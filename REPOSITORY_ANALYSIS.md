# AyyyProject / YouCode - Repository Analysis

**Repository:** `AzizBenMallouk/AyyyProject`  
**Primary Language:** TypeScript (Frontend 67%), Java (Backend 33%)  
**Last Updated:** February 26, 2026  
**Status:** Active Development

---

## 📁 Structure & Organization

### Overall Directory Structure

```
AyyyProject/
├── app-backend/          # Java Spring Boot REST API
├── app-frontend/         # Next.js 16 React Application
├── terraform/            # AWS Infrastructure as Code
├── main.drawio           # System Architecture Diagram
└── .gitignore
```

### Main Folders and Their Purposes

#### 1. app-backend/ - Spring Boot API
Java-based REST API following a traditional layered architecture pattern:

```
app-backend/
├── src/main/java/com/youcode/
│   ├── config/           # Security, Database, File Storage configs
│   ├── controller/       # 18 REST API controllers (Admin, Student, Staff, CME)
│   ├── dto/              # 21 Data Transfer Objects (Request/Response)
│   ├── entity/           # 36 JPA entities (Users, Classrooms, Activities, etc.)
│   ├── exception/        # Global exception handling
│   ├── mapper/           # 17 MapStruct mappers (DTO <-> Entity)
│   ├── repository/       # 30 Spring Data JPA repositories
│   ├── security/         # JWT authentication filters & providers
│   ├── service/          # 18 business logic services
│   └── util/             # Password utilities
│
├── src/main/resources/
│   └── application.yml   # Application configuration
│
├── pom.xml               # Maven dependencies
├── Dockerfile            # Container image definition
├── GeneratePassword.java # Utility for password generation
└── README.md             # Backend documentation
```

**File Naming Conventions:**
- PascalCase for class names: `UserController.java`, `ClassroomService.java`
- Suffix patterns: `*Controller`, `*Service`, `*Repository`, `*DTO`, `*Mapper`

#### 2. app-frontend/ - Next.js Application
Modern React application with App Router architecture:

```
app-frontend/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── (dashboard)/  # Route Group - Dashboard pages
│   │   │   ├── admin/    # Admin pages (activities, campuses, grades, users)
│   │   │   ├── cme/      # CME (Career Management) interviews
│   │   │   ├── library/  # Library management (books, categories, reservations)
│   │   │   ├── profile/  # User profile
│   │   │   ├── staff/    # Staff pages (classrooms, programs, students, action-plans)
│   │   │   └── student/  # Student dashboard
│   │   ├── login/        # Authentication page
│   │   ├── page.tsx      # Landing page
│   │   ├── layout.tsx    # Root layout
│   │   └── globals.css   # Tailwind + custom styles
│   │
│   ├── components/       # Reusable UI components (shadcn/ui)
│   ├── context/          # React context providers
│   ├── lib/              # Utilities, hooks, API clients
│   └── types/            # TypeScript type definitions
│
├── public/               # Static assets
├── package.json          # NPM dependencies
├── next.config.ts        # Next.js configuration
├── tsconfig.json         # TypeScript config
├── postcss.config.mjs    # PostCSS/Tailwind
├── eslint.config.mjs     # ESLint rules
└── components.json       # shadcn/ui configuration
```

**File Naming Conventions:**
- kebab-case for directories: `action-plans/`, `soft-skills/`
- PascalCase for component files: `page.tsx`
- Route group syntax: `(dashboard)/` 

#### 3. terraform/ - AWS Infrastructure
Production-ready Infrastructure as Code:

