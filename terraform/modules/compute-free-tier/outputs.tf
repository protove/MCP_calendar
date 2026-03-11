output "ecs_cluster_id" {
  description = "ECS Cluster ID"
  value       = aws_ecs_cluster.main.id
}

output "ecs_cluster_name" {
  description = "ECS Cluster 이름"
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  description = "ECS Service 이름"
  value       = aws_ecs_service.backend.name
}

output "backend_task_definition_arn" {
  description = "Backend Task Definition ARN"
  value       = aws_ecs_task_definition.backend.arn
}

output "ecs_task_execution_role_arn" {
  description = "ECS Task Execution Role ARN"
  value       = aws_iam_role.ecs_task_execution.arn
}

output "alb_dns_name" {
  description = "ALB DNS 이름 (Cloudflare CNAME 대상)"
  value       = aws_lb.backend.dns_name
}

output "alb_zone_id" {
  description = "ALB Hosted Zone ID"
  value       = aws_lb.backend.zone_id
}

output "acm_certificate_arn" {
  description = "ACM 인증서 ARN"
  value       = aws_acm_certificate.api.arn
}

output "acm_validation_records" {
  description = "ACM DNS 검증 레코드 (Cloudflare에 추가 필요)"
  value = {
    for dvo in aws_acm_certificate.api.domain_validation_options : dvo.domain_name => {
      name  = dvo.resource_record_name
      type  = dvo.resource_record_type
      value = dvo.resource_record_value
    }
  }
}
