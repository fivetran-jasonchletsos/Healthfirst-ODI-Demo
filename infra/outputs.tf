output "bucket_name" {
  description = "The S3 Managed Data Lake bucket name."
  value       = aws_s3_bucket.lake.bucket
}

output "fivetran_role_arn" {
  description = "IAM role ARN Fivetran assumes to write into the lake."
  value       = aws_iam_role.fivetran_mdls.arn
}

output "bronze_db" {
  value = aws_glue_catalog_database.bronze.name
}

output "silver_db" {
  value = aws_glue_catalog_database.silver.name
}

output "gold_db" {
  value = aws_glue_catalog_database.gold.name
}

output "athena_workgroup" {
  value = aws_athena_workgroup.demo.name
}

output "fivetran_destination_id" {
  description = "The Fivetran MDLS destination ID."
  value       = fivetran_destination.healthfirst.id
}

output "salesforce_connector_setup_url" {
  description = "URL to finish Salesforce connector setup (OAuth) in the Fivetran dashboard."
  value       = "https://fivetran.com/connectors/${fivetran_connector.salesforce.id}/setup"
}

output "oracle_connector_setup_url" {
  description = "URL to finish Oracle connector setup (host/credentials/supplemental logging) in the Fivetran dashboard."
  value       = "https://fivetran.com/connectors/${fivetran_connector.oracle.id}/setup"
}

output "sharepoint_connector_setup_url" {
  description = "URL to finish SharePoint connector setup (app registration/permissions) in the Fivetran dashboard."
  value       = "https://fivetran.com/connectors/${fivetran_connector.sharepoint.id}/setup"
}
