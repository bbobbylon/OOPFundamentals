package com.bob.devhub.dto;

/**
 * Response from POST /oauth2/token.
 *
 * @param token     a signed RS256 JWT
 * @param tokenType always "Bearer"
 * @param idm       the IdM profile whose claim shape was used
 * @param issuer    the {@code iss} claim baked into the token
 * @param audience  the {@code aud} claim the resource server will require
 * @param expiresAt expiry as epoch millis
 */
public record OidcTokenResponse(
    String token,
    String tokenType,
    String idm,
    String issuer,
    String audience,
    long expiresAt
) {}
