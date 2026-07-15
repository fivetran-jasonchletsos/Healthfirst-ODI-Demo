import { LakehouseArchitecture } from '../components/LakehouseArchitecture';
import { MDLS_DESTINATION } from '../lib/findings';

export default function ArchitecturePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Architecture</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Today, bringing on a new source at Healthfirst means engineering builds and maintains a custom pipeline --
          creating a backlog that slows data teams down and burns engineering capacity every AI/ML use case needs a
          new source. This demo's proposal is one platform: three Fivetran connectors (Salesforce, Oracle Database,
          S3/SharePoint) landing in a single AWS S3 Managed Data Lake, governed and queryable without copying data
          out to stand up each new analysis.
        </p>
      </div>

      <div className="card p-6">
        <LakehouseArchitecture />
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-navy-500">Why the S3 Managed Data Lake destination matters here</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Healthfirst's data stays in a bucket Healthfirst owns. {MDLS_DESTINATION.writesFormat}{' '}
          {MDLS_DESTINATION.catalog} That single governed copy is what lets exploratory data-analysis teams self-serve
          new sources without waiting on the EDM engineering backlog: Fivetran keeps the Iceberg tables and catalog
          current on every sync, so Athena, Snowflake, and other Iceberg-compatible engines are reading the same
          data, immediately, with no per-tool rebuild.
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-600">{MDLS_DESTINATION.maintenance}</p>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          <span className="font-semibold text-slate-800">Confirm before the POC: </span>
          {MDLS_DESTINATION.caveats}
        </p>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-navy-500">Validate and transform, downstream of ingest</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Fivetran is extract-and-load: it copies Salesforce, Oracle, and S3/SharePoint data into the bronze zone
          exactly as it lands, with no pre-load cleansing or normalization engine (the one exception is basic row
          filtering). Data quality and transformation are deliberately separate, composable layers on top of that raw
          copy -- not features bundled into ingestion:
        </p>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
          <li>
            <span className="font-semibold text-slate-800">Great Expectations (GX Core)</span> -- Fivetran became
            steward of the open-source GX Core project, positioned as the validation layer between bronze and silver:
            row counts, null thresholds, referential integrity, and freshness windows checked before promotion.
          </li>
          <li>
            <span className="font-semibold text-slate-800">dbt Wizard</span> -- dbt Labs' AI agent for authoring,
            refactoring, and debugging the dbt models that build silver and gold, grounded in project lineage, tests,
            and contracts.
          </li>
        </ul>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          See the POC Criteria page (A.V Data Transformation on Ingest, A.IX Data Quality Validation on Ingest, and
          A.XIII AI-Assisted Pipeline Development) for the fully sourced version of this claim.
        </p>
      </div>
    </div>
  );
}
