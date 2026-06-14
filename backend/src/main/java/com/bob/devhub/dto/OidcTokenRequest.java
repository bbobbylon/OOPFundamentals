package com.bob.devhub.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Request body for POST /oauth2/token — the learning issuer's "login".
 *
 * @param username an existing account (e.g. demo / admin)
 * @param password that account's password
 * @param idm      which IdM's claim shape to mimic: spring | entra | ping | keycloak
 */
public record OidcTokenRequest(
    @NotBlank String username,
    @NotBlank String password,
    String idm
) {}
