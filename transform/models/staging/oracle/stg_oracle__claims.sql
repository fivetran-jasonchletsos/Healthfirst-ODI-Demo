with source as (

    select * from {{ ref('claims') }}

)

select
    claim_id,
    member_id,
    provider_id,
    cast(service_date as date) as service_date,
    cast(claim_amount as decimal(10, 2)) as claim_amount,
    status

from source
