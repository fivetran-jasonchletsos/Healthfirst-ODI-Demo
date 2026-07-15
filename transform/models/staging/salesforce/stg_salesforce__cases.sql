with source as (

    select * from {{ ref('salesforce_cases') }}

)

select
    case_id,
    member_id,
    case_type,
    priority,
    status,
    cast(created_date as date) as created_date

from source
