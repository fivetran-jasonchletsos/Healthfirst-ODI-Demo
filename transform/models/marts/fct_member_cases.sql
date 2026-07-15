-- fct_member_cases: one row per Salesforce member-service case, with the
-- member's plan type joined in. Used on /dashboard for case volume by type
-- and priority.

with cases as (

    select * from {{ ref('stg_salesforce__cases') }}

),

members as (

    select * from {{ ref('stg_oracle__members') }}

)

select
    cases.case_id,
    cases.member_id,
    members.plan_type,
    cases.case_type,
    cases.priority,
    cases.status,
    cases.created_date

from cases
left join members
    on cases.member_id = members.member_id
