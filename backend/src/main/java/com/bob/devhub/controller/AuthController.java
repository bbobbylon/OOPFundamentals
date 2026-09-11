package com.bob.devhub.controller;

import com.bob.devhub.dto.AuthResponse;
import com.bob.devhub.dto.LoginRequest;
import com.bob.devhub.dto.RegisterRequest;
import com.bob.devhub.model.User;
import com.bob.devhub.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * First-party (HS256) authentication endpoints — the "we ARE the identity provider"
 * half of the backend, as opposed to {@link OidcController}, which plays an external
 * IdP.
 *
 * <pre>
 *   POST /api/auth/register  — public: create an account, returns a token (auto-login)
 *   POST /api/auth/login     — public: exchange username/password for an HS256 JWT
 *   GET  /api/auth/me        — Bearer:  echo the caller's identity from the token
 * </pre>
 *
 * <p>Who calls it: {@code app.html}'s sign-in/register panel, {@code devhub-run.js}
 * (silently logs in as the seeded {@code demo} account when the playgrounds have no
 * saved token), and {@code auth-identity-live-visualizer.html}'s live demo.
 *
 * <p>Security: {@code register}/{@code login} are in the default chain's
 * {@code permitAll} list in {@link com.bob.devhub.config.SecurityConfig}; {@code me}
 * relies on {@link com.bob.devhub.security.JwtAuthFilter} having placed a
 * {@link User} principal in the SecurityContext, so a missing/expired token there is
 * answered by the 401 entry point before this class runs.
 *
 * <p>Business rules (uniqueness, hashing, token minting) live in {@link AuthService};
 * this class is deliberately thin.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Creates a {@code ROLE_USER} account and returns a token so the SPA never has
     * to make a second login call. Bean validation on {@link RegisterRequest} yields
     * a 400 before we get here; a taken username/email surfaces as
     * {@link IllegalArgumentException} from the service, mapped to 409 below.
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(req));
    }

    /**
     * Password login. Bad credentials propagate as a Spring
     * {@code AuthenticationException}, which the security chain turns into the JSON
     * 401 — we never say WHICH of username/password was wrong.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    /**
     * Returns the authenticated user's public profile. The {@code roles} list comes
     * from {@link User#getAuthorities()} (persisted roles), which is what
     * {@code app.html} shows in its account panel after sign-in.
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(Map.of(
                "username", user.getUsername(),
                "email", user.getEmail(),
                "roles", user.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority).toList(),
                "createdAt", user.getCreatedAt()
        ));
    }

    /**
     * Maps the service's "already taken" {@link IllegalArgumentException} to a 409
     * with the same {@code {"error": ...}} shape the other controllers use, so the
     * SPA can show the message verbatim instead of a generic 500.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", ex.getMessage()));
    }
}
