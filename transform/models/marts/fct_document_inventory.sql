-- fct_document_inventory: one row per file landed from S3/SharePoint,
-- classified PHI vs. Internal. Used on /dashboard for the document-volume
-- and PHI-classification views (ties to the compliance/governance story).

with source as (

    select * from {{ ref('stg_files__documents') }}

)

select
    doc_id,
    doc_type,
    subject_id,
    file_size_kb,
    upload_date,
    classification

from source
