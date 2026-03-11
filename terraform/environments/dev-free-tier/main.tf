################################################################################
# Terraform + Provider 설정
################################################################################
terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

################################################################################
# Secrets Manager — 시크릿 값 조회
################################################################################
data "aws_secretsmanager_secret_version" "db_password" {
  secret_id = var.db_password_secret_arn
}

data "aws_secretsmanager_secret_version" "jwt_secret" {
  secret_id = var.jwt_secret_arn
}

data "aws_secretsmanager_secret_version" "gemini_api_key" {
  secret_id = var.gemini_api_key_secret_arn
}

data "aws_secretsmanager_secret_version" "weather_api_key" {
  count     = var.weather_api_key_secret_arn != "" ? 1 : 0
  secret_id = var.weather_api_key_secret_arn
}

################################################################################
# CloudWatch Log Group (순환 의존성 방지: compute ↔ monitoring)
################################################################################
resource "aws_cloudwatch_log_group" "app" {
  name              = "/ecs/${var.project_name}-${var.environment}"
  retention_in_days = 14

  tags = {
    Name        = "${var.project_name}-${var.environment}-logs"
    Environment = var.environment
  }
}

################################################################################
# Module: Networking
################################################################################
module "networking" {
  source = "../../modules/networking"

  project_name      = var.project_name
  environment       = var.environment
  vpc_cidr          = var.vpc_cidr
  allowed_ssh_cidrs = var.allowed_ssh_cidrs
}

################################################################################
# Module: Storage (ECR + S3 — compute보다 먼저 생성해야 ECR URL 전달 가능)
################################################################################
module "storage" {
  source = "../../modules/storage"

  project_name = var.project_name
  environment  = var.environment

  ecr_image_retention_count = 5
  s3_force_destroy          = true # dev 환경 편의
}

################################################################################
# Module: Database (RDS + ElastiCache)
################################################################################
module "database" {
  source = "../../modules/database-free-tier"

  project_name       = var.project_name
  environment        = var.environment
  private_subnet_ids = module.networking.private_subnet_ids
  database_sg_id     = module.networking.database_sg_id
  redis_sg_id        = module.networking.redis_sg_id

  db_name     = var.db_name
  db_username = var.db_username
  db_password = data.aws_secretsmanager_secret_version.db_password.secret_string
}

################################################################################
# Module: Compute (EC2 + ECS)
################################################################################
module "compute" {
  source = "../../modules/compute-free-tier"

  project_name   = var.project_name
  environment    = var.environment
  aws_region     = var.aws_region

  public_subnet_ids = module.networking.public_subnet_ids
  vpc_id            = module.networking.vpc_id
  web_sg_id         = module.networking.web_sg_id
  backend_sg_id     = module.networking.backend_sg_id

  ecr_backend_url  = module.storage.ecr_backend_url

  cloudwatch_log_group = aws_cloudwatch_log_group.app.name

  backend_env_vars = {
    SPRING_DATASOURCE_URL      = module.database.spring_datasource_url
    SPRING_DATASOURCE_USERNAME = var.db_username
    SPRING_DATASOURCE_PASSWORD = data.aws_secretsmanager_secret_version.db_password.secret_string
    SPRING_PROFILES_ACTIVE     = "prod"
    REDIS_HOST                 = module.database.redis_endpoint
    REDIS_PORT                 = tostring(module.database.redis_port)
    JWT_SECRET                 = data.aws_secretsmanager_secret_version.jwt_secret.secret_string
    GEMINI_API_KEY             = data.aws_secretsmanager_secret_version.gemini_api_key.secret_string
    WEATHER_API_KEY            = var.weather_api_key_secret_arn != "" ? data.aws_secretsmanager_secret_version.weather_api_key[0].secret_string : ""
    CORS_ALLOWED_ORIGINS       = "https://${var.domain_name},https://www.${var.domain_name}"
  }

}

################################################################################
# Module: Monitoring (compute 이후 — ec2_instance_id 필요)
################################################################################
module "monitoring" {
  source = "../../modules/monitoring"

  project_name   = var.project_name
  environment    = var.environment
  alarm_email    = var.alarm_email

  ecs_cluster_name   = module.compute.ecs_cluster_name
  ecs_service_name   = module.compute.ecs_service_name
  rds_instance_id    = module.database.rds_instance_id
  log_group_name     = aws_cloudwatch_log_group.app.name

  monthly_budget_usd      = var.monthly_budget_usd
  budget_alert_thresholds = [50, 80, 100]
}

################################################################################
# Module: CI/CD (CodePipeline + CodeBuild)
################################################################################
module "cicd" {
  source = "../../modules/cicd"

  project_name = var.project_name
  environment  = var.environment
  aws_region   = var.aws_region

  github_owner  = var.github_owner
  github_repo   = var.github_repo
  github_branch = var.github_branch

  ecr_backend_url  = module.storage.ecr_backend_url
  ecs_cluster_name = module.compute.ecs_cluster_name
  ecs_service_name = module.compute.ecs_service_name

  cloudwatch_log_group = aws_cloudwatch_log_group.app.name
}
