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
output "ec2_public_ip" {
  description = "EC2 퍼블릭 IP"
  value       = module.compute.ec2_public_ip
}

output "ec2_public_dns" {
  description = "EC2 퍼블릭 DNS"
  value       = module.compute.ec2_public_dns
}

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
  value       = "http://${module.compute.ec2_public_dns}"
}

output "api_url" {
  description = "API 엔드포인트 URL"
  value       = "http://${module.compute.ec2_public_dns}:8080/api"
}