```
terraform/
├── versions.tf           # Terraform & provider versions
├── deploy.sh             # Deployment automation script
├── global/
│   ├── s3-backend/       # Terraform state backend (S3 + DynamoDB)
│   └── iam-github-actions/ # OIDC for GitHub Actions
├── modules/
│   ├── vpc/              # Network: VPC, subnets, NAT, IGW
│   ├── ecr/              # Container registries
│   ├── eks/              # Kubernetes cluster + Fargate profiles
│   ├── irsa/             # IAM Roles for Service Accounts
│   ├── alb-controller/   # ALB ingress controller
│   ├── sqs/              # Message queues
│   └── lambda/           # AWS Lambda with Bedrock AI
└── environments/
    └── prod/             # Production environment
        ├── main.tf       # Root module
        ├── variables.tf  # Variable definitions
        ├── backend.tf    # S3 backend config
        └── terraform.tfvars # Environment values
```

---

## 💻 Technology Stack

### Backend (Java)

| Category | Technology | Version |
|----------|-----------|---------|
| **Framework** | Spring Boot | 3.2.2 |
| **Language** | Java | 17 (LTS) |
| **Build Tool** | Maven | 3.6+ |
| **Web** | Spring Web (Embedded Tomcat) | 3.2.2 |
| **Security** | Spring Security + JWT | 0.12.3 |
| **Data Access** | Spring Data JPA | 3.2.2 |
| **Database** | MySQL | 8.0+ |
| **Migrations** | Flyway | Latest |
| **Mapping** | MapStruct | 1.5.5.Final |
| **API Docs** | SpringDoc OpenAPI (Swagger) | 2.3.0 |
| **PDF** | iText | 8.0.2 |
| **QR Codes** | ZXing | 3.5.2 |
| **Utilities** | Lombok, Apache Commons | Various |

**Key Dependencies:**
```xml
<!-- Security -->
spring-boot-starter-security
jjwt-api / jjwt-impl / jjwt-jackson

<!-- Database -->
mysql-connector-j (runtime)
spring-boot-starter-data-jpa
flyway-core / flyway-mysql

<!-- DTO Mapping -->
mapstruct / mapstruct-processor
datafaker (for seeding)

<!-- Documentation -->
springdoc-openapi-starter-webmvc-ui

<!-- PDF/QR -->
itext7-core (pom)
zxing-core / zxing-javase
```

### Frontend (TypeScript)

| Category | Technology | Version |
|----------|-----------|---------|
| **Framework** | Next.js | 16.1.6 |
| **Language** | TypeScript | 5.x |
| **Runtime** | React | 19.2.3 |
| **Styling** | Tailwind CSS | 4.x |
| **UI Components** | shadcn/ui | 3.8.5 |
| **Radix Primitives** | Radix UI | ^1.x |
| **Animation** | Framer Motion | ^12.34.0 |
| **Icons** | Lucide React | ^0.563.0 |
| **Date Handling** | date-fns | ^4.1.0 |
| **Editor** | Editor.js | ^2.x |
| **Linting** | ESLint | 9.x |

**UI Component Libraries:**
- `@radix-ui/react-*` - Headless UI primitives (avatar, dialog, dropdown, select, etc.)
- `class-variance-authority` - Component variants
- `clsx`/`tailwind-merge` - Class name utilities
- `cmdk` - Command palette

### Infrastructure (Terraform)

| Category | Technology |
|----------|-----------|
| **IaC Tool** | Terraform 1.7+ |
| **Cloud Provider** | AWS |
| **Container Orchestration** | Amazon EKS 1.32 |
| **Compute** | AWS Fargate (Serverless Kubernetes) |
| **Load Balancer** | AWS ALB (Application Load Balancer) |
| **Messaging** | Amazon SQS |
| **AI/ML** | Amazon Bedrock (Claude 3) |
| **Container Registry** | Amazon ECR |
| **Secrets** | AWS Systems Manager (SSM) |
| **Authentication** | OIDC / IRSA (IAM Roles for Service Accounts) |
| **Deployment** | Argo CD |
| **Monitoring** | Prometheus + Grafana |
| **GitOps** | GitHub Actions + Helm |

---

## 🎯 Core Functionality

