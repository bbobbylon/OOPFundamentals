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

    public static Idm from(String value) {
        if (value == null) return SPRING;
        try {
            return Idm.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return SPRING;
        }
    }
}
