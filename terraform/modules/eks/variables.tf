variable "cluster_name" {
  type        = string
  description = "Name of the EKS cluster"
}

variable "project_name" {
  type        = string
  description = "Project name for tagging"
}

variable "environment" {
  type        = string
  description = "Environment name"
}

variable "kubernetes_version" {
  type        = string
  description = "Kubernetes version"
  default     = "1.32"
}

variable "private_subnet_ids" {
  type        = list(string)
  description = "Private subnet IDs for Fargate pods and cluster ENIs"
}

variable "public_subnet_ids" {
  type        = list(string)
  description = "Public subnet IDs (needed for the cluster VPC config)"
  default     = []
}

variable "cluster_public_access_cidrs" {
  type        = list(string)
  description = "CIDRs allowed to reach the EKS public API endpoint"
  default     = ["0.0.0.0/0"]
}

variable "fargate_profiles" {
  type = list(object({
    name      = string
    namespace = string
    labels    = optional(map(string), {})
  }))
  description = "List of Fargate profiles to create (in addition to kube-system)"
  default = [
    { name = "app", namespace = "ayyyapp-prod" },
    { name = "monitoring", namespace = "monitoring" },
  ]
}
