package com.bob.devhub.security;

import com.bob.devhub.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collection;
import java.util.List;

/**
 * NOT a Spring bean on purpose. A {@code Filter} bean would be auto-registered by
 * Spring Boot as a GLOBAL servlet filter (running outside Spring Security's
 * FilterChainProxy), which sets the SecurityContext but never clears it at
 * request end — leaking authentication across requests on reused threads.
 * Instead {@link com.bob.devhub.config.SecurityConfig} constructs this filter and
 * adds it to the chain explicitly, so it only runs where Spring Security manages
 * the SecurityContext lifecycle.
 */
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest req,
                                    @NonNull HttpServletResponse res,
                                    @NonNull FilterChain chain) throws ServletException, IOException {
        String authHeader = req.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            chain.doFilter(req, res);
            return;
        }
        String token = authHeader.substring(7);

        try {
            String username = jwtService.extractUsername(token);
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails user = userDetailsService.loadUserByUsername(username);
                if (jwtService.isTokenValid(token, user)) {
                    // Authorities come from the token's `roles` claim — the token is
                    // the source of truth (stateless authz). Fall back to the user's
                    // persisted authorities only if the token carried none (e.g. an
                    // older token minted before roles existed).
                    List<GrantedAuthority> fromToken = jwtService.extractRoles(token).stream()
                            .map(SimpleGrantedAuthority::new)
                            .map(a -> (GrantedAuthority) a)
                            .toList();
                    Collection<? extends GrantedAuthority> authorities =
                            fromToken.isEmpty() ? user.getAuthorities() : fromToken;

                    var auth = new UsernamePasswordAuthenticationToken(user, null, authorities);
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            }
        } catch (Exception ex) {
            // Expired / tampered / malformed token: leave the context anonymous.
            // The AuthenticationEntryPoint then returns a clean 401 JSON instead
            // of a 500 — exactly the failure the JWT playground demonstrates.
            SecurityContextHolder.clearContext();
        }
        chain.doFilter(req, res);
    }
}
