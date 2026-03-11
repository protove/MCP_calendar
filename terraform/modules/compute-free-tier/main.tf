################################################################################
# Data Sources
################################################################################
data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-ecs-hvm-*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  filter {
    name   = "state"
    values = ["available"]
  }
}

################################################################################
# IAM Role — EC2 + ECS
################################################################################
resource "aws_iam_role" "ec2_ecs" {
  name = "${var.project_name}-${var.environment}-ec2-ecs-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
  })

  tags = {
    Name        = "${var.project_name}-${var.environment}-ec2-ecs-role"
    Environment = var.environment
  }
}

resource "aws_iam_role_policy_attachment" "ecs_ec2_role" {
  role       = aws_iam_role.ec2_ecs.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

resource "aws_iam_role_policy_attachment" "ecr_read" {
  role       = aws_iam_role.ec2_ecs.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_role_policy_attachment" "ssm_managed" {
  role       = aws_iam_role.ec2_ecs.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy_attachment" "cloudwatch_agent" {
  role       = aws_iam_role.ec2_ecs.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

resource "aws_iam_instance_profile" "ec2_ecs" {
  name = "${var.project_name}-${var.environment}-ec2-ecs-profile"
  role = aws_iam_role.ec2_ecs.name
}

################################################################################
# IAM Role — ECS Task Execution
################################################################################
resource "aws_iam_role" "ecs_task_execution" {
  name = "${var.project_name}-${var.environment}-ecs-exec-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
    }]
  })

  tags = {
    Name        = "${var.project_name}-${var.environment}-ecs-exec-role"
    Environment = var.environment
  }
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

################################################################################
# EC2 Instance (Free Tier — t2.micro, ECS 에이전트 + Docker Compose 겸용)
################################################################################
locals {
  sg_ids = compact([
    var.web_sg_id,
    var.backend_sg_id,
    var.ssh_sg_id,
  ])
}

resource "aws_instance" "app" {
  ami                    = data.aws_ami.amazon_linux_2023.id
  instance_type          = var.ec2_instance_type
  subnet_id              = var.public_subnet_ids[0]
  vpc_security_group_ids = local.sg_ids
  iam_instance_profile   = aws_iam_instance_profile.ec2_ecs.name
  key_name               = var.ec2_key_pair_name != "" ? var.ec2_key_pair_name : null

  root_block_device {
    volume_size           = 30 # Free Tier: 최대 30 GiB
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
  }

  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required" # IMDSv2 강제 (보안)
  }

  user_data = base64encode(<<-EOF
    #!/bin/bash
    set -euo pipefail

    # System update
    dnf update -y

    # Docker 설치
    dnf install -y docker
    systemctl enable docker
    systemctl start docker

    # Docker Compose 설치
    DOCKER_COMPOSE_VERSION="v2.27.0"
    curl -fsSL "https://github.com/docker/compose/releases/download/$${DOCKER_COMPOSE_VERSION}/docker-compose-linux-x86_64" \
      -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose

    # ECS Agent 설치
    echo "ECS_CLUSTER=${var.project_name}-${var.environment}-cluster" >> /etc/ecs/ecs.config
    echo "ECS_ENABLE_CONTAINER_METADATA=true" >> /etc/ecs/ecs.config
    systemctl enable ecs
    systemctl start ecs

    # ec2-user를 docker 그룹에 추가
    usermod -aG docker ec2-user

    # CloudWatch Agent 설치
    dnf install -y amazon-cloudwatch-agent
  EOF
  )

  tags = {
    Name        = "${var.project_name}-${var.environment}-app"
    Environment = var.environment
    Project     = var.project_name
  }

  lifecycle {
    ignore_changes = [ami] # AMI 업데이트 시 인스턴스 재생성 방지
  }
}

################################################################################
# ECS Cluster
################################################################################
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-${var.environment}-cluster"

  setting {
    name  = "containerInsights"
    value = "disabled" # Free Tier 비용 절약
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-cluster"
    Environment = var.environment
  }
}

################################################################################
# ECS Task Definition — Backend
################################################################################
resource "aws_ecs_task_definition" "backend" {
  family                   = "${var.project_name}-${var.environment}-backend"
  requires_compatibilities = ["EC2"]
  network_mode             = "bridge"
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  cpu                      = 512
  memory                   = 512

  container_definitions = jsonencode([{
    name      = "backend"
    image     = "${var.ecr_backend_url}:latest"
    essential = true
    cpu       = 512
    memory    = 512

    portMappings = [{
      containerPort = var.backend_port
      hostPort      = var.backend_port
      protocol      = "tcp"
    }]

    environment = [
      for k, v in var.backend_env_vars : {
        name  = k
        value = v
      }
    ]

    logConfiguration = var.cloudwatch_log_group != "" ? {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = var.cloudwatch_log_group
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "backend"
      }
    } : null

    healthCheck = {
      command     = ["CMD-SHELL", "curl -f http://localhost:${var.backend_port}/api/chat/health || exit 1"]
      interval    = 30
      timeout     = 15
      retries     = 3
      startPeriod = 120
    }
  }])

  tags = {
    Name        = "${var.project_name}-${var.environment}-backend-task"
    Environment = var.environment
  }
}

################################################################################
# ECS Service — Backend
################################################################################
resource "aws_ecs_service" "backend" {
  name            = "${var.project_name}-${var.environment}-backend"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = 1
  launch_type     = "EC2"

  deployment_minimum_healthy_percent = 0
  deployment_maximum_percent         = 100

  tags = {
    Name        = "${var.project_name}-${var.environment}-backend-svc"
    Environment = var.environment
  }
}


