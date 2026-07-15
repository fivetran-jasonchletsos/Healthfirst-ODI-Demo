import { FINDINGS } from '../lib/findings';

const SOURCE_ICON: Record<string, string> = {
  salesforce: 'SFDC',
  oracle: 'ORCL',
  s3: 'S3',
  sharepoint: 'SPO',
};

export function LakehouseArchitecture() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.5fr_1fr]">
      {/* SOURCES */}
      <div className="space-y-3">
        <p className="text-center text-xs font-semibold uppercase tracking-wide text-slate-400">Sources</p>
        {FINDINGS.map((f) => (
          <div key={f.key} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-12 items-center justify-center rounded bg-navy-500 text-[10px] font-bold tracking-wide text-white">
                {SOURCE_ICON[f.key]}
              </span>
              <span className="text-sm font-semibold text-slate-800">{f.system}</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">{f.sourceRole}</p>
          </div>
        ))}
        <p className="text-center text-xs text-slate-400">CDC + polling + file-pattern sync via Fivetran</p>
      </div>

      {/* LAKEHOUSE */}
      <div className="flex flex-col items-center">
        <div className="mb-2 rounded-full bg-navy-500 px-4 py-1 text-xs font-semibold text-white">Fivetran</div>
        <div className="h-6 w-px bg-slate-300" />
        <div className="w-full rounded-lg border-2 border-navy-500 bg-navy-50 p-4">
          <div className="mb-3 text-center">
            <p className="text-sm font-bold text-navy-700">AWS S3 Managed Data Lake</p>
            <p className="text-xs text-slate-500">Apache Iceberg tables &middot; AWS Glue Data Catalog</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
            <div className="rounded bg-amber-700/90 py-3 text-white">Bronze</div>
            <div className="rounded bg-slate-400 py-3 text-white">Silver</div>
            <div className="rounded bg-yellow-500 py-3 text-white">Gold</div>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center text-[10px] text-slate-500">
            <span>raw, as-landed</span>
            <span>validated &middot; GX Core</span>
            <span>modeled &middot; dbt Wizard</span>
          </div>
        </div>
        <p className="mt-2 text-center text-xs text-slate-400">
          Copy-on-Write &middot; soft-delete / History Mode &middot; automated snapshot &amp; orphan-file maintenance
        </p>
      </div>

      {/* CONSUMPTION */}
      <div className="space-y-3">
        <p className="text-center text-xs font-semibold uppercase tracking-wide text-slate-400">Consumption</p>
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex flex-wrap gap-1.5">
            {['Athena', 'Snowflake', 'Redshift', 'EMR'].map((engine) => (
              <span key={engine} className="badge bg-slate-100 text-slate-600">
                {engine}
              </span>
            ))}
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500">All read the same Iceberg tables via Glue -- no copies, no per-tool rebuilds.</p>
        </div>
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
          <p className="text-xs font-semibold text-orange-800">Governed delivery</p>
          <p className="mt-1 text-xs leading-5 text-orange-900">HIPAA BAA &middot; HITRUST i1 &middot; SOC 1/2 &middot; ISO 27001</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Data Engineering', sub: 'pipeline ops' },
            { label: 'Actuarial & Analytics', sub: 'claims, enrollment' },
            { label: 'AI/ML & Data Science', sub: 'predictive models' },
            { label: 'Compliance & Governance', sub: 'PHI oversight' },
          ].map((role) => (
            <div key={role.label} className="rounded-md bg-slate-100 p-2 text-center">
              <p className="text-[11px] font-semibold text-slate-700">{role.label}</p>
              <p className="text-[10px] text-slate-500">{role.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
