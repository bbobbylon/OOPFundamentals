package com.bob.devhub.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Request body for {@code POST /api/auth/login} ({@link com.bob.devhub.controller.AuthController}).
 * Sent by {@code app.html}'s sign-in form, by {@code devhub-run.js}'s silent
 * {@code demo} login, and by {@code auth-identity-live-visualizer.html}.
 *
 * <p>{@code @NotBlank} plus the controller's {@code @Valid} turns an empty field into a
 * 400 before {@link com.bob.devhub.service.AuthService} ever sees it.
 *
 * @param username the account name (NOT the email — {@code findByUsername} is the lookup)
 * @param password the raw password; compared against the bcrypt hash by the
 *                 {@code AuthenticationManager}, never stored or logged
 */
public record LoginRequest(
    @NotBlank String username,
    @NotBlank String password
) {}
