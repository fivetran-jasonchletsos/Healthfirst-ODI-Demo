# Healthfirst · Fivetran ODI Demo

Sales-engineering demo built against Healthfirst's **Mutual Evaluation Plan**. Healthfirst is one of New York's
largest not-for-profit health insurers (2M+ members, 40,000+ providers, 80+ participating hospitals), evaluating
Fivetran as the foundation for secure, reliable, fully managed data ingestion ahead of predictive analytics and
Gen AI use cases.

**Scope: three use cases, one destination.**

| Use case | System | Role |
| --- | --- | --- |
| 1. Cloud Application Ingestion | Salesforce | Member outreach, service cases (CRM) |
| 2. Database data Ingestion | Oracle Database | Core policy administration, enrollment, claims |
| 3. File data Ingestion | S3 / SharePoint | Claims/eligibility landing files, policy documents, EOBs |
| Destination | AWS S3 Managed Data Lake Service | Apache Iceberg tables, AWS Glue Data Catalog, queryable by Athena/Snowflake |

## Every capability claim is sourced

Same discipline as this portfolio's other real-account demos: every Fivetran capability claim in this app links to
a real `fivetran.com/docs` page and is labeled **confirmed** (read directly on a live page), **inferred** (reasoned
from adjacent docs, not stated verbatim), or **unverified** (no source found -- don't present as fact without
checking with Fivetran first). Where a requirement is really about the AWS S3/Glue/Lake Formation layer Fivetran
writes into -- not a Fivetran feature itself -- it's labeled that way rather than folded into Fivetran's column.
See the **Sources**, **POC Criteria**, and **Compliance** pages for the full, linked breakdown.

The POC Criteria page is structured on the customer's own capability matrix (Core A.I-A.XIII, Value-Add B.I-B.V),
not just the raw checklist text from the evaluation plan, since that matrix is the actual scoring rubric Healthfirst's
evaluators will use.

## Repo layout

```
Healthfirst-ODI-Demo/
├── app/                    # Vite + React + TypeScript + Tailwind frontend
│   ├── src/pages/           # Overview, Architecture, Sources, POC Criteria, Compliance, Dashboard
│   ├── src/components/      # Layout, LakehouseArchitecture
│   ├── src/lib/              # findings.ts, compliance.ts, pocCriteria.ts -- single source of truth for every claim
│   └── public/data/          # Static JSON snapshots exported from the dbt marts, for the Dashboard page
├── transform/               # dbt project (hf_pipeline), DuckDB adapter
│   ├── seeds/                # Synthetic Healthfirst-style CSVs (members, providers, claims, cases, campaigns, docs)
│   ├── models/staging/       # oracle/, salesforce/, files/ -- one staging folder per source system
│   ├── models/marts/         # fct_claims, fct_member_cases, fct_campaign_performance, fct_document_inventory
│   └── tests/
├── infra/                   # Terraform: AWS (S3 lake + Glue + IAM + Athena) + Fivetran (connectors + MDLS destination)
├── scripts/                  # generate_data.py, export_marts_to_json.py
└── .github/workflows/deploy.yml   # GitHub Pages deploy
```

## Running locally

```bash
# 1. Generate synthetic seed data
python3 scripts/generate_data.py

# 2. Build the dbt project (DuckDB)
cd transform
DBT_PROFILES_DIR=. dbt seed
DBT_PROFILES_DIR=. dbt run
DBT_PROFILES_DIR=. dbt test
cd ..

# 3. Export marts to static JSON for the frontend
python3 scripts/export_marts_to_json.py

# 4. Run the frontend
cd app
npm install
npm run dev
```

`infra/` is code-only Terraform scaffolding -- `terraform validate` passes against zero real credentials (confirmed
against the actual `fivetran` provider schema via `terraform providers schema -json`, not guessed), but it is not
applied against a live AWS or Fivetran account as part of this build.

## Data note

All member, provider, claim, case, and document data in this demo is synthetic, generated with a fixed random seed
(`scripts/generate_data.py`, `random.seed(42)`). No real Healthfirst data is used anywhere in this repo.

## Sources

Fivetran connector and destination docs:
- https://fivetran.com/docs/connectors/applications/salesforce
- https://fivetran.com/docs/connectors/databases/oracle/oracle-connector
- https://fivetran.com/docs/connectors/files/amazon-s3
- https://fivetran.com/docs/connectors/files/share-point
- https://fivetran.com/docs/destinations/managed-data-lake-service
- https://fivetran.com/docs/managed-data-lake-service/metadata-catalogs
- https://fivetran.com/docs/managed-data-lake-service/troubleshooting/copy-on-write-update-strategy

Compliance and security:
- https://www.fivetran.com/security
- https://trust.fivetran.com/
- https://fivetran.com/docs/security
- https://fivetran.com/docs/core-concepts/data-credential-encryption
- https://fivetran.com/docs/using-fivetran/features/data-blocking-column-hashing
- https://www.fivetran.com/blog/how-to-handle-hipaa-concerns-with-cloud-data-warehouses

Platform/product:
- https://fivetran.com/docs/core-concepts/syncoverview
- https://fivetran.com/docs/transformations
- https://fivetran.com/docs/deployment-models
- https://fivetran.com/docs/logs/fivetran-platform
- https://docs.getdbt.com/docs/platform/wizard-overview

AWS (lake layer, not Fivetran):
- https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html
- https://docs.aws.amazon.com/lake-formation/latest/dg/glue-features-lf.html

The full, per-claim citation list (with confirmed/inferred/unverified labels) lives in `app/src/lib/findings.ts`,
`app/src/lib/compliance.ts`, and `app/src/lib/pocCriteria.ts`.
