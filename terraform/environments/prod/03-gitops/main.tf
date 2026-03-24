# GitOps and Addons Layer

# ArgoCD
resource "helm_release" "argocd" {
  name       = "argocd"
  repository = "https://argoproj.github.io/argo-helm"
  chart      = "argo-cd"
  namespace  = "argocd"
  create_namespace = true

  set {
    name  = "server.service.type"
    value = "LoadBalancer"
  }

  set {
    name  = "server.service.annotations.service\\.beta\\.kubernetes\\.io/aws-load-balancer-type"
    value = "external"
  }

  set {
    name  = "server.service.annotations.service\\.beta\\.kubernetes\\.io/aws-load-balancer-nlb-target-type"
    value = "ip"
  }

  set {
    name  = "server.service.annotations.service\\.beta\\.kubernetes\\.io/aws-load-balancer-scheme"
    value = "internet-facing"
  }

  set {
    name  = "server.extraArgs"
    value = "{--basehref,/argocd}"
  }

  timeout = 600
  wait    = true
}

# Argo Rollouts
resource "helm_release" "argo_rollouts" {
  name       = "argo-rollouts"
  repository = "https://argoproj.github.io/argo-helm"
  chart      = "argo-rollouts"
  namespace  = "argo-rollouts"
  create_namespace = true

  timeout = 600
  wait    = true
}

# ALB Controller
resource "helm_release" "aws_lb_controller" {
  name       = "aws-load-balancer-controller"
  repository = "https://aws.github.io/eks-charts"
  chart      = "aws-load-balancer-controller"
  namespace  = "kube-system"

  wait    = true

  set {
    name  = "clusterName"
    value = data.terraform_remote_state.cluster.outputs.cluster_name
  }

  set {
    name  = "serviceAccount.create"
    value = "true"
  }

  set {
    name  = "serviceAccount.name"
    value = "aws-load-balancer-controller"
  }

  set {
    name  = "serviceAccount.annotations.eks\\.amazonaws\\.com/role-arn"
    value = module.lb_role.iam_role_arn
  }
}

# IRSA for Load Balancer Controller
module "lb_role" {
  source    = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version   = "~> 5.20"

  role_name = "${var.cluster_name}-lb-controller"
  attach_load_balancer_controller_policy = true

  oidc_providers = {
    main = {
      provider_arn               = data.terraform_remote_state.cluster.outputs.oidc_provider_arn
      namespace_service_accounts = ["kube-system:aws-load-balancer-controller"]
    }
  }
}

# S3 and ECR (Data resources)
data "aws_caller_identity" "current" {}

module "s3_uploads" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "~> 3.0"

  bucket = "${var.cluster_name}-uploads-${data.aws_caller_identity.current.account_id}"
  acl    = "private"

  control_object_ownership = true
  object_ownership         = "ObjectWriter"

  versioning = {
    enabled = true
  }
}

module "ecr_frontend" {
  source  = "terraform-aws-modules/ecr/aws"
  version = "~> 1.6"

  repository_name = "app-frontend-prod"
  repository_image_tag_mutability = "IMMUTABLE"
  repository_lifecycle_policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 10 images"
        selection = {
          tagStatus     = "any"
          countType     = "imageCountMoreThan"
          countNumber   = 10
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

module "ecr_backend" {
  source  = "terraform-aws-modules/ecr/aws"
  version = "~> 1.6"

  repository_name = "app-backend-prod"
  repository_image_tag_mutability = "IMMUTABLE"
  repository_lifecycle_policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 10 images"
        selection = {
          tagStatus     = "any"
          countType     = "imageCountMoreThan"
          countNumber   = 10
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

# IRSA for Backend to access S3
module "backend_s3_role" {
  source    = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version   = "~> 5.20"

  role_name = "${var.cluster_name}-backend-s3"
  
  role_policy_arns = {
    policy = aws_iam_policy.backend_s3.arn
  }

  oidc_providers = {
    main = {
      provider_arn               = data.terraform_remote_state.cluster.outputs.oidc_provider_arn
      namespace_service_accounts = ["default:youcode-backend"]
    }
  }
}

resource "aws_iam_policy" "backend_s3" {
  name        = "${var.cluster_name}-backend-s3-policy"
  description = "Policy for backend to access S3 uploads"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Effect   = "Allow"
        Resource = [
          module.s3_uploads.s3_bucket_arn,
          "${module.s3_uploads.s3_bucket_arn}/*"
        ]
      }
    ]
  })
}

# Data from Cluster
data "terraform_remote_state" "cluster" {
  backend = "local"
  config = {
    path = "../02-cluster/terraform.tfstate"
  }
}
