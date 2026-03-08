# EKS Module
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 19.15"

  cluster_name    = var.cluster_name
  cluster_version = "1.31" # Updated from 1.27

  cluster_endpoint_public_access = true

  vpc_id                   = module.vpc.vpc_id
  subnet_ids               = module.vpc.private_subnets
  control_plane_subnet_ids = module.vpc.private_subnets

  eks_managed_node_groups = {
    main = {
      min_size     = 1
      max_size     = 3
      desired_size = 2

      ami_type       = "AL2023_ARM_64_STANDARD"
      instance_types = ["t4g.small"] # Changed to Free Tier eligible
      capacity_type  = "ON_DEMAND"
    }
  }

  # IRSA
  enable_irsa = true

  cluster_addons = {
    kube-proxy = {}
    vpc-cni = {
      resolve_conflicts = "OVERWRITE"
      configuration_values = jsonencode({
        env = {
          ENABLE_PREFIX_DELEGATION = "true"
          WARM_PREFIX_TARGET       = "1"
        }
      })
    }
    coredns = {}
  }
}
