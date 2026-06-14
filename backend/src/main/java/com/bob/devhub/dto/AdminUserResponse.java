package com.bob.devhub.dto;

import com.bob.devhub.model.User;

import java.time.LocalDateTime;
import java.util.List;

/** A user as seen by an administrator. Never exposes the password hash. */
public record AdminUserResponse(
    Long id,
    String username,
    String email,
    List<String> roles,
    LocalDateTime createdAt
) {
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
