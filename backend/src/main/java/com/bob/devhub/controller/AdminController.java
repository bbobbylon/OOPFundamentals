package com.bob.devhub.controller;

import com.bob.devhub.dto.AdminUserResponse;
import com.bob.devhub.model.Role;
import com.bob.devhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Admin-only endpoints. The class-level {@code @PreAuthorize("hasRole('ADMIN')")}
 * means every method here requires the {@code ROLE_ADMIN} authority — which is
 * read off the caller's JWT. A USER token reaching these endpoints produces a
 * real {@code 403 Forbidden} (handled by the JSON AccessDeniedHandler), which is
 * exactly what the JWT / Spring-Security playgrounds demonstrate live.
 *
 * <p>Who calls it: {@code auth-identity-live-visualizer.html} ("call /api/admin/users
 * as demo → watch the 403; as admin → 200") and {@link com.bob.devhub.AuthRoleIntegrationTest}.
 * {@code app.html} does not use it.
 *
 * <p>Security: default (HS256) chain. {@link com.bob.devhub.security.JwtAuthFilter}
 * builds the caller's authorities from the token's {@code roles} claim, so the
 * {@code hasRole} check here is decided by the TOKEN, not by a fresh DB read — a
 * demoted admin keeps admin access until their token expires (24h). That is the
 * standard stateless-JWT trade-off and is worth knowing before extending this class.
 *
 * <p>Reads the {@link UserRepository} directly rather than through a service: there
 * is no business logic to keep out of the controller, only a projection to
 * {@link AdminUserResponse}, which is where the password hash is stripped.
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepo;

    /** GET /api/admin/users — list every account (ADMIN only). */
    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> users() {
        return ResponseEntity.ok(
                userRepo.findAll().stream().map(AdminUserResponse::from).toList());
    }

    /**
     * GET /api/admin/stats — aggregate user counts (ADMIN only).
     * Counts admins by streaming {@code findAll()} rather than a dedicated query —
     * fine for a learning app's user table, not a pattern to copy at scale.
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> stats() {
        long total = userRepo.count();
        long admins = userRepo.findAll().stream()
                .filter(u -> u.getRoles().contains(Role.ROLE_ADMIN))
                .count();
        return ResponseEntity.ok(Map.of(
                "totalUsers", total,
                "admins", admins,
                "regularUsers", total - admins
        ));
    }
}
