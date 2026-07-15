with source as (

    select * from {{ ref('documents_manifest') }}

)

select
    doc_id,
    doc_type,
    subject_id,
    file_size_kb,
    cast(upload_date as date) as upload_date,
    classification

from source
