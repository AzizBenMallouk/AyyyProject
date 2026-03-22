# 🚀 YouCode — Full Project Setup Guide

> **Audience**: Anyone setting up this project from scratch on a fresh AWS account.
> **Time to complete**: ~45 minutes (most time is waiting for EKS to provision).

---

## 📐 Architecture Overview

```
GitHub (source of truth)
    │
    ├── app-backend/         Spring Boot API (Java)
    ├── app-frontend/        Next.js UI
    ├── app-notifications-worker/  Lambda (Python) — AI email announcements
    ├── gitops/              Kustomize manifests (ArgoCD watches this)
    └── terraform/
        └── environments/prod/
            ├── 01-network/  VPC, subnets, NAT Gateway
            ├── 02-cluster/  EKS, OIDC, IAM for GitHub Actions
            ├── 03-gitops/   ArgoCD, Argo Rollouts, ALB Controller,
            │                Prometheus Stack, ECR repos, S3
            └── 04-notifications/  SQS, SNS, Lambda, Secrets Manager

Deployment flow:
  git push → GitHub Actions → Build Docker → Push to ECR
           → Update kustomization.yaml → ArgoCD syncs → EKS
           → Argo Rollouts Blue/Green → Manual promote via GH Actions

Feature email flow:
  git commit "feature: ..." → GH Actions notify job
  → SQS → Lambda → HuggingFace AI → SNS → 📧 Users
```

---

## 🛠️ Prerequisites

Install the following tools on your local machine:

