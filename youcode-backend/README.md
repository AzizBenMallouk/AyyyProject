# YouCode Backend - SpringBoot

Modern SpringBoot backend for the YouCode Learning Management System.

## Tech Stack

- **Java 17**
- **Spring Boot 3.2.2**
- **Spring Security** with JWT authentication
- **Spring Data JPA** with Hibernate
- **MySQL** database
- **Flyway** for database migrations
- **Lombok** for reducing boilerplate
- **MapStruct** for DTO mapping
- **SpringDoc OpenAPI** for API documentation

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+

## Setup

1. **Create MySQL Database**
   ```sql
   CREATE DATABASE youcode CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **Configure Database**
   
   Update `src/main/resources/application.yml`:
   ```yaml
   spring:
     datasource:
       url: jdbc:mysql://localhost:3306/youcode
       username: your_username
       password: your_password
   ```

3. **Set JWT Secret**
   
   Set environment variable or update in `application.yml`:
   ```bash
   export JWT_SECRET="your-secret-key-min-256-bits"
   ```

4. **Build and Run**
   ```bash
   ./mvnw clean install
   ./mvnw spring-boot:run
   ```

## API Documentation

Once running, access Swagger UI at:
```
http://localhost:8080/api/swagger-ui.html
```

API docs JSON:
```
http://localhost:8080/api/docs
```

## Authentication

### Login
```bash
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "id": 1,
  "username": "admin",
  "email": "admin@youcode.ma",
  "role": "ADMIN"
}
```

### Using JWT Token

Include the token in the Authorization header:
```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Project Structure

```
src/main/java/com/youcode/
├── config/          # Configuration classes
├── controller/      # REST API controllers
├── dto/             # Data Transfer Objects
├── entity/          # JPA entities
├── exception/       # Custom exceptions
├── repository/      # Spring Data repositories
├── security/        # Security & JWT components
├── service/         # Business logic
└── util/            # Utility classes
```

## Database Migrations

Flyway migrations are located in `src/main/resources/db/migration/`.

To create a new migration:
1. Create file: `V{version}__{description}.sql`
2. Example: `V1__create_users_table.sql`

## Testing

Run tests:
```bash
./mvnw test
```

Run with coverage:
```bash
./mvnw clean test jacoco:report
```

## Building for Production

```bash
./mvnw clean package -DskipTests
java -jar target/youcode-backend-1.0.0.jar
```

## Environment Variables

- `JWT_SECRET` - Secret key for JWT tokens (required)
- `MAIL_USERNAME` - Email username for notifications
- `MAIL_PASSWORD` - Email password

## License

MIT
