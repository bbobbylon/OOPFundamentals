package com.bob.devhub.dto;

import java.util.List;

/**
 * Returned by /api/auth/register and /api/auth/login.
 *
 * @param token     the signed JWT (HS256)
 * @param tokenType always "Bearer" — the scheme to use in the Authorization header
 * @param username  the authenticated username
 * @param email     the account email
 * @param roles     the authorities baked into the token (e.g. ["ROLE_USER"])
 * @param expiresAt token expiry as epoch millis
 */
public record AuthResponse(
    String token,
    String tokenType,
    String username,
    String email,
    List<String> roles,
    long expiresAt
) {}
