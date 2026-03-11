output "log_group_name" {
  description = "CloudWatch Log Group 이름 (root에서 전달받은 값)"
  value       = var.log_group_name
}

output "sns_topic_arn" {
  description = "알람 알림 SNS Topic ARN"
  value       = aws_sns_topic.alerts.arn
}
