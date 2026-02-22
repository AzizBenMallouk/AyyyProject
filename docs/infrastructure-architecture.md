# YouCode Infrastructure & CI/CD Architecture

This document provides a comprehensive overview of the technical architecture implemented for the YouCode application, covering Terraform, Kubernetes, and GitHub Actions for Blue-Green deployments.

## 1. Infrastructure as Code (Terraform)
We use Terraform to provision and manage the AWS infrastructure in a reproducible way.

- **VPC**: A dedicated multi-AZ VPC with public and private subnets. NAT Gateway is used for private subnet egress.
- **EKS (Elastic Kubernetes Service)**: A managed Kubernetes cluster.
    - **Node Groups**: Managed node groups with `t3.medium` instances for the application workloads.
    - **OIDC**: Enabled for IAM Roles for Service Accounts (IRSA), allowing Kubernetes pods to assume AWS roles.
- **ECR (Elastic Container Registry)**: Private repositories for backend and frontend Docker images, with separate repositories for `dev` and `prod`.
- **IAM**: Pre-configured roles for:
    - **AWS Load Balancer Controller**: Manages ALBs for Ingress resources.
    - **ExternalDNS**: Syncs internal Kubernetes services with Route53 (optional).

## 2. Kubernetes Object Structure
We utilize **Kustomize** for configuration management across environments.

### Base Manifests (`k8s/base/`)
Defines the standard resources:
- `Deployment`: Replicas, selectors, and container specs for backend and frontend.
- `Service`: Internal load balancing within the cluster.

### Overlays (`k8s/overlays/`)
- `dev`: Single-replica deployment in the `youcode-dev` namespace.
- `prod-blue` & `prod-green`: Production environments with replicas and specific `color` labels for traffic switching.

### Routing (`k8s/routing/`)
- `Ingress`: AWS Application Load Balancer (ALB) that routes traffic to the target production service.
- **Production Services**: Specialized services that use a `color` selector to point to either the blue or green pods.

## 3. Blue-Green Deployment Strategy
The Blue-Green strategy ensures zero downtime and rapid rollback.

1.  **Deployment**: The new version is deployed to the "Idle" environment (e.g., if Blue is active, deploy to Green).
2.  **Verify**: The Idle environment is automatically checked for readiness.
3.  **Approve**: A manual approval step in GitHub Actions allows for final manual verification.
4.  **Swap**: Traffic is switched by patching the Production Service selector to point to the new color.

## 4. CI/CD Workflows (GitHub Actions)

### Development Workflow (`deploy-dev.yml`)
- Trigger: Push to `dev` branch.
- Action: Builds images, pushes to ECR, and applies the `dev` overlay to the `youcode-dev` namespace.

### Production Workflow (`deploy-prod.yml`)
- Trigger: Push to `main` branch.
- **Build & Push**: Builds production-ready images.
- **Deploy to Idle**: Identifies the currently inactive "Idle" color and deploys the new images there.
- **Manual Approval**: Required before switching traffic.
- **Traffic Switch**: Switches the production Ingress traffic to the new color.

## 5. Security & Authentication
- **Secrets Management**: Kubernetes Secrets are used to store sensitive data (DB URLs, credentials).
- **Network Isolation**: Application instances run in private subnets. Only the Load Balancer is in the public subnet.
- **RBAC**: Fine-grained access control within the EKS cluster.
