# 🏗️ AyyyApp — Terraform Infrastructure

Production-ready, cloud-native AWS infrastructure for **AyyyApp**, implemented as a fully modular Terraform codebase.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Repository Structure](#repository-structure)
- [Module Reference](#module-reference)
- [Step-by-Step Deployment Guide](#step-by-step-deployment-guide)
- [EKS Fargate — Key Concepts](#eks-fargate--key-concepts)
- [Security Model (IAM & IRSA)](#security-model-iam--irsa)
- [Networking Design](#networking-design)
- [Post-Terraform Kubernetes Setup](#post-terraform-kubernetes-setup)
- [Monitoring Stack Setup](#monitoring-stack-setup)
- [Async AI Pipeline](#async-ai-pipeline)
- [Rollback Procedures](#rollback-procedures)
- [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
Internet
    │
    ▼
AWS ALB (internet-facing, public subnets)
    │
    ▼
EKS Cluster — Fargate (no EC2 nodes)
    ├── kube-system      → ALB Controller, CoreDNS
    ├── ayyyapp-prod     → Backend, Frontend pods
    └── monitoring       → Prometheus, Grafana

    │
    ├── SQS Queue ──► Lambda ──► AWS Bedrock (Claude)
    │                               │
    │                               └─► DynamoDB (AI results)
    │
    └── ECR (Docker image registry)
         ├── ayyyapp-backend
         └── ayyyapp-frontend

Observability:
    CloudWatch ◄── EKS control plane logs, Lambda, ALB
    Prometheus  ◄── Pod metrics (scraped in-cluster)
    Grafana     ◄── Unified dashboards (Prometheus + CloudWatch DS)
```

---

## Prerequisites

| Tool | Minimum Version | Install |
|------|----------------|---------|
| Terraform | 1.7.0 | [hashicorp.com/terraform](https://www.terraform.io/downloads) |
| AWS CLI | 2.x | [aws.amazon.com/cli](https://aws.amazon.com/cli/) |
| kubectl | 1.32 | [kubernetes.io/docs](https://kubernetes.io/docs/tasks/tools/) |
| Helm | 3.x | [helm.sh](https://helm.sh/docs/intro/install/) |

**AWS Permissions required** (for the human running Terraform):
- `AdministratorAccess` (for initial bootstrap)
- After bootstrap, narrow down using IAM Access Analyzer

---

## Repository Structure

```
terraform/
├── versions.tf                        # Global Terraform + provider version pins
├── deploy.sh                          # Helper script (init/plan/apply/destroy)
│
├── global/                            # One-time bootstrap resources
│   ├── s3-backend/
│   │   └── main.tf                    # S3 state bucket + DynamoDB lock table
│   └── iam-github-actions/
│       └── main.tf                    # GitHub OIDC provider + CI IAM role
│
├── modules/                           # Reusable building blocks
│   ├── vpc/                           # VPC, subnets, IGW, NAT GW, route tables
│   ├── ecr/                           # ECR repositories + lifecycle policies
│   ├── eks/                           # EKS cluster + Fargate profiles + OIDC
│   ├── irsa/                          # Generic IAM Role for Service Account
│   ├── alb-controller/                # IAM policy + IRSA for ALB Ingress Controller
│   ├── sqs/                           # SQS queue + Dead Letter Queue
│   └── lambda/                        # Lambda function + SQS trigger + Bedrock access
│
└── environments/
    └── prod/
        ├── main.tf                    # Root module — wires all modules
        ├── variables.tf               # Variable declarations
        ├── terraform.tfvars           # Environment values
        └── backend.tf                 # S3 remote state config
```

---

## Module Reference

### `modules/vpc`

| What it creates | Notes |
|----------------|-------|
| VPC (`10.0.0.0/16`) | DNS hostnames + support enabled |
| 2 public subnets | ALB ENIs, NAT Gateways |
| 2 private subnets | Fargate pods, Lambda |
| Internet Gateway | Public internet ingress |
| 2 NAT Gateways (HA) | Outbound internet for private subnets |
| Route tables | Public → IGW, Private → NAT per AZ |

**Subnet tags** (critical for ALB controller):
- Public: `kubernetes.io/role/elb = 1`
- Private: `kubernetes.io/role/internal-elb = 1`
- Both: `kubernetes.io/cluster/<name> = owned`

**Inputs**: `vpc_cidr`, `project_name`, `environment`, `cluster_name`
**Outputs**: `vpc_id`, `public_subnet_ids`, `private_subnet_ids`

---

### `modules/ecr`

| What it creates | Notes |
|----------------|-------|
| ECR repository per service | Image tag immutability enabled |
| Lifecycle policy | Keep last 10 tagged; expire untagged after 7d |
| Repository policy | Allows account-root to pull |
| Image scanning | Scan on push enabled |

**Inputs**: `repository_names` (list), `project_name`, `environment`
**Outputs**: `repository_urls` (map), `repository_arns` (map)

---

### `modules/eks` ⭐ Fargate

| What it creates | Notes |
|----------------|-------|
| EKS cluster (v1.32) | Private + public endpoint |
| Cluster IAM role | AmazonEKSClusterPolicy + VPCResourceController |
| Fargate pod execution role | Shared by all Fargate profiles |
| Fargate profile: `kube-system` | CoreDNS, ALB controller |
| Fargate profiles: dynamic | Configured via `fargate_profiles` variable |
| OIDC provider | Required for IRSA |
| CloudWatch Log Group | Control plane logs (30-day retention) |

> **No EC2 nodes** — all workloads run serverlessly on Fargate. You pay per pod CPU/memory second, not per instance.

**Fargate limitations to be aware of**:
- No DaemonSets → use sidecar containers or ADOT for observability
- No `hostPath` volumes → use EFS or EmptyDir
- No GPU workloads
- Pods need to match a Fargate profile selector; unmatched pods are unschedulable if no node group exists

**Inputs**: `cluster_name`, `kubernetes_version`, `private_subnet_ids`, `public_subnet_ids`, `fargate_profiles`
**Outputs**: `cluster_name`, `cluster_endpoint`, `oidc_provider_arn`, `oidc_issuer_url`, `fargate_pod_execution_role_arn`, `cluster_security_group_id`

---

### `modules/irsa`

Generic reusable module. One call = one IAM role bound to one Kubernetes ServiceAccount.

```hcl
module "my_irsa" {
  source               = "../../modules/irsa"
  project_name         = "ayyyapp"
  role_name            = "ayyyapp-prod-myservice-role"
  oidc_provider_arn    = module.eks.oidc_provider_arn
  oidc_issuer_url      = module.eks.oidc_issuer_url
  namespace            = "ayyyapp-prod"
  service_account_name = "myservice-sa"
  policy_arns          = ["arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess"]
}
```

Then annotate your Kubernetes ServiceAccount:
```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: myservice-sa
  namespace: ayyyapp-prod
  annotations:
    eks.amazonaws.com/role-arn: <output from module.my_irsa.role_arn>
```

---

### `modules/alb-controller`

Provisions the full IAM policy from the [AWS ALB Controller docs](https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.7/) and IRSA role for the controller's ServiceAccount in `kube-system`.

**After `terraform apply`**, install the controller with Helm:
```bash
helm repo add eks https://aws.github.io/eks-charts
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=ayyyapp-prod \
  --set serviceAccount.create=true \
  --set serviceAccount.annotations."eks\.amazonaws\.com/role-arn"=$(terraform output -raw alb_controller_role_arn)
```

---

### `modules/sqs`

| What it creates | Notes |
|----------------|-------|
| Main SQS queue | SSE with AWS managed key, long polling (20s) |
| Dead Letter Queue (DLQ) | Receives messages after 3 failed attempts, 14-day retention |
| Queue policy | Account-root allowed to send/receive |

**Inputs**: `queue_name`, `visibility_timeout_seconds` (default 300s = Lambda max), `max_receive_count` (default 3)
**Outputs**: `queue_url`, `queue_arn`, `dlq_url`, `dlq_arn`

---

### `modules/lambda`

| What it creates | Notes |
|----------------|-------|
| Lambda function | Python 3.12, VPC-attached |
| IAM role | SQS receive/delete + Bedrock InvokeModel + DynamoDB write |
| SQS event source mapping | Batch size 5, `ReportBatchItemFailures` enabled |
| CloudWatch Log Group | 14-day retention |
| Placeholder handler | Working Python code — replace with real package via CI |

**Bedrock model IDs** (set via `bedrock_model_id`):
| Model | ID |
|-------|----|
| Claude 3 Haiku (default, cheapest) | `anthropic.claude-3-haiku-20240307-v1:0` |
| Claude 3 Sonnet | `anthropic.claude-3-sonnet-20240229-v1:0` |
| Claude 3 Opus | `anthropic.claude-3-opus-20240229-v1:0` |

---

## Step-by-Step Deployment Guide

### Phase 0 — Bootstrap State Backend (once only)

```bash
cd terraform/global/s3-backend

terraform init
terraform apply

# Note the outputs:
# state_bucket_name = "ayyyapp-terraform-state-<ACCOUNT_ID>"
# dynamodb_table_name = "ayyyapp-terraform-locks"
```

Update `environments/prod/backend.tf`:
```hcl
backend "s3" {
  bucket         = "ayyyapp-terraform-state-<YOUR_ACCOUNT_ID>"  # ← fill in
  key            = "environments/prod/terraform.tfstate"
  region         = "eu-west-3"
  encrypt        = true
  dynamodb_table = "ayyyapp-terraform-locks"
}
```

### Phase 1 — Bootstrap GitHub OIDC (once only)

```bash
cd terraform/global/iam-github-actions

terraform init
terraform apply

# Outputs:
# role_arn = "arn:aws:iam::<ACCOUNT>:role/ayyyapp-github-actions-role"
```

Add `role_arn` as a GitHub Actions secret named `AWS_GITHUB_ACTIONS_ROLE_ARN`.

### Phase 2 — Deploy Core Infrastructure

```bash
# Option A — using deploy.sh helper
./terraform/deploy.sh prod init
./terraform/deploy.sh prod plan
./terraform/deploy.sh prod apply

# Option B — manual
cd terraform/environments/prod
terraform init
terraform plan -var-file=terraform.tfvars -out=prod.tfplan
terraform apply prod.tfplan
```

Expected resources created: ~50–60 (VPC, subnets, IGW, NAT GWs, EKS, Fargate profiles, ECR repos, SQS, DynamoDB, Lambda, IAM roles, OIDC provider).

**Typical apply time**: 15–25 minutes (EKS cluster takes ~10–12 min, Fargate profiles ~2–3 min each).

### Phase 3 — Configure kubectl

```bash
aws eks update-kubeconfig \
  --region eu-west-3 \
  --name ayyyapp-prod

kubectl get nodes  # Will show "No resources found" — expected with Fargate
kubectl get pods -A
```

### Phase 4 — Patch CoreDNS for Fargate

CoreDNS ships with a `node-selector` that requires EC2 nodes. Remove it:

```bash
kubectl patch deployment coredns -n kube-system \
  --type=json \
  -p='[{"op":"remove","path":"/spec/template/spec/nodeSelector"}]'

kubectl patch deployment coredns -n kube-system \
  --type=json \
  -p='[{"op":"remove","path":"/spec/template/spec/tolerations"}]'

# Wait for CoreDNS to reschedule on Fargate
kubectl rollout status deployment/coredns -n kube-system
```

### Phase 5 — Install ALB Ingress Controller

```bash
ALB_ROLE=$(cd terraform/environments/prod && terraform output -raw alb_controller_role_arn)

helm repo add eks https://aws.github.io/eks-charts && helm repo update

helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=ayyyapp-prod \
  --set serviceAccount.create=true \
  --set "serviceAccount.annotations.eks\.amazonaws\.com/role-arn=$ALB_ROLE" \
  --set region=eu-west-3 \
  --set vpcId=$(cd terraform/environments/prod && terraform output -json | jq -r '.vpc_id.value // empty')

kubectl -n kube-system rollout status deployment/aws-load-balancer-controller
```

### Phase 6 — Install Argo CD

```bash
kubectl create namespace argocd
kubectl apply -n argocd \
  -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for Argo CD pods to start on Fargate
kubectl -n argocd rollout status deployment/argocd-server

# Get initial password
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d
```

### Phase 7 — Install Argo Rollouts

```bash
kubectl create namespace argo-rollouts
kubectl apply -n argo-rollouts \
  -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml
```

---

## EKS Fargate — Key Concepts

### How Fargate Scheduling Works

```
Pod created in Kubernetes
        │
        ▼
Does pod match a Fargate profile selector?
  (namespace + optional labels)
        │
  ┌─────┴─────┐
 YES          NO
  │            │
  ▼            ▼
Fargate    Pod stays Pending (no nodes to schedule on)
schedules  → add a Fargate profile or remove the pod
the pod
```

### Fargate Profiles in This Setup

| Profile | Namespace | Purpose |
|---------|-----------|---------|
| `kube-system` | `kube-system` | CoreDNS, ALB controller, Argo CD agents |
| `app` | `ayyyapp-prod` | Backend + Frontend application pods |
| `monitoring` | `monitoring` | Prometheus, Grafana |

> Add more namespaces by extending `fargate_profiles` in `terraform.tfvars`.

### Logging from Fargate Pods

Fargate uses **AWS Fluent Bit** as a built-in sidecar (not a DaemonSet).
Enable it with a `ConfigMap` in `kube-system`:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: aws-logging
  namespace: kube-system
data:
  flb_log_cw: "true"
  filters.conf: |
    [FILTER]
        Name parser
        Match *
        Key_name log
        Parser crio
  output.conf: |
    [OUTPUT]
        Name cloudwatch_logs
        Match *
        region eu-west-3
        log_group_name /aws/eks/ayyyapp-prod/fargate-app
        log_stream_prefix fargate-
        auto_create_group true
```

---

## Security Model (IAM & IRSA)

### No Static Credentials — Ever

| Component | How it authenticates |
|-----------|---------------------|
| GitHub Actions | OIDC federation → `ayyyapp-github-actions-role` |
| App pods | IRSA → `ayyyapp-prod-app-role` |
| ALB controller | IRSA → `ayyyapp-prod-alb-controller-role` |
| Lambda | Execution role attached at function level |

### IRSA Deep Dive

```
EKS OIDC Provider
        │  issues JWT token to pod's service account
        ▼
IAM Trust Policy checks:
  token.actions.githubusercontent.com:sub =
    "system:serviceaccount:ayyyapp-prod:ayyyapp-sa"
        │
        ▼
Pod assumes IAM role → AWS SDK calls work with temp credentials
```

### IAM Role Summary

| Role | Principal | Permissions |
|------|-----------|------------|
| `ayyyapp-github-actions-role` | GitHub Actions (OIDC) | ECR push, S3 state read |
| `ayyyapp-prod-cluster-role` | EKS service | AmazonEKSClusterPolicy |
| `ayyyapp-prod-fargate-pod-execution-role` | Fargate service | ECR pull, CloudWatch logs |
| `ayyyapp-prod-alb-controller-role` | K8s SA (IRSA) | Full ALB management |
| `ayyyapp-prod-app-role` | K8s SA (IRSA) | SQS SendMessage |
| `ayyyapp-prod-ai-processor-role` | Lambda service | SQS receive, Bedrock invoke, DynamoDB write |

---

## Networking Design

```
VPC: 10.0.0.0/16
│
├── PUBLIC (internet-facing)
│   ├── 10.0.0.0/24 — AZ-a  → NAT GW, ALB ENIs
│   └── 10.0.1.0/24 — AZ-b  → NAT GW, ALB ENIs
│
└── PRIVATE (no direct inbound internet)
    ├── 10.0.10.0/24 — AZ-a → Fargate pods, Lambda ENIs
    └── 10.0.11.0/24 — AZ-b → Fargate pods, Lambda ENIs

Traffic flow:
  Internet → ALB (public) → Fargate pods (private) via target group
  Fargate pods → Internet → via NAT Gateway (for ECR pulls, Bedrock calls)
  Lambda → SQS / DynamoDB → via VPC Endpoints (recommended)
```

---

## Post-Terraform Kubernetes Setup

### Deploy the Application

```bash
# Create the app namespace
kubectl create namespace ayyyapp-prod

# Apply the app ServiceAccount (annotated with IRSA role)
APP_ROLE=$(cd terraform/environments/prod && terraform output -raw app_irsa_role_arn)

kubectl apply -f - <<EOF
apiVersion: v1
kind: ServiceAccount
metadata:
  name: ayyyapp-sa
  namespace: ayyyapp-prod
  annotations:
    eks.amazonaws.com/role-arn: $APP_ROLE
EOF
```

### Example Ingress (ALB)

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ayyyapp-ingress
  namespace: ayyyapp-prod
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTPS":443}]'
spec:
  rules:
    - host: app.ayyyapp.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: ayyyapp-active   # Argo Rollouts active service
                port:
                  number: 80
```

---

## Monitoring Stack Setup

### Install kube-prometheus-stack via Helm

```bash
kubectl create namespace monitoring

helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  -n monitoring \
  --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.storageClassName=efs-sc \
  --set grafana.persistence.enabled=true \
  --set grafana.persistence.storageClassName=efs-sc

# Note: Fargate requires EFS for persistent storage (no EBS support)
# Install the EFS CSI driver and create a StorageClass first.
```

### CloudWatch Container Insights

Enable via the Fargate logging ConfigMap (see [EKS Fargate section](#logging-from-fargate-pods)).

### Key Metrics to Alert On

```yaml
# AlertManager rules (add to Prometheus config)
groups:
  - name: ayyyapp
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
        for: 5m
        labels:
          severity: critical

      - alert: SQSQueueDepth
        expr: aws_sqs_approximate_number_of_messages_visible_maximum > 500
        for: 10m
        labels:
          severity: warning
```

---

## Async AI Pipeline

```
User submits assignment (via EKS app)
            │
            ▼
    SQS: ayyyapp-prod-ai-pipeline
   (FIFO-like ordering, SSE encrypted)
            │
            ▼
      Lambda: ai-processor
      - Batch size: 5 messages
      - Timeout: 120s
      - Reserved concurrency: 10
            │
            ▼
  AWS Bedrock (Claude 3 Haiku)
  Prompt: "Review this code: ..."
            │
            ▼
  DynamoDB: evaluations table
  { submissionId, feedback, status: "reviewed" }
            │
            ▼
   App polls DynamoDB or uses DynamoDB Streams
   to notify the student
```

**Dead Letter Queue**: After 3 failed Lambda executions, the message moves to `ayyyapp-prod-ai-pipeline-dlq` for manual inspection. Monitor with:

```bash
aws sqs get-queue-attributes \
  --queue-url <DLQ_URL> \
  --attribute-names ApproximateNumberOfMessages
```

---

## Rollback Procedures

### Application Rollback (Argo Rollouts)

```bash
# View rollout status
kubectl argo rollouts get rollout ayyyapp -n ayyyapp-prod

# Abort in-flight promotion (reverts to blue)
kubectl argo rollouts abort ayyyapp -n ayyyapp-prod

# Rollback to previous revision
kubectl argo rollouts undo ayyyapp -n ayyyapp-prod
```

### Infrastructure Rollback (Terraform)

```bash
# View state history
terraform state list

# Revert to previous state using git
git revert HEAD  # in gitops repo
git push         # Argo CD re-applies

# Targeted destroy + re-apply
./terraform/deploy.sh prod apply -target=module.eks
```

---

## Troubleshooting

### Pod stuck in Pending

```bash
kubectl describe pod <pod-name> -n ayyyapp-prod
# Look for: "0/0 nodes available" → no Fargate profile matches
# Fix: ensure pod's namespace matches a Fargate profile selector
```

### ALB not provisioning (stays `<pending>`)

```bash
# 1. Check controller is running
kubectl get pods -n kube-system -l app.kubernetes.io/name=aws-load-balancer-controller

# 2. Check controller logs
kubectl logs -n kube-system \
  -l app.kubernetes.io/name=aws-load-balancer-controller --tail=50

# 3. Verify subnet tags exist
aws ec2 describe-subnets \
  --filters "Name=tag:kubernetes.io/role/elb,Values=1"

# 4. Verify IRSA annotation on the SA
kubectl get sa aws-load-balancer-controller -n kube-system -o yaml \
  | grep role-arn
```

### CoreDNS stuck in Pending after new deploy

```bash
# Re-patch the node selector
kubectl patch deployment coredns -n kube-system \
  --type=json \
  -p='[{"op":"remove","path":"/spec/template/spec/nodeSelector"}]'
```

### Terraform state lock stuck

```bash
aws dynamodb delete-item \
  --table-name ayyyapp-terraform-locks \
  --key '{"LockID": {"S": "ayyyapp-terraform-state-<ACCT>/environments/prod/terraform.tfstate"}}'
```

---

*Last updated: 2026-02-26 · Stack: Terraform 1.7+ · EKS 1.32 · Fargate · Argo Rollouts v1.7*
