# YouCode — Architecture Diagram Specification

> Give this entire file to an AI (ChatGPT, Claude, Gemini…) with the prompt:
> **"Generate a detailed architecture diagram based on the specification below. Use a clean, modern style."**

---

## 1. High-Level Context

YouCode is a web application deployed on AWS EKS using a full GitOps approach.
It has 4 main concerns represented as separate diagram zones:
- **CI/CD Pipeline** (GitHub Actions)
- **AWS Infrastructure** (VPC, EKS, ECR, S3, SQS, SNS, Lambda)
- **Kubernetes Workloads** (ArgoCD, Argo Rollouts, apps, monitoring)
- **Feature Notification Flow** (serverless AI-powered email pipeline)

---

## 2. Actors / Entry Points

- **Developer** — pushes code to GitHub (`main` branch)
- **End Users** — access the app via browser through an ALB
- **Ops/Reviewer** — reviews preview deployments and approves promotion in GitHub UI

---

## 3. Source Repositories & Code Areas

Single GitHub repository: `AzizBenMallouk/AyyyProject`

Relevant directories:
| Directory | Content |
|---|---|
| `app-backend/` | Spring Boot Java REST API |
| `app-frontend/` | Next.js React UI |
| `app-notifications-worker/` | Python Lambda function |
| `gitops/` | Kustomize manifests (watched by ArgoCD) |
| `terraform/environments/prod/` | IaC split into 4 layers |
| `.github/workflows/deploy.yml` | GitHub Actions CI/CD pipeline |

---

## 4. CI/CD Pipeline (GitHub Actions)

Trigger: push to `main` branch.

Draw as a horizontal pipeline with 5 sequential jobs connected by arrows. Show conditional (dashed) arrows where `if:` conditions apply.

```
[Developer] --git push--> [GitHub: main branch]
                                    |
                          [Job 1: filter]
                          Detects which component changed:
                          - app-backend changed? → flag: backend=true
                          - app-frontend changed? → flag: frontend=true
                                    |
                    ┌───────────────┴──────────────┐
                    │ (if backend OR frontend=true) │
                    ▼                              ▼
          [Job 2: build-and-push]          (skipped if only gitops changed)
          For each changed component:
          - Set up QEMU + Docker Buildx (ARM64)
          - Build Docker image (linux/arm64)
          - Push to Amazon ECR with tag: {git-sha}
          - Uses GHA cache for Docker layers
                    |
                    ▼
             [Job 3: deploy]
          - Update gitops/overlays/prod/kustomization.yaml
            (set new image tags for changed components)
          - git commit + push [skip ci]
          - Post Job Summary: preview review instructions
            (port-forward commands for frontend-preview & backend-preview)
                    |
                    ▼
          [Job 4: promote] ← PAUSED ⏸ (requires manual approval)
          Uses GitHub Environment: "production"
          (Required Reviewer must approve before this runs)
          - Download & cache kubectl-argo-rollouts plugin
          - aws eks update-kubeconfig
          - kubectl argo rollouts promote youcode-backend  (if backend changed)
          - kubectl argo rollouts promote youcode-frontend (if frontend changed)
                    │
      ┌─────────────┴─────────────────────────┐
      │ (if commit msg starts with "feature")  │
      ▼                                        │
[Job 5: notify] (runs in parallel to promote)
- Build git diff summary
- Send JSON event to SQS queue
  Payload: { commit_sha, commit_message, author, diff_summary }
```

---

## 5. AWS Infrastructure

### 5.1 Networking Layer (`01-network`)

```
AWS Region: us-east-1

┌─────────────────────────────────────────────────────────┐
│  VPC (10.x.x.x/16)                                      │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  AZ-1        │  │  AZ-2        │  │  AZ-3        │  │
│  │ Public Subnet│  │ Public Subnet│  │ Public Subnet│  │
│  │ (ALB, NLBs)  │  │              │  │              │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │ NAT GW           │           │              │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────┐  │
│  │ Private Sub  │  │ Private Sub  │  │ Private Sub  │  │
│  │ (EKS Nodes)  │  │ (EKS Nodes)  │  │ (EKS Nodes)  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 5.2 EKS Cluster Layer (`02-cluster`)

```
EKS Control Plane (managed by AWS)
         │
         ▼
