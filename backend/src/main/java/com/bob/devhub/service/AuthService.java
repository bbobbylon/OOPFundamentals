package com.bob.devhub.service;

import com.bob.devhub.dto.AuthResponse;
import com.bob.devhub.dto.LoginRequest;
import com.bob.devhub.dto.RegisterRequest;
import com.bob.devhub.model.Role;
import com.bob.devhub.model.User;
import com.bob.devhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.EnumSet;
import java.util.List;

/**
 * The business logic behind {@link com.bob.devhub.controller.AuthController}:
 * account creation and password login for the first-party HS256 token story.
 *
 * <p>Collaborators: {@link UserRepository} (uniqueness + lookup),
 * {@link PasswordEncoder} (bcrypt, from {@code SecurityConfig}), {@link JwtService}
 * (mints and reads the token), and Spring's {@link AuthenticationManager}, which
 * runs the {@code DaoAuthenticationProvider} → {@code UserDetailsServiceImpl} →
 * bcrypt-compare chain so this class never touches a password hash itself.
 *
 * <p>Invariants: passwords are hashed HERE, before the entity is built — the
 * repository/entity layer never sees a raw password. New accounts are always
 * {@code ROLE_USER}; there is no API path to self-assign ADMIN (the only admin is
 * the dev-profile seed in {@code DataInitializer}).
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authManager;

    /**
     * Creates the account and immediately issues a token (auto-login), so
     * {@code app.html} can go straight to the signed-in state.
     *
     * @throws IllegalArgumentException if the username or email is taken — the
     *         controller maps it to 409. Note this DOES reveal whether a name/email
     *         exists; acceptable for a learning app, and the global CLAUDE.md rule
     *         against enumeration is why a production port would return a generic
     *         message instead.
     */
    public AuthResponse register(RegisterRequest req) {
        if (userRepo.existsByUsername(req.username())) {
            throw new IllegalArgumentException("Username already taken");
        }
        if (userRepo.existsByEmail(req.email())) {
            throw new IllegalArgumentException("Email already registered");
        }
        User user = userRepo.save(User.builder()
                .username(req.username())
                .email(req.email())
                .password(passwordEncoder.encode(req.password()))
                .roles(EnumSet.of(Role.ROLE_USER))
                .build());
        return buildResponse(user);
    }

    /**
     * Verifies the credentials through the {@link AuthenticationManager} and, only
     * if that succeeds, loads the entity and mints a token. A wrong password throws
     * {@code BadCredentialsException} out of {@code authenticate()}; the security
     * chain's entry point turns that into the JSON 401. The {@code orElseThrow()}
     * after a successful authenticate cannot realistically fire — the manager just
     * loaded that same user.
     */
    public AuthResponse login(LoginRequest req) {
        authManager.authenticate(new UsernamePasswordAuthenticationToken(req.username(), req.password()));
        User user = userRepo.findByUsername(req.username()).orElseThrow();
        return buildResponse(user);
    }

    /**
     * Shared tail of register/login: mint the HS256 token and echo the roles and
     * expiry the SPA needs to render its account panel without decoding the JWT.
     * {@code expiresAt} is read BACK from the token so the two can never disagree.
     */
    private AuthResponse buildResponse(User user) {
        String token = jwtService.generateToken(user);
        List<String> roles = user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();
        return new AuthResponse(token, "Bearer", user.getUsername(), user.getEmail(),
                roles, jwtService.extractExpiration(token));
    }
}
