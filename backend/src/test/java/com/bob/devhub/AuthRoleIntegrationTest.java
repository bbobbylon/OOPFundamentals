package com.bob.devhub;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.hamcrest.Matchers.hasItem;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Verifies the role-based authorization story end to end against the real
 * security chain, using the dev-seeded demo (USER) and admin (ADMIN) accounts.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class AuthRoleIntegrationTest {

    @Autowired MockMvc mvc;
    private final ObjectMapper om = new ObjectMapper();

    private String login(String username, String password) throws Exception {
        var res = mvc.perform(post("/api/auth/login").contentType(APPLICATION_JSON)
                        .content(om.writeValueAsString(Map.of("username", username, "password", password))))
                .andExpect(status().isOk())
                .andReturn();
        return om.readTree(res.getResponse().getContentAsString()).get("token").asText();
    }

    @Test
    void loginReturnsRoles() throws Exception {
        mvc.perform(post("/api/auth/login").contentType(APPLICATION_JSON)
                        .content(om.writeValueAsString(Map.of("username", "admin", "password", "admin12345"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.roles", hasItem("ROLE_ADMIN")));
    }

    @Test
    void anonymousIsUnauthorizedOnAdmin() throws Exception {
        mvc.perform(get("/api/admin/users")).andExpect(status().isUnauthorized());
    }

    @Test
    void userIsForbiddenOnAdmin() throws Exception {
        String token = login("demo", "demo12345");
        mvc.perform(get("/api/admin/users").header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminIsAllowedOnAdmin() throws Exception {
        String token = login("admin", "admin12345");
        mvc.perform(get("/api/admin/users").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].username").exists());
    }

    @Test
    void tamperedTokenIsUnauthorized() throws Exception {
        String token = login("demo", "demo12345");
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token + "tampered"))
                .andExpect(status().isUnauthorized());
    }
}
