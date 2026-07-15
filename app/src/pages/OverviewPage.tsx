import { FINDINGS, MDLS_DESTINATION, type Verification } from '../lib/findings';

const VERIFICATION_LABEL: Record<Verification, string> = {
  confirmed: 'Confirmed',
  inferred: 'Inferred',
  unverified: 'Not verified',
};

const VERIFICATION_CLASSES: Record<Verification, string> = {
  confirmed: 'bg-emerald-100 text-emerald-800',
  inferred: 'bg-amber-100 text-amber-800',
  unverified: 'bg-red-100 text-red-800',
};

export default function OverviewPage() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Healthfirst is one of New York's largest not-for-profit health insurers -- 2M+ members, 40,000+ providers,
          80+ participating hospitals -- evaluating Fivetran as the foundation for secure, reliable, fully managed
          data ingestion, readying its data estate for predictive analytics and Gen AI use cases. This demo tracks
          the three use cases in the Mutual Evaluation Plan: Salesforce (cloud application), Oracle Database
          (database), and S3/SharePoint (files) -- all landing in a single AWS S3 Managed Data Lake destination.
          Every figure below is sourced from Fivetran's docs; see the Sources and POC Criteria pages for links.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {FINDINGS.map((f) => (
          <article key={f.key} className="card flex flex-col p-5">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold text-navy-500">{f.system}</h2>
              <span className={`badge shrink-0 ${VERIFICATION_CLASSES[f.syncFrequencyVerification]}`}>
                {VERIFICATION_LABEL[f.syncFrequencyVerification]}
              </span>
            </div>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">{f.sourceRole}</p>

            <dl className="mt-4 space-y-3 text-sm">
              <div className="rounded-md bg-navy-50 p-3">
                <dt className="font-medium text-navy-700">Fastest sync frequency</dt>
                <dd className="mt-1 text-navy-900">
                  <span className="font-semibold text-orange-600">{f.fastestSyncFrequency}</span>
                </dd>
                <dd className="mt-1 text-xs text-slate-500">{f.syncFrequencyNote}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">Deletes</dt>
                <dd className="mt-0.5 text-slate-800">
                  {f.supportsDeletes ? 'Captured' : 'Not captured'}
                  {f.deletesNote ? <span className="mt-1 block text-xs text-slate-500">{f.deletesNote}</span> : null}
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </section>

      <section className="card p-5">
        <h2 className="text-lg font-semibold text-navy-500">Destination: {MDLS_DESTINATION.system}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-700">{MDLS_DESTINATION.writesFormat}</p>
        <p className="mt-2 text-sm leading-6 text-slate-700">{MDLS_DESTINATION.catalog}</p>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs">
          {MDLS_DESTINATION.sourceUrls.map((url) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-navy-500 underline underline-offset-2 hover:text-orange-600"
            >
              {url.replace('https://', '')}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
