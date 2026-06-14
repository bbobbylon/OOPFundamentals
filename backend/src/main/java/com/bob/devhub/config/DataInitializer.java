package com.bob.devhub.config;

import com.bob.devhub.model.Role;
import com.bob.devhub.model.User;
import com.bob.devhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.EnumSet;
import java.util.Set;

/**
 * Seeds accounts so the auth playgrounds work out of the box.
 *
 *  • Dev profile → always seeds:
 *        demo  / demo12345   (ROLE_USER)            — hits 403 on admin endpoints
 *        admin / admin12345  (ROLE_USER, ROLE_ADMIN)
 *    (H2 is create-drop, so these are recreated each restart.)
 *
 *  • Prod profile → seeds NOTHING by default — we never ship default credentials
 *    to a public host. To enable a public demo login on Render, set
 *        APP_DEMO_ENABLED=true  APP_DEMO_USERNAME=…  APP_DEMO_PASSWORD=…
 *    and only that single ROLE_USER account is created.
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final Environment env;

    @Value("${app.demo.enabled:false}")  private boolean demoEnabled;
    @Value("${app.demo.username:demo}")  private String demoUsername;
    @Value("${app.demo.password:}")      private String demoPassword;

    @Override
    public void run(String... args) {
        if (env.acceptsProfiles(Profiles.of("dev"))) {
            seed("demo", "demo@devhub.local", "demo12345", EnumSet.of(Role.ROLE_USER));
            seed("admin", "admin@devhub.local", "admin12345", EnumSet.of(Role.ROLE_USER, Role.ROLE_ADMIN));
            log.info("Seeded dev accounts -> demo/demo12345 (USER), admin/admin12345 (USER,ADMIN)");
        } else if (demoEnabled && demoPassword != null && !demoPassword.isBlank()) {
            seed(demoUsername, demoUsername + "@devhub.local", demoPassword, EnumSet.of(Role.ROLE_USER));
            log.info("Seeded public demo account '{}' (ROLE_USER) from app.demo.* config", demoUsername);
        }
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
