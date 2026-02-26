output "repository_urls" {
  description = "Map of repository name → ECR URL"
  value       = { for name, repo in aws_ecr_repository.this : name => repo.repository_url }
}

output "repository_arns" {
  description = "Map of repository name → ECR ARN"
  value       = { for name, repo in aws_ecr_repository.this : name => repo.arn }
}
