aws_region   = "eu-west-3"
project_name = "ayyyapp"
environment  = "prod"
cluster_name = "ayyyapp-prod"

kubernetes_version = "1.32"
vpc_cidr           = "10.0.0.0/16"

ecr_repository_names = ["ayyyapp-backend", "ayyyapp-frontend"]

# Fargate profiles — add more namespaces as needed
fargate_profiles = [
  { name = "app", namespace = "ayyyapp-prod" },
  { name = "monitoring", namespace = "monitoring" },
]

app_namespace            = "ayyyapp-prod"
app_service_account_name = "ayyyapp-sa"

# Bedrock model — Claude Haiku (fast + cost-effective)
bedrock_model_id = "anthropic.claude-3-haiku-20240307-v1:0"
