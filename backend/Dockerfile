# ============================================================================
# DevHub backend — multi-stage Docker build (production-hardened)
# ----------------------------------------------------------------------------
# Stage 1 builds the Spring Boot fat jar with Maven.
# Stage 2 is a lean Alpine JRE runtime (~80 MB vs ~200 MB without Alpine).
# Runs as a non-root user. Container-aware JVM flags applied automatically.
#
# Build (from the backend/ directory):
#   docker build -t devhub-backend .
#
# Run standalone:
#   docker run -p 8080:8080 \
#     -e SPRING_PROFILES_ACTIVE=prod \
#     -e DATABASE_URL=jdbc:postgresql://host:5432/devhub \
#     -e DATABASE_USERNAME=devhub \
#     -e DATABASE_PASSWORD=secret \
#     -e JWT_SECRET=change-me-32-chars-minimum-for-HS256 \
#     -e CORS_ALLOWED_ORIGINS=https://yourapp.com \
#     devhub-backend
#
# Or use docker-compose from the repo root:
#   docker compose up --build
# ============================================================================

# ---- Stage 1: Maven build ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build

# Cache Maven dependencies separately — only re-runs when pom.xml changes
COPY pom.xml .
RUN mvn -q -B dependency:go-offline

# Compile and package; skip tests (run them in CI before building the image)
COPY src ./src
RUN mvn -q -B clean package -DskipTests

# ---- Stage 2: Lean runtime (Alpine = ~80 MB) ----
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Optional language runtimes for the server-side code playground (app.exec.*).
# docker-compose builds with these ON so Python/TypeScript/Shell run in-container.
# A lean prod image (Render) can build with --build-arg INCLUDE_RUNTIMES=false —
# code execution is disabled in the prod profile anyway.
ARG INCLUDE_RUNTIMES=true
RUN if [ "$INCLUDE_RUNTIMES" = "true" ]; then \
      apk add --no-cache python3 nodejs npm bash; \
    fi

# Non-root user — security best practice; never run app as root in production.
# Child processes spawned by the runner therefore also run unprivileged.
RUN addgroup -S spring && adduser -S spring -G spring

# Copy the repackaged Spring Boot jar
COPY --from=build /build/target/*.jar app.jar

# Container-optimized JVM flags:
#   UseContainerSupport  — respect cgroup CPU/memory limits (not host values)
#   MaxRAMPercentage=75  — heap = 75% of container memory limit
#   urandom              — faster startup; /dev/random can block in containers
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"
ENV SPRING_PROFILES_ACTIVE=prod

EXPOSE 8080

# Docker will mark the container unhealthy if actuator/health stops responding.
# Orchestrators (Kubernetes, ECS) use this to decide when to restart the pod.
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

USER spring

# sh -c expands $JAVA_OPTS at runtime so the env var is honoured
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
