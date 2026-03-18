# Infrastructure Documentation (Terraform)

This project uses Terraform (with a Terragrunt-like structure) to manage AWS infrastructure.

## Structure
The infrastructure is organized by environment:
- `terraform/environments/prod/`: Production environment.
    - `01-network/`: VPC, Subnets, and Networking.
    - `02-cluster/`: EKS Cluster and Node Groups.
    - `03-gitops/`: ArgoCD installation and ECR management.

## Key Components
- **VPC**: High-availability networking across multiple AZs.
- **EKS**: Managed Kubernetes service.
- **ECR**: Container registries for frontend and backend images.

## Management
Infra changes should be applied sequentially (01 -> 02 -> 03).
A `cleanup_infra.sh` script is provided for resource deletion.
