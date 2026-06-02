# ============================================================================
# DevHub backend — multi-stage Docker build
# ----------------------------------------------------------------------------
# Stage 1 builds the Spring Boot fat jar with Maven; stage 2 ships only the
# JRE + jar so the final image stays small. Works on Render, Railway, Fly.io,
# or any Docker host. Build context is this `backend/` directory.
#
#   docker build -t devhub-backend .
#   docker run -p 8080:8080 \
#     -e SPRING_PROFILES_ACTIVE=prod \
#     -e DATABASE_URL=jdbc:postgresql://host:5432/devhub \
#     -e DATABASE_USERNAME=devhub \
#     -e DATABASE_PASSWORD=secret \
#     -e JWT_SECRET=change-me-to-a-long-random-string \
#     -e CORS_ALLOWED_ORIGINS=https://yourname.github.io \
#     devhub-backend
# ============================================================================

# ---- Stage 1: build ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Cache dependencies first (only re-runs when pom.xml changes)
COPY pom.xml .
RUN mvn -q -B dependency:go-offline

# Build the application
COPY src ./src
RUN mvn -q -B clean package -DskipTests

# ---- Stage 2: runtime ----
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copy the repackaged Spring Boot jar (excludes *.jar.original)
COPY --from=build /app/target/*.jar app.jar

# Render/Railway/Fly inject the port via $PORT; application-prod.yml reads it.
EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=prod

ENTRYPOINT ["java", "-jar", "app.jar"]
