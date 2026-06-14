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
 * Verifies the self-hosted OIDC story: a published JWKS, RS256 tokens validated
 * by the resource-server chain, and IdM claim shapes mapped to authorities.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class OidcResourceServerTest {

    @Autowired MockMvc mvc;
    private final ObjectMapper om = new ObjectMapper();

    private String oidcToken(String username, String password, String idm) throws Exception {
        var res = mvc.perform(post("/oauth2/token").contentType(APPLICATION_JSON)
                        .content(om.writeValueAsString(Map.of("username", username, "password", password, "idm", idm))))
                .andExpect(status().isOk())
                .andReturn();
        return om.readTree(res.getResponse().getContentAsString()).get("token").asText();
    }

    @Test
    void jwksExposesPublicKeyOnly() throws Exception {
        mvc.perform(get("/oauth2/jwks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.keys[0].kty").value("RSA"))
                .andExpect(jsonPath("$.keys[0].n").exists())   // public modulus present
                .andExpect(jsonPath("$.keys[0].d").doesNotExist()); // private exponent NOT leaked
    }

    @Test
    void entraAdminTokenMapsToAdminAuthority() throws Exception {
        String token = oidcToken("admin", "admin12345", "entra");
        mvc.perform(get("/api/oidc/userinfo").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authorities", hasItem("ROLE_ADMIN")))
                .andExpect(jsonPath("$.authorities", hasItem("SCOPE_User.Read")));
    }

    @Test
    void keycloakUserTokenIsForbiddenOnOidcAdmin() throws Exception {
        String token = oidcToken("demo", "demo12345", "keycloak");
        mvc.perform(get("/api/oidc/admin").header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminTokenAllowedOnOidcAdmin() throws Exception {
        String token = oidcToken("admin", "admin12345", "ping");
        mvc.perform(get("/api/oidc/admin").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void garbageBearerIsUnauthorized() throws Exception {
        mvc.perform(get("/api/oidc/userinfo").header("Authorization", "Bearer not.a.jwt"))
                .andExpect(status().isUnauthorized());
    }
}
