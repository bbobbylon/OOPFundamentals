package com.bob.devhub.dto;

import com.bob.devhub.model.User;

import java.time.LocalDateTime;
import java.util.List;

/**
 * A user as seen by an administrator. Never exposes the password hash.
 *
 * <p>Carried by {@code GET /api/admin/users} ({@link com.bob.devhub.controller.AdminController}),
 * which requires {@code ROLE_ADMIN}. This projection is the ONLY reason the entity's
 * password column never reaches a client — keep it that way if you add fields.
 *
 * @param id        database id
 * @param username  login name
 * @param email     account email
 * @param roles     enum names, e.g. {@code ["ROLE_USER","ROLE_ADMIN"]}
 * @param createdAt when the row was inserted ({@code User.onCreate})
 */
public record AdminUserResponse(
    Long id,
    String username,
    String email,
    List<String> roles,
    LocalDateTime createdAt
) {
    /** Entity → DTO projection; deliberately does not touch {@code getPassword()}. */
    public static AdminUserResponse from(User u) {
        return new AdminUserResponse(
                u.getId(),
                u.getUsername(),
                u.getEmail(),
                u.getRoles().stream().map(Enum::name).toList(),
                u.getCreatedAt()
        );
    }
}
