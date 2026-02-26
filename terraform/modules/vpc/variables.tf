variable "vpc_cidr" {
  type        = string
  description = "CIDR block for the VPC"
  default     = "10.0.0.0/16"
}

variable "project_name" {
  type        = string
  description = "Project name used for resource naming and tagging"
}

variable "environment" {
  type        = string
  description = "Environment name (dev, staging, prod)"
}

variable "cluster_name" {
  type        = string
  description = "EKS cluster name — used for subnet tags"
}
