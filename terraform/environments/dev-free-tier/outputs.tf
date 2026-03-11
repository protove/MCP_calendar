################################################################################
# Networking
################################################################################
output "vpc_id" {
  description = "VPC ID"
  value       = module.networking.vpc_id
}

################################################################################
# Compute
################################################################################
output "ecs_cluster_name" {
  description = "ECS Cluster 이름"
  value       = module.compute.ecs_cluster_name
}

################################################################################
# Database
################################################################################
output "rds_endpoint" {
  description = "RDS PostgreSQL 엔드포인트"
  value       = module.database.rds_endpoint
}

output "rds_instance_id" {
  description = "RDS 인스턴스 식별자"
  value       = module.database.rds_instance_id
}

output "redis_endpoint" {
  description = "ElastiCache Redis 엔드포인트"
  value       = module.database.redis_endpoint
}

output "spring_datasource_url" {
  description = "Spring Boot JDBC URL"
  value       = module.database.spring_datasource_url
  sensitive   = true
}

################################################################################
# Storage
################################################################################
output "ecr_backend_url" {
  description = "Backend ECR Repository URL"
  value       = module.storage.ecr_backend_url
}

output "ecr_frontend_url" {
  description = "Frontend ECR Repository URL"
  value       = module.storage.ecr_frontend_url
}

################################################################################
# URLs
################################################################################
output "app_url" {
  description = "애플리케이션 접속 URL"
  value       = "https://${var.domain_name}"
}

output "api_url" {
  description = "API 엔드포인트 URL"
  value       = "https://api.${var.domain_name}/api"
}

output "alb_dns_name" {
  description = "ALB DNS (Cloudflare CNAME 대상)"
  value       = module.compute.alb_dns_name
}
