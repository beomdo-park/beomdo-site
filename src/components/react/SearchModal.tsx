import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { Locale } from '../../data/i18n';

interface PagefindResult {
  id: string;
  data: () => Promise<{ url: string; excerpt: string; meta?: { title?: string } }>;
}

interface PagefindInstance {
  search: (query: string) => Promise<{ results: PagefindResult[] }>;
}

interface SearchHit {
  url: string;
  title: string;
  excerpt: string;
}

export default function SearchModal({ locale = 'ko' }: { locale?: Locale }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'unavailable' | 'done'>('idle');
  const pagefindRef = useRef<PagefindInstance | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => inputRef.current?.focus(), 20);
    if (!pagefindRef.current) {
      const pfPath = '/pagefind/pagefind.js';
      import(/* @vite-ignore */ pfPath)
        .then((mod) => {
          pagefindRef.current = mod as PagefindInstance;
        })
        .catch(() => setStatus('unavailable'));
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const trimmed = query.trim();
    if (!trimmed) {
      setHits([]);
      setStatus(pagefindRef.current ? 'idle' : status);
      return;
    }
    if (!pagefindRef.current) return;

    let cancelled = false;
    setStatus('loading');
    const timer = setTimeout(async () => {
      try {
        const res = await pagefindRef.current!.search(trimmed);
        const top = await Promise.all(
          res.results.slice(0, 8).map(async (r) => {
            const d = await r.data();
            return { url: d.url, title: d.meta?.title || d.url, excerpt: d.excerpt };
          })
        );
        if (!cancelled) {
          setHits(top);
          setStatus('done');
        }
      } catch {
        if (!cancelled) setStatus('unavailable');
      }
    }, 120);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, open]);

  const isKo = locale === 'ko';

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={isKo ? '사이트 검색' : 'Search site'}
        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors cursor-pointer"
      >
        <Search className="h-3.5 w-3.5" />
        <kbd className="hidden sm:inline font-mono text-[10px] text-[var(--text-tertiary)]">Ctrl K</kbd>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={isKo ? '사이트 검색' : 'Search site'}
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-xs p-4 pt-[12vh]"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-xl overflow-hidden rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-2xl">
            <div className="flex items-center gap-2.5 border-b border-[var(--border-hairline)] px-4 py-3">
              <Search className="h-4 w-4 text-[var(--text-tertiary)] shrink-0" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isKo ? '논문, 프로젝트, 블로그 글 검색 (QEnvS, ROQET, 양자 배터리...)' : 'Search papers, projects, posts (QEnvS, ROQET, QEC...)'}
                className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close search"
                className="rounded p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[55vh] overflow-y-auto p-2">
              {status === 'unavailable' && (
                <p className="px-3 py-6 text-center text-xs text-[var(--text-tertiary)]">
                  {isKo ? '검색 인덱스는 프로덕션 빌드 후 활성화됩니다.' : 'Search index is available after production build.'}
                </p>
              )}
              {status === 'idle' && !query && (
                <div className="px-3 py-4 text-xs text-[var(--text-tertiary)] space-y-2">
                  <p>{isKo ? '추천 검색어:' : 'Suggested:'}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['QEnvS', 'ROQET', '양자 배터리', 'INT8 PTQ', 'AAAI', 'DBpia'].map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => setQuery(term)}
                        className="rounded border border-[var(--border-hairline)] bg-[var(--bg-subtle)] px-2 py-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {status === 'loading' && (
                <p className="px-3 py-6 text-center text-xs text-[var(--text-tertiary)]">
                  {isKo ? '검색 중…' : 'Searching…'}
                </p>
              )}
              {status === 'done' && hits.length === 0 && (
                <p className="px-3 py-6 text-center text-xs text-[var(--text-tertiary)]">
                  {isKo ? `“${query}”에 대한 검색 결과가 없습니다.` : `No matches for “${query}”.`}
                </p>
              )}
              {hits.length > 0 && (
                <ul className="divide-y divide-[var(--border-hairline)]">
                  {hits.map((hit) => (
                    <li key={hit.url}>
                      <a
                        href={hit.url}
                        onClick={() => setOpen(false)}
                        className="block rounded-md px-3 py-2.5 hover:bg-[var(--bg-subtle)] transition-colors"
                      >
                        <div className="text-sm font-medium text-[var(--text-primary)]">{hit.title}</div>
                        <div
                          className="mt-1 text-xs text-[var(--text-secondary)] line-clamp-2 [&_mark]:bg-[var(--accent-primary-soft)] [&_mark]:text-[var(--accent-primary)] [&_mark]:px-0.5 [&_mark]:rounded"
                          dangerouslySetInnerHTML={{ __html: hit.excerpt }}
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
