# --- Fivetran API credentials ---

variable "fivetran_api_key" {
  description = "Fivetran API key (REST API). Defaulted to empty string so plan/validate work with zero real credentials."
  type        = string
  sensitive   = true
  default     = ""
}

variable "fivetran_api_secret" {
  description = "Fivetran API secret (REST API). Defaulted to empty string so plan/validate work with zero real credentials."
  type        = string
  sensitive   = true
  default     = ""
}

# --- AWS / lake ---

variable "aws_region" {
  description = "AWS region for the S3 Managed Data Lake bucket, Glue catalog, and Athena workgroup."
  type        = string
  default     = "us-east-1"
}

variable "bucket_prefix" {
  description = "Prefix for the S3 lake bucket name (a random suffix is appended for global uniqueness)."
  type        = string
  default     = "healthfirst-odi-lake"
}

variable "demo_slug" {
  description = "Short slug used to name Glue databases, the Athena workgroup, and the Fivetran IAM role."
  type        = string
  default     = "healthfirst"
}

variable "fivetran_aws_account_id" {
  description = "Fivetran's AWS account ID, used in the IAM trust policy so Fivetran can assume the MDLS role. Confirm the current value in the Fivetran MDLS destination setup wizard before applying for real -- defaulted to empty so plan/validate work with zero real credentials."
  type        = string
  sensitive   = true
  default     = ""
}

variable "fivetran_external_id" {
  description = "External ID Fivetran generates per-destination for the IAM trust policy's sts:ExternalId condition (prevents the confused-deputy problem). Populated by Fivetran when the MDLS destination is created in the dashboard -- defaulted to empty so plan/validate work with zero real credentials."
  type        = string
  sensitive   = true
  default     = ""
}

# --- Per-connector sync frequency (minutes) ---
# Defaults are the fastest verified frequency per connector from the
# research findings (see app/src/lib/findings.ts). Type is string because
# fivetran_connector_schedule's sync_frequency attribute is a String with a
# fixed enum validator: "1", "5", "15", "30", "60", "120", "180", "360",
# "480", "720", "1440".

variable "salesforce_sync_frequency_minutes" {
  description = "Salesforce connector sync frequency in minutes. Fastest verified: 1 minute (Enterprise/Business Critical plan; 5 minutes on lower plans)."
  type        = string
  default     = "1"
}

variable "oracle_sync_frequency_minutes" {
  description = "Oracle connector sync frequency in minutes. Fastest verified: 1 minute (Enterprise/Business Critical plan) -- directly stated as the minimum sync interval on the Oracle connector comparison table."
  type        = string
  default     = "1"
}

variable "sharepoint_sync_frequency_minutes" {
  description = "SharePoint connector sync frequency in minutes. Fastest verified: 15 minutes (default/floor for the file-connector category; no SharePoint-specific 1-minute confirmation found)."
  type        = string
  default     = "15"
}
