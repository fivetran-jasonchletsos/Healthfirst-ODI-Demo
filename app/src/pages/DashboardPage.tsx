import { useMemo, type ReactNode } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useJson } from '../lib/useJson';
import type { CampaignPerformanceRow, ClaimRow, DocumentInventoryRow, MemberCaseRow } from '../lib/types';

const CHART_COLORS = ['#0f4c9c', '#0ea894', '#3d7ed6', '#5fddc2', '#a4c4ed', '#94e9d6', '#08284f', '#08685c'];

function currency(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="card p-5">
      <h2 className="text-base font-semibold text-navy-500">{title}</h2>
      {subtitle ? <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p> : null}
      <div className="mt-4 h-72">{children}</div>
    </section>
  );
}

function StatusPanel({ status }: { status: 'loading' | 'error' }) {
  return (
    <div className="flex h-full items-center justify-center text-sm text-slate-400">
      {status === 'loading' ? 'Loading...' : 'Could not load data'}
    </div>
  );
}

export default function DashboardPage() {
  const claims = useJson<ClaimRow[]>('/data/fct_claims.json');
  const cases = useJson<MemberCaseRow[]>('/data/fct_member_cases.json');
  const campaigns = useJson<CampaignPerformanceRow[]>('/data/fct_campaign_performance.json');
  const documents = useJson<DocumentInventoryRow[]>('/data/fct_document_inventory.json');

  const claimAmountByPlan = useMemo(() => {
    if (claims.status !== 'ready') return [];
    const totals = new Map<string, { plan: string; amount: number }>();
    for (const row of claims.data) {
      const entry = totals.get(row.plan_type) ?? { plan: row.plan_type, amount: 0 };
      entry.amount += row.claim_amount;
      totals.set(row.plan_type, entry);
    }
    return Array.from(totals.values()).sort((a, b) => b.amount - a.amount);
  }, [claims]);

  const claimsByStatus = useMemo(() => {
    if (claims.status !== 'ready') return [];
    const totals = new Map<string, number>();
    for (const row of claims.data) {
      totals.set(row.status, (totals.get(row.status) ?? 0) + 1);
    }
    return Array.from(totals.entries()).map(([status, count]) => ({ status, count }));
  }, [claims]);

  const casesByType = useMemo(() => {
    if (cases.status !== 'ready') return [];
    const totals = new Map<string, number>();
    for (const row of cases.data) {
      totals.set(row.case_type, (totals.get(row.case_type) ?? 0) + 1);
    }
    return Array.from(totals.entries())
      .map(([caseType, count]) => ({ caseType, count }))
      .sort((a, b) => b.count - a.count);
  }, [cases]);

  const documentsByClassification = useMemo(() => {
    if (documents.status !== 'ready') return [];
    const totals = new Map<string, number>();
    for (const row of documents.data) {
      totals.set(row.classification, (totals.get(row.classification) ?? 0) + 1);
    }
    return Array.from(totals.entries()).map(([classification, count]) => ({ classification, count }));
  }, [documents]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Built from four dbt marts (fct_claims, fct_member_cases, fct_campaign_performance,
          fct_document_inventory) over synthetic Healthfirst-style data, exported as static JSON snapshots. In
          production these would refresh on each Fivetran sync + dbt run against the AWS S3 Managed Data Lake,
          instead of being a point-in-time file. Campaign volume is shown separately below the charts.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Claim amount by plan type" subtitle="Oracle Database claims, summed by plan_type">
          {claimAmountByPlan.length === 0 ? (
            <StatusPanel status={claims.status === 'error' ? 'error' : 'loading'} />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={claimAmountByPlan} layout="vertical" margin={{ left: 24, right: 16, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e6ef" horizontal={false} />
                <XAxis type="number" tickFormatter={(v: number) => currency(v)} fontSize={11} />
                <YAxis type="category" dataKey="plan" width={140} fontSize={11} />
                <Tooltip formatter={(v: number) => currency(v)} />
                <Bar dataKey="amount" fill="#0f4c9c" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Claims by status" subtitle="Claim count by status">
          {claimsByStatus.length === 0 ? (
            <StatusPanel status={claims.status === 'error' ? 'error' : 'loading'} />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={claimsByStatus} dataKey="count" nameKey="status" outerRadius={90} label>
                  {claimsByStatus.map((entry, i) => (
                    <Cell key={entry.status} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Salesforce member-service case volume by type"
          subtitle="Case count by case_type"
        >
          {casesByType.length === 0 ? (
            <StatusPanel status={cases.status === 'error' ? 'error' : 'loading'} />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={casesByType} margin={{ left: 8, right: 16, top: 8, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e6ef" vertical={false} />
                <XAxis dataKey="caseType" fontSize={10} angle={-25} textAnchor="end" interval={0} height={80} />
                <YAxis fontSize={11} width={40} />
                <Tooltip />
                <Bar dataKey="count" fill="#0ea894" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Documents landed from S3/SharePoint, by classification"
          subtitle="EOBs, prior-auth forms, credentialing packets, grievance correspondence -- PHI vs. Internal"
        >
          {documentsByClassification.length === 0 ? (
            <StatusPanel status={documents.status === 'error' ? 'error' : 'loading'} />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={documentsByClassification} dataKey="count" nameKey="classification" outerRadius={90} label>
                  {documentsByClassification.map((entry, i) => (
                    <Cell key={entry.classification} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <section className="card p-5">
        <h2 className="text-base font-semibold text-navy-500">Member outreach campaign performance</h2>
        <p className="mt-0.5 text-xs text-slate-500">Salesforce campaigns, response rate by audience size</p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Campaign</th>
                <th className="px-3 py-2">Audience</th>
                <th className="px-3 py-2">Response rate</th>
                <th className="px-3 py-2">Sent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campaigns.status === 'ready' &&
                campaigns.data
                  .slice()
                  .sort((a, b) => b.response_rate_pct - a.response_rate_pct)
                  .map((c) => (
                    <tr key={c.campaign_id} className="odd:bg-white even:bg-slate-50">
                      <td className="px-3 py-2 font-medium text-slate-800">{c.campaign_name}</td>
                      <td className="px-3 py-2 text-slate-600">{c.audience_size.toLocaleString('en-US')}</td>
                      <td className="px-3 py-2 font-semibold text-orange-600">{c.response_rate_pct}%</td>
                      <td className="px-3 py-2 text-slate-500">{c.sent_date}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
