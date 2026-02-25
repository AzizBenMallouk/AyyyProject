terraform {
  required_version = ">= 1.10"

  backend "s3" {
    bucket       = "bucketlister-terraform-state"
    key          = "eks/k8s/terraform.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
  }
}

# ── Read cluster info from infra/ state ───────────────────────────────────
data "terraform_remote_state" "infra" {
  backend = "s3"
  config = {
    bucket  = "bucketlister-terraform-state"
    key     = "eks/infra/terraform.tfstate"
    region  = "us-east-1"
    encrypt = true
  }
}

locals {
  cluster_name = data.terraform_remote_state.infra.outputs.cluster_name
  cluster_endpoint = data.terraform_remote_state.infra.outputs.cluster_endpoint
  cluster_ca       = data.terraform_remote_state.infra.outputs.cluster_certificate_authority_data
  lb_role_arn      = data.terraform_remote_state.infra.outputs.lb_role_arn
  vpc_id           = data.terraform_remote_state.infra.outputs.vpc_id
}

provider "aws" {
  region = var.aws_region
}

provider "helm" {
  kubernetes {
    host                   = local.cluster_endpoint
    cluster_ca_certificate = base64decode(local.cluster_ca)
    exec {
      api_version = "client.authentication.k8s.io/v1beta1"
      args        = ["eks", "get-token", "--cluster-name", local.cluster_name]
      command     = "aws"
    }
  }
}

provider "kubernetes" {
  host                   = local.cluster_endpoint
  cluster_ca_certificate = base64decode(local.cluster_ca)
  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    args        = ["eks", "get-token", "--cluster-name", local.cluster_name]
    command     = "aws"
  }
}
