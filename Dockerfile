# Stage 1: Build the Angular frontend
FROM node:24 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the Spring Boot backend
FROM maven:3.9-eclipse-temurin-21 AS backend-build
WORKDIR /app/backend
COPY backend/pom.xml ./
COPY backend/src ./src
# Copy the compiled Angular static files from the first stage directly into the backend static resources folder
COPY --from=frontend-build /app/frontend/dist/finvertex-angular/browser/ src/main/resources/static/
RUN mvn clean package -DskipTests

# Stage 3: Run stage
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=backend-build /app/backend/target/*.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
