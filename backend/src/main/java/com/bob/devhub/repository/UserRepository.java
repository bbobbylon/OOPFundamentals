package com.bob.devhub.repository;

import com.bob.devhub.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Data access for {@link User}. Callers: {@link com.bob.devhub.service.UserDetailsServiceImpl}
 * (every password login AND every Bearer-token request, via {@code JwtAuthFilter}),
 * {@link com.bob.devhub.service.AuthService} (registration uniqueness),
 * {@link com.bob.devhub.service.OidcTokenService}, {@link com.bob.devhub.config.DataInitializer}
 * (seeding) and {@link com.bob.devhub.controller.AdminController} (listing).
 *
 * <p>All derived queries; {@code username} and {@code email} are both unique columns,
 * so the {@code Optional}s are at most one row. Note that the JWT filter hits
 * {@code findByUsername} on EVERY authenticated request — the token is trusted for
 * authorities, but the principal object is still loaded from the DB.
 */
public interface UserRepository extends JpaRepository<User, Long> {
    /** Login / token-principal lookup. The username, not the email, is the login key. */
    Optional<User> findByUsername(String username);
    /** Currently unused by the app; kept for the obvious "login by email" extension. */
    Optional<User> findByEmail(String email);
    /** Registration + seeding guard; cheaper than {@code findByUsername().isPresent()}. */
    boolean existsByUsername(String username);
    /** Registration guard for the second unique column. */
    boolean existsByEmail(String email);
}
