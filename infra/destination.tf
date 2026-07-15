# Single AWS S3 Managed Data Lake Service destination for Healthfirst. All
# three source use cases (Salesforce, Oracle Database, S3/SharePoint) land
# here as Apache Iceberg tables in the customer-owned bucket provisioned in
# lake.tf, cataloged in AWS Glue.
#
# Config field names below were confirmed against the actual `fivetran`
# Terraform provider schema (`terraform providers schema -json`), not
# guessed -- the destination `service` value is "managed_data_lake" (an
# umbrella service that supports AWS/S3+Glue, GCS, or Databricks Unity
# Catalog depending on `storage_provider`; a separate, newer "new_s3_datalake"
# service also exists with its own `table_format` field but was not
# selected here since it wasn't independently confirmed against a live
# account). The exact accepted string for `storage_provider` (used "S3"
# below) is not enumerated in the provider schema itself -- confirm it
# against the Fivetran REST API/dashboard before applying for real.
#
# Code-only scaffolding, validated with `terraform validate` against zero
# real credentials -- not applied against a live Fivetran account.

resource "fivetran_group" "healthfirst" {
  name = "jason_chletsos_healthfirst"
}

resource "fivetran_destination" "healthfirst" {
  group_id         = fivetran_group.healthfirst.id
  service          = "managed_data_lake"
  time_zone_offset = "0"
  region           = var.aws_region
  run_setup_tests  = "true"

  config {
    storage_provider           = "S3"
    bucket                     = aws_s3_bucket.lake.bucket
    region                     = var.aws_region
    prefix_path                = "healthfirst"
    fivetran_role_arn          = aws_iam_role.fivetran_mdls.arn
    should_maintain_tables_in_glue = true
  }

  depends_on = [aws_iam_role_policy.fivetran_mdls]
}
