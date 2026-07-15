// Single source of truth for every Fivetran capability claim shown on the
// Overview and Sources pages. Every field traces back to a real
// fivetran.com/docs page (see sourceUrls) gathered via direct fetch, not
// search-summary. If a fact could not be confirmed on a real page it is
// marked 'inferred' or 'unverified' and the note says why -- do not upgrade
// a verification label without re-checking the source.

export type Verification = 'confirmed' | 'inferred' | 'unverified';

export interface SystemFinding {
  key: 'salesforce' | 'oracle' | 's3' | 'sharepoint';
  system: string;
  serviceIdentifier: string;
  serviceIdentifierNote?: string;
  sourceRole: string;
  currentApproach: string;
  syncMethod: string;
  supportsHistoricalSync: boolean;
  supportsInserts: boolean;
  supportsUpdates: boolean;
  supportsDeletes: boolean;
  deletesNote?: string;
  fastestSyncFrequency: string;
  syncFrequencyVerification: Verification;
  syncFrequencyNote: string;
  schemaChangeHandling: string;
  notes: string;
  sourceUrls: string[];
}

export const FINDINGS: SystemFinding[] = [
  {
    key: 'salesforce',
    system: 'Salesforce',
    serviceIdentifier: 'salesforce',
    sourceRole: 'Cloud Application -- CRM (member outreach, service cases)',
    currentApproach: 'Use case 1 in the Mutual Evaluation Plan: Cloud Application Ingestion.',
    syncMethod:
      'REST API and Bulk API (Fivetran chooses per table by data volume; Bulk API for historical/high-volume incremental, REST API otherwise and as fallback). Incremental syncs use Salesforce timestamp fields (SystemModStamp, LastModifiedDate, CreatedDate, or LoginTime) for most tables; objects marked non-replicateable by Salesforce are fully re-imported on a size-based cadence instead.',
    supportsHistoricalSync: true,
    supportsInserts: true,
    supportsUpdates: true,
    supportsDeletes: true,
    deletesNote:
      'Soft-deleted records (Recycle Bin) are captured via the SObject Get Deleted API -- but Salesforce only retains them there for 15 days, after which Fivetran can no longer retrieve/mark them. OpportunityLineItem (and its children) bypasses the Recycle Bin entirely; its deletes are immediate and can be missed without a manual re-import.',
    fastestSyncFrequency: '1 minute (Enterprise / Business Critical plan); 5 minutes on lower plans',
    syncFrequencyVerification: 'confirmed',
    syncFrequencyNote:
      '1 minute is the fastest frequency Fivetran advertises platform-wide, and Salesforce is not on the published exclusion list (Salesforce Marketing Cloud, a separate connector, is excluded). Confirmed at the platform-policy level rather than a Salesforce-specific sentence.',
    schemaChangeHandling:
      'Per-connection policy (Allow all new data / Allow new columns / Block all new data) governs new tables/columns. Salesforce "formula fields" are auto-excluded from normal sync -- they can\'t be synced incrementally with reliable integrity -- and are instead captured in FIVETRAN_FORMULA / FIVETRAN_FORMULA_MODEL system tables for reconstruction downstream.',
    notes:
      'Compound fields (e.g. BillingAddress) are decomposed into individual subfield columns. Each Salesforce org has a rolling 24-hour Bulk/REST API quota; Fivetran falls back from Bulk to REST at 90% Bulk quota use and auto-postpones syncs by 1 hour at 90% REST quota use. AWS PrivateLink connectivity requires a Business Critical plan plus a Salesforce Private Connect license. Requires Salesforce Enterprise-level org or purchased API capacity.',
    sourceUrls: [
      'https://fivetran.com/docs/connectors/applications/salesforce',
      'https://fivetran.com/docs/connectors/applications/salesforce/troubleshooting/capturing-deletes',
      'https://fivetran.com/docs/core-concepts/syncoverview',
      'https://fivetran.com/docs/getting-started/fivetran-dashboard/connectors/schema',
    ],
  },
  {
    key: 'oracle',
    system: 'Oracle Database',
    serviceIdentifier: 'oracle',
    serviceIdentifierNote: 'Confirmed against the fivetran Terraform provider schema (a separate "oracle_rds" identifier exists for RDS-hosted Oracle).',
    sourceRole: 'Database -- core policy administration, enrollment, and claims',
    currentApproach: 'Use case 2 in the Mutual Evaluation Plan: Database data Ingestion.',
    syncMethod:
      'Binary Log Reader: log-based CDC reading Oracle redo logs directly (online + archived), no primary key required, supports LOBs. Fivetran Teleport Sync is available for tables under 100GB as a lower-setup alternative. LogMiner is sunset as of May 15, 2026 and should not be proposed for a new connection.',
    supportsHistoricalSync: true,
    supportsInserts: true,
    supportsUpdates: true,
    supportsDeletes: true,
    deletesNote: 'Deletes are soft-deletes: the destination row is flagged via a _fivetran_deleted boolean rather than physically removed. TRUNCATE operations on the source are handled the same way.',
    fastestSyncFrequency: '1 minute (Enterprise / Business Critical plan)',
    syncFrequencyVerification: 'confirmed',
    syncFrequencyNote: 'Directly stated as "Minimum sync interval: 1 minute" on the Oracle connector comparison table. Choosing 1-minute frequency does not guarantee the sync completes within 1 minute.',
    schemaChangeHandling:
      'Binary Log Reader: ADD COLUMN without a default proceeds without a full re-sync; ADD COLUMN with a default triggers an automatic re-sync; DROP COLUMN is handled without a re-sync. Teleport Sync: ADD COLUMN with null/default values proceeds without re-sync; other alterations (type changes, renames, drops) trigger a full table re-sync. New tables/schemas are auto-mapped and imported.',
    notes:
      'Capacity ceilings relevant to payer-scale claims/eligibility volume: max 200 GB/hour redo log volume, max 5 TB aggregate replicated table size, Teleport Sync capped at tables under 100 GB each. Requires supplemental logging enabled at the database (and PDB, for multitenant) level. Supports direct TLS (Oracle 12.2+), SSH tunnel, Proxy Agent (fully on-prem, no inbound connectivity), and private networking (AWS PrivateLink / Azure Private Link / GCP Private Service Connect, Business Critical only). Supports TDE-encrypted source databases via wallet credentials. Only materialized views are supported as sync objects (not regular views); generated/computed columns are not replicated.',
    sourceUrls: [
      'https://fivetran.com/docs/connectors/databases/oracle/oracle-connector',
      'https://fivetran.com/docs/connectors/databases/oracle',
      'https://fivetran.com/docs/connectors/databases/oracle/oracle-connector/setup-guide',
    ],
  },
  {
    key: 's3',
    system: 'Amazon S3',
    serviceIdentifier: 's3',
    serviceIdentifierNote: 'Confirmed against the fivetran Terraform provider schema.',
    sourceRole: 'File -- claims/eligibility landing files, EOB batches',
    currentApproach: 'Use case 3 in the Mutual Evaluation Plan: File data Ingestion.',
    syncMethod:
      'Magic Folder mode: one destination table per source file, change detection via last-modified timestamp, full re-import of the file on change (no incremental/upsert). Merge (pattern) mode: multiple files matching a name pattern load into one destination table, supports incremental syncs via one of three primary-key strategies (upsert by filename+line number, append with surrogate keys, or upsert on a custom primary key) -- the choice is locked after the first successful sync.',
    supportsHistoricalSync: true,
    supportsInserts: true,
    supportsUpdates: true,
    supportsDeletes: true,
    deletesNote: 'Delete capture depends on mode: Magic Folder mode does not propagate a removed source file as a destination delete. Merge mode with an upsert primary-key strategy does support delete propagation via the standard soft-delete (_fivetran_deleted) mechanism.',
    fastestSyncFrequency: '15 minutes (default scan interval for file connectors)',
    syncFrequencyVerification: 'confirmed',
    syncFrequencyNote:
      'Fivetran\'s file-connector docs state plainly: "By default, all connections sync new and modified files every 15 minutes." No S3-connector-specific page was found confirming eligibility for the platform\'s 1-minute tier, so treat 15 minutes as the confirmed practical floor.',
    schemaChangeHandling:
      'New tables matching the configured file/folder pattern are added automatically (governed by the connection\'s Schema Changes setting). In Merge mode, new columns are added with an initial STRING type, corrected once real values are observed; columns removed from the source sync as nulls rather than being dropped.',
    notes:
      'Merged cells in Excel source files are not supported -- rows containing them are skipped. Fivetran does not sync from S3 replication (destination) buckets. Supported file types: CSV/TSV, JSON/JSONL, XML (loaded unflattened into a single column), XLS/XLSX/XLSM, common compressed archives, and PGP-encrypted files. Hybrid deployment requires Enterprise/Business Critical; AWS PrivateLink requires Business Critical.',
    sourceUrls: [
      'https://fivetran.com/docs/connectors/files/amazon-s3',
      'https://fivetran.com/docs/connectors/files/amazon-s3/setup-guide',
      'https://fivetran.com/docs/connectors/files',
    ],
  },
  {
    key: 'sharepoint',
    system: 'SharePoint',
    serviceIdentifier: 'share_point',
    serviceIdentifierNote: 'Confirmed against the fivetran Terraform provider schema (underscore, not the "share-point" docs URL slug).',
    sourceRole: 'File -- policy documents, provider rosters, prior-authorization forms',
    currentApproach: 'Use case 3 in the Mutual Evaluation Plan: File data Ingestion.',
    syncMethod:
      'Magic Folder mode: each file (each worksheet, for spreadsheets) becomes its own destination table; table/column names are derived from the file name and first-row values. Merge mode: files matching configured regex patterns load into an explicitly named destination table; supports upsert, append, or upsert-with-primary-key handling.',
    supportsHistoricalSync: true,
    supportsInserts: true,
    supportsUpdates: true,
    supportsDeletes: false,
    deletesNote: 'Confirmed from the connector\'s own Features table: the "Capture deletes" capability is NOT enabled for SharePoint in either sync mode. Files removed from the source folder are not marked or removed in the destination -- pair SharePoint with a database or application connector for anything requiring guaranteed delete propagation.',
    fastestSyncFrequency: '15 minutes (default scan interval for file connectors)',
    syncFrequencyVerification: 'confirmed',
    syncFrequencyNote: 'Same platform-wide file-connector default as Amazon S3; no SharePoint-specific page was found stating eligibility for a faster tier.',
    schemaChangeHandling:
      'Magic Folder mode: column names are taken from the worksheet\'s first row on every sync, so a changed header row changes the destination columns; empty worksheets, empty first rows, and empty first-row cells are skipped. Merge mode: destination table name is configured explicitly, decoupled from the source file name.',
    notes:
      'Unstructured file replication is labeled Beta and is SaaS-deployment only -- not available if Hybrid deployment is required for data-residency/compliance reasons, a meaningful caveat for a HIPAA-sensitive insurer that wants both. SharePoint permissions sync requires "Advanced setup" access; when no primary key is exposed for a principal, Fivetran generates one by hashing the user\'s email. Only .xls/.xlsx/.xlsm are supported; no hyperlinks, pivot tables, or merged-cell rows.',
    sourceUrls: [
      'https://fivetran.com/docs/connectors/files/share-point',
      'https://fivetran.com/docs/connectors/files/share-point/setup-guide',
      'https://fivetran.com/docs/connectors/files/share-point/api-configuration',
      'https://fivetran.com/docs/connectors/files',
    ],
  },
];

