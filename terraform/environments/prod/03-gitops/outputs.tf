output "ecr_frontend_repository_url" {
  description = "The URL of the frontend ECR repository"
  value       = module.ecr_frontend.repository_url
}

output "ecr_backend_repository_url" {
  description = "The URL of the backend ECR repository"
  value       = module.ecr_backend.repository_url
}

output "s3_bucket_name" {
  description = "The name of the S3 bucket"
  value       = module.s3_uploads.s3_bucket_id
}
