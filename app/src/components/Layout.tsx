import { NavLink, Outlet } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: 'Overview', end: true },
  { to: '/architecture', label: 'Architecture' },
  { to: '/sources', label: 'Sources' },
  { to: '/poc-criteria', label: 'POC Criteria' },
  { to: '/compliance', label: 'Compliance' },
  { to: '/dashboard', label: 'Dashboard' },
];

function navLinkClasses({ isActive }: { isActive: boolean }): string {
  return [
    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-orange-500 text-white' : 'text-navy-100 hover:bg-navy-700 hover:text-white',
  ].join(' ');
}

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="bg-navy-500">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded bg-white text-lg font-extrabold tracking-tight text-navy-500">
              H+
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-white">Fivetran ODI Demo</p>
              <p className="text-xs text-navy-200">Mutual evaluation, prepared for Healthfirst</p>
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={navLinkClasses}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-4 text-xs text-slate-500">
          Sales-engineering demo prepared for Healthfirst's Mutual Evaluation Plan (Salesforce, Oracle Database, and
          S3/SharePoint files landing in an AWS S3 Managed Data Lake). Every Fivetran capability claim is sourced from
          Fivetran's published documentation, and every AWS-lake-layer claim is labeled as such -- see the Source
          column on the Sources and POC Criteria pages for links.
        </div>
      </footer>
    </div>
  );
}
