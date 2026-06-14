package com.bob.devhub.service;

import com.bob.devhub.dto.OidcTokenResponse;
import com.bob.devhub.model.Idm;
import com.bob.devhub.model.Role;
import com.bob.devhub.model.User;
import com.bob.devhub.repository.UserRepository;
import com.nimbusds.jose.JOSEObjectType;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * Issues RS256 OIDC-style tokens for an authenticated user, shaped to mimic the
 * chosen {@link Idm}. This is the "authorization server" half of the self-hosted
 * OIDC story; {@link com.bob.devhub.config.OidcKeyConfig} holds the signing key.
 */
@Service
@RequiredArgsConstructor
public class OidcTokenService {

    private final AuthenticationManager authManager;
    private final UserRepository userRepo;
    private final RSAKey rsaKey;

    @Value("${app.oidc.issuer:http://localhost:8081}")
    private String issuer;

    @Value("${app.oidc.audience:devhub-api}")
    private String audience;

    @Value("${app.oidc.ttl-seconds:3600}")
    private long ttlSeconds;

    /** Authenticates the credentials, then mints an IdM-shaped RS256 token. */
    public OidcTokenResponse issue(String username, String password, Idm idm) {
        authManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
        User user = userRepo.findByUsername(username).orElseThrow();

        Instant now = Instant.now();
        Instant exp = now.plusSeconds(ttlSeconds);
        boolean isAdmin = user.getRoles().contains(Role.ROLE_ADMIN);

        JWTClaimsSet.Builder claims = new JWTClaimsSet.Builder()
                .issuer(issuer)
                .audience(audience)
                .subject(user.getUsername())
                .issueTime(Date.from(now))
                .expirationTime(Date.from(exp))
                .claim("preferred_username", user.getUsername())
                .claim("email", user.getEmail())
                .claim("idm", idm.name().toLowerCase());

        // Each IdM carries authorization data in its own claim(s). The resource
        // server's IdmAuthoritiesConverter knows how to read every one of these.
        switch (idm) {
            case SPRING -> claims
                    .claim("roles", springRoles(isAdmin))                 // ["ROLE_USER", ...]
                    .claim("scope", "profile progress.read" + (isAdmin ? " admin" : ""));
            case ENTRA -> claims
                    .claim("roles", appRoles(isAdmin))                    // ["User","Admin"]
                    .claim("scp", "User.Read")
                    .claim("appid", "devhub-spa")
                    .claim("tid", "common")
                    .claim("ver", "2.0");
            case PING -> claims
                    .claim("group", groups(isAdmin))                      // ["user","admin"]
                    .claim("scope", "openid profile")
                    .claim("client_id", "devhub-spa");
            case KEYCLOAK -> claims
                    .claim("realm_access", Map.of("roles", groups(isAdmin))) // {roles:[...]}
                    .claim("scope", "openid profile")
                    .claim("azp", "devhub-spa");
        }

        String token = sign(claims.build());
        return new OidcTokenResponse(token, "Bearer", idm.name().toLowerCase(),
                issuer, audience, exp.toEpochMilli());
    }

    private String sign(JWTClaimsSet claims) {
        try {
            SignedJWT jwt = new SignedJWT(
                    new JWSHeader.Builder(JWSAlgorithm.RS256)
                            .keyID(rsaKey.getKeyID())
                            .type(JOSEObjectType.JWT)
                            .build(),
                    claims);
            jwt.sign(new RSASSASigner(rsaKey.toPrivateKey()));
            return jwt.serialize();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to sign OIDC token", e);
        }
    }

    private static List<String> springRoles(boolean admin) {
        return admin ? List.of("ROLE_USER", "ROLE_ADMIN") : List.of("ROLE_USER");
    }

    private static List<String> appRoles(boolean admin) {
        return admin ? List.of("User", "Admin") : List.of("User");
    }

    private static List<String> groups(boolean admin) {
        return admin ? List.of("user", "admin") : List.of("user");
    }
}
