# These outputs are consumed by the k8s/ module via terraform_remote_state

output "cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "cluster_endpoint" {
  description = "EKS cluster API endpoint"
  value       = module.eks.cluster_endpoint
}

output "cluster_certificate_authority_data" {
  description = "Base64-encoded cluster CA certificate"
  value       = module.eks.cluster_certificate_authority_data
}

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "lb_role_arn" {
  description = "IAM role ARN for the AWS Load Balancer Controller"
  value       = module.lb_role.iam_role_arn
}

output "ecr_repository_urls" {
  description = "ECR repository URLs"
  value = {
    backend_prod  = aws_ecr_repository.backend.repository_url
    frontend_prod = aws_ecr_repository.frontend.repository_url
    backend_dev   = aws_ecr_repository.backend_dev.repository_url
    frontend_dev  = aws_ecr_repository.frontend_dev.repository_url
  }
}
