# YouCode — End-to-End Deployment Guide

> **Stack**: Next.js (frontend) · Spring Boot (backend) · AWS EKS · ECR · Terraform · Kustomize · GitHub Actions

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Getting the Repository](#2-getting-the-repository)
3. [AWS Account Bootstrap](#3-aws-account-bootstrap)
4. [Terraform — Provisioning Infrastructure](#4-terraform--provisioning-infrastructure)
5. [Kubernetes — Manual First-Time Setup](#5-kubernetes--manual-first-time-setup)
6. [Kubernetes — Deploying the Application](#6-kubernetes--deploying-the-application)
7. [GitHub Actions — CI/CD Pipelines](#7-github-actions--cicd-pipelines)
8. [Blue-Green Release Flow](#8-blue-green-release-flow)
9. [Useful Commands](#9-useful-commands)

---

## 1. Prerequisites

Install the following tools before starting:

| Tool | Min. Version | Install |
|---|---|---|
| `git` | 2.x | `apt install git` |
| `terraform` | ≥ 1.0 | [developer.hashicorp.com](https://developer.hashicorp.com/terraform/install) |
| `aws` CLI | v2 | [aws.amazon.com/cli](https://aws.amazon.com/cli/) |
| `kubectl` | 1.29 | [kubernetes.io/docs](https://kubernetes.io/docs/tasks/tools/) |
| `kustomize` | ≥ 5.x | `brew install kustomize` or [kubectl kustomize](https://kubectl.docs.kubernetes.io/installation/kustomize/) |
| `docker` | 24.x | [docs.docker.com](https://docs.docker.com/engine/install/) |
| `helm` | 3.x | [helm.sh/docs](https://helm.sh/docs/intro/install/) |

**AWS Permissions required** — your IAM user or role must be able to:
- Create VPCs, EKS clusters, EC2 instances, IAM roles, ECR repositories
- Manage Route53 hosted zones (for ExternalDNS)
- Read/write to an S3 bucket for Terraform remote state

---

## 2. Getting the Repository

```bash
# Clone the repo
git clone https://github.com/<your-org>/youcode.git
cd youcode/app

# Verify structure
ls
# .github/  docs/  k8s/  terraform/  youcode-backend/  youcode-frontend/
```

**Branch conventions:**

| Branch | Purpose |
|---|---|
| `main` | Production — triggers Blue-Green deploy to EKS |
| `dev` | Development — triggers direct deploy to Dev overlay |

---

## 3. AWS Account Bootstrap

### 3.1 Configure AWS CLI

```bash
aws configure
# AWS Access Key ID:     <your-key-id>
# AWS Secret Access Key: <your-secret-key>
# Default region:        eu-west-3
# Output format:         json
```

Verify access:

```bash
aws sts get-caller-identity
```

### 3.2 Create Terraform Remote State Storage (one-time)

The `main.tf` backend is commented out by default. First create the S3 bucket and DynamoDB table manually:

```bash
# Create S3 bucket for state
aws s3api create-bucket \
  --bucket youcode-terraform-state \
  --region eu-west-3 \
  --create-bucket-configuration LocationConstraint=eu-west-3

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket youcode-terraform-state \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket youcode-terraform-state \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "AES256"}
    }]
  }'

# Create DynamoDB table for state locking
aws dynamodb create-table \
  --table-name youcode-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region eu-west-3
```

Then **uncomment** the `backend "s3"` block in `terraform/main.tf`:

```hcl
backend "s3" {
  bucket         = "youcode-terraform-state"
  key            = "eks/terraform.tfstate"
  region         = "eu-west-3"
  dynamodb_table = "youcode-terraform-locks"
  encrypt        = true
}
```

---

## 4. Terraform — Provisioning Infrastructure

The `terraform/` directory provisions the following resources:

| File | Resources Created |
|---|---|
| `vpc.tf` | VPC (`10.0.0.0/16`), 3 public + 3 private subnets, NAT Gateway |
| `eks.tf` | EKS cluster `youcode-cluster` (v1.29), managed node group (`t3.medium`, 2 nodes, max 3) |
| `ecr.tf` | 4 ECR repos: `youcode-backend-prod`, `youcode-frontend-prod`, `youcode-backend-dev`, `youcode-frontend-dev` |
| `iam.tf` | IAM roles (IRSA) for: AWS Load Balancer Controller, ExternalDNS |

### 4.1 Initialize and Apply

```bash
cd terraform/

# Download providers and modules
terraform init

# Preview the plan (~30 resources)
terraform plan

# Apply — this takes ~15-20 minutes
terraform apply
# Type 'yes' when prompted
```

### 4.2 Capture Outputs

Once apply completes, capture the outputs you'll need later:

```bash
terraform output
```

Example output:
```
eks_cluster_name       = "youcode-cluster"
eks_cluster_endpoint   = "https://XXXX.gr7.eu-west-3.eks.amazonaws.com"
ecr_repository_urls    = {
  backend_prod  = "123456789.dkr.ecr.eu-west-3.amazonaws.com/youcode-backend-prod"
  frontend_prod = "123456789.dkr.ecr.eu-west-3.amazonaws.com/youcode-frontend-prod"
  backend_dev   = "123456789.dkr.ecr.eu-west-3.amazonaws.com/youcode-backend-dev"
  frontend_dev  = "123456789.dkr.ecr.eu-west-3.amazonaws.com/youcode-frontend-dev"
}
lb_controller_role_arn = "arn:aws:iam::123456789:role/youcode-lb-controller"
```

---

## 5. Kubernetes — Manual First-Time Setup

These steps run once after Terraform provisions the cluster.

### 5.1 Connect kubectl to the cluster

```bash
aws eks update-kubeconfig --name youcode-cluster --region eu-west-3

# Verify connection
kubectl get nodes
# NAME                        STATUS   ROLES    AGE   VERSION
# ip-10-0-1-xxx.eu-west-3...  Ready    <none>   2m    v1.29.x
```

### 5.2 Create Namespaces

```bash
kubectl create namespace youcode-prod
kubectl create namespace youcode-dev
```

### 5.3 Install AWS Load Balancer Controller

```bash
# Add Helm repo
helm repo add eks https://aws.github.io/eks-charts
helm repo update

# Install the controller
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=youcode-cluster \
  --set serviceAccount.create=true \
  --set serviceAccount.annotations."eks\.amazonaws\.com/role-arn"=$(terraform -chdir=terraform output -raw lb_controller_role_arn) \
  --set region=eu-west-3 \
  --set vpcId=$(terraform -chdir=terraform output -raw vpc_id)
```

### 5.4 Create Kubernetes Secrets

The backend reads DB credentials from a `youcode-secrets` secret:

```bash
# Production
kubectl create secret generic youcode-secrets \
  --namespace youcode-prod \
  --from-literal=db-url='jdbc:postgresql://<your-rds-host>:5432/youcode' \
  --from-literal=db-username='youcode_user' \
  --from-literal=db-password='<your-db-password>'

# Dev
kubectl create secret generic youcode-secrets \
  --namespace youcode-dev \
  --from-literal=db-url='jdbc:postgresql://<your-dev-rds-host>:5432/youcode_dev' \
  --from-literal=db-username='youcode_user' \
  --from-literal=db-password='<your-dev-db-password>'
```

> [!IMPORTANT]
> Never commit secrets to git. Use AWS Secrets Manager + External Secrets Operator for a production-grade setup.

---

## 6. Kubernetes — Deploying the Application

The `k8s/` directory uses **Kustomize** with base manifests and per-environment overlays.

```
k8s/
├── base/               # Shared manifests (Deployment + Service)
│   ├── backend.yaml    # Spring Boot on port 8081
│   ├── frontend.yaml   # Next.js on port 3000
│   └── kustomization.yaml
└── overlays/
    ├── dev/            # Dev-specific patches
    ├── prod-blue/      # Blue production environment
    └── prod-green/     # Green production environment
```

### 6.1 Manual Deploy to Dev

```bash
# Point to your dev ECR image
cd k8s/overlays/dev
kustomize edit set image youcode-backend=<ECR_REGISTRY>/youcode-backend-dev:latest
kustomize edit set image youcode-frontend=<ECR_REGISTRY>/youcode-frontend-dev:latest

# Apply
kustomize build . | kubectl apply -f - -n youcode-dev

# Check rollout
kubectl rollout status deployment/youcode-backend -n youcode-dev
kubectl rollout status deployment/youcode-frontend -n youcode-dev
```

### 6.2 Manual Deploy to Prod (Blue)

```bash
IMAGE_TAG=<git-sha>
ECR_REGISTRY=123456789.dkr.ecr.eu-west-3.amazonaws.com

cd k8s/overlays/prod-blue
kustomize edit set image youcode-backend=${ECR_REGISTRY}/youcode-backend-prod:${IMAGE_TAG}
kustomize edit set image youcode-frontend=${ECR_REGISTRY}/youcode-frontend-prod:${IMAGE_TAG}
kustomize build . | kubectl apply -f - -n youcode-prod
```

### 6.3 Verify Deployment

```bash
kubectl get pods -n youcode-prod
kubectl get services -n youcode-prod
kubectl get ingress -n youcode-prod   # Get the ALB DNS name
```

---

## 7. GitHub Actions — CI/CD Pipelines

Two workflows automate the full build→push→deploy cycle.

### 7.1 Required GitHub Secrets

Go to **Settings → Secrets and variables → Actions** and add:

| Secret | Description |
|---|---|
| `AWS_ACCESS_KEY_ID` | IAM user access key with ECR + EKS permissions |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key |
| `AWS_REGION` | `eu-west-3` |
| `EKS_CLUSTER_NAME` | `youcode-cluster` |

### 7.2 Required GitHub Environment

The prod workflow uses a **manual approval gate**. Create it:

1. Go to **Settings → Environments → New environment**
2. Name it `production-approval`
3. Add **Required reviewers** (your team leads)
4. Optionally lock to the `main` branch

---

### 7.3 `deploy-dev.yml` — Dev Pipeline

**Triggers on**: push to `dev` branch

**Steps:**
```
push to dev
    │
    ▼
Checkout code
    │
    ▼
Configure AWS credentials + Login to ECR
    │
    ▼
docker build youcode-backend  →  ECR: youcode-backend-dev:<sha> + :latest
docker build youcode-frontend →  ECR: youcode-frontend-dev:<sha> + :latest
    │
    ▼
aws eks update-kubeconfig
    │
    ▼
kustomize edit set image  (overlays/dev)
kustomize build | kubectl apply
```

### 7.4 `deploy-prod.yml` — Production Blue-Green Pipeline

**Triggers on**: push to `main` branch

**Three Jobs:**

#### Job 1: `build-and-push`
```
push to main
    │
    ▼
Configure AWS + Login ECR
    │
    ▼
docker build youcode-backend  →  ECR: youcode-backend-prod:<sha>
docker build youcode-frontend →  ECR: youcode-frontend-prod:<sha>
```

#### Job 2: `deploy-to-idle`
```
Depends on: build-and-push
    │
    ▼
Detect active color:
  kubectl get svc youcode-frontend-prod → read .spec.selector.color
  active=blue  →  idle=green
  active=green →  idle=blue
    │
    ▼
kustomize edit set image  (overlays/prod-{idle_color})
kustomize build | kubectl apply
    │
    ▼
kubectl rollout status (wait for healthy pods)
```

#### Job 3: `promote-to-active`
```
Depends on: deploy-to-idle
Environment: production-approval  ← ⏸ MANUAL APPROVAL REQUIRED
    │
    ▼ (after reviewer approves)
kubectl patch svc youcode-backend-prod  → selector.color={new_color}
kubectl patch svc youcode-frontend-prod → selector.color={new_color}
  (traffic instantly switches to the new deployment)
```

---

## 8. Blue-Green Release Flow

```
Initial State: Blue=ACTIVE, Green=IDLE
                    │
  Push to main      │
                    ▼
          Build & push Docker images
                    │
                    ▼
       Deploy to GREEN (idle) overlay
       Wait for all pods to be Ready
                    │
                    ▼
       ⏸  Manual approval gate
       (reviewer validates staging)
                    │
             Approved ──────────────────────────────────┐
                    │                                    │
                    ▼                                    ▼
         Patch Service selectors               Rejected → Green stays
         color: blue → green                  idle, no traffic impact
                    │
                    ▼
        GREEN=ACTIVE, Blue=IDLE (rolled back for next deploy)
```

> [!TIP]
> To **rollback** instantly, manually patch the services back to the previous color:
> ```bash
> kubectl patch svc youcode-frontend-prod -n youcode-prod \
>   -p '{"spec":{"selector":{"color":"blue"}}}'
> kubectl patch svc youcode-backend-prod -n youcode-prod \
>   -p '{"spec":{"selector":{"color":"blue"}}}'
> ```

---

## 9. Useful Commands

### Cluster Status
```bash
# List all pods across namespaces
kubectl get pods -A

# Stream logs
kubectl logs -f deployment/youcode-backend -n youcode-prod

# Describe a failing pod
kubectl describe pod <pod-name> -n youcode-prod
```

### ECR Authentication
```bash
# Manually authenticate Docker to ECR
aws ecr get-login-password --region eu-west-3 | \
  docker login --username AWS --password-stdin \
  123456789.dkr.ecr.eu-west-3.amazonaws.com
```

### Terraform State
```bash
# List all managed resources
terraform state list

# Refresh state from AWS
terraform refresh

# Destroy all infrastructure (⚠️ destructive)
terraform destroy
```

### Force a Rollout
```bash
# Trigger re-deploy without image change
kubectl rollout restart deployment/youcode-backend -n youcode-prod
kubectl rollout restart deployment/youcode-frontend -n youcode-prod
```

### Scale Nodes
```bash
# Manually scale node group (Terraform is source of truth for production)
aws eks update-nodegroup-config \
  --cluster-name youcode-cluster \
  --nodegroup-name main \
  --scaling-config minSize=1,maxSize=5,desiredSize=3 \
  --region eu-west-3
```
