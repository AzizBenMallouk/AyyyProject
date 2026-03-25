# ============================================================
# SQS Queue — Feature Announcement Trigger
# ============================================================
resource "aws_sqs_queue" "feature_announcements" {
  name                       = "${var.cluster_name}-feature-announcements"
  visibility_timeout_seconds = 300  # 5 min — enough time for AI + SNS publish
  message_retention_seconds  = 86400 # 1 day
  receive_wait_time_seconds  = 10   # long polling

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.feature_announcements_dlq.arn
    maxReceiveCount     = 3
  })
}

resource "aws_sqs_queue" "feature_announcements_dlq" {
  name                      = "${var.cluster_name}-feature-announcements-dlq"
  message_retention_seconds = 1209600 # 14 days
}

# ============================================================
# SNS Topic — Email Broadcast to App Users
# ============================================================
resource "aws_sns_topic" "feature_updates" {
  name = "${var.cluster_name}-feature-updates"
}

# Pre-subscribe any initial emails provided via variable
resource "aws_sns_topic_subscription" "initial_subscribers" {
  for_each  = toset(var.notification_emails)
  topic_arn = aws_sns_topic.feature_updates.arn
  protocol  = "email"
  endpoint  = each.value
}

# ============================================================
# Secrets Manager — HuggingFace API Token
# ============================================================
resource "aws_secretsmanager_secret" "gemini_api_key" {
  name                    = "${var.cluster_name}/gemini-api-key"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "gemini_api_key" {
  secret_id     = aws_secretsmanager_secret.gemini_api_key.id
  secret_string = var.gemini_api_key
}

# ============================================================
# IAM Role for Lambda
# ============================================================
data "aws_iam_policy_document" "lambda_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "feature_notifier" {
  name               = "${var.cluster_name}-feature-notifier"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

resource "aws_iam_role_policy" "feature_notifier" {
  name = "feature-notifier-policy"
  role = aws_iam_role.feature_notifier.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "SQSConsume"
        Effect = "Allow"
        Action = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes"
        ]
        Resource = aws_sqs_queue.feature_announcements.arn
      },
      {
        Sid    = "SNSPublish"
        Effect = "Allow"
        Action = ["sns:Publish"]
        Resource = aws_sns_topic.feature_updates.arn
      },
      {
        Sid    = "SecretsRead"
        Effect = "Allow"
        Action = ["secretsmanager:GetSecretValue"]
        Resource = aws_secretsmanager_secret.gemini_api_key.arn
      },
      {
        Sid    = "CloudWatchLogs"
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

# ============================================================
# Lambda Function Package (no external deps — stdlib + boto3 only)
# ============================================================
data "archive_file" "feature_notifier" {
  type        = "zip"
  source_dir  = "${path.root}/../../../../app-notifications-worker"
  output_path = "${path.module}/feature_notifier.zip"
}

resource "aws_lambda_function" "feature_notifier" {
  function_name = "${var.cluster_name}-feature-notifier"
  role          = aws_iam_role.feature_notifier.arn
  handler       = "handler.lambda_handler"
  runtime       = "python3.12"
  timeout       = 120
  memory_size   = 256

  filename         = data.archive_file.feature_notifier.output_path
  source_code_hash = data.archive_file.feature_notifier.output_base64sha256

  environment {
    variables = {
      SNS_TOPIC_ARN      = aws_sns_topic.feature_updates.arn
      GEMINI_SECRET_NAME = aws_secretsmanager_secret.gemini_api_key.name
      AWS_REGION_NAME    = var.region
    }
  }
}

# ============================================================
# SQS → Lambda Event Source Mapping
# ============================================================
resource "aws_lambda_event_source_mapping" "sqs_to_lambda" {
  event_source_arn = aws_sqs_queue.feature_announcements.arn
  function_name    = aws_lambda_function.feature_notifier.arn
  batch_size       = 1 # Process one feature at a time
  enabled          = true
}

# ============================================================
# CloudWatch Log Group (explicit, 14-day retention)
# ============================================================
resource "aws_cloudwatch_log_group" "feature_notifier" {
  name              = "/aws/lambda/${aws_lambda_function.feature_notifier.function_name}"
  retention_in_days = 14
}
