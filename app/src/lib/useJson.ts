import { useEffect, useState } from 'react';

export type FetchState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'ready'; data: T };

/** Fetches a static JSON snapshot from public/data/*.json. */
export function useJson<T>(path: string): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });

    const base = import.meta.env.BASE_URL.replace(/\/$/, '');
    const resolvedPath = path.startsWith('/') ? `${base}${path}` : path;

    fetch(resolvedPath)
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((data: T) => {
        if (!cancelled) setState({ status: 'ready', data });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({ status: 'error', error: err instanceof Error ? err.message : String(err) });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [path]);

  return state;
}
