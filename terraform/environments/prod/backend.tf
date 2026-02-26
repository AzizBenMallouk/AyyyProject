###############################################################################
# Remote State Backend — prod environment
# Update REPLACE_WITH_ACCOUNT_ID after running the s3-backend bootstrap.
###############################################################################

terraform {
  backend "s3" {
    bucket         = "ayyyapp-terraform-state-REPLACE_WITH_ACCOUNT_ID"
    key            = "environments/prod/terraform.tfstate"
    region         = "eu-west-3"
    encrypt        = true
    dynamodb_table = "ayyyapp-terraform-locks"
  }
}