Managed Node Group:
- Instance: t4g.small (ARM64 Graviton)
- AMI: AL2023_ARM_64_STANDARD
- Min: 0, Max: 5, Desired: 3
- Capacity: ON_DEMAND
- VPC CNI with prefix delegation (more pods per node)

IAM:
- GitHub Actions OIDC Provider → IAM Role "github-actions-oidc-role"
  (allows GitHub Actions to authenticate with AWS without static keys)
- Manual OIDC provider for EKS (for IRSA)
```

### 5.3 AWS Managed Services

```
┌─────────────────────────────────────────────────────────┐
│ ECR (Elastic Container Registry)                        │
│   - app-frontend-prod  (IMMUTABLE tags)                 │
│   - app-backend-prod   (IMMUTABLE tags)                 │
│   - Lifecycle policy: keep last 10 images only          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ S3                                                       │
│   - Bucket: prod-eks-cluster-aws-s3-uploads-bucket      │
│   - Private, versioned                                   │
│   - Backend accesses via IRSA (no static credentials)   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Notification Pipeline (Serverless)                       │
│                                                          │
│  SQS Queue: feature-announcements                        │
│   └── Dead Letter Queue (after 3 failures)               │
│            │                                             │
│            ▼ (event source mapping)                      │
│  Lambda: feature-notifier (Python 3.12, 256MB, 120s)    │
│   ├── Reads: Secrets Manager (HuggingFace token)         │
│   ├── Calls: HuggingFace API (Mistral-7B-Instruct)      │
│   │          → generates email subject + HTML body       │
│   └── Publishes to: SNS Topic feature-updates            │
│                          │                              │
│                          ▼ (protocol: email)             │
│                   📧 App Users (subscribers)             │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Kubernetes Cluster Workloads

All workloads run on EKS. Draw as boxes inside the cluster boundary.

### Namespace: `argocd`
```
┌──────────────────────────────────────────────┐
│ ArgoCD                                        │
│ - Watches: github.com/AzizBenMallouk/AyyyProject│
│ - Path: gitops/overlays/prod/                │
│ - Sync: automated (prune + selfHeal)          │
│ - Exposed: via NLB (internet-facing)          │
└──────────────────────────────────────────────┘
```

### Namespace: `argo-rollouts`
```
┌────────────────────────────────┐
│ Argo Rollouts Controller       │
│ Manages Blue/Green deployments │
└────────────────────────────────┘
```

### Namespace: `kube-system`
```
┌────────────────────────────────────────────┐
│ AWS Load Balancer Controller               │
│ - creates ALB from Ingress resources       │
│ - IRSA role for AWS API access             │
└────────────────────────────────────────────┘
```

### Namespace: `monitoring`
```
┌─────────────────────────────────────────────────────┐
│ kube-prometheus-stack                                │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
│ │  Prometheus  │ │   Grafana    │ │AlertManager  │  │
│ │  7d retention│ │  via NLB     │ │              │  │
│ └──────────────┘ └──────────────┘ └──────────────┘  │
│                                                      │
│ ServiceMonitors:                                     │
│   - youcode-backend → /actuator/prometheus (8082)   │
│   - youcode-frontend → /metrics (3000)               │
└─────────────────────────────────────────────────────┘
```

