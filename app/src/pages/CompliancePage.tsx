import { CERTIFICATION_ITEMS, HIPAA_ITEMS, SECURITY_FEATURE_ITEMS, type ComplianceItem } from '../lib/compliance';
import type { Verification } from '../lib/findings';

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

function ComplianceCard({ title, items }: { title: string; items: ComplianceItem[] }) {
  return (
    <div className="card p-5">
      <h2 className="text-lg font-semibold text-navy-500">{title}</h2>
      <dl className="mt-4 space-y-4">
        {items.map((item) => (
          <div key={item.label} className="border-t border-slate-100 pt-4 first:border-t-0 first:pt-0">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <dt className="text-sm font-semibold text-slate-800">{item.label}</dt>
              <span className={`badge shrink-0 ${VERIFICATION_CLASSES[item.verification]}`}>{VERIFICATION_LABEL[item.verification]}</span>
            </div>
            <dd className="mt-1 text-sm leading-6 text-slate-600">{item.detail}</dd>
            <dd className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
              {item.sourceUrls.map((url) => (
                <a key={url} href={url} target="_blank" rel="noreferrer" className="text-navy-500 underline underline-offset-2 hover:text-orange-600">
                  {url.replace('https://', '')}
                </a>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default function CompliancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Compliance</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Healthfirst is a health insurer handling Protected Health Information (PHI) -- HIPAA is the claim most
          likely to be scrutinized in this evaluation, so it leads. Fivetran's own documentation is explicit that
          HIPAA compliance is a shared responsibility: a signed BAA and HITRUST certification are necessary but not
          sufficient -- Healthfirst still owns configuration-level controls (PHI classification, minimum-necessary
          access, non-production data hygiene, column hashing/blocking where appropriate).
        </p>
      </div>

      <ComplianceCard title="HIPAA" items={HIPAA_ITEMS} />

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <ComplianceCard title="Certifications & attestations" items={CERTIFICATION_ITEMS} />
        <ComplianceCard title="Security features" items={SECURITY_FEATURE_ITEMS} />
      </section>
    </div>
  );
}
