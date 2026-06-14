package com.bob.devhub.model;

/**
 * Application roles.
 *
 * The names are deliberately prefixed with {@code ROLE_} because that is the
 * convention Spring Security expects: {@code hasRole('ADMIN')} in a
 * {@code @PreAuthorize} expression matches the authority {@code ROLE_ADMIN}.
 * Storing the prefix on the enum means the value we persist, the value we put
 * in the JWT {@code roles} claim, and the {@link org.springframework.security.core.GrantedAuthority}
 * string are all identical — no translation layer to get wrong.
 */
public enum Role {
    ROLE_USER,
    ROLE_ADMIN
}
