variable "function_name" {
  type = string
}

variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "sqs_queue_arn" {
  type        = string
  description = "ARN of the SQS queue that triggers this Lambda"
}

variable "sqs_queue_url" {
  type        = string
  description = "URL of the SQS queue (passed as env var)"
}

variable "sqs_batch_size" {
  type    = number
  default = 5
}

variable "bedrock_model_id" {
  type        = string
  description = "Bedrock model ID (e.g. anthropic.claude-3-haiku-20240307-v1:0)"
  default     = "anthropic.claude-3-haiku-20240307-v1:0"
}

variable "dynamodb_table_name" {
  type        = string
  description = "DynamoDB table to write AI results into"
}

variable "timeout_seconds" {
  type    = number
  default = 120
}

variable "memory_mb" {
  type    = number
  default = 512
}

variable "reserved_concurrency" {
  type        = number
  description = "Reserved concurrency limit (-1 = unreserved)"
  default     = 10
}

variable "vpc_subnet_ids" {
  type        = list(string)
  description = "Private subnet IDs if Lambda should run inside the VPC"
  default     = null
}

variable "vpc_security_group_ids" {
  type    = list(string)
  default = []
}
