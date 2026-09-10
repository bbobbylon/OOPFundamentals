package com.bob.devhub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Boot entry point for {@code devhub-backend}, the OPTIONAL Spring Boot API behind
 * the DevHub static site in {@code frontend/}.
 *
 * <p>Component scanning starts at this package ({@code com.bob.devhub}), which is why
 * every sub-package (config, controller, service, repository, security, model, dto)
 * is picked up without explicit registration. Nothing in the site requires this
 * process to be running: {@code app.html} falls back to {@code localStorage} for
 * progress when {@code config.js} carries no {@code DEVHUB_API_BASE}, and only a
 * handful of pages ever call it — {@code app.html} (auth + progress), the three
 * playground pages via {@code devhub-run.js} ({@code /api/run/*}), and
 * {@code auth-identity-live-visualizer.html} (auth, admin and OIDC endpoints).
 *
 * <p>Profiles: {@code dev} is the default (H2 in-memory, seeded demo accounts, code
 * execution on); {@code prod} requires {@code JWT_SECRET} and {@code DATABASE_*} env
 * vars and turns the code runner OFF. See {@code application*.yml}.
 */
@SpringBootApplication
public class DevHubApplication {
    /**
     * Standard Spring Boot bootstrap. Profile selection, port and secrets all come
     * from the environment (see {@code application.yml}); nothing is configured here.
     */
    public static void main(String[] args) {
        SpringApplication.run(DevHubApplication.class, args);
    }
}