### Primary Purpose
YouCode is a **comprehensive Learning Management System (LMS)** designed for managing coding bootcamp operations. It handles:

1. **Student Management** - Profiles, enrollments, promotions, grades
2. **Classroom Operations** - Scheduling, attendance tracking, activities
3. **Learning Resources** - Library with book reservations
4. **Assessments** - Soft skills evaluation, interview scheduling
5. **Gamification** - Points system, squads, sprints
6. **Career Management** - CME interviews, action plans

### Key Features

#### Backend Capabilities
- **JWT Authentication** - Stateless auth with role-based access (ADMIN, STAFF, STUDENT, CME)
- **CRUD Operations** - Full REST API for all entities
- **File Upload** - Secure file storage with configurable properties
- **PDF Generation** - Report generation with iText
- **QR Code Integration** - Student/Classroom QR generation
- **Database Seeding** - Automated data initialization (28KB DataSeeder)
- **Swagger UI** - Interactive API documentation at `/api/swagger-ui.html`

#### Frontend Capabilities
- **Role-Based Dashboard** - Different views for Admin, Staff, Student, CME
- **Authentication** - Login with JWT token storage
- **Data Tables** - Full CRUD with sorting, filtering, pagination
- **Form Handling** - Dynamic forms with validation
- **Rich Text Editing** - Editor.js integration for content
- **Responsive Design** - Tailwind CSS with shadcn/ui components
- **Client-Side Routing** - Next.js App Router with nested layouts

#### DevOps/Infrastructure
- **Serverless Kubernetes** - EKS with Fargate (no EC2 management)
- **GitOps Deployment** - Argo CD for declarative deployments
- **Infrastructure as Code** - Complete AWS stack in Terraform
- **Auto-scaling** - Fargate automatic scaling
- **Monitoring Stack** - Prometheus + Grafana observability
- **CI/CD** - GitHub Actions with OIDC authentication
- **AI Pipeline** - Async processing with SQS → Lambda → Bedrock

### Main Entry Points

| Component | Entry Point | Description |
|-----------|-------------|-------------|
| **Backend** | `YoucodeBackendApplication.java` | Spring Boot main class |
| **Frontend** | `app/page.tsx` → redirects to `/login` | Next.js root |
| **API Docs** | `http://localhost:8080/api/swagger-ui.html` | OpenAPI/Swagger |
| **Authentication** | `POST /auth/login` | JWT token endpoint |
| **Terraform** | `environments/prod/main.tf` | Root module |

---

## 🧩 Code Components

### Backend Architecture

#### Controller Layer (18 controllers)
```java
// Example: ClassroomController
@RestController
@RequestMapping("/api/classrooms")
public class ClassroomController {
    // GET, POST, PUT, DELETE endpoints
    // Handles HTTP requests, delegates to services
}
```

**Controllers:** Absence, Activity, ActivityComment, Auth, Campus, Classroom, ClassroomActivity, File, Grade, Interview, Library, Point, Program, Promotion, Role, SoftSkill, Sprint, Squad, User

#### Entity Layer (36 entities)
Core domain models with JPA annotations:
- **Users:** User, Role, Permission, UserPermission, UserStatus
- **Education:** Classroom, Program, Promotion, Campus, Enroll
- **Activities:** Activity, ClassroomActivity, ClassroomActivityAssignment, ActivityComment
- **Assessment:** SoftSkill, SoftSkillEvaluation, Grade, StudentInterview, InterviewPosition
- **Library:** Book, BookCategory, Reservation
- **Gamification:** Point, PointCriteria, PointCriteriaCategory, Squad, Sprint
- **Other:** Absence, AbsenceType, MarketplaceProduct, MarketplaceOrder, LinkBrand, Competence

#### Service Layer (18 services)
Business logic implementation with transactional boundaries:
- `UserService` - Authentication, user CRUD
- `ClassroomService` - Class management, assignments
- `SquadService` - Team operations, points calculation
- `AuthService` - JWT generation, password encoding

