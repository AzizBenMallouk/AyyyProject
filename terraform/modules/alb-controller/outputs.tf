output "irsa_role_arn" {
  description = "IAM role ARN to annotate the aws-load-balancer-controller ServiceAccount"
  value       = module.irsa.role_arn
}
