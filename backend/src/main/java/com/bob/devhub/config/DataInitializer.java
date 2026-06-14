package com.bob.devhub.config;

import com.bob.devhub.model.Role;
import com.bob.devhub.model.User;
import com.bob.devhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.EnumSet;
import java.util.Set;

/**
 * Seeds two demo accounts on startup so the auth playgrounds work the moment the
 * backend boots — no manual registration needed:
 *
 *   demo  / demo12345   → ROLE_USER          (hits a 403 on admin endpoints)
 *   admin / admin12345  → ROLE_USER, ROLE_ADMIN (gets 200 everywhere)
 *
 * Dev profile only. The H2 schema is {@code create-drop}, so these are recreated
 * on every restart. Production seeding (Render) is handled separately and gated
 * behind explicit env vars — we never ship default credentials to a public host.
 */
@Component
@Profile("dev")
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seed("demo", "demo@devhub.local", "demo12345", EnumSet.of(Role.ROLE_USER));
        seed("admin", "admin@devhub.local", "admin12345", EnumSet.of(Role.ROLE_USER, Role.ROLE_ADMIN));
        log.info("Seeded demo accounts -> demo/demo12345 (USER), admin/admin12345 (USER,ADMIN)");
    }

    private void seed(String username, String email, String rawPassword, Set<Role> roles) {
        if (userRepo.existsByUsername(username)) return;
        userRepo.save(User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(rawPassword))
                .roles(roles)
                .build());
    }
}
