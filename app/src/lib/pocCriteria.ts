// POC Success Criteria, structured on Niraj's capability matrix taxonomy
// (Core A.I-A.XIII, Value-Add B.I-B.V) since that is the scoring rubric
// Healthfirst's evaluators will actually use -- not just the raw checklist
// text from the Mutual Evaluation Plan. Each top-level capability carries
// the detailed, sourced sub-requirements from that plan underneath it.
//
// Every row is graded on which layer actually owns the capability --
// "fivetran" (a documented Fivetran feature), "s3_lake_formation" (an AWS
// S3/Glue/Lake Formation capability Fivetran writes into but does not
// itself provide), "joint" (both layers contribute), or "not_applicable".
// Mislabeling a lake-layer capability as a Fivetran feature is the failure
// mode this file exists to avoid.

import type { Verification } from './findings';

export type Layer = 'fivetran' | 's3_lake_formation' | 'joint' | 'not_applicable';
export type CapabilityGroup = 'Core' | 'Value-Add';

export interface CriteriaRow {
  requirement: string;
  fivetranAnswer: string;
  layer: Layer;
  sourceUrls: string[];
  verification: Verification;
}

export interface CriteriaCategory {
  id: string;
  group: CapabilityGroup;
  categoryName: string;
  description: string;
  /** One-line answer for the Capability Matrix table -- full detail is in the demo script, not the page. */
  summary: string;
  rows: CriteriaRow[];
}

