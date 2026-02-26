###############################################################################
# Module: SQS
# Standard queue with Dead Letter Queue for the async AI pipeline.
###############################################################################

# ── Dead Letter Queue ─────────────────────────────────────────────────────────

resource "aws_sqs_queue" "dlq" {
  name                      = "${var.queue_name}-dlq"
  message_retention_seconds = 1209600 # 14 days — keep failed messages for inspection
  kms_master_key_id         = "alias/aws/sqs"

  tags = {
    ManagedBy   = "terraform"
    Project     = var.project_name
    Environment = var.environment
    Type        = "dlq"
  }
}

# ── Main Queue ────────────────────────────────────────────────────────────────

resource "aws_sqs_queue" "this" {
  name                       = var.queue_name
  visibility_timeout_seconds = var.visibility_timeout_seconds
  message_retention_seconds  = var.message_retention_seconds
  receive_wait_time_seconds  = 20 # Long polling
  kms_master_key_id          = "alias/aws/sqs"

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.dlq.arn
    maxReceiveCount     = var.max_receive_count
  })

  tags = {
    ManagedBy   = "terraform"
    Project     = var.project_name
    Environment = var.environment
    Type        = "main"
  }
}

# ── Queue Policy — allow EKS pods (via IRSA) to send ─────────────────────────

data "aws_caller_identity" "current" {}

resource "aws_sqs_queue_policy" "this" {
  queue_url = aws_sqs_queue.this.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowSendFromAccount"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Action   = ["sqs:SendMessage", "sqs:ReceiveMessage", "sqs:DeleteMessage", "sqs:GetQueueAttributes"]
        Resource = aws_sqs_queue.this.arn
      }
    ]
  })
}
