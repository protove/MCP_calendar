# ============================================
# Development Stage
# ============================================
FROM gradle:8.5-jdk21 AS development

WORKDIR /app

# Copy Gradle configuration
COPY build.gradle.kts settings.gradle.kts gradle.properties ./
COPY gradle gradle

# Download dependencies
RUN gradle dependencies --no-daemon

# Copy source code
COPY src src

# Expose port
EXPOSE 8080

# Run with Spring Boot DevTools
CMD ["gradle", "bootRun", "--no-daemon"]


# ============================================
# Builder Stage
# ============================================
FROM gradle:8.5-jdk21 AS builder

WORKDIR /app

# Copy entire project
COPY . .

# Build application (skip tests for faster builds)
RUN gradle build --no-daemon -x test


# ============================================
# Production Stage
# ============================================
FROM eclipse-temurin:21-jre-alpine AS production

WORKDIR /app

# Add non-root user
RUN addgroup -S spring && adduser -S spring -G spring

# Copy JAR file from builder
COPY --from=builder /app/build/libs/*.jar app.jar

# Change ownership
RUN chown spring:spring app.jar

# Use non-root user
USER spring:spring

# Expose port
EXPOSE 8080

# JVM optimization for containers
ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", \
    "app.jar"]