export const POC_CRITERIA: CriteriaCategory[] = [
  {
    id: 'A.I',
    group: 'Core',
    categoryName: 'Connector Breadth & Flexibility',
    description: 'Ability to connect to a wide range of data source types.',
    summary: 'Native connectors for Salesforce, Oracle (CDC), and SharePoint/S3 -- no code required.',
    rows: [
      {
        requirement: 'Connect to Salesforce, Oracle, and SharePoint/S3 sources',
        fivetranAnswer:
          'Fivetran has purpose-built, pre-built connectors for all named systems: Salesforce (REST + Bulk API), Oracle (log-based CDC, requires Enterprise or Business Critical plan), SharePoint (file connector, Magic Folder or pattern-mapped sync modes), and Amazon S3 as a source (file connector with IAM role, access key, or Connect Card auth). Four distinct, separately documented connectors, not one generic file loader.',
        layer: 'fivetran',
        sourceUrls: [
          'https://fivetran.com/docs/connectors/applications/salesforce',
          'https://fivetran.com/docs/connectors/databases/oracle/oracle-connector',
          'https://fivetran.com/docs/connectors/files/share-point',
          'https://fivetran.com/docs/connectors/files/amazon-s3/setup-guide',
        ],
        verification: 'confirmed',
      },
      {
        requirement: 'Connect to AWS S3 Managed Data Lake destination',
        fivetranAnswer:
          'Fivetran\'s Managed Data Lake Service (MDLS) lands data as Apache Iceberg or Delta Lake tables in a customer-owned S3 bucket, with either public-internet or private-networking connectivity, and native AWS Glue Catalog integration for query engines like Athena and Redshift.',
        layer: 'fivetran',
        sourceUrls: ['https://fivetran.com/docs/destinations/managed-data-lake-service'],
        verification: 'confirmed',
      },
      {
        requirement: 'Sync historical data sources',
        fivetranAnswer:
          'On initial connection, Fivetran copies all rows from every accessible table/schema, interleaving incremental change processing during long-running historical copies so recent changes aren\'t missed. A historical re-sync can also be manually triggered later, per connection or per table.',
        layer: 'fivetran',
        sourceUrls: [
          'https://fivetran.com/docs/connectors/databases/oracle/oracle-connector',
          'https://fivetran.com/docs/rest-api/api-reference/connections/resync-connection',
        ],
        verification: 'confirmed',
      },
      {
        requirement: 'Resume large file uploads if interrupted (resumable/multipart uploads)',
        fivetranAnswer:
          'Multipart-upload behavior (plain upload under 5GB, multipart above) is documented for Fivetran Activations\' S3 destination -- a separate reverse-ETL product, not the S3 Managed Data Lake Service destination in scope for this POC. Resumable/multipart behavior for MDLS writes specifically was not found documented and should be confirmed directly with Fivetran.',
        layer: 'fivetran',
        sourceUrls: ['https://fivetran.com/docs/activations/destinations/available-destinations/s3'],
        verification: 'unverified',
      },
      {
        requirement: 'Configuration is genuinely no-code / GUI-based, not scripted',
        fivetranAnswer:
          'Standard pre-built connectors (all four named systems above) are configured entirely through the Fivetran dashboard/GUI or REST API -- no customer-written code for setup, scheduling, or schema mapping. Coding is required only if a source needs the Connector SDK (custom Python) because it isn\'t natively supported; SDK connectors still run inside Fivetran\'s managed infrastructure and inherit its orchestration and retry model.',
        layer: 'fivetran',
        sourceUrls: ['https://fivetran.com/docs/connectors', 'https://fivetran.com/docs/connector-sdk'],
        verification: 'confirmed',
      },
    ],
  },
  {
    id: 'A.II',
    group: 'Core',
    categoryName: 'Structured, Semi-Structured, and Unstructured Data Support',
    description: 'Ingests structured, semi-structured, and unstructured data.',
    summary: 'Structured + semi-structured confirmed; unstructured file support is Beta and source-limited.',
    rows: [
      {
        requirement: 'Ingest structured data (database rows, standard types)',
        fivetranAnswer: 'Confirmed and central to this POC -- the Oracle Database connector replicates standard relational rows/columns (INT, STRING, DATE, DECIMAL, etc.) directly.',
        layer: 'fivetran',
        sourceUrls: ['https://fivetran.com/docs/connectors/databases/oracle/oracle-connector'],
        verification: 'confirmed',
      },
      {
        requirement: 'Ingest semi-structured data (JSON, nested objects)',
        fivetranAnswer:
          'JSON is schema-inferred: top-level fields are promoted to destination columns, while nested/complex structures are mapped into a JSON-typed column rather than auto-unpacked into further columns. Applies across the file connectors (S3, SharePoint) and API/application connectors like Salesforce.',
        layer: 'fivetran',
        sourceUrls: ['https://fivetran.com/docs/connectors/files/amazon-s3'],
        verification: 'confirmed',
      },
      {
        requirement: 'Ingest unstructured data (documents, PDFs, images)',
        fivetranAnswer:
          'Unstructured file replication is a distinct, explicitly labeled Beta feature: files replicate in their original format into a destination\'s object storage layer, with metadata (name, source URL, location) tracked separately. As of this research, it is scoped to Merge Mode connections on 10 named source connectors (including SharePoint, but not Amazon S3 or Oracle), landing only in BigQuery, Databricks, or Snowflake, and only in the SaaS deployment model -- not confirmed for Hybrid. Do not assume unstructured document replication (e.g. scanned prior-auth forms) works into the S3 Managed Data Lake Service destination without confirming with Fivetran directly.',
        layer: 'fivetran',
        sourceUrls: [
          'https://fivetran.com/docs/core-concepts/features/unstructured-file-replication',
          'https://fivetran.com/docs/connectors/files/unstructured-files',
        ],
        verification: 'confirmed',
      },
    ],
  },
  {
    id: 'A.III',
    group: 'Core',
    categoryName: 'Real-Time (Streaming, API) + Batch Support',
    description: 'Handles both real-time streams (for AI/ML) and batch loads (for BI/reporting).',
    summary: 'Micro-batch as fast as 1 minute -- not sub-second streaming.',
    rows: [
      {
        requirement: 'Support scheduled batch, real-time streaming, API, and file-drop ingestion',
        fivetranAnswer:
          'Fivetran supports scheduled batch syncs (as fast as 1-minute intervals on Enterprise/Business Critical, 5-minute otherwise), API-based connectors, and file-drop ingestion via the Files/S3 connector family. It is not a sub-second streaming platform -- event data (e.g. via the Webhooks connector) is captured continuously but only lands in the destination on the next sync, typically 10-15 minutes for the first event. Read "real-time" here as frequent micro-batch, not true low-latency streaming.',
        layer: 'fivetran',
        sourceUrls: ['https://fivetran.com/docs/core-concepts/syncoverview', 'https://fivetran.com/docs/connectors/events/webhooks/setup-guide'],
        verification: 'confirmed',
      },
      {
        requirement: 'Detect new or changed files without needing to reload everything (incremental ingestion)',
        fivetranAnswer:
          'After the initial historical load, file-based connectors (Amazon S3, SharePoint) continuously monitor the source and sync only new or modified files matching the configured pattern.',
        layer: 'fivetran',
        sourceUrls: ['https://fivetran.com/docs/connectors/files/amazon-s3'],
        verification: 'confirmed',
      },
      {
        requirement: 'Support both full and incremental (delta) ingestion modes across sources',
        fivetranAnswer:
          'Every connector runs an initial full historical sync followed by incremental syncs using cursors (timestamps, IDs, log positions); if incremental detection becomes unreliable, Fivetran automatically falls back to a full reimport of the affected tables. Documented across database, file, and API/SaaS connector types.',
        layer: 'fivetran',
        sourceUrls: ['https://fivetran.com/docs/core-concepts/syncoverview'],
        verification: 'confirmed',
      },
      {
        requirement: 'Process files in order when the source system requires it (ordering guarantees)',
        fivetranAnswer:
          'For database sources, log-based CDC preserves source transaction commit order. For file-based connectors, no guaranteed sequential processing order is documented -- an optional time-based listing strategy only optimizes file-listing order lexicographically, it is not a delivery-order guarantee. Validate strict in-order file processing during the POC rather than assuming it.',
        layer: 'fivetran',
        sourceUrls: ['https://fivetran.com/docs/connectors/databases/troubleshooting/optimize-cdc-performance', 'https://fivetran.com/docs/connectors/files/tutorials/best-practices'],
        verification: 'inferred',
      },
    ],
  },
  {
    id: 'A.IV',
    group: 'Core',
    categoryName: 'Event-Driven Orchestration',
    description: 'Triggers ingestion based on events (file drop, API call, stream).',
    summary: 'API/webhook-triggered syncs confirmed; native S3-event triggers need a Lambda bridge.',
    rows: [
      {
        requirement: 'Trigger ingestion from events (file drops, storage puts, API calls)',
        fivetranAnswer:
          'API-triggered ingestion is confirmed via the REST API\'s Sync Connection endpoint, and event ingestion via the Webhooks connector. Direct triggering from a native S3 storage-PUT event notification is not documented as an out-of-the-box Fivetran feature -- it requires external glue (e.g. an S3 event notification invoking a Lambda that calls the Fivetran REST API), a joint Fivetran-plus-AWS pattern.',
        layer: 'joint',
        sourceUrls: ['https://fivetran.com/docs/rest-api/tutorials/trigger-syncs-manually', 'https://fivetran.com/docs/connectors/functions/aws-lambda/setup-guide'],
        verification: 'inferred',
      },
      {
        requirement: 'Allow controlled backfills (reloading from a specific time or set of files)',
        fivetranAnswer:
          'Fivetran supports triggering a full historical re-sync of a connection or specific tables via the dashboard or REST API, and lets new connections set a Historical Sync Time Frame to bound backfills to a specific date range instead of syncing all history.',
        layer: 'fivetran',
        sourceUrls: ['https://fivetran.com/docs/connectors/troubleshooting/trigger-historical-re-syncs', 'https://fivetran.com/docs/rest-api/tutorials/historical-sync'],
        verification: 'confirmed',
      },
      {
        requirement: 'Quarantine failures and emit structured error events with correlation IDs',
        fivetranAnswer:
          'No native per-record quarantine mechanism with correlation/tracking IDs is documented. The Connector SDK exposes connection-level error fields (errorMessage, errorType, stackTrace) in the dashboard, but a bad-row quarantine pattern for file connectors is an open community feature request, not a shipped capability today.',
        layer: 'fivetran',
        sourceUrls: ['https://fivetran.com/docs/connector-sdk/troubleshooting'],
        verification: 'unverified',
      },
    ],
  },
  {
    id: 'A.V',
    group: 'Core',
    categoryName: 'Data Transformation on Ingest',
    description: 'Performs filtering, cleansing, and normalization before landing in the lakehouse.',
    summary: 'Extract-and-load only -- cleansing/normalization runs downstream (dbt), not pre-load.',
    rows: [
      {
        requirement: 'Filter, cleanse, or normalize data before it lands in the destination',
        fivetranAnswer:
          'Fivetran is an ELT platform, confirmed directly on its own Transformations docs: raw data lands first, and transformations (including dbt-based models) run post-load, in the destination, triggered automatically after a sync or on a schedule. The one narrow exception is row filtering, applied in-flight before rows are written -- an include/exclude filter, not general cleansing or normalization. There is no pre-load cleansing/normalization engine. For Healthfirst\'s architecture, this means bronze-zone data lands as a faithful copy of the source, and cleansing/normalization/data-quality logic (dbt for transformation, Great Expectations for validation) runs downstream against the landed Iceberg tables, not during ingest itself.',
        layer: 'fivetran',
        sourceUrls: ['https://fivetran.com/docs/transformations', 'https://www.fivetran.com/blog/etl-vs-elt-why-a-post-load-process-wins-every-time'],
        verification: 'confirmed',
      },
    ],
  },
  {
    id: 'A.VI',
    group: 'Core',
    categoryName: 'Security & Compliance',
    description: 'Provides encryption, access control, and audit logging, supporting PHI/PII compliance.',
    summary: 'TLS + KMS encryption, secrets vault, PrivateLink confirmed; legal holds/retention are AWS-side.',
    rows: [
      {
        requirement: 'Allow retention rules and legal holds to be set at time of ingestion',
        fivetranAnswer:
          'Not a Fivetran ingestion feature. Retention periods and legal holds are an AWS S3 Object Lock (WORM) capability configured on the destination bucket, independent of the Fivetran sync process. MDLS does expose its own Iceberg snapshot-retention setting, but that governs table-maintenance cleanup, not legal/compliance holds.',
        layer: 's3_lake_formation',
        sourceUrls: ['https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html', 'https://fivetran.com/docs/destinations/managed-data-lake-service'],
        verification: 'confirmed',
      },
      {
        requirement: 'Encrypt data in transit and at rest using approved standards',
        fivetranAnswer:
          'Dashboard and source/destination connections use TLS 1.2+ (SSL by default for databases). Stored data and credentials are encrypted at rest via Aurora database encryption plus an application-level encryption layer, keys managed in AWS KMS. Business Critical customers can supply a customer-managed key (CMK). Fivetran will sign a HIPAA BAA and holds HITRUST i1 certification (tied to Business Critical) -- see the demo script for the full HIPAA/certification detail.',
        layer: 'fivetran',
        sourceUrls: ['https://fivetran.com/docs/core-concepts/data-credential-encryption', 'https://www.fivetran.com/security'],
        verification: 'confirmed',
      },
      {
        requirement: 'Manage credentials and secrets securely (never in plain text or logs)',
        fivetranAnswer:
          'Credentials go to Fivetran\'s Secure Credentials Service, encrypted at rest, never hard-coded; for custom connectors Fivetran explicitly recommends the runtime secrets object rather than embedding credentials in code. CMKs available on Business Critical for additional control.',
        layer: 'fivetran',
        sourceUrls: ['https://fivetran.com/docs/core-concepts/data-credential-encryption'],
        verification: 'confirmed',
      },
      {
        requirement: 'Use only private and secure network paths for ingestion (VPC endpoints/private links)',
        fivetranAnswer:
          'AWS PrivateLink lets traffic move between Fivetran and an AWS-hosted source/destination without traversing the public internet; setup requires an AWS endpoint service behind a network load balancer and safelisting Fivetran\'s AWS account ID.',
        layer: 'fivetran',
        sourceUrls: ['https://fivetran.com/docs/connectors/databases/connection-options/aws-private-link'],
        verification: 'confirmed',
      },
    ],
  },
  {
    id: 'A.VII',
    group: 'Core',
    categoryName: 'Metadata Ingestion & Lineage',
    description: 'Captures the technical and operational metadata to enable governance, reproducibility, and cataloging.',
    summary: 'Platform Connector gives schema/table/lineage metadata (Enterprise/Business Critical only).',
    rows: [
      {
        requirement: 'Make metadata captured at ingest usable for observability dashboards and impact analysis',
        fivetranAnswer:
          'On Enterprise/Business Critical, the Platform Connector populates schema/table/column/lineage/change-event tables in a fivetran_metadata schema in the destination -- source-to-destination lineage and schema-change history queryable directly or fed into cataloging tools (Metaplane, DataHub, OpenMetadata). This lineage/impact-analysis metadata is not available on the Standard plan.',
        layer: 'fivetran',
        sourceUrls: ['https://fivetran.com/docs/logs/fivetran-platform'],
        verification: 'confirmed',
      },
      {
        requirement: 'Keep a versioned record of classification decisions with full audit trails',
        fivetranAnswer:
          'Fivetran\'s Audit Trail (Enterprise/Business Critical) logs configuration changes to PII-related settings like Column Hashing and Data Blocking -- old/new values, user, timestamp -- the closest thing to a versioned classification-decision record on the Fivetran side. A fuller versioned schema/classification history for the lake tables themselves comes from AWS Glue Data Catalog table versions, a lake-layer capability.',
        layer: 'joint',
        sourceUrls: ['https://fivetran.com/docs/logs/fivetran-platform', 'https://docs.aws.amazon.com/glue/latest/dg/schema-registry.html'],
        verification: 'inferred',
      },
      {
        requirement: 'Automatically update the data lake catalog',
        fivetranAnswer:
          'MDLS updates its built-in Iceberg REST Catalog (Apache Polaris-based) during every sync, and can also auto-register/update tables in an external AWS Glue Data Catalog, Databricks Unity Catalog, or BigQuery/BigLake metastore. If an external catalog becomes inconsistent, Fivetran detects it on the next sync and republishes the latest version.',
        layer: 'joint',
        sourceUrls: ['https://fivetran.com/docs/managed-data-lake-service/metadata-catalogs'],
        verification: 'confirmed',
      },
    ],
  },
  {
    id: 'A.VIII',
    group: 'Core',
    categoryName: 'Schema Handling & Evolution',
    description: 'Detects, enforces, and evolves schema without pipeline breakage.',
    summary: 'Automatic schema-drift detection and type widening for structured/semi-structured sources.',
    rows: [
      {
        requirement: 'Handle implicit datatype changes between source and target',
        fivetranAnswer:
          'Fivetran automatically detects source schema changes, including column datatype changes, and propagates them to the destination -- promoting a column to the most specific type that can losslessly represent both old and new data (e.g. widening to STRING when types are incompatible). Unsupported source types map to the closest supported destination type or are excluded from load.',
        layer: 'fivetran',
        sourceUrls: ['https://www.fivetran.com/blog/reliable-data-replication-in-the-face-of-schema-drift', 'https://fivetran.com/docs/getting-started/fivetran-dashboard/connectors/schema'],
        verification: 'confirmed',
      },
      {
        requirement: 'Detect and track metadata schema drift across structured/semi-structured/unstructured data',
        fivetranAnswer:
          'For structured/semi-structured sources, Fivetran auto-detects new/removed/changed columns and tables with a per-connection policy (Allow All / Allow New Columns / Block All), recorded as schema-change events queryable via the Platform Connector\'s LOG table. For genuinely unstructured file sources, Fivetran doesn\'t apply the same schema-drift concept -- it attaches system metadata (file name, path, sync timestamp) per row for lineage instead of tracking a changing schema.',
        layer: 'fivetran',
        sourceUrls: ['https://fivetran.com/docs/logs/faq/track-schema-changes', 'https://fivetran.com/docs/using-fivetran/fivetran-dashboard/connectors/schema'],
        verification: 'confirmed',
      },
    ],
  },
  {
    id: 'A.IX',
    group: 'Core',
    categoryName: 'Data Quality Validation on Ingest',
    description: 'Performs schema validation, null checks, duplicate detection, and anomaly detection at ingest time.',
    summary: 'Fivetran validates schema/types only -- deeper DQ checks run via Great Expectations (GX Core), downstream.',
    rows: [
      {
        requirement: 'Schema validation, null checks, duplicate detection, and anomaly detection',
        fivetranAnswer:
          'Fivetran itself performs schema-level validation at ingest (rejecting/logging invalid primary keys, handling type mismatches -- see Schema Handling above) but does not run column-level null-threshold checks, duplicate-value detection, or statistical anomaly detection as a native ingestion feature. Fivetran announced stewardship of Great Expectations (GX Core) -- the open-source data-quality validation project -- funding its maintenance and ecosystem integrations. In this architecture, GX Core is the intended data-quality-validation layer: it runs downstream against the landed bronze-zone tables (row counts, null thresholds, referential integrity, freshness windows) before promotion to silver, rather than being built into the ingest path itself. Present this honestly to Healthfirst as Fivetran (move) + GX Core (validate) + dbt (transform) working together, not as a single ingest-time DQ engine.',
        layer: 'joint',
        sourceUrls: ['https://fivetran.com/docs/getting-started/fivetran-dashboard/connectors/schema', 'https://fivetran.com/docs/core-concepts/syncoverview'],
        verification: 'inferred',
      },
      {
        requirement: 'Confirm the ingestion pipeline fully processed a file (processing completeness check)',
        fivetranAnswer:
          'The Sync History view breaks each sync into Extract/Process/Load stages with row counts per table, and file connectors only reprocess new/modified files on subsequent syncs -- giving a way to infer a file completed the pipeline. Fivetran does not describe an explicit per-file "fully processed" flag or checksum; this is inferred from sync-stage and row-count visibility, not a documented guarantee.',
        layer: 'fivetran',
        sourceUrls: ['https://fivetran.com/docs/core-concepts/syncoverview', 'https://fivetran.com/docs/using-fivetran/fivetran-dashboard/connectors/status'],
        verification: 'inferred',
      },
    ],
  },
  {
    id: 'A.X',
    group: 'Core',
    categoryName: 'Reliability & Fault Tolerance',
    description: 'Guarantees data delivery with retry, checkpointing, and exactly-once/at-least-once semantics.',
    summary: 'Tiered auto-retry + checkpointed resume; 99.9% SLA on Enterprise/Business Critical.',
    rows: [
      {
        requirement: 'Gracefully handle pipeline failure without introducing duplicates or gaps',
        fivetranAnswer:
          'On failure, Fivetran retries on an escalating schedule (frequent retries for 24 hours, then at normal sync-frequency through 72 hours, then daily up to 14 days before auto-pausing) and resumes from where it left off. A _fivetran_id is assigned to rows lacking a natural primary key specifically to prevent duplicates across retried/resumed syncs.',
        layer: 'fivetran',
        sourceUrls: ['https://fivetran.com/docs/core-concepts/syncoverview'],
        verification: 'confirmed',
      },
      {
        requirement: 'Automatically retry failed ingestions, waiting longer between each attempt',
        fivetranAnswer:
          'Fivetran documents a tiered, fixed-cadence retry schedule for failed syncs -- frequent retries for 24 hours, then daily out to 72 hours and again to 14 days, then auto-pause. This is automatic tiered retry, but Fivetran\'s own docs do not describe this specific ingestion-retry path as exponential backoff (that term appears elsewhere, for Activations/reverse-ETL webhook retries) -- don\'t claim exponential backoff specifically for source ingestion.',
        layer: 'fivetran',
        sourceUrls: ['https://fivetran.com/docs/getting-started/syncoverview', 'https://fivetran.com/docs/connectors/troubleshooting'],
        verification: 'inferred',
      },
      {
        requirement: 'Guarantee reliable delivery (at least once, or exactly once where needed)',
        fivetranAnswer:
          'Fivetran documents idempotent pipelines that update sync cursors only after a successful destination write and can resume from the last checkpoint -- functionally aimed at effectively-once delivery -- and Enterprise/Business Critical plans carry a 99.9% data-delivery SLA (measured after 5 consecutive days of successful table syncs). The terms "at-least-once"/"exactly-once" are not used verbatim in Fivetran\'s docs, so present the mechanism rather than that exact terminology.',
        layer: 'fivetran',
        sourceUrls: ['https://fivetran.com/docs/getting-started/syncoverview', 'https://www.fivetran.com/legal/sla'],
        verification: 'inferred',
      },
      {
        requirement: 'Allow settings to control speed or pause ingestion (backpressure/throttling)',
        fivetranAnswer:
          'No single universal throttling dial is documented for database sources. What is confirmed: configurable sync scheduling (fixed interval, cron, or manual/API-triggered) so historical loads can run off-peak, a per-connector Daily API Call Limit on some SaaS connectors, and automatic honoring of source-side 429/rate-limit responses. Treat this as scheduling-plus-rate-limit-reaction rather than a guaranteed real-time throttle; confirm with Fivetran whether Oracle/Salesforce expose finer-grained controls for this POC.',
        layer: 'fivetran',
        sourceUrls: ['https://fivetran.com/docs/core-concepts/syncoverview', 'https://fivetran.com/docs/using-fivetran/fivetran-dashboard/connectors/troubleshooting/avoid-api-limit'],
        verification: 'inferred',
      },
    ],
  },
  {
    id: 'A.XI',
    group: 'Core',
    categoryName: 'Scalability & Performance',
    description: 'Ingests large-scale, high-throughput data reliably and efficiently.',
    summary: 'High-Volume Agent scales log-based CDC; partitioning is an AWS/Glue setting, not Fivetran\'s.',
    rows: [
      {
        requirement: 'Scale to high throughput ingestion of large structured files and streams',
        fivetranAnswer:
          'Fivetran\'s High-Volume Agent (HVA) connectors provide distributed, agent-based log replication for high-volume database sources (sync as fast as 1 minute, 10x+ compression for transfer). File connectors sync on a schedule as frequent as every 15 minutes. Fivetran is fundamentally a scheduled/incremental (micro-batch) ELT platform, not a continuous stream processor.',
        layer: 'fivetran',
        sourceUrls: ['https://fivetran.com/docs/connectors/databases/hva-connectors', 'https://fivetran.com/docs/connectors/files'],
        verification: 'inferred',
      },
      {
        requirement: 'Support partitioning and layout conventions for storage (time/source/classification-based)',
        fivetranAnswer:
          'MDLS writes each table to a deterministic path (<root>/<prefix_path>/<schema_name>/<table_name>/) with Iceberg or Delta metadata alongside Parquet files, but current Fivetran documentation does not describe configurable time-based, source-based, or classification-based partition strategies within that path. Custom partition layouts, Glue Data Catalog partition definitions, and Lake Formation governance over those partitions are configured at the AWS S3/Glue/Lake Formation layer.',
        layer: 's3_lake_formation',
        sourceUrls: ['https://fivetran.com/docs/destinations/managed-data-lake-service', 'https://docs.aws.amazon.com/lake-formation/latest/dg/glue-features-lf.html'],
        verification: 'confirmed',
      },
    ],
  },
  {
    id: 'A.XII',
    group: 'Core',
    categoryName: 'Operational Resilience & Observability',
    description: 'Ensures ingestion pipelines are transparent, resilient, and diagnosable, with monitoring, alerting, and recovery mechanisms.',
    summary: 'Standardized logs + usage metrics; full alerting/lineage UI needs a paired tool.',
    rows: [
      {
        requirement: 'Provide end-to-end observability: monitoring, logging, metrics, lineage, alerting',
        fivetranAnswer:
          'The Platform Connector (or any of 8 supported external log services) delivers standardized JSON logs covering sync status, schema changes, connector errors, and audit actions. Enterprise/Business Critical plans add lineage/change-event metadata tables for root-cause and impact analysis. Native alerting and full lineage-graph UI are limited without pairing Fivetran with a downstream tool (Datadog, Metaplane, DataHub) -- observability in practice is delivered jointly by Fivetran\'s log/metadata output plus a connected monitoring tool.',
        layer: 'joint',
        sourceUrls: ['https://fivetran.com/docs/logs', 'https://fivetran.com/docs/logs/fivetran-platform'],
        verification: 'confirmed',
      },
      {
        requirement: 'Feed ingestion performance and cost metrics into observability dashboards',
        fivetranAnswer:
          'The dashboard\'s Usage and Billing tabs show connection-level Monthly Active Rows (MAR) and spend at account and per-connection/per-table level, updated daily. The Platform Connector and external log services expose sync duration, rows extracted/loaded, and failure counts that can be piped into Datadog, CloudWatch, Splunk, etc. for custom dashboards.',
        layer: 'fivetran',
        sourceUrls: ['https://fivetran.com/docs/core-concepts/usage-based-pricing/tracking-and-optimizing-usage', 'https://fivetran.com/docs/logs'],
        verification: 'confirmed',
      },
    ],
  },
  {
    id: 'A.XIII',
    group: 'Core',
    categoryName: 'AI-Assisted Pipeline Development',
    description: 'Uses ML/AI in aspects of data ingestion -- suggest mappings, detect PHI, anomalies, or optimize ingestion flows.',
    summary: 'No native AI in ingestion; dbt Wizard (real, dbt Labs) assists downstream model-building.',
    rows: [
      {
        requirement: 'AI/ML-suggested schema mappings, PHI/PII detection, or ingestion-flow optimization',
        fivetranAnswer:
          'Fivetran\'s own documented feature set (data blocking, column hashing, schema-change handling) is manual/rule-based, not AI/ML-driven -- there is no native AI feature that auto-suggests mappings, auto-detects PHI/PII, or auto-optimizes ingestion flows today. Where Fivetran + dbt Labs do apply AI is downstream, on the transformation side: "dbt Wizard" is a real, currently shipping dbt Labs product (public preview in the Studio IDE, public beta standalone) -- an AI agent that authors, refactors, and debugs dbt models grounded in project lineage, tests, and contracts. It supersedes the earlier "dbt Copilot" assistant. Present this accurately to Healthfirst as AI-assisted transformation authoring (dbt Wizard), not AI-assisted ingestion.',
        layer: 'joint',
        sourceUrls: [
          'https://fivetran.com/docs/using-fivetran/features',
          'https://docs.getdbt.com/docs/platform/wizard-overview',
          'https://www.getdbt.com/product/dbt-wizard',
        ],
        verification: 'confirmed',
      },
    ],
  },
  {
    id: 'B.I',
    group: 'Value-Add',
    categoryName: 'Cost Management Features',
    description: 'Provides monitoring, throttling, and cost optimization for ingestion workloads.',
    summary: 'Exposes Monthly Active Rows + spend; storage tiering is an S3 Lifecycle setting.',
    rows: [
      {
        requirement: 'Expose ingestion cost metrics (throughput, storage, compute usage)',
        fivetranAnswer:
          'The Billing & Usage dashboard and Platform Connector surface Monthly Active Rows (MAR) per connector and per table, plus current/historical spend and transformation usage. MAR -- not network throughput, storage bytes, or backend compute time -- is what Fivetran meters and bills on; separate throughput/storage/compute metrics are not exposed.',
        layer: 'fivetran',
        sourceUrls: ['https://fivetran.com/docs/core-concepts/usage-based-pricing/tracking-and-optimizing-usage'],
        verification: 'confirmed',
      },
      {
        requirement: 'Support tiered storage placement (standard to infrequent access to archive) at ingest',
        fivetranAnswer:
          'This is an S3 bucket/Lake Formation capability, not a Fivetran setting. Fivetran writes new Iceberg/Delta files to S3 Standard and its own docs say archive-class tiers (Glacier Flexible Retrieval, Glacier Deep Archive, Intelligent-Tiering Archive/Deep Archive) are unsupported destinations for the lake, because retrieval delays break table reads and Fivetran\'s own maintenance jobs. Moving objects to Infrequent Access or Glacier after ingest is done with S3 Lifecycle rules on the bucket, independent of Fivetran.',
        layer: 's3_lake_formation',
        sourceUrls: ['https://fivetran.com/docs/managed-data-lake-service'],
        verification: 'confirmed',
      },
    ],
  },
  {
    id: 'B.II',
    group: 'Value-Add',
    categoryName: 'Native Lakehouse Format Support',
    description: 'Supports open table formats to reduce post-ingestion processing.',
    summary: 'Writes Iceberg, auto-updates the catalog, self-maintains snapshots/orphan files.',
    rows: [
      {
        requirement: 'Store originals in secure, write-once (WORM) storage',
        fivetranAnswer:
          'WORM protection is delivered by AWS S3 Object Lock (Governance or Compliance mode) configured on the destination bucket -- Fivetran documentation does not describe any WORM/Object Lock support of its own. A bucket locked in strict Compliance-mode Object Lock would need evaluation for compatibility with Fivetran\'s automated snapshot/orphan-file maintenance, which needs s3:PutObject/s3:DeleteObject permissions.',
        layer: 's3_lake_formation',
        sourceUrls: ['https://fivetran.com/docs/destinations/managed-data-lake-service/setup-guide', 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html'],
        verification: 'confirmed',
      },
      {
        requirement: 'Automated table maintenance -- clean up old orphaned files',
        fivetranAnswer:
          'MDLS runs Iceberg maintenance automatically: daily expiration of snapshots older than a configurable window (always keeping at least the last 2), pruning of prior metadata-file versions, and orphan-file cleanup every other week (unreferenced files quarantined 7+ days before permanent deletion). No customer-scheduled compaction or cleanup scripts required.',
        layer: 'fivetran',
        sourceUrls: ['https://fivetran.com/docs/managed-data-lake-service'],
        verification: 'confirmed',
      },
      {
        requirement: 'Data immediately queryable by downstream consumption services like Athena or Snowflake',
        fivetranAnswer:
          'Because Fivetran writes standard Apache Iceberg tables to S3 and keeps a catalog in sync every run, tables are queryable by compatible engines once a sync completes -- Snowflake via a catalog-linked database for Iceberg, Athena/Redshift/EMR via the Glue Catalog integration. Availability is tied to sync completion, not true streaming/real-time.',
        layer: 'joint',
        sourceUrls: ['https://fivetran.com/docs/managed-data-lake-service/metadata-catalogs', 'https://fivetran.com/docs/managed-data-lake-service/tutorials/query-iceberg-tables-from-snowflake'],
        verification: 'confirmed',
      },
    ],
  },
  {
    id: 'B.III',
    group: 'Value-Add',
    categoryName: 'Multi-Cloud & Hybrid Support',
    description: 'Works across cloud and on-prem systems, minimizing vendor lock-in.',
    summary: 'SaaS or Hybrid -- agent runs in your VPC, Fivetran keeps the control plane.',
    rows: [
      {
        requirement: 'Deployment models: SaaS, Hybrid, and on-prem/self-hosted',
        fivetranAnswer:
          'Fivetran documents two deployment models. SaaS Deployment: all data processing runs in Fivetran\'s managed cloud (selectable by preferred cloud region). Hybrid Deployment: actual data processing runs inside the customer\'s own network/VPC via a self-installed Hybrid Deployment Agent (Kubernetes, or Docker/Podman on a Linux host), while Fivetran\'s control plane (configuration, orchestration, monitoring) stays fully managed in Fivetran\'s cloud; the agent communicates outbound-only, sending metadata/logs/MAR info -- not raw data -- back to Fivetran. There is no fully self-hosted/on-prem-only model with zero Fivetran control plane. Specific underlying cloud providers hosting Fivetran\'s SaaS control plane were not confirmed in this research pass -- state the SaaS/Hybrid split without naming specific providers until verified.',
        layer: 'fivetran',
        sourceUrls: ['https://fivetran.com/docs/deployment-models', 'https://fivetran.com/docs/deployment-models/hybrid-deployment'],
        verification: 'confirmed',
      },
    ],
  },
  {
    id: 'B.V',
    group: 'Value-Add',
    categoryName: 'Low-Code / No-Code Interfaces',
    description: 'Enables users to build pipelines without heavy coding, improving adoption.',
    summary: 'Dashboard/API config for all standard connectors -- no code except the Connector SDK.',
    rows: [
      {
        requirement: 'Build and manage pipelines without writing code',
        fivetranAnswer:
          'Standard pre-built connectors are configured entirely through the Fivetran dashboard/GUI or REST API -- no code is written by the customer for the 700+ pre-built connectors, including all three named in this POC (Salesforce, Oracle, SharePoint/S3). Coding is required only when using the Connector SDK to build a connector for a source Fivetran doesn\'t natively support.',
        layer: 'fivetran',
        sourceUrls: ['https://fivetran.com/docs/connectors', 'https://fivetran.com/docs/connector-sdk'],
        verification: 'confirmed',
      },
    ],
  },
];
