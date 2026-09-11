package com.bob.devhub.config;

import com.bob.devhub.security.IdmAuthoritiesConverter;
import com.bob.devhub.security.JwtAuthFilter;
import com.bob.devhub.service.JwtService;
import com.bob.devhub.service.UserDetailsServiceImpl;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.io.IOException;
import java.util.List;

/**
 * Two security filter chains, evaluated in @Order:
 *
 *   (1) OIDC chain      — matches /api/oidc/** and /oauth2/** and validates RS256
 *                         tokens against our JWKS (the "Entra/Ping resource server"
 *                         story). Authorities come from the IdM-aware converter.
 *   (2) Default chain   — everything else, secured by the first-party HS256
 *                         {@link JwtAuthFilter} (the "first-party token" story).
 *
 * Spring picks the FIRST chain whose matcher accepts the request, so the two
 * mechanisms coexist without interfering.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity   // turns on @PreAuthorize on controllers & services
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtService jwtService;
    private final UserDetailsServiceImpl userDetailsService;
    private final JwtDecoder oidcJwtDecoder;
    private final IdmAuthoritiesConverter idmAuthoritiesConverter;

    @Value("${app.cors.allowed-origins:http://localhost:3000,http://localhost:5500,http://127.0.0.1:3000,http://127.0.0.1:5500,https://bbobbylon.github.io}")
    private List<String> allowedOrigins;

    // ---- Chain 1: OIDC / OAuth2 resource server (RS256 via JWKS) -------------
    @Bean
    @Order(1)
    public SecurityFilterChain oidcFilterChain(HttpSecurity http) throws Exception {
        return http
                .securityMatcher("/api/oidc/**", "/oauth2/**")
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsSource()))
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // The JWKS doc and the token endpoint are public, just like a real IdP's.
                        .requestMatchers("/oauth2/jwks", "/oauth2/token").permitAll()
                        .anyRequest().authenticated())
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.decoder(oidcJwtDecoder)
                                       .jwtAuthenticationConverter(jwtAuthConverter()))
                        .authenticationEntryPoint(restAuthEntryPoint())
                        .accessDeniedHandler(restAccessDeniedHandler()))
                .exceptionHandling(e -> e
                        .authenticationEntryPoint(restAuthEntryPoint())
                        .accessDeniedHandler(restAccessDeniedHandler()))
                .build();
    }

    // ---- Chain 2: default (first-party HS256 JwtAuthFilter) ------------------
    @Bean
    @Order(2)
    public SecurityFilterChain defaultFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsSource()))
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Only register & login are public; /api/auth/me needs a valid token,
                        // so a bad/expired token there yields a clean 401 (not a 500 on a null principal).
                        .requestMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/login").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()
                        .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/run/languages").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // POST /api/run/{language} stays authenticated — an open code-runner is RCE.
                        .anyRequest().authenticated()
                )
                .exceptionHandling(e -> e
                        .authenticationEntryPoint(restAuthEntryPoint())
                        .accessDeniedHandler(restAccessDeniedHandler()))
                .headers(h -> h.frameOptions(f -> f.sameOrigin())
                               .httpStrictTransportSecurity(hsts -> hsts.disable()))
                // Constructed here (not a bean) so Spring Boot won't ALSO register it
                // as a global servlet filter — see JwtAuthFilter's class comment.
                .addFilterBefore(new JwtAuthFilter(jwtService, userDetailsService),
                        UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    /** Wraps the IdM-aware authorities converter for the resource server. */
    private JwtAuthenticationConverter jwtAuthConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(idmAuthoritiesConverter);
        return converter;
    }

    /** 401 — no/invalid/expired credentials. */
    @Bean
    public AuthenticationEntryPoint restAuthEntryPoint() {
        return (req, res, ex) -> writeError(res, HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized",
                "Authentication required: missing, invalid, or expired token.", req);
    }

    /** 403 — authenticated, but lacking the required role/authority. */
    @Bean
    public AccessDeniedHandler restAccessDeniedHandler() {
        return (req, res, ex) -> writeError(res, HttpServletResponse.SC_FORBIDDEN, "Forbidden",
                "Access denied: your token does not grant the required role.", req);
    }

    private static void writeError(HttpServletResponse res, int status, String error,
                                   String message, HttpServletRequest req) throws IOException {
        res.setStatus(status);
        res.setContentType("application/json");
        res.getWriter().write(String.format(
                "{\"status\":%d,\"error\":\"%s\",\"message\":\"%s\",\"path\":\"%s\"}",
                status, error, message, req.getRequestURI()));
    }

    @Bean
    /**
     * CORS for the browser: the site is static files served from a DIFFERENT origin than
     * this API (GitHub Pages / App Runner in production, file:// or a dev server locally),
     * so without this every fetch from a lesson page is blocked before it is even sent.
     *
     * <p>Origins come from configuration, never a wildcard — {@code allowCredentials(true)}
     * makes a wildcard both illegal and dangerous, since it would let any site on the
     * internet make authenticated calls with a learner's cookies. Adding a deployment means
     * adding its origin to {@code app.cors.allowed-origins}, not loosening this.
     *
     * <p>Registered for /api/** and /oauth2/** only; everything else needs no cross-origin
     * access.
     */
    public CorsConfigurationSource corsSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(allowedOrigins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        source.registerCorsConfiguration("/oauth2/**", config);
        return source;
    }

    @Bean
    /**
     * Exposes Spring's auto-configured {@link AuthenticationManager} as a bean so
     * {@code AuthService} (password login) and {@code OidcTokenService} (the token
     * endpoint) can both call it directly to verify credentials.
     *
     * <p>Taken from {@link AuthenticationConfiguration} rather than assembled by hand: that
     * is what wires in {@link UserDetailsServiceImpl} and the {@link #passwordEncoder()}
     * below with the framework's own defaults — including hiding "user not found" behind
     * "bad credentials". Building a ProviderManager here instead would silently opt out of
     * that protection.
     */
    public AuthenticationManager authManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    /**
     * BCrypt, used both to hash new registrations and to verify logins — the two must be
     * the same bean or every password stops matching.
     *
     * <p>Default strength (10). BCrypt stores its cost and salt inside the hash, so raising
     * the strength later re-hashes new passwords without invalidating existing ones.
     */
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
