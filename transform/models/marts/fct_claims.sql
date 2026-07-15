-- fct_claims: one row per claim, with member plan/county and provider
-- specialty/network status joined in. Used on the /dashboard page for
-- claims-by-status and claims-by-plan-type views.

with claims as (

    select * from {{ ref('stg_oracle__claims') }}

),

members as (

    select * from {{ ref('stg_oracle__members') }}

),

providers as (

    select * from {{ ref('stg_oracle__providers') }}

)

select
    claims.claim_id,
    claims.member_id,
    members.plan_type,
    members.county,
    claims.provider_id,
    providers.specialty,
    providers.network_status,
    claims.service_date,
    claims.claim_amount,
    claims.status

from claims
left join members
    on claims.member_id = members.member_id
left join providers
    on claims.provider_id = providers.provider_id
