package com.bob.devhub.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.function.Function;

/**
 * Mints and verifies the HS256 JSON Web Tokens that authenticate every call into this
 * backend. It is the only place in the application that knows the signing secret.
 *
 * <p>Where it sits: {@link AuthService} calls {@link #generateToken(UserDetails)} after a
 * successful register or login and returns the string to the browser;
 * {@link com.bob.devhub.security.JwtAuthFilter} calls {@link #extractUsername(String)} and
 * {@link #isTokenValid(String, UserDetails)} on every subsequent request, resolving the
 * user through {@link UserDetailsServiceImpl}. Those two are the ONLY callers — nothing
 * else should parse a token, because a second parser is a second place for the
 * verification rules to drift.
 *
 * <p>The session is STATELESS: no token is ever stored server-side, so there is
 * deliberately no revocation list. A leaked token is valid until it expires, which is why
 * {@code app.jwt.expiration-ms} matters and why {@link #validateSecret()} refuses to boot
 * on a weak secret rather than failing lazily on the first login.
 *
 * <p>This class is also teaching material: the site's JWT playground pages decode exactly
 * the tokens minted here, so the claim set below is what a learner sees on screen.
 *
 * @see com.bob.devhub.config.SecurityConfig for the filter chain that consumes these tokens
 */
@Service
public class JwtService {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiration-ms}")
    private long expirationMs;

    /**
     * Fail fast at startup if the signing secret is missing or too weak. HS256
     * requires a key of at least 256 bits (32 bytes); a blank or short secret would
     * otherwise only blow up lazily on the first token operation. Validating here
     * turns a latent runtime failure into an obvious deployment error at boot.
     */
    @PostConstruct
    void validateSecret() {
        int bytes = secret == null ? 0 : secret.getBytes(StandardCharsets.UTF_8).length;
        if (bytes < 32) {
            throw new IllegalStateException(
                    "app.jwt.secret must be set and at least 32 bytes (256 bits) for HS256; got " + bytes + " byte(s)");
        }
    }

    /**
     * Mint a signed token for an authenticated user. Called once per successful
     * register/login; the result is the browser's entire session.
     *
     * <p>The authorities are copied INTO the token rather than looked up per request,
     * which is the trade the whole design turns on: authorization costs no database
     * round-trip, but a role changed in the database does not take effect until the
     * learner's current token expires.
     *
     * @param user the authenticated principal, from {@link UserDetailsServiceImpl}
     * @return a compact, signed JWS string — safe to put in an Authorization header
     */
    public String generateToken(UserDetails user) {
        long now = System.currentTimeMillis();
        List<String> roles = user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();
        return Jwts.builder()
                .subject(user.getUsername())
                // Carry the authorities INSIDE the token. The resource server can
                // then authorize a request from the token alone, without a DB hit —
                // the whole point of a self-contained JWT. This is the claim the
                // JWT playground decodes and shows the learner.
                .claim("roles", roles)
                .issuedAt(new Date(now))
                .expiration(new Date(now + expirationMs))
                .signWith(signingKey())
                .compact();
    }

    /**
     * The token's subject — the username the token was minted for.
     *
     * <p>VERIFIES THE SIGNATURE as a side effect (every read goes through
     * {@code extractClaim}, which parses with {@code verifyWith}), so this throws on a
     * forged or tampered token rather than returning an attacker-chosen name. Callers
     * treat a thrown exception as "not authenticated".
     *
     * @throws io.jsonwebtoken.JwtException if the token is malformed, unsigned, signed
     *         with the wrong key, or expired
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /** Reads the {@code roles} claim. Returns an empty list if the claim is absent. */
    public List<String> extractRoles(String token) {
        Object raw = extractClaim(token, claims -> claims.get("roles"));
        if (raw instanceof List<?> list) {
            return list.stream().map(String::valueOf).toList();
        }
        return List.of();
    }

    /**
     * Expiry as epoch milliseconds. Returned to the browser alongside the token so the
     * front end can refresh before a call fails, rather than discovering the expiry as a
     * surprise 401 mid-exercise. Never trusted for enforcement — that is
     * {@link #isTokenValid(String, UserDetails)}, server-side.
     */
    public long extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration).getTime();
    }

    /**
     * The gate every authenticated request passes through: the token must be signed by us
     * (checked while parsing), must not have expired, and its subject must match the user
     * that was just loaded from the database.
     *
     * <p>The subject comparison is what makes deleting or renaming a user take effect
     * immediately: the token still verifies cryptographically, but there is no longer a
     * matching principal to hand it to.
     *
     * @return true only if all three hold; a thrown parse exception means the same "no"
     */
    public boolean isTokenValid(String token, UserDetails user) {
        return extractUsername(token).equals(user.getUsername()) && !isExpired(token);
    }

    private boolean isExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    private <T> T extractClaim(String token, Function<Claims, T> resolver) {
        return resolver.apply(
                Jwts.parser().verifyWith(signingKey()).build().parseSignedClaims(token).getPayload()
        );
    }

    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
}
