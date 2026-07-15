import { POC_CRITERIA, type CriteriaRow, type Layer } from '../lib/pocCriteria';
import type { Verification } from '../lib/findings';

const LAYER_LABEL: Record<Layer, string> = {
  fivetran: 'Fivetran',
  s3_lake_formation: 'S3 / Lake Formation',
  joint: 'Fivetran + Lake',
  not_applicable: 'N/A',
};

const LAYER_CLASSES: Record<Layer, string> = {
  fivetran: 'bg-navy-100 text-navy-700',
  s3_lake_formation: 'bg-orange-100 text-orange-800',
  joint: 'bg-slate-200 text-slate-700',
  not_applicable: 'bg-slate-100 text-slate-500',
};

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

function CriteriaRowCard({ row }: { row: CriteriaRow }) {
  return (
    <div className="border-t border-slate-100 py-4 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-sm font-semibold text-slate-800">{row.requirement}</p>
        <div className="flex shrink-0 flex-wrap gap-1.5">
          <span className={`badge ${LAYER_CLASSES[row.layer]}`}>{LAYER_LABEL[row.layer]}</span>
          <span className={`badge ${VERIFICATION_CLASSES[row.verification]}`}>{VERIFICATION_LABEL[row.verification]}</span>
        </div>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{row.fivetranAnswer}</p>
      {row.sourceUrls.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
          {row.sourceUrls.map((url) => (
            <a key={url} href={url} target="_blank" rel="noreferrer" className="text-navy-500 underline underline-offset-2 hover:text-orange-600">
              {url.replace('https://', '')}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function CategorySection({ category }: { category: (typeof POC_CRITERIA)[number] }) {
  return (
    <details className="card group p-5" open>
      <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
        <div>
          <span className="font-mono text-xs font-semibold text-orange-600">{category.id}</span>{' '}
          <span className="text-base font-semibold text-navy-500">{category.categoryName}</span>
          <p className="mt-1 text-xs text-slate-500">{category.description}</p>
        </div>
        <span className="badge bg-slate-100 text-slate-500">{category.rows.length} item{category.rows.length === 1 ? '' : 's'}</span>
      </summary>
      <div className="mt-3">
        {category.rows.map((row) => (
          <CriteriaRowCard key={row.requirement} row={row} />
        ))}
      </div>
    </details>
  );
}

export default function PocCriteriaPage() {
  const core = POC_CRITERIA.filter((c) => c.group === 'Core');
  const valueAdd = POC_CRITERIA.filter((c) => c.group === 'Value-Add');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">POC Success Criteria</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Healthfirst and Fivetran agreed these technical capabilities are the basis for evaluating the POC.
          Structured on the capability matrix (Core A.I-A.XIII, Value-Add B.I-B.V). Each requirement is graded on
          which layer actually owns the capability -- a Fivetran-native feature, an AWS S3 / Lake Formation
          capability Fivetran writes into but does not itself provide, or both jointly -- and labeled
          confirmed / inferred / not verified against Fivetran's real published documentation.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Core</h2>
        {core.map((category) => (
          <CategorySection key={category.id} category={category} />
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Value-Add</h2>
        {valueAdd.map((category) => (
          <CategorySection key={category.id} category={category} />
        ))}
      </section>
    </div>
  );
}
