package com.bob.devhub.controller;

import com.bob.devhub.dto.OidcTokenRequest;
import com.bob.devhub.dto.OidcTokenResponse;
import com.bob.devhub.model.Idm;
import com.bob.devhub.service.OidcTokenService;
import com.nimbusds.jose.jwk.JWKSet;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * The self-hosted OIDC surface. Endpoints here are handled by the resource-server
 * SecurityFilterChain (see SecurityConfig), which validates RS256 tokens against
 * the public key published at /oauth2/jwks.
 *
 *   GET  /oauth2/jwks       — public: the JSON Web Key Set (public key only)
 *   POST /oauth2/token      — public: exchange credentials for an RS256 token
 *   GET  /api/oidc/userinfo — protected: echoes the validated claims + authorities
 *   GET  /api/oidc/admin    — protected: ADMIN only → real 403 for USER tokens
 */
@RestController
@RequiredArgsConstructor
public class OidcController {

    private final OidcTokenService oidcTokenService;
    private final JWKSet jwkSet;

    /** Standard JWKS document a resource server (or browser) fetches to get the public key. */
    @GetMapping("/oauth2/jwks")
    public ResponseEntity<Map<String, Object>> jwks() {
        // toJSONObject() emits ONLY public fields — the private key never leaves the server.
        return ResponseEntity.ok(jwkSet.toJSONObject());
    }

    /** Learning issuer: authenticate, then mint an IdM-shaped RS256 token. */
    @PostMapping("/oauth2/token")
    public ResponseEntity<OidcTokenResponse> token(@Valid @RequestBody OidcTokenRequest req) {
        OidcTokenResponse resp = oidcTokenService.issue(req.username(), req.password(), Idm.from(req.idm()));
        return ResponseEntity.ok(resp);
    }

    /** Shows exactly what the resource server extracted from a validated token. */
    @GetMapping("/api/oidc/userinfo")
    public ResponseEntity<Map<String, Object>> userinfo(JwtAuthenticationToken auth) {
        Jwt jwt = (Jwt) auth.getToken();
        List<String> authorities = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority).toList();
        return ResponseEntity.ok(Map.of(
                "subject", jwt.getSubject(),
                "issuer", String.valueOf(jwt.getIssuer()),
                "audience", jwt.getAudience(),
                "authorities", authorities,
                "claims", jwt.getClaims()
        ));
    }

    /** ADMIN-only resource: a USER token reaching here gets a real 403. */
    @GetMapping("/api/oidc/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> admin(JwtAuthenticationToken auth) {
        return ResponseEntity.ok(Map.of(
                "message", "Welcome, admin — this resource is gated by hasRole('ADMIN').",
                "subject", auth.getName()
        ));
    }

    /** Bad credentials on the token endpoint → clean 401 (not a 500). */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, String>> handleAuthFailure(AuthenticationException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "invalid_credentials", "message", ex.getMessage()));
    }
}
