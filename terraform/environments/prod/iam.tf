# IRSA for AWS Load Balancer Controller
module "lb_role" {
  source    = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version   = "~> 5.20"

  role_name = "${var.cluster_name}-lb-controller"
  attach_load_balancer_controller_policy = true

  oidc_providers = {
    main = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["kube-system:aws-load-balancer-controller"]
    }
  }
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
      provider_arn               = module.eks.oidc_provider_arn
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

resource "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"] # GitHub's thumbprint
}

# GitHub Actions OIDC Role
module "github_oidc_role" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-assumable-role-with-oidc"
  version = "~> 5.0"

  create_role      = true
  role_name        = "github-actions-oidc-role"
  provider_url     = aws_iam_openid_connect_provider.github.url
  role_policy_arns = ["arn:aws:iam::aws:policy/AdministratorAccess"]

  oidc_fully_qualified_subjects = [
    "repo:AzizBenMallouk/AyyyProject:ref:refs/heads/main"
  ]
}
