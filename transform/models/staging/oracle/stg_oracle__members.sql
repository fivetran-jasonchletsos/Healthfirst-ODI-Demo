with source as (

    select * from {{ ref('members') }}

)

select
    member_id,
    plan_type,
    county,
    cast(enrollment_date as date) as enrollment_date,
    status

from source
