variable "project_name" {
  type        = string
  description = "Project name for tagging"
}

variable "environment" {
  type        = string
  description = "Environment name"
}

variable "repository_names" {
  type        = list(string)
  description = "List of ECR repository names to create"
  default     = ["youcode-backend", "youcode-frontend"]
}
