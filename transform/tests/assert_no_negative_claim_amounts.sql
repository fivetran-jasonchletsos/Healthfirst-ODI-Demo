-- A failing test would return rows; dbt test passes when this returns zero.
select *
from {{ ref('fct_claims') }}
where claim_amount < 0
