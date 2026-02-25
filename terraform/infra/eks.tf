module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = var.cluster_name
  cluster_version = "1.32"

  cluster_endpoint_public_access = true

  vpc_id                   = module.vpc.vpc_id
  subnet_ids               = module.vpc.private_subnets
  control_plane_subnet_ids = module.vpc.private_subnets

  fargate_profiles = {
    default = {
      name = "default"
      selectors = [
        { namespace = "default" },
        { namespace = "kube-system" },
      ]
    }
  }

  enable_cluster_creator_admin_permissions = true

  tags = {
    Project     = var.project_name
    Environment = "prod"
  }
}

# CoreDNS — AWS-managed addon, stays in the infra layer
resource "aws_eks_addon" "coredns" {
  cluster_name                = module.eks.cluster_name
  addon_name                  = "coredns"
  resolve_conflicts_on_create = "OVERWRITE"
  resolve_conflicts_on_update = "OVERWRITE"

  configuration_values = jsonencode({
    computeType  = "Fargate"
    replicaCount = 2
    resources = {
      limits   = { cpu = "0.25", memory = "256M" }
      requests = { cpu = "0.25", memory = "256M" }
    }
  })

  depends_on = [module.eks]
}
