import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="card p-8 text-center">
      <h1 className="text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 text-sm text-slate-600">
        <Link to="/" className="text-navy-500 underline underline-offset-2 hover:text-orange-600">
          Back to Overview
        </Link>
      </p>
    </div>
  );
}
