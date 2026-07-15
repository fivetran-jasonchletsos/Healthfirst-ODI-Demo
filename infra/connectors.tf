# Three Fivetran connectors, one per Mutual Evaluation Plan use case.
# Service identifiers below were confirmed against the actual `fivetran`
# Terraform provider schema (`terraform providers schema -json`), not
# guessed: "salesforce", "oracle" (a separate "oracle_rds" exists for
# RDS-hosted Oracle -- not used here since the plan doesn't specify RDS),
# and "share_point" (underscore -- the docs URL slug "share-point" is not
# the Terraform/API service string). Connector-specific auth (OAuth,
# Oracle DB credentials, SharePoint app registration) is intentionally NOT
# modeled here -- left to the values Fivetran can accept without them (auth
# completed via the connector's setup_url, see outputs.tf).
#
# Code-only scaffolding, validated with `terraform validate` against zero
# real credentials -- not applied against a live Fivetran account.

# --- 1. Salesforce (Use case 1: Cloud Application Ingestion) ---
resource "fivetran_connector" "salesforce" {
  group_id = fivetran_group.healthfirst.id
  service  = "salesforce"

  destination_schema {
    name = "jason_chletsos_healthfirst_salesforce"
  }

  depends_on = [fivetran_destination.healthfirst]
}

# Sync frequency: 1 minute is Fivetran's fastest platform-wide frequency
# (Enterprise/Business Critical plan required); Salesforce is not on the
# published exclusion list. Confirmed at the platform-policy level, see
# findings.ts syncFrequencyNote for detail.
resource "fivetran_connector_schedule" "salesforce" {
  connector_id      = fivetran_connector.salesforce.id
  sync_frequency    = var.salesforce_sync_frequency_minutes
  schedule_type     = "auto"
  paused            = "true"
  pause_after_trial = "true"
}

# --- 2. Oracle Database (Use case 2: Database data Ingestion) ---
resource "fivetran_connector" "oracle" {
  group_id = fivetran_group.healthfirst.id
  service  = "oracle"

  destination_schema {
    name = "jason_chletsos_healthfirst_oracle"
  }

  depends_on = [fivetran_destination.healthfirst]
}

# Sync frequency: "Minimum sync interval: 1 minute" is stated directly on
# the Oracle connector comparison table (Enterprise/Business Critical
# plan). Binary Log Reader is the CDC method to propose -- LogMiner is
# sunset May 15, 2026.
resource "fivetran_connector_schedule" "oracle" {
  connector_id      = fivetran_connector.oracle.id
  sync_frequency    = var.oracle_sync_frequency_minutes
  schedule_type     = "auto"
  paused            = "true"
  pause_after_trial = "true"
}

# --- 3. SharePoint (Use case 3: File data Ingestion) ---
# S3 is also a named source in the Mutual Evaluation Plan's file-ingestion
# use case, but S3 here is provisioned as the MDLS *destination* bucket
# (see lake.tf/destination.tf) -- SharePoint is the connector standing in
# for "file data ingestion" on the source side, per the plan's own test
# case ("S3/files to MDLS(S3)").
resource "fivetran_connector" "sharepoint" {
  group_id = fivetran_group.healthfirst.id
  service  = "share_point"

  destination_schema {
    name = "jason_chletsos_healthfirst_sharepoint"
  }

  depends_on = [fivetran_destination.healthfirst]
}

# Sync frequency: 15 minutes is the confirmed default/floor for Fivetran's
# file-connector category; no SharePoint-specific page confirms eligibility
# for the 1-minute tier. SharePoint does not capture deletes (see
# findings.ts) -- pair with Oracle/Salesforce for delete-aware use cases.
resource "fivetran_connector_schedule" "sharepoint" {
  connector_id      = fivetran_connector.sharepoint.id
  sync_frequency    = var.sharepoint_sync_frequency_minutes
  schedule_type     = "auto"
  paused            = "true"
  pause_after_trial = "true"
}
