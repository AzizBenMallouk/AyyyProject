output "sqs_queue_url" {
  description = "URL of the SQS feature announcements queue (used by CI/CD)"
  value       = aws_sqs_queue.feature_announcements.url
}

output "sqs_queue_arn" {
  description = "ARN of the SQS feature announcements queue"
  value       = aws_sqs_queue.feature_announcements.arn
}

output "sns_topic_arn" {
  description = "ARN of the SNS feature updates topic"
  value       = aws_sns_topic.feature_updates.arn
}

output "lambda_function_name" {
  description = "Name of the feature notifier Lambda"
  value       = aws_lambda_function.feature_notifier.function_name
}