### Namespace: `default` (Application Workloads)
```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Argo Rollout: youcode-backend (Blue/Green)                  │ │
│  │  🔵 Blue Pod (active, prod traffic)  ← Service: youcode-backend│
│  │  🟢 Green Pod (preview, new version) ← Service: youcode-backend-preview│
│  │  Image: ECR/app-backend-prod:{sha}                          │ │
│  │  Spring Boot, port 8082                                     │ │
│  │  IRSA → S3 access                                           │ │
│  │  MySQL connection: jdbc:mysql://mysql:3306/app_db           │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Argo Rollout: youcode-frontend (Blue/Green)                 │ │
│  │  🔵 Blue Pod (active, prod traffic)  ← Service: youcode-frontend│
│  │  🟢 Green Pod (preview, new version) ← Service: youcode-frontend-preview│
│  │  Image: ECR/app-frontend-prod:{sha}                         │ │
│  │  Next.js, port 3000                                         │ │
│  │  Env: NEXT_PUBLIC_API_URL=/api                              │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌──────────────────────────────────┐                           │
│  │ Deployment: mysql                │                           │
│  │  MySQL 8.0, port 3306            │                           │
│  │  Database: app_db                │                           │
│  └──────────────────────────────────┘                           │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Ingress: app-ingress (ALB, internet-facing)                 ││
│  │   /api  → youcode-backend:8082 (prod traffic only)         ││
│  │   /     → youcode-frontend:80  (prod traffic only)         ││
│  └──────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

---

## 7. Full End-to-End Request Flow (User → App)

```
[Browser]
    │ HTTPS
    ▼
[ALB: youcode-alb] (internet-facing, in public subnets)
    │
    ├── /api/* ──►  youcode-backend Service (port 8082) ──► Backend Pod (Spring Boot)
    │                                                              │
    │                                                        MySQL (app_db)
    │                                                        S3 (file uploads, via IRSA)
    │
    └── /*     ──►  youcode-frontend Service (port 80) ──► Frontend Pod (Next.js)
```

---

## 8. GitOps Sync Flow

```
[GitHub Actions: deploy job]
    │ updates kustomization.yaml (new image tag)
    │ git push to main
    ▼
[GitHub: gitops/overlays/prod/kustomization.yaml]
    │ ArgoCD polls every 3 minutes (or webhook)
    ▼
[ArgoCD] detects diff → initiates sync
    │ applies new Rollout manifest
    ▼
[Argo Rollouts Controller]
    │ spins up Green pod alongside Blue pod
    │ routes 0% traffic to Green
    ▼
[GitHub Actions: promote job] ← waits for manual approval
    │ Reviewer checks preview service (port-forward)
    │ Approves in GitHub UI
    ▼
[Argo Rollouts: promote]
    │ switches active Service selector to Green pod
    │ keeps Blue pod for ~30s then terminates
    ▼
[Production traffic now goes to Green (new version)]
```

---

## 9. Feature Announcement Flow

```
[Developer]
    │ git commit -m "feature: add dark mode"
    │ git push
    ▼
[GitHub Actions: notify job]
    │ detects: commit message starts with "feature"
    │ runs: git diff --stat (builds change summary)
    │
    ▼
[SQS: feature-announcements queue]
    │ Message: { sha, message, author, diff_summary }
    ▼
[Lambda: feature-notifier]
    │ ① Fetch HuggingFace token from Secrets Manager
    │ ② POST to HuggingFace API: Mistral-7B-Instruct
    │      Prompt: "Write a product update email about: {commit info}"
    │      Response: { subject: "...", body: "<html>...</html>" }
    │ ③ Wrap in branded HTML email template
    │ ④ Publish to SNS topic: feature-updates
    ▼
[SNS: feature-updates topic]
    │ Protocol: email
    ▼
[📧 All subscribed users receive the announcement]
```

---

## 10. Diagram Style Notes

When generating the diagram, please:

- Use a **dark background** (#1a1a2e or similar dark navy) with light-colored components
- Use **color coding** per zone:
  - 🟦 Blue: CI/CD / GitHub Actions
  - 🟧 Orange: AWS managed services (ECR, S3, SQS, SNS, Lambda, Secrets Manager)
  - 🟩 Green: Kubernetes / EKS workloads
  - 🟪 Purple: GitOps (ArgoCD, Argo Rollouts)
  - 🔴 Red: Monitoring (Prometheus, Grafana, AlertManager)
  - ⚡ Yellow: Serverless notification pipeline
- Use **solid arrows** for synchronous calls, **dashed arrows** for async/event-driven flows
- Use **bold borders** to group AWS VPC, EKS cluster, and GitHub as distinct boundary boxes
- Show the **Blue/Green split** clearly with two parallel pods and separate services
- Add **small icons** where possible: Docker whale (builds), GitHub logo, AWS logo, K8s wheel, ArgoCD icon
