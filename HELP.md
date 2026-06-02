# DevHub — Deploy Quick Reference

> Full step-by-step walkthrough (with screenshots-worthy detail, env vars, and a
> troubleshooting table) lives in **[README.md → "Deploying the Dev Learning Hub"](README.md#deploying-the-dev-learning-hub-devhub)**.
> This is the condensed cheat-sheet.

**The one wire:** `frontend/config.js` → `window.DEVHUB_API_BASE` tells the
frontend where the backend is. `null` = local dev (`http://localhost:8081`); set
it to your deployed HTTPS URL for production.

### Run locally

| | Windows | macOS / Linux |
|---|---|---|
| **Backend** (H2, :8081) | `.\mvnw.cmd -f backend\pom.xml spring-boot:run` | `./mvnw -f backend/pom.xml spring-boot:run` |
| **Frontend** (:5500) | `cd frontend; py -m http.server 5500` | `cd frontend && python3 -m http.server 5500` |

Then open <http://localhost:5500/app.html>. Health check: <http://localhost:8081/actuator/health>.
Serve the frontend on **5500** (it's CORS-allowed); don't open `app.html` as a `file://`.

### Build / containerize the backend

```
# Build the executable jar  →  backend/target/devhub-backend-0.0.1-SNAPSHOT.jar
.\mvnw.cmd -f backend\pom.xml -DskipTests clean package      # Windows
./mvnw -f backend/pom.xml -DskipTests clean package          # macOS/Linux

# Or build the Docker image (context = backend/)
cd backend
docker build -t devhub-backend .
```

### Production environment variables (backend)

| Key | Example | Notes |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | `prod` | switches H2 → PostgreSQL |
| `DATABASE_URL` | `jdbc:postgresql://host:5432/devhub` | must start with `jdbc:postgresql://` |
| `DATABASE_USERNAME` / `DATABASE_PASSWORD` | — | keep out of the URL |
| `JWT_SECRET` | 32+ random chars | signs login tokens |
| `CORS_ALLOWED_ORIGINS` | `https://yourname.github.io` | your Pages origin, no trailing slash |

### Deploy checklist

1. Backend → Render (Docker, root dir `backend/`) + Postgres; set the env vars above.
2. `frontend/config.js` → set `DEVHUB_API_BASE` to the Render HTTPS URL.
3. Push to `master` → GitHub Pages workflow publishes `frontend/`.
4. Backend `CORS_ALLOWED_ORIGINS` must equal your Pages origin exactly.
5. Open the app → **Sign in → Register** to create the first account.

---

# Getting Started

### Reference Documentation

For further reference, please consider the following sections:

* [Official Apache Maven documentation](https://maven.apache.org/guides/index.html)
* [Spring Boot Maven Plugin Reference Guide](https://docs.spring.io/spring-boot/4.0.6/maven-plugin)
* [Create an OCI image](https://docs.spring.io/spring-boot/4.0.6/maven-plugin/build-image.html)
* [Azure Actuator](https://aka.ms/spring/docs/actuator)
* [Spring Boot Actuator](https://docs.spring.io/spring-boot/4.0.6/reference/actuator/index.html)
* [Azure Active Directory](https://microsoft.github.io/spring-cloud-azure/current/reference/html/index.html#spring-security-with-azure-active-directory)
* [Spring Batch JDBC](https://docs.spring.io/spring-boot/4.0.6/how-to/batch.html)
* [Rest Repositories](https://docs.spring.io/spring-boot/4.0.6/how-to/data-access.html#howto.data-access.exposing-spring-data-repositories-as-rest)
* [Spring Boot DevTools](https://docs.spring.io/spring-boot/4.0.6/reference/using/devtools.html)
* [Spring for GraphQL](https://docs.spring.io/spring-boot/4.0.6/reference/web/spring-graphql.html)
* [Netflix DGS](https://netflix.github.io/dgs/)
* [OAuth2 Authorization Server](https://docs.spring.io/spring-boot/4.0.6/reference/web/spring-security.html#web.security.oauth2.authorization-server)
* [OAuth2 Client](https://docs.spring.io/spring-boot/4.0.6/reference/web/spring-security.html#web.security.oauth2.client)
* [OAuth2 Resource Server](https://docs.spring.io/spring-boot/4.0.6/reference/web/spring-security.html#web.security.oauth2.server)
* [Spring REST Docs](https://docs.spring.io/spring-restdocs/docs/current/reference/htmlsingle/)
* [Spring Security](https://docs.spring.io/spring-boot/4.0.6/reference/web/spring-security.html)
* [Anthropic Claude](https://docs.spring.io/spring-ai/reference/api/chat/anthropic-chat.html)
* [DeepSeek](https://docs.spring.io/spring-ai/reference/api/chat/deepseek-chat.html)
* [Ollama](https://docs.spring.io/spring-ai/reference/api/chat/ollama-chat.html)
* [OpenAI](https://docs.spring.io/spring-ai/reference/api/chat/openai-chat.html)
* [HTTP Client](https://docs.spring.io/spring-boot/4.0.6/reference/io/rest-client.html#io.rest-client.restclient)
* [Reactive HTTP Client](https://docs.spring.io/spring-boot/4.0.6/reference/io/rest-client.html#io.rest-client.webclient)
* [Spring Web](https://docs.spring.io/spring-boot/4.0.6/reference/web/servlet.html)
* [Spring Reactive Web](https://docs.spring.io/spring-boot/4.0.6/reference/web/reactive.html)
* [WebSocket](https://docs.spring.io/spring-boot/4.0.6/reference/messaging/websockets.html)

### Guides

The following guides illustrate how to use some features concretely:

* [Building a RESTful Web Service with Spring Boot Actuator](https://spring.io/guides/gs/actuator-service/)
* [Securing a Java Web App with the Spring Boot Starter for Azure Active Directory](https://aka.ms/spring/msdocs/aad)
* [Accessing JPA Data with REST](https://spring.io/guides/gs/accessing-data-rest/)
* [Accessing Neo4j Data with REST](https://spring.io/guides/gs/accessing-neo4j-data-rest/)
* [Accessing MongoDB Data with REST](https://spring.io/guides/gs/accessing-mongodb-data-rest/)
* [Building a GraphQL service](https://spring.io/guides/gs/graphql-server/)
* [Accessing data with MySQL](https://spring.io/guides/gs/accessing-data-mysql/)
* [Securing a Web Application](https://spring.io/guides/gs/securing-web/)
* [Spring Boot and OAuth2](https://spring.io/guides/tutorials/spring-boot-oauth2/)
* [Authenticating a User with LDAP](https://spring.io/guides/gs/authenticating-ldap/)
* [Building a RESTful Web Service](https://spring.io/guides/gs/rest-service/)
* [Serving Web Content with Spring MVC](https://spring.io/guides/gs/serving-web-content/)
* [Building REST services with Spring](https://spring.io/guides/tutorials/rest/)
* [Building a Reactive RESTful Web Service](https://spring.io/guides/gs/reactive-rest-service/)
* [Using WebSocket to build an interactive web application](https://spring.io/guides/gs/messaging-stomp-websocket/)

### Additional Links

These additional references should also help you:

* [Azure Active Directory Sample](https://aka.ms/spring/samples/latest/aad)

### Maven Parent overrides

Due to Maven's design, elements are inherited from the parent POM to the project POM.
While most of the inheritance is fine, it also inherits unwanted elements like `<license>` and `<developers>` from the
parent.
To prevent this, the project POM contains empty overrides for these elements.
If you manually switch to a different parent and actually want the inheritance, you need to remove those overrides.

