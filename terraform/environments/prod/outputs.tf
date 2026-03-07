output "cluster_name" {
  value = module.eks.cluster_name
}

output "cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "vpc_id" {
  value = module.vpc.vpc_id
}

output "ecr_frontend_repository_url" {
  value = module.ecr_frontend.repository_url
}

output "ecr_backend_repository_url" {
  value = module.ecr_backend.repository_url
}

output "s3_bucket_name" {
  value = module.s3_uploads.s3_bucket_id
}

output "backend_s3_role_arn" {
  value = module.backend_s3_role.iam_role_arn
}

output "oidc_provider_arn" {
  value = module.eks.oidc_provider_arn
}

output "github_actions_role_arn" {
  value       = module.github_oidc_role.iam_role_arn
  description = "The ARN of the IAM role for GitHub Actions"
}
