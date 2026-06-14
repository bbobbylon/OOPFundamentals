package com.bob.devhub.security;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Turns the authorization claims of a validated OIDC token into Spring Security
 * authorities — handling each IdM's different claim shape so the SAME endpoint
 * (e.g. {@code hasRole('ADMIN')}) works no matter which provider minted the token.
 *
 * Mapping rules (all normalised to ROLE_* / SCOPE_*):
 *   roles               (Spring, Entra app roles)  → ROLE_&lt;UPPER&gt;
 *   realm_access.roles  (Keycloak)                 → ROLE_&lt;UPPER&gt;
 *   group / groups      (Ping)                     → ROLE_&lt;UPPER&gt;
 *   scope / scp         (OAuth2 / Entra)           → SCOPE_&lt;scope&gt;
 *
 * This is the live equivalent of the claim-mapping the JWT playground used to
 * only simulate.
 */
@Component
public class IdmAuthoritiesConverter implements Converter<Jwt, Collection<GrantedAuthority>> {

    @Override
    public Collection<GrantedAuthority> convert(Jwt jwt) {
        Set<GrantedAuthority> authorities = new LinkedHashSet<>();

        // 1) roles claim (Spring "ROLE_ADMIN", Entra app roles "Admin")
        for (String role : asStringList(jwt.getClaim("roles"))) {
            authorities.add(role(role));
        }

        // 2) Keycloak: realm_access.roles
        Object realmAccess = jwt.getClaim("realm_access");
        if (realmAccess instanceof Map<?, ?> map) {
            for (String role : asStringList(map.get("roles"))) {
                authorities.add(role(role));
            }
        }

        // 3) Ping: group / groups
        for (String group : asStringList(jwt.getClaim("group"))) {
            authorities.add(role(group));
        }
        for (String group : asStringList(jwt.getClaim("groups"))) {
            authorities.add(role(group));
        }

        // 4) OAuth2 scopes: "scope" (space-delimited) and Entra "scp"
        for (String scope : asScopeList(jwt.getClaim("scope"))) {
            authorities.add(new SimpleGrantedAuthority("SCOPE_" + scope));
        }
        for (String scope : asScopeList(jwt.getClaim("scp"))) {
            authorities.add(new SimpleGrantedAuthority("SCOPE_" + scope));
        }

        return authorities;
    }

    /** Normalises a role/group name to a ROLE_ authority (idempotent on ROLE_ prefix). */
    private static SimpleGrantedAuthority role(String raw) {
        String name = raw.trim().toUpperCase().replace(' ', '_');
        return new SimpleGrantedAuthority(name.startsWith("ROLE_") ? name : "ROLE_" + name);
    }

    /** Accepts a List, or a single String, or null. */
    @SuppressWarnings("unchecked")
    private static List<String> asStringList(Object claim) {
        if (claim instanceof List<?> list) {
            return list.stream().map(String::valueOf).toList();
        }
        if (claim instanceof String s && !s.isBlank()) {
            return List.of(s);
        }
        return List.of();
    }

    /** Scopes may arrive as a space-delimited string or an array. */
    private static List<String> asScopeList(Object claim) {
        if (claim instanceof String s && !s.isBlank()) {
            return List.of(s.trim().split("\\s+"));
        }
        return asStringList(claim);
    }
}
