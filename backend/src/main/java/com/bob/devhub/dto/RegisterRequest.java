package com.bob.devhub.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request body for {@code POST /api/auth/register} ({@link com.bob.devhub.controller.AuthController}).
 * Sent by {@code app.html}'s create-account form.
 *
 * <p>The size limits mirror the column lengths on {@link com.bob.devhub.model.User}
 * ({@code username} 50, {@code email} 100), so a too-long value is a clean 400 from
 * bean validation rather than a constraint violation from the database. The 8-char
 * password minimum is the only password policy the app has.
 *
 * @param username 3–50 chars; must be unique (checked in {@code AuthService.register})
 * @param email    a syntactically valid address, ≤100 chars; must be unique
 * @param password 8–100 chars raw; bcrypt-hashed by the service before it is stored
 */
public record RegisterRequest(
    @NotBlank @Size(min = 3, max = 50)  String username,
    @NotBlank @Email @Size(max = 100)   String email,
    @NotBlank @Size(min = 8, max = 100) String password
) {}
