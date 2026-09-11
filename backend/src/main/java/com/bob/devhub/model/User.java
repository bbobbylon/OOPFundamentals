package com.bob.devhub.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.EnumSet;
import java.util.Set;

/**
 * A DevHub account. Doubles as Spring Security's {@link UserDetails}, so the same
 * object is what {@link com.bob.devhub.service.UserDetailsServiceImpl} loads for
 * password checks AND what {@link com.bob.devhub.security.JwtAuthFilter} places in
 * the SecurityContext — controllers receive it via {@code @AuthenticationPrincipal User}.
 *
 * <p>Created by {@link com.bob.devhub.service.AuthService#register} and by
 * {@link com.bob.devhub.config.DataInitializer} (the seeded {@code demo}/{@code admin}
 * accounts). Never serialised directly: {@code AuthResponse}, {@code AdminUserResponse}
 * and {@code /api/auth/me}'s map are the only shapes that leave the server, which is
 * how the bcrypt {@code password} column stays private.
 *
 * <p>Table {@code users} (not {@code user} — a reserved word in H2/Postgres) plus the
 * {@code user_roles} element-collection table. Lombok {@code @Data} generates the
 * getters {@code UserDetails} needs ({@code getUsername}, {@code getPassword}).
 */
@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Column(nullable = false)
    private String password;

    /**
     * The roles granted to this user. Stored in a side table {@code user_roles}
     * (one row per role) via {@link ElementCollection}. Loaded EAGERLY because
     * Spring Security needs the authorities the moment the user is loaded, and
     * the set is tiny.
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    @Builder.Default
    private Set<Role> roles = EnumSet.of(Role.ROLE_USER);

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Insert-time defaults: stamps {@code createdAt} and guarantees at least
     * {@code ROLE_USER}. The role fallback exists because {@code @Builder.Default}
     * only covers the builder path — the JPA no-arg constructor leaves the set null.
     */
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (roles == null || roles.isEmpty()) {
            roles = EnumSet.of(Role.ROLE_USER);
        }
    }

    /**
     * Maps each {@link Role} to a Spring Security authority. Because the enum
     * names already carry the {@code ROLE_} prefix, the authority string is just
     * the enum name (e.g. {@code ROLE_ADMIN}).
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
                .map(r -> new SimpleGrantedAuthority(r.name()))
                .toList();
    }

    /*
     * The four account-state flags UserDetails requires. DevHub has no lockout,
     * expiry or disable feature, so all four are hard-wired to true; a real CIAM
     * app would back these with columns (and the DaoAuthenticationProvider would
     * then reject logins automatically when any is false).
     */
    @Override public boolean isAccountNonExpired()     { return true; }
    @Override public boolean isAccountNonLocked()      { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled()               { return true; }
}
