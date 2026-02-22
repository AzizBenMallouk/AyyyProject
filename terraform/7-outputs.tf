output "vpc_id" {
  description = "The ID of the VPC"
  value       = module.vpc.vpc_id
}

output "lb_controller_role_arn" {
  description = "The ARN of the IAM role for the LB controller"
  value       = module.lb_role.iam_role_arn
}

output "eks_cluster_name" {
  description = "The name of the EKS cluster"
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "The endpoint for the EKS cluster"
  value       = module.eks.cluster_endpoint
}

output "ecr_repository_urls" {
  description = "The URLs of the ECR repositories"
  value = {
    backend_prod  = aws_ecr_repository.backend.repository_url
    frontend_prod = aws_ecr_repository.frontend.repository_url
    backend_dev   = aws_ecr_repository.backend_dev.repository_url
    frontend_dev  = aws_ecr_repository.frontend_dev.repository_url
  }
}