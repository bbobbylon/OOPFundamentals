package com.bob.devhub.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/** Unit test for the HS256 token service — focuses on the new roles claim. */
class JwtServiceTest {

    private final JwtService jwt = new JwtService();

    @BeforeEach
    void setup() {
        ReflectionTestUtils.setField(jwt, "secret", "test-secret-test-secret-test-secret-0123456789");
        ReflectionTestUtils.setField(jwt, "expirationMs", 3_600_000L);
    }

    @Test
    void tokenCarriesUsernameAndRoles() {
        UserDetails user = User.withUsername("alice").password("x")
                .authorities("ROLE_USER", "ROLE_ADMIN").build();

        String token = jwt.generateToken(user);

        assertThat(jwt.extractUsername(token)).isEqualTo("alice");
        assertThat(jwt.extractRoles(token)).containsExactlyInAnyOrder("ROLE_USER", "ROLE_ADMIN");
        assertThat(jwt.isTokenValid(token, user)).isTrue();
    }

    @Test
    void rolesAbsentYieldsEmptyList() {
        UserDetails user = User.withUsername("bob").password("x").authorities(List.of()).build();
        String token = jwt.generateToken(user);
        assertThat(jwt.extractRoles(token)).isEmpty();
    }
}
