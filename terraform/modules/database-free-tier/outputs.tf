output "rds_instance_id" {
  description = "RDS 인스턴스 식별자"
  value       = aws_db_instance.postgres.identifier
}

output "rds_endpoint" {
  description = "RDS PostgreSQL 엔드포인트 (host:port)"
  value       = aws_db_instance.postgres.endpoint
}

output "rds_address" {
  description = "RDS PostgreSQL 호스트 주소"
  value       = aws_db_instance.postgres.address
}

output "rds_port" {
  description = "RDS PostgreSQL 포트"
  value       = aws_db_instance.postgres.port
}

output "rds_db_name" {
  description = "RDS 데이터베이스 이름"
  value       = aws_db_instance.postgres.db_name
}

output "redis_endpoint" {
  description = "ElastiCache Redis 엔드포인트"
  value       = aws_elasticache_cluster.redis.cache_nodes[0].address
}

output "redis_port" {
  description = "ElastiCache Redis 포트"
  value       = aws_elasticache_cluster.redis.cache_nodes[0].port
}

output "spring_datasource_url" {
  description = "Spring Boot JDBC URL"
  value       = "jdbc:postgresql://${aws_db_instance.postgres.endpoint}/${aws_db_instance.postgres.db_name}"
}
