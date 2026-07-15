# AWS-side of the AWS S3 Managed Data Lake destination: the customer-owned
# bucket, Glue Data Catalog (bronze/silver/gold databases), the IAM role
# Fivetran assumes to write into it, and an Athena workgroup for downstream
# querying. This is the "S3 Managed Data Lake" endpoint the Mutual
# Evaluation Plan calls out as the destination for all three source
# use cases (Salesforce, Oracle Database, S3/SharePoint).
#
# Code-only scaffolding, validated with `terraform validate` against zero
# real credentials -- not applied against a live AWS account as part of
# this build.

data "aws_caller_identity" "current" {}

resource "random_id" "suffix" {
  byte_length = 4
}

# --- S3 ---

resource "aws_s3_bucket" "lake" {
  bucket        = "${var.bucket_prefix}-${random_id.suffix.hex}"
  force_destroy = true
  tags          = { demo = var.demo_slug }
}

resource "aws_s3_bucket_versioning" "lake" {
  bucket = aws_s3_bucket.lake.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "lake" {
  bucket = aws_s3_bucket.lake.id
  rule {
    apply_server_side_encryption_by_default { sse_algorithm = "AES256" }
  }
}

resource "aws_s3_bucket_public_access_block" "lake" {
  bucket                  = aws_s3_bucket.lake.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Tiered storage placement at ingest (POC Success Criteria: Cost Management).
# Objects age from Standard -> Standard-IA -> Glacier as they cool off.
resource "aws_s3_bucket_lifecycle_configuration" "lake" {
  bucket = aws_s3_bucket.lake.id
  rule {
    id     = "tiered-storage-lifecycle"
    status = "Enabled"
    filter {}
    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }
    transition {
      days          = 180
      storage_class = "GLACIER"
    }
  }
}

# Object Lock (WORM) support for the raw/bronze zone -- POC Success Criteria
# calls out "store originals in secure, write-once storage" and "retention
# rules and legal holds set at time of ingestion". Object Lock must be
# enabled at bucket creation; this models the requirement even though the
# Fivetran MDLS destination itself does not set retention/legal-hold
# policies -- that is a lake-side (Lake Formation / S3 Object Lock)
# capability layered on top of where Fivetran writes.
resource "aws_s3_bucket_object_lock_configuration" "lake" {
  bucket = aws_s3_bucket.lake.id
  rule {
    default_retention {
      mode = "GOVERNANCE"
      days = 2555 # 7 years, typical health-plan claims retention floor
    }
  }
}

# --- Glue Data Catalog ---

resource "aws_glue_catalog_database" "bronze" {
  name = "${var.demo_slug}_bronze"
}

resource "aws_glue_catalog_database" "silver" {
  name = "${var.demo_slug}_silver"
}

resource "aws_glue_catalog_database" "gold" {
  name = "${var.demo_slug}_gold"
}

# --- IAM role for Fivetran MDLS ---

data "aws_iam_policy_document" "fivetran_trust" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::${var.fivetran_aws_account_id}:root"]
    }
    condition {
      test     = "StringEquals"
      variable = "sts:ExternalId"
      values   = [var.fivetran_external_id]
    }
  }
}

resource "aws_iam_role" "fivetran_mdls" {
  name               = "${var.demo_slug}-fivetran-mdls"
  assume_role_policy = data.aws_iam_policy_document.fivetran_trust.json
}

data "aws_iam_policy_document" "fivetran_mdls" {
  statement {
    effect = "Allow"
    actions = [
      "s3:ListBucket",
      "s3:GetBucketLocation",
      "s3:GetBucketVersioning",
    ]
    resources = [aws_s3_bucket.lake.arn]
  }
  statement {
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
    ]
    resources = ["${aws_s3_bucket.lake.arn}/bronze/*"]
  }
  statement {
    effect = "Allow"
    actions = [
      "glue:CreateTable", "glue:UpdateTable", "glue:DeleteTable",
      "glue:GetTable", "glue:GetTables", "glue:GetDatabase",
      "glue:GetPartitions", "glue:BatchCreatePartition",
      "glue:BatchUpdatePartition", "glue:BatchDeletePartition",
    ]
    resources = [
      "arn:aws:glue:${var.aws_region}:${data.aws_caller_identity.current.account_id}:catalog",
      aws_glue_catalog_database.bronze.arn,
      "arn:aws:glue:${var.aws_region}:${data.aws_caller_identity.current.account_id}:table/${aws_glue_catalog_database.bronze.name}/*",
    ]
  }
}

resource "aws_iam_role_policy" "fivetran_mdls" {
  name   = "fivetran-mdls-policy"
  role   = aws_iam_role.fivetran_mdls.id
  policy = data.aws_iam_policy_document.fivetran_mdls.json
}

# --- Athena (downstream consumption, no copy of the lake data) ---

resource "aws_athena_workgroup" "demo" {
  name = var.demo_slug
  configuration {
    result_configuration {
      output_location = "s3://${aws_s3_bucket.lake.bucket}/athena-results/"
      encryption_configuration { encryption_option = "SSE_S3" }
    }
  }
}
