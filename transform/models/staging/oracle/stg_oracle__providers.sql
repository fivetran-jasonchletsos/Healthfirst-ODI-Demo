with source as (

    select * from {{ ref('providers') }}

)

select
    provider_id,
    specialty,
    network_status,
    hospital_affiliated

from source
