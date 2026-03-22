variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "cluster_name" {
  description = "Name of the EKS cluster (used for resource naming)"
  type        = string
  default     = "prod-eks-cluster"
}

variable "huggingface_token" {
  description = "HuggingFace API token for AI email generation (sensitive)"
  type        = string
  sensitive   = true
}

variable "notification_emails" {
  description = "List of initial email addresses to subscribe to the SNS topic"
  type        = list(string)
  default     = []
}
