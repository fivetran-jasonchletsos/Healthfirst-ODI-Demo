import { POC_CRITERIA, type CriteriaCategory, type Layer } from '../lib/pocCriteria';

const LAYER_LABEL: Record<Layer, string> = {
  fivetran: 'Fivetran',
  s3_lake_formation: 'AWS / Lake',
  joint: 'Both',
  not_applicable: 'N/A',
};

const LAYER_CLASSES: Record<Layer, string> = {
  fivetran: 'bg-navy-100 text-navy-700',
  s3_lake_formation: 'bg-orange-100 text-orange-800',
  joint: 'bg-slate-200 text-slate-700',
  not_applicable: 'bg-slate-100 text-slate-500',
};

function primaryLayer(category: CriteriaCategory): Layer {
  const layers = new Set(category.rows.map((r) => r.layer));
  if (layers.size === 1) return category.rows[0].layer;
  return 'joint';
}

const MAX_DOCS_SHOWN = 3;

function docsFor(category: CriteriaCategory): string[] {
  return Array.from(new Set(category.rows.flatMap((r) => r.sourceUrls)));
}

function docLabel(url: string): string {
  const path = url.replace(/^https?:\/\//, '').replace(/\/+$/, '');
  const segment = path.split('/').pop() ?? path;
  return segment.replace(/\.html?$/i, '').replace(/[-_]/g, ' ') || path;
}

function MatrixRow({ category }: { category: CriteriaCategory }) {
  const layer = primaryLayer(category);
  const docs = docsFor(category);
  const shown = docs.slice(0, MAX_DOCS_SHOWN);
  const remaining = docs.length - shown.length;
  return (
    <tr className="align-top odd:bg-white even:bg-slate-50">
      <td className="whitespace-nowrap px-3 py-3 font-mono text-xs font-semibold text-orange-600">{category.id}</td>
      <td className="px-3 py-3">
        <p className="text-sm font-semibold text-slate-800">{category.categoryName}</p>
        <p className="mt-0.5 text-xs text-slate-500">{category.description}</p>
      </td>
      <td className="px-3 py-3">
        <p className="text-sm leading-5 text-slate-700">{category.summary}</p>
        <span className={`badge mt-1.5 ${LAYER_CLASSES[layer]}`}>{LAYER_LABEL[layer]}</span>
      </td>
      <td className="px-3 py-3">
        <ul className="space-y-1">
          {shown.map((url) => (
            <li key={url}>
              <a href={url} target="_blank" rel="noreferrer" className="text-xs text-navy-500 underline underline-offset-2 hover:text-orange-600">
                {docLabel(url)}
              </a>
            </li>
          ))}
          {remaining > 0 && <li className="text-xs text-slate-400">+{remaining} more (see demo script)</li>}
        </ul>
      </td>
    </tr>
  );
}

function MatrixTable({ categories }: { categories: CriteriaCategory[] }) {
  return (
    <div className="card overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-navy-500 text-left text-xs font-semibold uppercase tracking-wide text-white">
          <tr>
            <th className="px-3 py-3">ID</th>
            <th className="px-3 py-3">Capability</th>
            <th className="px-3 py-3">Answer</th>
            <th className="px-3 py-3">Documentation</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {categories.map((c) => (
            <MatrixRow key={c.id} category={c} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PocCriteriaPage() {
  const core = POC_CRITERIA.filter((c) => c.group === 'Core');
  const valueAdd = POC_CRITERIA.filter((c) => c.group === 'Value-Add');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Capability Matrix</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Answers to Healthfirst's capability matrix (Core A.I-A.XIII, Value-Add B.I-B.V), each linked to Fivetran's
          real documentation. Layer badge shows who owns the capability -- Fivetran, AWS/Lake Formation, or both.
        </p>
      </div>

      <section>
        <h2 className="mb-2 text-base font-bold text-slate-900">Core</h2>
        <MatrixTable categories={core} />
      </section>

      <section>
        <h2 className="mb-2 text-base font-bold text-slate-900">Value-Add</h2>
        <MatrixTable categories={valueAdd} />
      </section>
    </div>
  );
}