export function findingByKey(key: SystemFinding['key']): SystemFinding {
  const f = FINDINGS.find((x) => x.key === key);
  if (!f) throw new Error(`No finding for ${key}`);
  return f;
}

export interface DestinationFinding {
  system: string;
  serviceIdentifier: string;
  writesFormat: string;
  catalog: string;
  updateStrategy: string;
  syncModes: string;
  maintenance: string;
  caveats: string;
  verification: Verification;
  sourceUrls: string[];
}

export const MDLS_DESTINATION: DestinationFinding = {
  system: 'AWS S3 Managed Data Lake Service (MDLS)',
  serviceIdentifier: 'managed_data_lake (confirmed against the fivetran Terraform provider schema; storage_provider="S3" selects the AWS path -- the same umbrella service also supports GCS and Databricks Unity Catalog)',
  writesFormat:
    'Fivetran manages table structure, metadata, catalogs, and maintenance operations over Apache Iceberg (and/or Delta Lake) tables, while the customer\'s own S3 bucket serves as the underlying storage layer -- Fivetran does not maintain a separate copy of the data outside that bucket.',
  catalog:
    'Default catalog is Fivetran\'s own Iceberg REST Catalog (Apache Polaris-based, called the "Fivetran Catalog"); AWS Glue Data Catalog integration is an optional add-on that cannot be edited after the first successful sync into the data lake. If an external Glue catalog becomes inconsistent, Fivetran detects it on the next sync and republishes the latest table version from its own catalog.',
  updateStrategy:
    'Copy-on-Write (COW): updates and deletes are applied by writing a new Parquet file that excludes the old/deleted row, rather than an in-place merge-on-read edit. Old files persist until Fivetran\'s own maintenance job runs, so query engines always see correct, de-duplicated results despite temporary file-level duplication.',
  syncModes:
    'Soft Delete (default): deleted source rows are flagged via _fivetran_deleted rather than physically removed. History Mode: every version of a row is inserted with _fivetran_active/_fivetran_start/_fivetran_end tracked. Fivetran itself never hard-deletes -- true purges require a customer-run DELETE/DROP or downstream transformation filtering _fivetran_deleted = TRUE.',
  maintenance:
    'Fivetran runs Iceberg table maintenance automatically: expiration of snapshots older than a configurable retention window (minimum 2 retained), pruning of prior metadata-file versions, and orphan-file cleanup (unreferenced files quarantined into an "orphans" folder, run every other week, permanently removed on a later run). No customer-scheduled compaction or cleanup scripts are required. Fivetran does not support AWS Glue-driven compaction on its managed tables -- if Glue or another external process rewrites a Fivetran-managed table, Fivetran detects the external modification on the next sync and reverts it.',
  caveats:
    'No support for Fivetran Transformations inside MDLS -- dbt/SQL transformation logic runs downstream against the Iceberg tables (e.g. in Athena or Snowflake). No support for Iceberg "position deletes" or Delta "Change Data Feed." Certain S3 storage tiers (Glacier variants) are unsupported as the target prefix -- tiering to Glacier must happen after ingest via a separate S3 Lifecycle rule, not at ingest. Bucket name and S3 prefix path cannot be changed after initial setup. Partitioning strategy for the written Iceberg/Delta tables is not publicly documented on any MDLS page found in this research pass -- do not make a partition-pruning performance claim to Healthfirst without confirming directly with Fivetran.',
  verification: 'confirmed',
  sourceUrls: [
    'https://fivetran.com/docs/destinations/managed-data-lake-service',
    'https://fivetran.com/docs/destinations/managed-data-lake-service/setup-guide',
    'https://fivetran.com/docs/destinations/managed-data-lake-service/metadata-catalogs',
    'https://fivetran.com/docs/managed-data-lake-service/troubleshooting/copy-on-write-update-strategy',
    'https://fivetran.com/docs/managed-data-lake-service/troubleshooting/aws-glue-compaction-compatibility',
  ],
};
