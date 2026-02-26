variable "aws_region" {
  type    = string
  default = "eu-west-3"
}

variable "project_name" {
  type    = string
  default = "ayyyapp"
}

variable "environment" {
  type    = string
  default = "prod"
}

variable "cluster_name" {
  type    = string
  default = "ayyyapp-prod"
}

variable "kubernetes_version" {
  type    = string
  default = "1.32"
}

variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "ecr_repository_names" {
  type    = list(string)
  default = ["ayyyapp-backend", "ayyyapp-frontend"]
}

variable "fargate_profiles" {
  type = list(object({
    name      = string
    namespace = string
    labels    = optional(map(string), {})
  }))
  default = [
    { name = "app", namespace = "ayyyapp-prod" },
    { name = "monitoring", namespace = "monitoring" },
  ]
}

variable "app_namespace" {
  type    = string
  default = "ayyyapp-prod"
}

variable "app_service_account_name" {
  type    = string
  default = "ayyyapp-sa"
}

variable "bedrock_model_id" {
  type    = string
  default = "anthropic.claude-3-haiku-20240307-v1:0"
}
