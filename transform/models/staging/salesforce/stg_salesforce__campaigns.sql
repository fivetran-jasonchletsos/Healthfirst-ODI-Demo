with source as (

    select * from {{ ref('salesforce_campaigns') }}

)

select
    campaign_id,
    campaign_name,
    audience_size,
    cast(response_rate_pct as decimal(5, 1)) as response_rate_pct,
    cast(sent_date as date) as sent_date

from source
