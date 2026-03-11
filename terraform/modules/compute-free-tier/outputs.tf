output "ec2_instance_id" {
  description = "EC2 인스턴스 ID"
  value       = aws_instance.app.id
}

output "ec2_public_ip" {
  description = "EC2 퍼블릭 IP"
  value       = aws_instance.app.public_ip
}

output "ec2_public_dns" {
  description = "EC2 퍼블릭 DNS"
  value       = aws_instance.app.public_dns
}

output "ecs_cluster_id" {
  description = "ECS Cluster ID"
  value       = aws_ecs_cluster.main.id
}

output "ecs_cluster_name" {
  description = "ECS Cluster 이름"
  value       = aws_ecs_cluster.main.name
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