| Tool | Version | Install |
|---|---|---|
| AWS CLI | v2 | `brew install awscli` / [docs](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) |
| Terraform | ≥ 1.5 | `brew install terraform` |
| kubectl | ≥ 1.28 | `brew install kubectl` |
| Helm | ≥ 3.12 | `brew install helm` |
| kustomize | ≥ 5.0 | `brew install kustomize` |
| Docker | ≥ 24 | [docs.docker.com](https://docs.docker.com/get-docker/) |
| Git | any | pre-installed on most systems |

---

## 🔑 Step 1 — AWS Account Setup

### 1.1 Configure AWS CLI
```bash
aws configure
# AWS Access Key ID: <your key>
# AWS Secret Access Key: <your secret>
# Default region name: us-east-1
# Default output format: json
```

### 1.2 Verify access
```bash
aws sts get-caller-identity
# Should return your Account ID, UserId, Arn
```

---

## 🌐 Step 2 — Network Layer (`01-network`)

This creates the VPC, public/private subnets across 3 AZs, and a NAT Gateway.

```bash
cd terraform/environments/prod/01-network
terraform init
terraform plan   # Review what will be created
terraform apply  # Type "yes" to confirm
```

**What gets created:**
- VPC with CIDR defined in `variables.tf`
- 3 public subnets (for load balancers)
- 3 private subnets (for EKS worker nodes)
- 1 NAT Gateway (single AZ to save cost — upgrade to HA for production)
- Proper Kubernetes subnet tags for ALB auto-discovery

> ⏱️ This takes ~3 minutes.

---

## ☸️ Step 3 — EKS Cluster Layer (`02-cluster`)

This provisions the EKS control plane, ARM64 worker nodes, and the GitHub Actions OIDC role.

```bash
cd terraform/environments/prod/02-cluster
terraform init
terraform plan
terraform apply
```

**What gets created:**
- EKS 1.31 cluster with managed node group (`t4g.small`, ARM64)
- VPC CNI with prefix delegation (more pods per node)
- CoreDNS + kube-proxy add-ons
- GitHub Actions OIDC provider + IAM role (so CI/CD can push to ECR and update K8s)

> ⏱️ EKS takes **15–20 minutes** to fully provision.

### Configure kubectl
```bash
aws eks update-kubeconfig \
  --name prod-eks-cluster \
  --region us-east-1

# Verify
kubectl get nodes
# Should see your t4g.small nodes in Ready state
```

---

## 🔧 Step 4 — GitOps & Add-ons Layer (`03-gitops`)

This installs all cluster add-ons and creates AWS resources used by the app.

```bash
cd terraform/environments/prod/03-gitops
terraform init
terraform plan
terraform apply
```

**What gets created:**
- **ArgoCD** (Helm) — GitOps controller, exposed via NLB
- **Argo Rollouts** (Helm) — Blue/Green deployment controller
- **AWS Load Balancer Controller** (Helm) — manages ALB/NLB from K8s ingress
- **Prometheus Stack** (Helm) — Prometheus + Grafana + AlertManager in `monitoring` namespace
- **ECR Repositories** — `app-frontend-prod` and `app-backend-prod` (IMMUTABLE tags)
- **S3 Bucket** — for backend file uploads
- **IRSA Role** — allows the backend pod to access S3 without static credentials

> ⏱️ Takes ~10 minutes (Helm charts are large).

### Get ArgoCD admin password
```bash
kubectl get secret argocd-initial-admin-secret \
  -n argocd \
  -o jsonpath="{.data.password}" | base64 --decode
echo ""
```

### Get ArgoCD URL
```bash
kubectl get svc argocd-server -n argocd
# Copy the EXTERNAL-IP and open in browser
```

### Get Grafana URL
```bash
kubectl get svc -n monitoring prometheus-stack-grafana
# Default credentials: admin / prom-operator
```

---

## 📬 Step 5 — Notifications Layer (`04-notifications`)

This creates the SQS queue, SNS email topic, Secrets Manager entry, and the Lambda function.

### 5.1 Get a HuggingFace token (free)
1. Go to [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Click **New token** → Role: `Read` → Copy the token (starts with `hf_`)

### 5.2 Apply Terraform
```bash
cd terraform/environments/prod/04-notifications
terraform init
terraform plan -var="huggingface_token=hf_xxxxxxxxxxxx"
terraform apply -var="huggingface_token=hf_xxxxxxxxxxxx"
```

**What gets created:**
- **SQS Queue** `prod-eks-cluster-feature-announcements` + Dead Letter Queue
- **SNS Topic** `prod-eks-cluster-feature-updates` (email protocol)
- **Secrets Manager** secret storing the HuggingFace token
- **Lambda Function** `prod-eks-cluster-feature-notifier` (Python 3.12)
- **CloudWatch Log Group** with 14-day retention

### 5.3 Note the SQS URL for CI/CD
```bash
terraform output sqs_queue_url
# Copy this value — you'll need it as a GitHub secret
```

### 5.4 Subscribe users to email notifications
```bash
aws sns subscribe \
  --topic-arn $(terraform output -raw sns_topic_arn) \
  --protocol email \
  --notification-endpoint user@example.com
# The user will receive a confirmation email — they must click to confirm
```

---

## 🤖 Step 6 — GitHub Actions CI/CD Setup

### 6.1 Add GitHub Secrets

Go to your repo → **Settings** → **Secrets and Variables** → **Actions** → **New repository secret**:

| Secret Name | Value | Where to get it |
|---|---|---|
| `AWS_ROLE_ARN` | `arn:aws:iam::<account-id>:role/github-actions-oidc-role` | `terraform output` in `02-cluster` |
| `AWS_REGION` | `us-east-1` | Your chosen region |
| `CLUSTER_NAME` | `prod-eks-cluster` | Check `variables.tf` |
| `FEATURE_ANNOUNCEMENTS_SQS_URL` | `https://sqs.us-east-1.amazonaws.com/...` | `terraform output sqs_queue_url` in `04-notifications` |

### 6.2 Register the ArgoCD Application

Apply the ArgoCD Application manifest so ArgoCD starts watching your GitOps folder:

```bash
kubectl apply -f gitops/argocd/application.yaml
```

> After this, ArgoCD will automatically sync everything in `gitops/overlays/prod/` whenever changes are pushed to `main`.

### 6.3 Trigger the first build

Push any code change to `main`:
```bash
git commit -m "chore: initial deployment"
git push origin main
```

Go to **GitHub → Actions** and watch the pipeline:
1. `filter` — detects which components changed
2. `build-and-push` — builds Docker images and pushes to ECR
3. `deploy` — updates the image tags in `gitops/overlays/prod/kustomization.yaml`
4. `promote` — promotes the Argo Rollouts blue/green deployment

---

## 🏗️ Application Architecture (Kubernetes)

Once deployed, the following resources run in the `default` namespace:

| Resource | Type | Details |
|---|---|---|
| `youcode-backend` | Argo Rollout | Spring Boot API on port 8082, Blue/Green |
| `youcode-frontend` | Argo Rollout | Next.js on port 3000, Blue/Green |
| `mysql` | Deployment | MySQL 8.0, emptyDir volume (stateless for now) |
| `app-ingress` | Ingress (ALB) | `/api` → backend, `/` → frontend |
| `youcode-backend-preview` | Service | Green (preview) service for backend |
| `youcode-frontend-preview` | Service | Green (preview) service for frontend |

---

## 🔄 Day-2 Operations

### Manual Blue/Green Promotion
After a deployment, the new version is live on the **preview** service only.
To promote it to production traffic:
```bash
# Via the GitHub Actions "promote" job (runs automatically after deploy)
# Or manually:
aws eks update-kubeconfig --name prod-eks-cluster --region us-east-1
kubectl argo rollouts promote youcode-backend
kubectl argo rollouts promote youcode-frontend
```

### Rollback
```bash
kubectl argo rollouts undo youcode-backend
kubectl argo rollouts undo youcode-frontend
```

### Watch rollout status
```bash
kubectl argo rollouts get rollout youcode-backend --watch
```

### Feature announcement email
Any commit starting with `feature` triggers the notification pipeline:
```bash
git commit -m "feature: add dark mode to the dashboard"
git push
# → Lambda generates AI email → SNS sends to all subscribers
```

---

## 📊 Monitoring

| Service | URL | Credentials |
|---|---|---|
| Grafana | `kubectl get svc -n monitoring prometheus-stack-grafana` | `admin / prom-operator` |
| ArgoCD | `kubectl get svc -n argocd argocd-server` | `admin / <see Step 4>` |
| Prometheus | Port-forward: `kubectl port-forward svc/prometheus-stack-kube-prom-prometheus 9090 -n monitoring` | No auth |

---

## 🧹 Teardown (Destroy Everything)

Destroy in **reverse** order to avoid dependency errors:

```bash
# 1. Notifications layer
cd terraform/environments/prod/04-notifications && terraform destroy

# 2. GitOps & add-ons
cd terraform/environments/prod/03-gitops && terraform destroy

# 3. EKS cluster
cd terraform/environments/prod/02-cluster && terraform destroy

# 4. Network
cd terraform/environments/prod/01-network && terraform destroy
```

> ⚠️ Make sure all Load Balancers are deleted before destroying the network layer (they are created by the ALB controller, not Terraform). Run `kubectl delete ingress --all` first if needed.

---

## 🆘 Troubleshooting

### Pods stuck in `Pending`
```bash
kubectl describe pod <pod-name>
# Most likely: insufficient resources on t4g.small nodes
# Check node capacity:
kubectl describe nodes | grep -A 5 "Allocated resources"
```

### ArgoCD shows app as `OutOfSync`
```bash
kubectl get application youcode-app -n argocd -o yaml
# Check the 'status.conditions' field for error details
# Force sync:
kubectl patch application youcode-app -n argocd \
  --type merge -p '{"operation":{"sync":{"revision":"HEAD"}}}'
```

### Lambda not generating emails
```bash
# Check CloudWatch logs
aws logs tail /aws/lambda/prod-eks-cluster-feature-notifier --follow
# Common issue: HuggingFace token expired or model is loading (first call takes ~20s)
```

### GitHub Actions failing on AWS auth
```bash
# Verify the OIDC trust policy in IAM allows your repo
# The role should allow: repo:AzizBenMallouk/AyyyProject:ref:refs/heads/main
```