#### Security Layer
```java
// JWT Token Provider
@Component
public class JwtTokenProvider {
    @Value("${jwt.secret}")
    private String jwtSecret;
    
    public String generateToken(Authentication auth) { ... }
    public boolean validateToken(String token) { ... }
}
```

#### DTO & Mapper Pattern
MapStruct for type-safe mapping:
```java
@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDTO toDTO(User user);
    User toEntity(UserDTO dto);
}
```

### Frontend Architecture

#### Next.js App Router Structure
Using Next.js 14+ App Router with:
- **Route Groups:** `(dashboard)` - shared layout for authenticated pages
- **Dynamic Segments:** `[id]` - for entity editing
- **Parallel Routes** - for complex layouts
- **Intercepting Routes** - for modals

#### State Management
- **React Context** - Global authentication state
- **Local State** - `useState` for component-level data
- **Server State** - Direct API calls with SWR-like caching

#### Component Patterns
```typescript
// shadcn/ui component usage
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { DataTable } from "@/components/ui/data-table"
```

#### Key Frontend Components
- **Data Tables** - Reusable table with server-side operations
- **Form Components** - Dynamic forms with validation
- **Dialog/Modal System** - For create/edit operations
- **Navigation** - Role-based sidebar navigation

---

## ⚙️ Configuration & Setup

### Backend Configuration

**application.yml:**
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/youcode
    username: your_username
    password: your_password
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true
  flyway:
    enabled: true
    locations: classpath:db/migration

jwt:
  secret: your-secret-key-min-256-bits

file:
  storage:
    path: ./uploads
```

**Environment Variables:**
- `JWT_SECRET` - JWT signing key (required)
- `MAIL_USERNAME` - SMTP username
- `MAIL_PASSWORD` - SMTP password

**Database Setup:**
```sql
CREATE DATABASE youcode CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Frontend Configuration

**.env.local:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

**Setup Commands:**
```bash
# Install dependencies
npm install

# Development server
npm run dev        # http://localhost:3000

# Build for production
npm run build
npm start
```

### Terraform Configuration

**Variables (terraform.tfvars):**
```hcl
project_name    = "ayyyapp"
environment     = "prod"
region          = "eu-west-3"
cluster_name    = "ayyyapp-prod"

fargate_profiles = [
  { name = "kube-system", selectors = [{ namespace = "kube-system" }] },
  { name = "app", selectors = [{ namespace = "ayyyapp-prod" }] },
  { name = "monitoring", selectors = [{ namespace = "monitoring" }] }
]
```

**Deployment Phases:**
1. Bootstrap S3 backend (global/s3-backend)
2. Bootstrap GitHub OIDC (global/iam-github-actions)
3. Deploy core infrastructure (environments/prod)
4. Configure kubectl access
5. Patch CoreDNS for Fargate
6. Install ALB Controller via Helm
7. Install ArgoCD
8. Deploy application via ArgoCD

---

## 📖 Documentation & Comments

### Existing Documentation

#### README Files
| File | Purpose | Size |
|------|---------|------|
| `app-backend/README.md` | Backend setup & API guide | 2.8 KB |
| `app-frontend/README.md` | Next.js getting started | 1.4 KB |
| `terraform/README.md` | Complete Infrastructure docs | 20.9 KB |

#### API Documentation
- **Swagger UI:** Auto-generated from SpringDoc annotations
- **OpenAPI JSON:** Available at `/api/docs`
- **Authentication Examples:** Login request/response documented

#### Code Documentation
- **Javadoc:** Present on public APIs (AuthController, Services)
- **Comments:** Inline comments in complex logic (DatabaseSeeder)
- **Configuration:** Well-documented YAML files

### Documentation Quality Assessment

