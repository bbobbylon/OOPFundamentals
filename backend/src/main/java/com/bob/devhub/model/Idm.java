package com.bob.devhub.model;

/**
 * Identity providers whose token "claim shapes" the OIDC issuer can mimic.
 *
 * Different IdMs put authorization data in different claims:
 *   SPRING   → roles: ["ROLE_USER", ...]            scope: "..."
 *   ENTRA    → roles: ["User","Admin"]  scp: "..."  appid, tid, ver   (Microsoft Entra ID)
 *   PING     → group: ["user","admin"]  scope: "..."  client_id        (PingFederate / PingOne)
 *   KEYCLOAK → realm_access: {roles:[...]}  scope: "..."  azp
 *
 * The resource server's {@code IdmAuthoritiesConverter} understands all of these
 * shapes, so the claims→authorities mapping is real for whichever IdM you pick.
 */
public enum Idm {
    SPRING, ENTRA, PING, KEYCLOAK;

    /**
     * Lenient parser for the {@code idm} field of {@code POST /oauth2/token}
     * ({@link com.bob.devhub.dto.OidcTokenRequest}). Case-insensitive; null, blank
     * or unknown values fall back to {@link #SPRING} rather than failing, because
     * the field is optional and the Spring shape is the "plain" default the
     * learner sees first.
     */
    public static Idm from(String value) {
        if (value == null) return SPRING;
        try {
            return Idm.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return SPRING;
        }
    }
}
