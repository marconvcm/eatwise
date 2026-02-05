# Stage 1: Build the application
FROM gradle:8.5-jdk17-alpine AS build
WORKDIR /app
COPY build.gradle* settings.gradle* ./
COPY src ./src
RUN gradle clean bootJar -x test --no-daemon

# Stage 2: Create the runtime image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Create a non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy the built jar from the build stage
COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