| Aspect | Rating | Notes |
|--------|--------|-------|
| **README Coverage** | ⭐⭐⭐⭐ | Each component has dedicated README |
| **API Documentation** | ⭐⭐⭐⭐⭐ | Swagger/OpenAPI fully integrated |
| **Code Comments** | ⭐⭐⭐ | Key areas documented, some gaps |
| **Terraform Docs** | ⭐⭐⭐⭐⭐ | Comprehensive module reference |
| **Architecture Docs** | ⭐⭐⭐⭐ | drawio diagram + detailed README |

---

## 🚦 Development Status

### Repository Metadata
- **Created:** February 15, 2026
- **Last Updated:** February 26, 2026
- **Stars:** 1
- **Forks:** 0
- **Issues:** 0 (open)
- **Visibility:** Private
- **Default Branch:** `main`

### Activity Indicators
- ✅ **Recent Commits:** February 26, 2026
- ✅ **Active Development:** Multiple component updates
- ✅ **Documentation Updated:** Terraform README current as of Feb 26, 2026
- ✅ **Dependencies Current:** Next.js 16, Spring Boot 3.2.2

### Missing/TODO Items
Based on code analysis, potential improvements:

1. **Backend:**
   - Unit test coverage (spring-boot-starter-test present but no test files visible)
   - Integration tests for controllers
   - API versioning strategy

2. **Frontend:**
   - Error boundary implementation
   - Loading states optimization
   - Offline support (PWA)

3. **Infrastructure:**
   - Cost monitoring/alerting
   - Disaster recovery documentation
   - Backup strategy for databases

### Security Considerations
✅ **Implemented:**
- JWT authentication with role-based access
- HTTPS (ALB termination)
- No hardcoded secrets (environment variables)
- IRSA for AWS service authentication
- Container image scanning (ECR)

⚠️ **Recommendations:**
- Enable dependency vulnerability scanning (Dependabot)
- Add rate limiting on API endpoints
- Implement audit logging

---

## 🏗️ Design Patterns & Architectural Decisions

### Backend Patterns
1. **Layered Architecture** - Controller → Service → Repository
2. **DTO Pattern** - Separate API models from domain entities
3. **Mapper Pattern** - MapStruct for type conversion
4. **Repository Pattern** - Spring Data JPA for data access
5. **Singleton** - Services as Spring beans
6. **JWT Authentication** - Stateless security

### Frontend Patterns
1. **Container/Presentational** - Pages (containers) vs Components (presentational)
2. **Higher-Order Components** - Route guards, layout wrappers
3. **Compound Components** - shadcn/ui Dialog, Dropdown patterns
4. **Custom Hooks** - Data fetching, authentication
5. **Context API** - Global state management

### Infrastructure Patterns
1. **GitOps** - ArgoCD for declarative deployments
2. **Infrastructure as Code** - Complete Terraform coverage
3. **Serverless Compute** - EKS Fargate (no EC2 nodes)
4. **Security Best Practices** - IRSA, OIDC, no long-lived credentials
5. **Multi-Account Strategy** - Separate bootstrap resources

---

## 📊 Project Statistics

| Metric | Count |
|--------|-------|
| **Backend Java Files** | ~130 |
| **Frontend TSX Files** | ~25 pages + components |
| **Terraform Resources** | ~55+ modules/resources |
| **Entities** | 36 JPA entities |
| **API Endpoints** | ~80+ REST endpoints |
| **Database Tables** | ~40 tables |

---

## 🔄 Deployment Workflow

```
Developer Push → GitHub Actions → ECR Build → ArgoCD → EKS (Fargate) → ALB
                                      ↓
                              Terraform Apply → AWS Resources
```

### Environments
- **Development:** Local Docker Compose (implied)
- **Production:** AWS EKS (eu-west-3)

---

*Analysis generated on March 3, 2026 by Ghost AI*  
*Repository: AzizBenMallouk/AyyyProject*  
*Purpose: Comprehensive codebase documentation*