output "role_arn" {
  description = "ARN of the IRSA IAM role — annotate your K8s ServiceAccount with this"
  value       = aws_iam_role.irsa.arn
}

output "role_name" {
  value = aws_iam_role.irsa.name
}
