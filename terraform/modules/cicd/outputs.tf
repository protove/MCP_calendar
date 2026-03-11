output "pipeline_name" {
  description = "CodePipeline 이름"
  value       = aws_codepipeline.backend.name
}

output "codebuild_project_name" {
  description = "CodeBuild 프로젝트 이름"
  value       = aws_codebuild_project.backend.name
}

output "github_connection_arn" {
  description = "GitHub CodeStar Connection ARN (콘솔에서 수동 승인 필요)"
  value       = aws_codestarconnections_connection.github.arn
}

output "github_connection_status" {
  description = "GitHub Connection 상태"
  value       = aws_codestarconnections_connection.github.connection_status
}
