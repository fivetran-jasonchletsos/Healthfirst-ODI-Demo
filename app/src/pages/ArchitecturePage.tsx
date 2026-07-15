import { LakehousePipeline, type SourceNode } from '../components/LakehousePipeline';
import { findingByKey } from '../lib/findings';

const TODAY = 'Manual, engineering-built pipeline';

const SOURCES: SourceNode[] = (['salesforce', 'oracle', 's3', 'sharepoint'] as const).map((key) => {
  const f = findingByKey(key);
  return {
    id: key,
    label: f.system,
    logo: key,
    today: TODAY,
    fivetranSyncLabel: f.fastestSyncFrequency.split('(')[0].trim(),
    syncConfidence: f.syncFrequencyVerification,
  };
});

const ROLES = [
  { label: 'Data Engineering', sub: 'pipeline ops' },
  { label: 'Actuarial & Analytics', sub: 'claims, enrollment' },
  { label: 'AI/ML & Data Science', sub: 'predictive models' },
  { label: 'Compliance & Governance', sub: 'PHI oversight' },
];

export default function ArchitecturePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Architecture</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Three source systems, one destination: Salesforce, Oracle Database, and S3/SharePoint land in a single
          AWS S3 Managed Data Lake -- one governed copy, read by every downstream engine.
        </p>
      </div>

      <div className="card p-6">
        <LakehousePipeline
          sources={SOURCES}
          bronze={{ tables: 6, rows: 18574 }}
          silver={{ tables: 6, rows: 18574 }}
          gold={{ tables: 4, rows: 14224 }}
          roles={ROLES}
          dbtProjectName="hf_pipeline"
          lakeAttribution="s3://healthfirst-odi-lake · Iceberg + Glue"
        />
      </div>
    </div>
  );
}
