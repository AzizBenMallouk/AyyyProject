# YouCode — Code Deep Dive (101)

> Line-by-line explanations of every Terraform config, Kubernetes manifest, and GitHub Actions workflow in the project.

---

## Table of Contents

### Terraform
- [main.tf — Providers & Backend](#-maintf--providers--remote-state-backend)
- [variables.tf — Input Variables](#-variablestf--input-variables)
- [vpc.tf — Network Layer](#-vpctf--network-layer)
- [eks.tf — Kubernetes Cluster](#-ekstf--kubernetes-cluster)
- [ecr.tf — Container Registries](#-ecrtf--container-registries)
- [iam.tf — Service Account Roles](#-iamtf--service-account-roles-irsa)
- [outputs.tf — Exported Values](#-outputstf--exported-values)

### Kubernetes
- [base/backend.yaml — Backend Deployment & Service](#-basebackendyaml--backend-deployment--service)
- [base/frontend.yaml — Frontend Deployment & Service](#-basefrontendyaml--frontend-deployment--service)
- [base/kustomization.yaml — Base Manifest List](#-basekustomizationyaml--base-manifest-list)
- [overlays/dev — Dev Overlay](#-overlaysdev--dev-overlay)
- [overlays/prod-blue & prod-green — Blue-Green Overlays](#-overlaysprod-blue--prod-green--blue-green-overlays)
- [routing/production.yaml — Ingress & Prod Services](#-routingproductionyaml--ingress--production-services)

### GitHub Actions
- [deploy-dev.yml — Dev Pipeline](#-deploy-devyml--dev-pipeline)
- [deploy-prod.yml — Prod Blue-Green Pipeline](#-deploy-prodyml--production-blue-green-pipeline)

---

# ⚙️ TERRAFORM

---

## 📄 `main.tf` — Providers & Remote State Backend

```hcl
terraform {
  required_version = ">= 1.0"
```
> Enforces a minimum Terraform CLI version. This prevents team members running older versions from accidentally applying a plan that uses newer syntax or behaviors.

```hcl
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
  }
```
> Declares exactly which providers are needed and pins them to compatible minor versions.
> - `~> 5.0` means "any 5.x release" — locks the major version so breaking changes from v6 can't sneak in.
> - The `kubernetes` provider isn't used directly here but is declared for future use (e.g., applying K8s resources via Terraform).

```hcl
  # backend "s3" {
  #   bucket         = "youcode-terraform-state"
  #   key            = "eks/terraform.tfstate"
  #   region         = "eu-west-3"
  #   dynamodb_table = "youcode-terraform-locks"
  #   encrypt        = true
  # }
```
> **Remote state** stores the Terraform state file in S3 instead of locally. This is critical for teams:
> - **S3 bucket**: stores the `.tfstate` JSON file that maps real AWS resources to your Terraform code
> - **key**: the path within the bucket — like a folder structure for multiple environments
> - **dynamodb_table**: provides **state locking** — prevents two engineers from running `apply` simultaneously, which would corrupt the state
> - **encrypt = true**: state files can contain secrets (DB passwords, keys), so encryption at rest is mandatory
>
> The block is commented out until you create the S3 bucket and DynamoDB table (see deployment guide).

```hcl
provider "aws" {
  region = var.aws_region
}
```
> Configures the AWS provider to use the region defined in `variables.tf` (default: `eu-west-3` — Paris). All AWS resources will be created in this region.

---

## 📄 `variables.tf` — Input Variables

```hcl
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-west-3"
}
```
> Declares a string variable for the AWS region. The `default` means you don't have to pass it explicitly — but you can override it via `TF_VAR_aws_region` env var or a `.tfvars` file. Centralizing the region here means changing `eu-west-3` to `eu-west-1` in one place updates every resource.

```hcl
variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
  default     = "youcode-cluster"
}
```
> The EKS cluster name. Used by both `eks.tf` (to name the cluster) and `vpc.tf` (to tag subnets with the cluster name so Kubernetes can discover them for load balancers).

```hcl
variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}
```
> The IP address range for the entire VPC — `10.0.0.0/16` gives you 65,534 usable IPs, plenty for subnetting into public and private ranges.

```hcl
variable "project_name" {
  description = "Project name for tagging"
  type        = string
  default     = "youcode"
}
```
> A tag/prefix string applied uniformly to all resource names (e.g., `youcode-backend-prod` for ECR, `youcode-vpc` for the VPC). This makes costs traceable in the AWS billing console.

---

## 📄 `vpc.tf` — Network Layer

```hcl
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"
```
> Uses the widely-adopted open-source VPC Terraform module. This single module creates: VPC, subnets, route tables, NAT gateways, internet gateways, and subnet associations — saving hundreds of lines of raw resource definitions.

```hcl
  name = "${var.project_name}-vpc"   # → "youcode-vpc"
  cidr = var.vpc_cidr                # → "10.0.0.0/16"
```
> Sets the VPC name tag and the overall IP space.

```hcl
  azs             = ["${var.aws_region}a", "${var.aws_region}b", "${var.aws_region}c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
```
> Creates **6 subnets across 3 Availability Zones** for high availability.
>
> | Type | AZ-a | AZ-b | AZ-c |
> |---|---|---|---|
> | **Private** | 10.0.1.0/24 | 10.0.2.0/24 | 10.0.3.0/24 |
> | **Public** | 10.0.101.0/24 | 10.0.102.0/24 | 10.0.103.0/24 |
>
> - **Private subnets**: EKS worker nodes live here — no direct internet access
> - **Public subnets**: NAT Gateway and ALB (load balancer) live here — internet-facing

```hcl
  enable_nat_gateway = true
  single_nat_gateway = true
```
> A **NAT Gateway** lets private-subnet resources (EKS nodes) initiate outbound traffic (e.g., pull Docker images, call AWS APIs) without being directly accessible from the internet.
> `single_nat_gateway = true` uses one shared NAT instead of one per AZ — **saves cost**, at the expense of reduced HA if the NAT AZ has an outage. Acceptable for this project scale.

```hcl
  enable_dns_hostnames = true
```
> Required by EKS. Without this, nodes cannot resolve AWS service endpoints by hostname.

```hcl
  public_subnet_tags = {
    "kubernetes.io/role/elb"                    = "1"
    "kubernetes.io/cluster/${var.cluster_name}" = "owned"
  }
  private_subnet_tags = {
    "kubernetes.io/role/internal-elb"           = "1"
    "kubernetes.io/cluster/${var.cluster_name}" = "owned"
  }
```
> These subnet tags are **required by the AWS Load Balancer Controller**. When you create an `Ingress` in Kubernetes, the controller reads these tags to discover which subnets to provision the ALB or NLB into.
> - `elb` tag on public subnets → internet-facing load balancers go here
> - `internal-elb` tag on private subnets → internal load balancers go here

---

## 📄 `eks.tf` — Kubernetes Cluster

```hcl
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"
```
> Uses the official EKS Terraform module (v20). This provisions the control plane, OIDC provider, node group IAM roles, security groups, and kubeconfig.

```hcl
  cluster_name    = var.cluster_name    # "youcode-cluster"
  cluster_version = "1.29"
```
> Kubernetes version 1.29. Always pin this — `eks update-cluster-version` is a one-way operation and must be tested.

```hcl
  cluster_endpoint_public_access = true
```
> Makes the Kubernetes API server reachable from the internet (your laptop, GitHub Actions runners). For maximum security in production, set this to `false` and use a VPN or bastion host — but public access with IAM auth is acceptable for a project of this size.

```hcl
  vpc_id                   = module.vpc.vpc_id
  subnet_ids               = module.vpc.private_subnets
  control_plane_subnet_ids = module.vpc.private_subnets
```
> Places both the control plane ENIs and worker nodes in the **private subnets**. Even though the API endpoint is publicly accessible, the underlying infrastructure is not directly reachable.

```hcl
  eks_managed_node_groups = {
    main = {
      min_size     = 1
      max_size     = 3
      desired_size = 2

      instance_types = ["t3.medium"]
      capacity_type  = "ON_DEMAND"
    }
  }
```
> Defines a **Managed Node Group** — AWS handles OS patching, node replacement, and scaling for you.
>
> | Parameter | Value | Meaning |
> |---|---|---|
> | `min_size` | 1 | Never scale below 1 node (prevents total downtime) |
> | `max_size` | 3 | Can scale out to 3 nodes under load |
> | `desired_size` | 2 | Normal steady-state: 2 nodes |
> | `instance_types` | `t3.medium` | 2 vCPU / 4GB RAM per node — suitable for dev/staging workloads |
> | `capacity_type` | `ON_DEMAND` | Reliable, not spot instances — avoids unexpected terminations |

```hcl
  enable_cluster_creator_admin_permissions = true
```
> Automatically grants admin access to the IAM identity that ran `terraform apply`. Without this, even the person who created the cluster would get locked out of kubectl.

---

## 📄 `ecr.tf` — Container Registries

Four ECR repositories are created — one per app per environment:

```hcl
resource "aws_ecr_repository" "backend" {
  name                 = "${var.project_name}-backend-prod"   # "youcode-backend-prod"
  image_tag_mutability = "MUTABLE"
```
> `MUTABLE` allows overwriting existing tags (e.g., re-pushing `:latest`). For stricter immutability in production, use `IMMUTABLE` — this forces every push to use a unique tag, making rollbacks safer.

```hcl
  image_scanning_configuration {
    scan_on_push = true
  }
```
> Enables **AWS ECR Basic Scanning** (powered by Clair/Trivy) on every image push. You'll see vulnerability reports in the ECR console without any extra tooling. Critical for catching CVEs in your base images.

The four repositories created:

| Resource Name | ECR Repo Name | Purpose |
|---|---|---|
| `aws_ecr_repository.backend` | `youcode-backend-prod` | Spring Boot images for production |
| `aws_ecr_repository.frontend` | `youcode-frontend-prod` | Next.js images for production |
| `aws_ecr_repository.backend_dev` | `youcode-backend-dev` | Spring Boot images for dev |
| `aws_ecr_repository.frontend_dev` | `youcode-frontend-dev` | Next.js images for dev |

---

## 📄 `iam.tf` — Service Account Roles (IRSA)

**IRSA** (IAM Roles for Service Accounts) is the AWS-native way to grant Kubernetes pods permission to call AWS APIs — without hardcoding credentials.

```hcl
module "lb_role" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "~> 5.0"

  role_name                              = "${var.project_name}-lb-controller"
  attach_load_balancer_controller_policy = true
```
> Creates an IAM role for the **AWS Load Balancer Controller** pod. The `attach_load_balancer_controller_policy = true` attaches the exact AWS-managed policy that lets the controller create/manage ALBs and NLBs on your behalf.

```hcl
  oidc_providers = {
    main = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["kube-system:aws-load-balancer-controller"]
    }
  }
```
> This is the IRSA trust relationship. It says:
> _"Only the Kubernetes ServiceAccount named `aws-load-balancer-controller` in namespace `kube-system` is allowed to assume this IAM role."_
> The OIDC provider (created by the EKS module) acts as the identity bridge between Kubernetes and AWS IAM.

```hcl
module "external_dns_role" {
  ...
  role_name                     = "${var.project_name}-external-dns"
  attach_external_dns_policy    = true
  external_dns_hosted_zone_arns = ["arn:aws:route53:::hostedzone/*"]
```
> Creates an IAM role for **ExternalDNS** — a controller that automatically creates Route53 DNS records pointing to your ALB whenever you create an Ingress with a hostname annotation. The wildcard `hostedzone/*` grants access to all your Route53 zones.

---

## 📄 `outputs.tf` — Exported Values

```hcl
output "vpc_id" {
  value = module.vpc.vpc_id
}
```
> Exported so you can use it in scripts: `terraform output -raw vpc_id`

```hcl
output "eks_cluster_name" {
  value = module.eks.cluster_name
}
output "eks_cluster_endpoint" {
  value = module.eks.cluster_endpoint
}
```
> Used by GitHub Actions to configure kubectl: `aws eks update-kubeconfig --name $(terraform output -raw eks_cluster_name)`

```hcl
output "ecr_repository_urls" {
  value = {
    backend_prod  = aws_ecr_repository.backend.repository_url
    frontend_prod = aws_ecr_repository.frontend.repository_url
    backend_dev   = aws_ecr_repository.backend_dev.repository_url
    frontend_dev  = aws_ecr_repository.frontend_dev.repository_url
  }
}
```
> A map output. Access individual URLs with: `terraform output -json ecr_repository_urls | jq -r '.backend_prod'`

```hcl
output "lb_controller_role_arn" {
  value = module.lb_role.iam_role_arn
}
```
> Used when installing the AWS Load Balancer Controller via Helm — the Helm chart needs this ARN to annotate the ServiceAccount.

---

# ☸️ KUBERNETES

---

## 📄 `base/backend.yaml` — Backend Deployment & Service

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: youcode-backend
```
> A **Deployment** is a Kubernetes object that manages a set of identical pods (replicas). It ensures the desired number of pods is always running and handles rolling updates.

```yaml
spec:
  replicas: 2
```
> Run **2 instances** of the backend for redundancy. If one pod crashes or a node goes down, the other keeps serving traffic. Kustomize overlays can override this (e.g., dev uses 1 replica).

```yaml
  selector:
    matchLabels:
      app: youcode-backend
  template:
    metadata:
      labels:
        app: youcode-backend
```
> The `selector` tells the Deployment which pods it owns. The `labels` on the pod template must match the selector. The Service uses this same label to route traffic.

```yaml
    spec:
      containers:
      - name: youcode-backend
        image: youcode-backend:latest
        ports:
        - containerPort: 8081
```
> The container image tag `youcode-backend:latest` is a placeholder — Kustomize's `edit set image` command replaces it with the real ECR URL + git SHA tag at deploy time.
> Port `8081` is the Spring Boot server port (configured via `server.port` in `application.properties`).

```yaml
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: prod
```
> Activates the Spring Boot `prod` profile — this loads `application-prod.properties`, which typically points to the production database, disables debug logging, etc.

```yaml
        - name: SPRING_DATASOURCE_URL
          valueFrom:
            secretKeyRef:
              name: youcode-secrets
              key: db-url
        - name: SPRING_DATASOURCE_USERNAME
          valueFrom:
            secretKeyRef:
              name: youcode-secrets
              key: db-username
        - name: SPRING_DATASOURCE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: youcode-secrets
              key: db-password
```
> Injects database credentials from a **Kubernetes Secret** (not hardcoded in the manifest). The `youcode-secrets` Secret must be created in the same namespace before deploying. This is the Kubernetes-native way to handle sensitive config.

```yaml
---
apiVersion: v1
kind: Service
metadata:
  name: youcode-backend
spec:
  ports:
  - port: 80
    targetPort: 8081
  selector:
    app: youcode-backend
```
> A **ClusterIP Service** (the default type) — this is an internal DNS name and virtual IP that other pods use to reach the backend. No external access. The Ingress will route to this.
> - `port: 80` → what clients inside the cluster connect to
> - `targetPort: 8081` → what the container actually listens on

---

## 📄 `base/frontend.yaml` — Frontend Deployment & Service

```yaml
        image: youcode-frontend:latest
        ports:
        - containerPort: 3000
```
> Next.js development server (or `next start`) listens on port 3000.

```yaml
        env:
        - name: NEXT_PUBLIC_API_URL
          value: "http://youcode-backend:8081/api"
```
> Points the frontend at the backend **Service** by its cluster-internal DNS name (`youcode-backend`). Kubernetes automatically resolves this name within the cluster. Notice this doesn't use `localhost` — pods in the same cluster talk via service names.
>
> However, `NEXT_PUBLIC_API_URL` is baked in at build time for Next.js client-side code. For production, this should be the public ALB URL, not the cluster-internal service. This is typically overridden in the prod overlay.

---

## 📄 `base/kustomization.yaml` — Base Manifest List

```yaml
resources:
- backend.yaml
- frontend.yaml
```
> The base `kustomization.yaml` is purely a file registry. It tells Kustomize which YAML files belong to this base. Overlays reference `../../base` to inherit all of these resources.

---

## 📄 `overlays/dev` — Dev Overlay

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
- ../../base            # Inherit backend.yaml + frontend.yaml
namespace: youcode-dev  # Override: deploy into youcode-dev namespace
nameSuffix: -dev        # Rename all resources: youcode-backend → youcode-backend-dev
commonLabels:
  env: dev              # Add label env=dev to every resource
```

```yaml
patchesStrategicMerge:
- |-
  apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: youcode-backend
  spec:
    replicas: 1         # Override: only 1 replica in dev (cost saving)
- |-
  apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: youcode-frontend
  spec:
    replicas: 1         # Override: only 1 replica in dev
```
> **Strategic Merge Patch** surgically overrides specific fields in the base. Instead of duplicating the entire Deployment YAML, you only specify what changes: `replicas: 1`. All other fields (image, env, ports, etc.) are inherited from the base unchanged.

---

## 📄 `overlays/prod-blue` & `prod-green` — Blue-Green Overlays

```yaml
# prod-blue/kustomization.yaml
resources:
- ../../base
namespace: youcode-prod
nameSuffix: -blue             # Resources named: youcode-backend-blue, youcode-frontend-blue
commonLabels:
  env: prod
  color: blue                 # ← KEY: this label is what the prod Service selects on
```

The `prod-green` overlay is identical but with `nameSuffix: -green` and `color: green`.

**Why this pattern works:** The production Service (in `routing/production.yaml`) has a selector `{ color: blue }`. When the pipeline patches the selector to `{ color: green }`, traffic instantly shifts to the green pods — zero-downtime, no rolling update needed.

---

## 📄 `routing/production.yaml` — Ingress & Production Services

### Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: youcode-ingress
  namespace: youcode-prod
  annotations:
    kubernetes.io/ingress.class: alb
```
> Tells the **AWS Load Balancer Controller** (installed via Helm) to create an Application Load Balancer for this Ingress. Without this annotation, no ALB is created.

```yaml
    alb.ingress.kubernetes.io/scheme: internet-facing
```
> Places the ALB in the **public subnets** — reachable from the internet. Use `internal` for private APIs.

```yaml
    alb.ingress.kubernetes.io/target-type: ip
```
> Routes traffic directly to pod IPs instead of node IPs. This is the preferred mode for EKS — better performance, and works with Fargate if you ever migrate there.

```yaml
spec:
  rules:
  - http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: youcode-backend-prod
            port:
              number: 8081
      - path: /
        pathType: Prefix
        backend:
          service:
            name: youcode-frontend-prod
            port:
              number: 80
```
> **Path-based routing** on a single ALB:
> - `https://your-alb.aws.com/api/*` → backend (Spring Boot)
> - `https://your-alb.aws.com/*` → frontend (Next.js)
>
> More specific paths should come first. `/api` is listed before `/` so API calls aren't accidentally handled by the frontend.

### Production Services (the Blue-Green switch point)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: youcode-backend-prod
spec:
  selector:
    app: youcode-backend
    env: prod
    color: blue  # ← This line is patched by the CI/CD pipeline
```
> This is **the only Service the Ingress talks to** for production backend traffic. Its selector currently targets pods labelled `color: blue`. When the CI/CD pipeline runs:
> ```bash
> kubectl patch svc youcode-backend-prod -n youcode-prod \
>   -p '{"spec":{"selector":{"color":"green"}}}'
> ```
> The service immediately re-routes to green pods — in milliseconds, with zero dropped connections.

---

# 🚀 GITHUB ACTIONS

---

## 📄 `deploy-dev.yml` — Dev Pipeline

```yaml
on:
  push:
    branches:
      - dev
```
> Triggers on every push to the `dev` branch. PRs targeting `dev` do not trigger this (only direct pushes or merged PRs).

```yaml
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ secrets.AWS_REGION }}
```
> Uses the official AWS action to configure credentials. Under the hood, it sets `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_DEFAULT_REGION` as environment variables for all subsequent steps. These are read from GitHub Secrets — never hardcoded.

```yaml
    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v2
```
> Calls `aws ecr get-login-password` and pipes it to `docker login` automatically. The step's output `steps.login-ecr.outputs.registry` gives you the ECR registry URL (e.g., `123456789.dkr.ecr.eu-west-3.amazonaws.com`).

```yaml
    - name: Build and push Backend image
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        ECR_REPOSITORY: youcode-backend-dev
        IMAGE_TAG: ${{ github.sha }}
      run: |
        docker build \
          -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG \
          -t $ECR_REGISTRY/$ECR_REPOSITORY:latest \
          youcode-backend
        docker push $ECR_REGISTRY/$ECR_REPOSITORY --all-tags
```
> Builds the backend Docker image from the `youcode-backend/` directory (which must contain a `Dockerfile`).
> Tags it **twice**:
> - `:$IMAGE_TAG` — the git commit SHA, e.g. `:a3f5bc1`. Immutable and traceable.
> - `:latest` — a convenience tag for dev that always points to the newest build.
>
> `--all-tags` pushes both tags in one command.

```yaml
    - name: Update EKS kubeconfig
      run: aws eks update-kubeconfig --name ${{ secrets.EKS_CLUSTER_NAME }} --region ${{ secrets.AWS_REGION }}
```
> Writes/merges the kubeconfig entry for the cluster into `~/.kube/config` on the runner. `kubectl` commands after this point are authenticated against EKS using the AWS credentials configured earlier.

```yaml
    - name: Deploy to EKS (Dev Overlay)
      run: |
        cd k8s/overlays/dev
        kustomize edit set image youcode-backend=${{ steps.login-ecr.outputs.registry }}/youcode-backend-dev:${{ github.sha }}
        kustomize edit set image youcode-frontend=${{ steps.login-ecr.outputs.registry }}/youcode-frontend-dev:${{ github.sha }}
        kustomize build . | kubectl apply -f -
```
> Three steps in one:
> 1. `kustomize edit set image` — patches the `kustomization.yaml` to replace the placeholder image name with the real ECR URL + SHA tag. This modifies the file in-place on the runner.
> 2. `kustomize build .` — renders the final merged YAML (base + overlay patches + image overrides) to stdout.
> 3. `kubectl apply -f -` — applies the rendered YAML to the cluster. Kubernetes does a diff and only updates what changed.

---

## 📄 `deploy-prod.yml` — Production Blue-Green Pipeline

This workflow has **three jobs** that run sequentially with dependencies.

### Job 1: `build-and-push`

```yaml
jobs:
  build-and-push:
    runs-on: ubuntu-latest
    outputs:
      registry: ${{ steps.login-ecr.outputs.registry }}
```
> The `outputs` block exports the ECR registry URL so other jobs can use it via `${{ needs.build-and-push.outputs.registry }}`. Without this, downstream jobs can't access the ECR URL because each job runs on a fresh runner.

The build steps are identical to the dev pipeline but push to `youcode-backend-prod` and `youcode-frontend-prod` repos, with only the SHA tag (no `:latest`).

---

### Job 2: `deploy-to-idle`

```yaml
  deploy-to-idle:
    needs: build-and-push
```
> Won't start until `build-and-push` completes successfully. If the build fails, this job is skipped.

```yaml
    - name: Determine active and idle colors
      id: determine-color
      run: |
        CURRENT_COLOR=$(kubectl get svc youcode-frontend-prod \
          -n youcode-prod \
          -o jsonpath='{.spec.selector.color}')
        if [ "$CURRENT_COLOR" == "blue" ]; then
          echo "new_color=green" >> $GITHUB_OUTPUT
        else
          echo "new_color=blue" >> $GITHUB_OUTPUT
        fi
```
> **Reads the live cluster state** to determine which color is currently active.
> - If the prod service currently selects `color: blue` → we'll deploy to `green` (the idle side)
> - If it selects `color: green` → we'll deploy to `blue`
>
> `jsonpath='{.spec.selector.color}'` is a JSONPath query against the Service object's spec.
> `$GITHUB_OUTPUT` is a special file that exports step outputs to subsequent steps/jobs.

```yaml
    - name: Deploy to Idle environment
      env:
        NEW_COLOR: ${{ steps.determine-color.outputs.new_color }}
        REGISTRY: ${{ needs.build-and-push.outputs.registry }}
      run: |
        cd k8s/overlays/prod-${NEW_COLOR}
        kustomize edit set image youcode-backend=${REGISTRY}/youcode-backend-prod:${{ github.sha }}
        kustomize edit set image youcode-frontend=${REGISTRY}/youcode-frontend-prod:${{ github.sha }}
        kustomize build . | kubectl apply -f -
```
> Deploys to the **idle** color only. Live production traffic is completely unaffected — the active color's pods keep running untouched.

```yaml
    - name: Wait for deployment
      run: |
        kubectl rollout status deployment/youcode-backend-${{ steps.determine-color.outputs.new_color }} -n youcode-prod
        kubectl rollout status deployment/youcode-frontend-${{ steps.determine-color.outputs.new_color }} -n youcode-prod
```
> `kubectl rollout status` blocks until all new pods are Running and Ready (or times out with an error). This is the health gate — if pods crash-loop or fail readiness checks, the workflow fails here, and **the traffic switch never happens**.

---

### Job 3: `promote-to-active`

```yaml
  promote-to-active:
    needs: [deploy-to-idle]
    environment: production-approval  # ← Manual gate
```
> The `environment: production-approval` key pauses the workflow and **sends a notification to required reviewers** configured in the GitHub Environment settings. A human must click "Approve" in the GitHub UI before this job runs.
>
> This is your last safety check: the idle environment is running the new code, you can test it at its internal address, then approve to flip traffic.

```yaml
    - name: Switch traffic to new active color
      env:
        NEW_COLOR: ${{ needs.deploy-to-idle.outputs.new_color }}
      run: |
        kubectl patch svc youcode-backend-prod -n youcode-prod \
          -p '{"spec":{"selector":{"color":"'${NEW_COLOR}'"}}}'
        kubectl patch svc youcode-frontend-prod -n youcode-prod \
          -p '{"spec":{"selector":{"color":"'${NEW_COLOR}'"}}}'
```
> `kubectl patch` does a **partial in-place update** — only modifying the `selector.color` field.
>
> This is the atomic traffic switch. The moment this command completes:
> - All new requests go to the new color's pods
> - In-flight requests on the old color complete normally (connection draining)
> - Zero downtime, zero re-deployment
>
> The old color's pods continue running until the next deployment cycle (when they become the new idle target).
