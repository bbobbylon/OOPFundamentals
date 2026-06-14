package com.bob.devhub.config;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.KeyUse;
import com.nimbusds.jose.jwk.RSAKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPublicKey;
import java.util.UUID;

/**
 * The asymmetric (RS256) key material for the self-hosted OIDC story.
 *
 * The backend plays BOTH roles a real CIAM setup splits across two systems:
 *   - Authorization server: signs tokens with the RSA *private* key
 *     ({@link com.bob.devhub.service.OidcTokenService}).
 *   - Resource server: validates tokens with the RSA *public* key, fetched in
 *     the real world from the IdP's JWKS endpoint. Here we publish that same
 *     public key at {@code GET /oauth2/jwks}.
 *
 * The keypair is generated fresh at startup (dev-friendly; tokens simply don't
 * survive a restart). A production deployment would inject a stable key so the
 * JWKS is durable — noted in the README.
 */
@Configuration
public class OidcKeyConfig {

    private static final Logger log = LoggerFactory.getLogger(OidcKeyConfig.class);

    @Value("${app.oidc.issuer:http://localhost:8081}")
    private String issuer;

    @Value("${app.oidc.audience:devhub-api}")
    private String audience;

    /** The signing key (public + private). Used by the issuer to sign tokens. */
    @Bean
    public RSAKey rsaKey() {
        try {
            KeyPairGenerator gen = KeyPairGenerator.getInstance("RSA");
            gen.initialize(2048);
            KeyPair kp = gen.generateKeyPair();
            RSAKey key = new RSAKey.Builder((RSAPublicKey) kp.getPublic())
                    .privateKey(kp.getPrivate())
                    .keyUse(KeyUse.SIGNATURE)
                    .algorithm(JWSAlgorithm.RS256)
                    .keyID(UUID.randomUUID().toString())
                    .build();
            log.info("Generated OIDC RS256 signing key (kid={})", key.getKeyID());
            return key;
        } catch (Exception e) {
            throw new IllegalStateException("Could not generate RSA key for OIDC", e);
        }
    }

    /** The PUBLIC half only, served as a JWK Set at GET /oauth2/jwks. */
    @Bean
    public JWKSet jwkSet(RSAKey rsaKey) {
        return new JWKSet(rsaKey.toPublicJWK());
    }

    /**
     * Resource-server decoder: verifies the RS256 signature with our public key,
     * then validates timestamps, the issuer, and the audience — the same checks a
     * real resource server runs against Entra/Ping tokens.
     */
    @Bean
    public JwtDecoder oidcJwtDecoder(RSAKey rsaKey) throws Exception {
        RSAPublicKey publicKey = rsaKey.toRSAPublicKey();
        NimbusJwtDecoder decoder = NimbusJwtDecoder
                .withPublicKey(publicKey)
                .signatureAlgorithm(SignatureAlgorithm.RS256)
                .build();

        OAuth2TokenValidator<Jwt> withIssuer = JwtValidators.createDefaultWithIssuer(issuer);
        OAuth2TokenValidator<Jwt> withAudience = audienceValidator();
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(withIssuer, withAudience));
        return decoder;
    }

    private OAuth2TokenValidator<Jwt> audienceValidator() {
        return jwt -> jwt.getAudience() != null && jwt.getAudience().contains(audience)
                ? OAuth2TokenValidatorResult.success()
                : OAuth2TokenValidatorResult.failure(
                        new OAuth2Error("invalid_token",
                                "Required audience '" + audience + "' is missing", null));
    }
}
