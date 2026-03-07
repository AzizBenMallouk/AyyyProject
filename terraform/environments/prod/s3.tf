# S3 Bucket for App Uploads
module "s3_uploads" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "~> 3.0"

  bucket = "${var.cluster_name}-uploads"
  acl    = "private"

  control_object_ownership = true
  object_ownership         = "ObjectWriter"

  versioning = {
    enabled = true
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
      namespace_service_accounts = ["default:youcode-backend"] # Assuming default namespace
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
