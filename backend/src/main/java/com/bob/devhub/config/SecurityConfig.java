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
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
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
                        .requestMatchers("/api/auth/**").permitAll()
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
                .authenticationProvider(authProvider())
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
    public AuthenticationProvider authProvider() {
        // Spring Security 7 (Spring Boot 4): UserDetailsService is now a
        // constructor argument; the no-arg ctor + setUserDetailsService() were removed.
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
