# Healthfirst-ODI-Demo infra
#
# Sales-engineering demo built against Healthfirst's Mutual Evaluation Plan:
# Salesforce (cloud application), Oracle Database (source database), and
# S3/SharePoint (file sources) all landing in a single AWS S3 Managed Data
# Lake destination (Apache Iceberg tables + AWS Glue Data Catalog, queryable
# by Athena/Snowflake without copying data out of the lake).
#
# This configuration is code-only scaffolding for demo purposes. It is
# validated with `terraform validate` against zero real credentials and is
# not intended to be applied against a live Fivetran or AWS account as part
# of this build.

provider "fivetran" {
  api_key    = var.fivetran_api_key
  api_secret = var.fivetran_api_secret
}

provider "aws" {
  region = var.aws_region
}
