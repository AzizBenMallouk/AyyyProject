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
        {
          namespace = "default"
        },
        {
          namespace = "kube-system"
        }
      ]
    }
  }


  # Cluster creator admin permissions
  enable_cluster_creator_admin_permissions = true

  tags = {
    Project     = var.project_name
    Environment = "prod"
  }
}