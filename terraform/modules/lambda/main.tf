###############################################################################
# Module: Lambda
# AI async processor triggered by SQS. Calls AWS Bedrock (Claude) and stores
# the result in DynamoDB.
###############################################################################

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# ── Lambda Execution Role ─────────────────────────────────────────────────────

resource "aws_iam_role" "lambda" {
  name = "${var.function_name}-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })

  tags = {
    ManagedBy   = "terraform"
    Project     = var.project_name
    Environment = var.environment
  }
}

# Basic execution (CloudWatch Logs)
resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# VPC attachment (if Lambda runs in VPC)
resource "aws_iam_role_policy_attachment" "lambda_vpc" {
  count      = var.vpc_subnet_ids != null ? 1 : 0
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# Inline policy: SQS + Bedrock + DynamoDB
resource "aws_iam_role_policy" "lambda_permissions" {
  name = "${var.function_name}-permissions"
  role = aws_iam_role.lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "SQSAccess"
        Effect = "Allow"
        Action = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes",
          "sqs:ChangeMessageVisibility",
        ]
        Resource = var.sqs_queue_arn
      },
      {
        Sid    = "BedrockAccess"
        Effect = "Allow"
        Action = [
          "bedrock:InvokeModel",
          "bedrock:InvokeModelWithResponseStream",
        ]
        Resource = "arn:aws:bedrock:${data.aws_region.current.name}::foundation-model/${var.bedrock_model_id}"
      },
      {
        Sid    = "DynamoDBAccess"
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:GetItem",
        ]
        Resource = "arn:aws:dynamodb:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:table/${var.dynamodb_table_name}"
      },
    ]
  })
}

# ── CloudWatch Log Group ──────────────────────────────────────────────────────

resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${var.function_name}"
  retention_in_days = 14

  tags = {
    ManagedBy   = "terraform"
    Project     = var.project_name
    Environment = var.environment
  }
}

# ── Placeholder deployment package ───────────────────────────────────────────
# Replace with actual code artifact as part of the CI/CD pipeline.

data "archive_file" "placeholder" {
  type        = "zip"
  output_path = "${path.module}/placeholder.zip"

  source {
    content  = <<-PYTHON
      import json, os, boto3

      bedrock = boto3.client("bedrock-runtime")
      dynamodb = boto3.resource("dynamodb")
      table = dynamodb.Table(os.environ["DYNAMODB_TABLE"])

      def handler(event, context):
          for record in event["Records"]:
              payload = json.loads(record["body"])
              submission_id = payload["submission_id"]
              code = payload["code"]

              response = bedrock.invoke_model(
                  modelId=os.environ["BEDROCK_MODEL_ID"],
                  contentType="application/json",
                  accept="application/json",
                  body=json.dumps({
                      "anthropic_version": "bedrock-2023-05-31",
                      "max_tokens": 1024,
                      "messages": [{"role": "user", "content": f"Review this code:\\n\\n{code}"}]
                  })
              )

              result = json.loads(response["body"].read())
              feedback = result["content"][0]["text"]

              table.update_item(
                  Key={"submissionId": submission_id},
                  UpdateExpression="SET feedback = :f, #s = :s",
                  ExpressionAttributeNames={"#s": "status"},
                  ExpressionAttributeValues={":f": feedback, ":s": "reviewed"}
              )

          return {"statusCode": 200}
    PYTHON
    filename = "handler.py"
  }
}

# ── Lambda Function ───────────────────────────────────────────────────────────

resource "aws_lambda_function" "this" {
  function_name    = var.function_name
  role             = aws_iam_role.lambda.arn
  filename         = data.archive_file.placeholder.output_path
  source_code_hash = data.archive_file.placeholder.output_base64sha256
  runtime          = "python3.12"
  handler          = "handler.handler"
  timeout          = var.timeout_seconds
  memory_size      = var.memory_mb

  reserved_concurrent_executions = var.reserved_concurrency

  environment {
    variables = {
      BEDROCK_MODEL_ID = var.bedrock_model_id
      SQS_QUEUE_URL    = var.sqs_queue_url
      DYNAMODB_TABLE   = var.dynamodb_table_name
      LOG_LEVEL        = "INFO"
    }
  }

  dynamic "vpc_config" {
    for_each = var.vpc_subnet_ids != null ? [1] : []
    content {
      subnet_ids         = var.vpc_subnet_ids
      security_group_ids = var.vpc_security_group_ids
    }
  }

  tags = {
    ManagedBy   = "terraform"
    Project     = var.project_name
    Environment = var.environment
  }

  depends_on = [
    aws_cloudwatch_log_group.lambda,
    aws_iam_role_policy_attachment.lambda_basic,
  ]
}

# ── SQS Trigger ───────────────────────────────────────────────────────────────

resource "aws_lambda_event_source_mapping" "sqs" {
  event_source_arn                   = var.sqs_queue_arn
  function_name                      = aws_lambda_function.this.arn
  batch_size                         = var.sqs_batch_size
  maximum_batching_window_in_seconds = 30
  enabled                            = true

  function_response_types = ["ReportBatchItemFailures"]
}
