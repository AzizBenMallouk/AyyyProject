output "cluster_name" {
  value = aws_eks_cluster.this.name
}

output "cluster_endpoint" {
  value = aws_eks_cluster.this.endpoint
}

output "cluster_ca_certificate" {
  value     = aws_eks_cluster.this.certificate_authority[0].data
  sensitive = true
}

output "cluster_version" {
  value = aws_eks_cluster.this.version
}

output "oidc_provider_arn" {
  description = "ARN of the OIDC provider — used by IRSA module"
  value       = aws_iam_openid_connect_provider.eks.arn
}

output "oidc_issuer_url" {
  description = "OIDC issuer URL without https:// — used in IRSA trust policies"
  value       = trimprefix(aws_eks_cluster.this.identity[0].oidc[0].issuer, "https://")
}

output "fargate_pod_execution_role_arn" {
  description = "IAM role ARN used by Fargate to pull images and write logs"
  value       = aws_iam_role.fargate.arn
}

output "cluster_security_group_id" {
  description = "EKS-managed cluster security group (used by Lambda VPC config)"
  value       = aws_eks_cluster.this.vpc_config[0].cluster_security_group_id
}
