import { FINDINGS, MDLS_DESTINATION } from '../lib/findings';

function labelForSourceUrl(url: string): string {
  const match = url.match(/\/connectors\/(applications|databases|files)\/([^/]+)/);
  if (match) {
    const slug = match[2].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return `${slug} connector docs`;
  }
  if (url.includes('/destinations/managed-data-lake-service') || url.includes('/managed-data-lake-service')) return 'MDLS destination docs';
  return url.replace('https://', '');
}

export default function SourcesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Sources</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          The three Mutual Evaluation Plan use cases: Cloud Application Ingestion (Salesforce), Database data
          Ingestion (Oracle Database), and File data Ingestion (S3 / SharePoint). Every cell traces back to
          Fivetran's published documentation -- follow the Source links to the underlying doc page.
        </p>
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-navy-500 text-left text-xs font-semibold uppercase tracking-wide text-white">
            <tr>
              <th className="px-4 py-3">System</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Sync method</th>
              <th className="px-4 py-3">I / U / D</th>
              <th className="px-4 py-3">Fastest sync</th>
              <th className="px-4 py-3">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {FINDINGS.map((f) => (
              <tr key={f.key} className="align-top odd:bg-white even:bg-slate-50">
                <td className="px-4 py-3 font-semibold text-navy-600">
                  {f.system}
                  <div className="mt-1 font-mono text-xs font-normal text-slate-400">service: {f.serviceIdentifier}</div>
                  {f.serviceIdentifierNote && <div className="mt-1 text-xs text-slate-400">{f.serviceIdentifierNote}</div>}
                </td>
                <td className="px-4 py-3 text-slate-700">{f.sourceRole}</td>
                <td className="px-4 py-3 text-slate-700">{f.syncMethod}</td>
                <td className="px-4 py-3 text-slate-700">
                  <span className={f.supportsInserts ? 'text-emerald-700' : 'text-red-600'}>I</span>{' '}
                  <span className={f.supportsUpdates ? 'text-emerald-700' : 'text-red-600'}>U</span>{' '}
                  <span className={f.supportsDeletes ? 'text-emerald-700' : 'text-red-600'}>D</span>
                  {f.deletesNote && <p className="mt-1 text-xs text-slate-500">{f.deletesNote}</p>}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  <span className="font-semibold text-orange-600">{f.fastestSyncFrequency}</span>
                  <p className="mt-1 text-xs text-slate-500">{f.syncFrequencyNote}</p>
                </td>
                <td className="px-4 py-3">
                  <ul className="space-y-1">
                    {f.sourceUrls.map((url) => (
                      <li key={url}>
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-navy-500 underline underline-offset-2 hover:text-orange-600"
                        >
                          {labelForSourceUrl(url)}
                        </a>
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card p-5">
        <h2 className="text-lg font-semibold text-navy-500">Destination: {MDLS_DESTINATION.system}</h2>
        <dl className="mt-4 space-y-4 text-sm">
          <div>
            <dt className="font-semibold text-slate-800">Update strategy</dt>
            <dd className="mt-1 leading-6 text-slate-600">{MDLS_DESTINATION.updateStrategy}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-800">Sync modes</dt>
            <dd className="mt-1 leading-6 text-slate-600">{MDLS_DESTINATION.syncModes}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-800">Table maintenance</dt>
            <dd className="mt-1 leading-6 text-slate-600">{MDLS_DESTINATION.maintenance}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-800">Caveats to confirm with Fivetran before the POC</dt>
            <dd className="mt-1 leading-6 text-slate-600">{MDLS_DESTINATION.caveats}</dd>
          </div>
        </dl>
        <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-xs">
          {MDLS_DESTINATION.sourceUrls.map((url) => (
            <a key={url} href={url} target="_blank" rel="noreferrer" className="text-navy-500 underline underline-offset-2 hover:text-orange-600">
              {url.replace('https://', '')}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
