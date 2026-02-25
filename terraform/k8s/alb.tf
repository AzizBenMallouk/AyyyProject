# AWS Load Balancer Controller — installs the operator that provisions ALBs
resource "helm_release" "aws_load_balancer_controller" {
  name       = "aws-load-balancer-controller"
  repository = "https://aws.github.io/eks-charts"
  chart      = "aws-load-balancer-controller"
  namespace  = "kube-system"
  version    = "1.8.0"

  set {
    name  = "clusterName"
    value = local.cluster_name
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
    value = local.lb_role_arn
  }
  set {
    name  = "replicaCount"
    value = "2"
  }
  set {
    name  = "vpcId"
    value = local.vpc_id
  }
  set {
    name  = "region"
    value = var.aws_region
  }
}
