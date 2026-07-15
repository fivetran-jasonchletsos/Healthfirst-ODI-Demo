-- fct_campaign_performance: one row per Salesforce outreach campaign. Used
-- on /dashboard for campaign response-rate views.

with source as (

    select * from {{ ref('stg_salesforce__campaigns') }}

)

select
    campaign_id,
    campaign_name,
    audience_size,
    response_rate_pct,
    sent_date

from source
