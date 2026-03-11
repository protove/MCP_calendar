output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "vpc_cidr" {
  description = "VPC CIDR 블록"
  value       = aws_vpc.main.cidr_block
}

output "public_subnet_ids" {
  description = "퍼블릭 서브넷 ID 목록"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "프라이빗 서브넷 ID 목록"
  value       = aws_subnet.private[*].id
}

output "web_sg_id" {
  description = "Web (HTTP/HTTPS) Security Group ID"
  value       = aws_security_group.web.id
}

output "ssh_sg_id" {
  description = "SSH Security Group ID (없으면 빈 문자열)"
  value       = length(aws_security_group.ssh) > 0 ? aws_security_group.ssh[0].id : ""
}

output "backend_sg_id" {
  description = "Backend Security Group ID"
  value       = aws_security_group.backend.id
}

output "database_sg_id" {
  description = "Database Security Group ID"
  value       = aws_security_group.database.id
}

output "redis_sg_id" {
  description = "Redis Security Group ID"
  value       = aws_security_group.redis.id
}
