variable "queue_name" {
  type        = string
  description = "Name of the SQS queue"
}

variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "visibility_timeout_seconds" {
  type        = number
  description = "Must be >= Lambda max execution time"
  default     = 300
}

variable "message_retention_seconds" {
  type    = number
  default = 345600 # 4 days
}

variable "max_receive_count" {
  type        = number
  description = "Number of receives before message goes to DLQ"
  default     = 3
}
