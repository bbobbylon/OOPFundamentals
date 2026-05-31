package com.bob.devhub.dto;

public record AuthResponse(
    String token,
    String username,
    String email,
    long expiresAt
) {}
