variable "project_name" {
  type = string
}

variable "role_name" {
  type        = string
  description = "Name for the IAM role"
}

variable "oidc_provider_arn" {
  type        = string
  description = "ARN of the EKS OIDC provider"
}

variable "oidc_issuer_url" {
  type        = string
  description = "OIDC issuer URL (without https://)"
}

variable "namespace" {
  type        = string
  description = "Kubernetes namespace of the service account"
}

variable "service_account_name" {
  type        = string
  description = "Kubernetes service account name"
}

variable "policy_arns" {
  type        = list(string)
  description = "List of managed IAM policy ARNs to attach"
  default     = []
}

variable "inline_policy_json" {
  type        = string
  description = "Optional inline policy JSON. Leave empty string to skip."
  default     = ""
}
