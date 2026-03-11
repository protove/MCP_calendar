################################################################################
# RDS Subnet Group
################################################################################
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-${var.environment}-db-subnet-group"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name        = "${var.project_name}-${var.environment}-db-subnet-group"
    Environment = var.environment
  }
}

################################################################################
# RDS Parameter Group
################################################################################
resource "aws_db_parameter_group" "postgres" {
  name   = "${var.project_name}-${var.environment}-pg16-params"
  family = "postgres16"

  parameter {
    name  = "log_connections"
    value = "1"
  }

  parameter {
    name  = "log_disconnections"
    value = "1"
  }

  parameter {
    name  = "log_min_duration_statement"
    value = "1000" # 1초 이상 쿼리 로깅
  }

  parameter {
    name         = "rds.force_ssl"
    value        = "1"
    apply_method = "pending-reboot"
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-pg16-params"
    Environment = var.environment
  }
}

################################################################################
# RDS Instance (Free Tier — db.t3.micro, PostgreSQL 16)
################################################################################
resource "aws_db_instance" "postgres" {
  identifier = "${var.project_name}-${var.environment}-postgres"

  engine         = "postgres"
  engine_version = var.db_engine_version
  instance_class = var.db_instance_class

  allocated_storage     = var.db_allocated_storage
  max_allocated_storage = var.db_allocated_storage # Free Tier에서 자동 확장 방지
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  db_subnet_group_name = aws_db_subnet_group.main.name
  parameter_group_name = aws_db_parameter_group.postgres.name

  vpc_security_group_ids = [var.database_sg_id]

  multi_az            = false # Free Tier: Single-AZ만 무료 (v1.2.0에서 Multi-AZ 버전 보관)
  publicly_accessible = false # 보안: Private Subnet만

  backup_retention_period = 1             # Free Tier 최대 1일
  backup_window           = "03:00-04:00" # UTC (KST 12:00-13:00)
  maintenance_window      = "sun:04:00-sun:05:00"

  skip_final_snapshot       = false
  final_snapshot_identifier = "${var.project_name}-${var.environment}-postgres-final"
  deletion_protection       = true

  performance_insights_enabled = false # Free Tier 비용 절약

  tags = {
    Name        = "${var.project_name}-${var.environment}-postgres"
    Environment = var.environment
    Project     = var.project_name
  }
}

################################################################################
# ElastiCache Redis (Free Tier — cache.t3.micro)
################################################################################
resource "aws_elasticache_subnet_group" "redis" {
  name       = "${var.project_name}-${var.environment}-redis-subnet-group"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name        = "${var.project_name}-${var.environment}-redis-subnet-group"
    Environment = var.environment
  }
}

resource "aws_elasticache_cluster" "redis" {
  cluster_id = "${var.project_name}-${var.environment}-redis"

  engine               = "redis"
  engine_version       = "7.1"
  node_type            = "cache.t3.micro" # Free Tier 대상
  num_cache_nodes      = 1
  port                 = 6379
  parameter_group_name = "default.redis7"

  subnet_group_name  = aws_elasticache_subnet_group.redis.name
  security_group_ids = [var.redis_sg_id]

  snapshot_retention_limit = 0 # Free Tier 비용 절약
  maintenance_window       = "sun:05:00-sun:06:00"

  tags = {
    Name        = "${var.project_name}-${var.environment}-redis"
    Environment = var.environment
    Project     = var.project_name
  }
}
