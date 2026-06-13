# syntax=docker/dockerfile:1

###############################################################################
# Stage 1 — Build the Vite / React single-page app                            #
###############################################################################
FROM node:20-alpine AS ui-build
WORKDIR /ui

# Install dependencies first (cached unless package manifests change).
COPY ui/package.json ui/package-lock.json ./
RUN npm ci

# Build the SPA -> produces /ui/dist
COPY ui/ ./
RUN npm run build

###############################################################################
# Stage 2 — Build the Spring Boot jar that serves the SPA                     #
###############################################################################
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

# Cache dependency resolution separately from source changes.
COPY gradlew settings.gradle build.gradle ./
COPY gradle ./gradle
RUN chmod +x gradlew && ./gradlew --no-daemon dependencies || true

# Bring in the built SPA so the `copyUi` task folds it into static resources.
COPY --from=ui-build /ui/dist ./ui/dist

COPY src ./src
RUN ./gradlew --no-daemon clean bootJar -x test

###############################################################################
# Stage 3 — Minimal runtime image                                             #
###############################################################################
FROM eclipse-temurin:17-jre AS runtime
WORKDIR /app

RUN addgroup --system spring && adduser --system --ingroup spring spring

COPY --from=build /app/build/libs/*.jar app.jar
RUN chown spring:spring app.jar
USER spring

EXPOSE 8081

ENV JAVA_OPTS=""
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
