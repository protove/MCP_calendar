################################################################################
# Terraform Backend — S3 + DynamoDB State Lock
################################################################################
terraform {
  backend "s3" {
    bucket         = "mcp-calendar-terraform-state"
    key            = "dev-free-tier/terraform.tfstate"
    region         = "ap-northeast-2"
    encrypt        = true
    dynamodb_table = "mcp-calendar-terraform-lock"
  }
}
