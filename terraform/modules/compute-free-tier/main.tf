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
# ECS Task Definition — Backend (Fargate)
################################################################################
resource "aws_ecs_task_definition" "backend" {
  family                   = "${var.project_name}-${var.environment}-backend"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  cpu                      = "512"
  memory                   = "1024"

  container_definitions = jsonencode([{
    name      = "backend"
    image     = "${var.ecr_backend_url}:latest"
    essential = true

    portMappings = [{
      containerPort = var.backend_port
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
      command     = ["CMD-SHELL", "curl -f http://localhost:${var.backend_port}/api/health || exit 1"]
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
# ECS Service — Backend (Fargate)
################################################################################
resource "aws_ecs_service" "backend" {
  name            = "${var.project_name}-${var.environment}-backend"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200

  health_check_grace_period_seconds = 120

  network_configuration {
    subnets          = var.public_subnet_ids
    security_groups  = [var.backend_sg_id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "backend"
    container_port   = var.backend_port
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-backend-svc"
    Environment = var.environment
  }
}

################################################################################
# Auto Scaling — ECS Service
################################################################################
resource "aws_appautoscaling_target" "backend" {
  max_capacity       = 2  # Free Tier: 50 vCPU-hours/월, 2 task(1.0 vCPU)=50h 안전 마진
  min_capacity       = 1
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.backend.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "backend_cpu" {
  name               = "${var.project_name}-${var.environment}-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.backend.resource_id
  scalable_dimension = aws_appautoscaling_target.backend.scalable_dimension
  service_namespace  = aws_appautoscaling_target.backend.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = 80  # Free Tier 보호: 덜 공격적인 스케일 아웃
    scale_in_cooldown  = 300
    scale_out_cooldown = 120 # 빠른 스케일 아웃 방지
  }
}

################################################################################
# ALB — Application Load Balancer
################################################################################
resource "aws_lb" "backend" {
  name               = "${var.project_name}-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.web_sg_id]
  subnets            = var.public_subnet_ids

  tags = {
    Name        = "${var.project_name}-${var.environment}-alb"
    Environment = var.environment
  }
}

resource "aws_lb_target_group" "backend" {
  name        = "${var.project_name}-${var.environment}-backend-tg"
  port        = var.backend_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 10
    interval            = 30
    path                = "/api/health"
    port                = "traffic-port"
    matcher             = "200"
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-backend-tg"
    Environment = var.environment
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.backend.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }
}


