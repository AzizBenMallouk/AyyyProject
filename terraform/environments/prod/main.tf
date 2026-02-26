###############################################################################
# Environment: prod
# Root module — wires all modules together for the production environment.
# Backend is configured in backend.tf
###############################################################################

terraform {
  required_version = ">= 1.7.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
  }
  # Backend is configured in backend.tf
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# ── VPC ───────────────────────────────────────────────────────────────────────

module "vpc" {
  source = "../../modules/vpc"

  project_name = var.project_name
  environment  = var.environment
  vpc_cidr     = var.vpc_cidr
  cluster_name = var.cluster_name
}

# ── ECR ───────────────────────────────────────────────────────────────────────

module "ecr" {
  source = "../../modules/ecr"

  project_name     = var.project_name
  environment      = var.environment
  repository_names = var.ecr_repository_names
}

# ── EKS + Fargate ─────────────────────────────────────────────────────────────

module "eks" {
  source = "../../modules/eks"

  cluster_name       = var.cluster_name
  project_name       = var.project_name
  environment        = var.environment
  kubernetes_version = var.kubernetes_version

  private_subnet_ids = module.vpc.private_subnet_ids
  public_subnet_ids  = module.vpc.public_subnet_ids

  fargate_profiles = var.fargate_profiles
}

# ── ALB Controller IRSA ───────────────────────────────────────────────────────

module "alb_controller" {
  source = "../../modules/alb-controller"

  cluster_name      = var.cluster_name
  project_name      = var.project_name
  oidc_provider_arn = module.eks.oidc_provider_arn
  oidc_issuer_url   = module.eks.oidc_issuer_url

  depends_on = [module.eks]
}

# ── App IRSA (pods → SQS) ────────────────────────────────────────────────────

data "aws_iam_policy_document" "app_sqs_send" {
  statement {
    effect    = "Allow"
    actions   = ["sqs:SendMessage", "sqs:GetQueueUrl"]
    resources = [module.sqs.queue_arn]
  }
}

resource "aws_iam_policy" "app_sqs_send" {
  name   = "${var.cluster_name}-app-sqs-send"
  policy = data.aws_iam_policy_document.app_sqs_send.json
}

module "app_irsa" {
  source = "../../modules/irsa"

  project_name         = var.project_name
  role_name            = "${var.cluster_name}-app-role"
  oidc_provider_arn    = module.eks.oidc_provider_arn
  oidc_issuer_url      = module.eks.oidc_issuer_url
  namespace            = var.app_namespace
  service_account_name = var.app_service_account_name
  policy_arns          = [aws_iam_policy.app_sqs_send.arn]

  depends_on = [module.eks]
}

# ── SQS Queue ─────────────────────────────────────────────────────────────────

module "sqs" {
  source = "../../modules/sqs"

  queue_name   = "${var.project_name}-${var.environment}-ai-pipeline"
  project_name = var.project_name
  environment  = var.environment
}

# ── DynamoDB Table (AI evaluation results) ────────────────────────────────────

resource "aws_dynamodb_table" "evaluations" {
  name         = "${var.project_name}-${var.environment}-evaluations"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "submissionId"

  attribute {
    name = "submissionId"
    type = "S"
  }

  server_side_encryption {
    enabled = true
  }

  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

# ── Lambda (async AI processor) ───────────────────────────────────────────────

module "lambda" {
  source = "../../modules/lambda"

  function_name       = "${var.project_name}-${var.environment}-ai-processor"
  project_name        = var.project_name
  environment         = var.environment
  sqs_queue_arn       = module.sqs.queue_arn
  sqs_queue_url       = module.sqs.queue_url
  bedrock_model_id    = var.bedrock_model_id
  dynamodb_table_name = aws_dynamodb_table.evaluations.name

  # Lambda runs in private subnets to access VPC-internal resources
  vpc_subnet_ids         = module.vpc.private_subnet_ids
  vpc_security_group_ids = [module.eks.cluster_security_group_id]

  depends_on = [module.sqs, aws_dynamodb_table.evaluations]
}

# ── Outputs ───────────────────────────────────────────────────────────────────

output "cluster_name" {
  value = module.eks.cluster_name
}

output "cluster_endpoint" {
  value     = module.eks.cluster_endpoint
  sensitive = true
}

output "ecr_urls" {
  description = "ECR repository URLs — use in Kubernetes manifests"
  value       = module.ecr.repository_urls
}

output "alb_controller_role_arn" {
  description = "Annotate the aws-load-balancer-controller ServiceAccount with this ARN"
  value       = module.alb_controller.irsa_role_arn
}

output "app_irsa_role_arn" {
  description = "Annotate the app ServiceAccount with this ARN"
  value       = module.app_irsa.role_arn
}

output "fargate_pod_execution_role_arn" {
  description = "Fargate pod execution role ARN (referenced by Fargate profiles)"
  value       = module.eks.fargate_pod_execution_role_arn
}

output "sqs_queue_url" {
  value = module.sqs.queue_url
}

output "dynamodb_table_name" {
  value = aws_dynamodb_table.evaluations.name
}
