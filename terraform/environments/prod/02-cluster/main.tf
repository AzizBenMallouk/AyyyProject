# EKS Cluster Layer

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 19.15"

  cluster_name    = var.cluster_name
  cluster_version = "1.31"

  cluster_endpoint_public_access = true

  vpc_id                   = data.terraform_remote_state.network.outputs.vpc_id
  subnet_ids               = data.terraform_remote_state.network.outputs.private_subnets
  control_plane_subnet_ids = data.terraform_remote_state.network.outputs.private_subnets

  eks_managed_node_groups = {
    main = {
      min_size     = 0
      max_size     = 5
      desired_size = 2

      ami_type       = "AL2023_ARM_64_STANDARD"
      instance_types = ["t4g.small"]
      capacity_type  = "ON_DEMAND"
      # capacity_type  = "SPOT"
    }
  }

  enable_irsa                   = false

  cluster_addons = {
    kube-proxy = {}
    vpc-cni = {
      resolve_conflicts = "OVERWRITE"
      configuration_values = jsonencode({
        env = {
          ENABLE_PREFIX_DELEGATION  = "true"
          WARM_PREFIX_TARGET        = "1"
          MINIMUM_IP_TARGET         = "10"
          WARM_IP_TARGET            = "5"
        }
      })
    }
    coredns = {}
  }
}

# GitHub Actions OIDC
resource "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]
}

# EKS OIDC Provider (Bypass network check for thumbprint)
resource "aws_iam_openid_connect_provider" "eks" {
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = ["9e99a48a9960b14926bb7f3b02e22da2b0ab7280"]
  url             = module.eks.cluster_oidc_issuer_url
}

module "github_oidc_role" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-assumable-role-with-oidc"
  version = "~> 5.0"

  create_role      = true
  role_name        = "github-actions-oidc-role"
  provider_url     = aws_iam_openid_connect_provider.github.url
  role_policy_arns = ["arn:aws:iam::aws:policy/AdministratorAccess"]

  oidc_fully_qualified_subjects = [
    # Branch-based jobs (build, deploy, notify)
    "repo:AzizBenMallouk/AyyyProject:ref:refs/heads/main",
    # Environment-based jobs (promote uses environment:production)
    # "repo:AzizBenMallouk/AyyyProject:environment:production"
  ]
}

data "terraform_remote_state" "network" {
  backend = "local"
  config = {
    path = "../01-network/terraform.tfstate"
  }
}
