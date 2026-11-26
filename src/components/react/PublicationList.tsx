import { useMemo, useState } from 'react';
import { Check, Copy, ExternalLink, Search } from 'lucide-react';
import type { Publication, ResearchTopic } from '../../data/publications';

interface Props {
  publications: Publication[];
}

const TOPIC_LABELS: Record<'all' | ResearchTopic, string> = {
  all: 'All topics',
  'quantum-battery': 'Quantum Batteries',
  qec: 'QEC & Hardware',
  'scientific-ml': 'Scientific ML',
};

export default function PublicationList({ publications }: Props) {
  const [topic, setTopic] = useState<'all' | ResearchTopic>('all');
  const [scope, setScope] = useState<'all' | 'international' | 'domestic'>('all');
  const [firstOnly, setFirstOnly] = useState(false);
  const [query, setQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [openBibId, setOpenBibId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return publications.filter((p) => {
      if (topic !== 'all' && p.topic !== topic) return false;
      if (scope !== 'all' && p.scope !== scope) return false;
      if (firstOnly && !p.isFirstAuthor) return false;
      if (q) {
        const hay = `${p.title} ${p.venue} ${p.venueShort} ${p.authors} ${p.year}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [publications, topic, scope, firstOnly, query]);

  const years = useMemo(
    () => Array.from(new Set(filtered.map((p) => p.year))).sort((a, b) => b - a),
    [filtered]
  );

  const copyBib = async (pub: Publication) => {
    try {
      await navigator.clipboard.writeText(pub.bibtex);
      setCopiedId(pub.id);
      setTimeout(() => setCopiedId((prev) => (prev === pub.id ? null : prev)), 1800);
    } catch {
      setOpenBibId(pub.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 space-y-3.5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by title, venue (AAAI, IEEE, KDD, IEIE, KICS), or author..."
              className="w-full rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-subtle)]/60 pl-9 pr-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-primary)] focus:outline-none"
            />
          </div>
          <label className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-subtle)]/40 px-3 py-2 text-sm text-[var(--text-secondary)] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={firstOnly}
              onChange={(e) => setFirstOnly(e.target.checked)}
              className="accent-[var(--accent-primary)]"
            />
            <span>1st author only</span>
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(TOPIC_LABELS) as ('all' | ResearchTopic)[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setTopic(k)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  topic === k
                    ? 'bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] border border-[var(--accent-primary)]/40'
                    : 'border border-[var(--border-hairline)] bg-[var(--bg-subtle)]/40 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {TOPIC_LABELS[k]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            {(['all', 'international', 'domestic'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setScope(s)}
                className={`rounded-md px-2.5 py-1 capitalize transition-colors cursor-pointer ${
                  scope === s
                    ? 'bg-[var(--bg-subtle)] font-medium text-[var(--text-primary)] border border-[var(--border-strong)]'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="text-xs font-mono text-[var(--text-tertiary)]">
        Showing {filtered.length} of {publications.length} entries
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-8 text-center text-sm text-[var(--text-secondary)]">
          No entries match the current filters.
        </div>
      ) : (
        <div className="space-y-8">
          {years.map((year) => {
            const group = filtered.filter((p) => p.year === year);
            return (
              <section key={year} className="space-y-3">
                <div className="flex items-baseline gap-3 border-b border-[var(--border-hairline)] pb-2">
                  <h2 className="font-mono text-lg font-semibold tabular-nums text-[var(--text-primary)]">
                    {year}
                  </h2>
                  <span className="text-xs text-[var(--text-tertiary)]">{group.length} entries</span>
                </div>

                <ul className="divide-y divide-[var(--border-hairline)]">
                  {group.map((pub) => (
                    <li key={pub.id} className="py-4 first:pt-2 space-y-2">
                      <div className="flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="rounded border border-[var(--border-strong)] bg-[var(--bg-subtle)] px-2 py-0.5 font-mono font-medium text-[var(--text-primary)]">
                          {pub.venueShort}
                        </span>
                        {pub.indexing && (
                          <span className="rounded border border-[var(--accent-primary)]/40 bg-[var(--accent-primary-soft)] px-2 py-0.5 font-mono text-[var(--accent-primary)]">
                            {pub.indexing}
                          </span>
                        )}
                        {pub.isFirstAuthor && (
                          <span className="rounded border border-[var(--signal-positive)]/40 bg-[var(--signal-positive)]/10 px-2 py-0.5 font-medium text-[var(--signal-positive)]">
                            1st author
                          </span>
                        )}
                        {!pub.isFirstAuthor && (
                          <span className="text-[var(--text-tertiary)]">{pub.role}</span>
                        )}
                        {pub.award && (
                          <span className="rounded border border-[var(--signal-warn)]/40 bg-[var(--signal-warn)]/10 px-2 py-0.5 text-[var(--signal-warn)]">
                            {pub.award}
                          </span>
                        )}
                      </div>

                      <h3 className="text-[15px] font-semibold leading-snug text-[var(--text-primary)]">
                        {pub.url ? (
                          <a
                            href={pub.url}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-[var(--accent-primary)] transition-colors inline-flex items-baseline gap-1.5"
                          >
                            <span>{pub.title}</span>
                            <ExternalLink className="h-3.5 w-3.5 shrink-0 inline opacity-60" />
                          </a>
                        ) : (
                          pub.title
                        )}
                      </h3>

                      <p className="text-sm text-[var(--text-secondary)]">{pub.authors}</p>
                      <p className="text-xs text-[var(--text-tertiary)]">{pub.venue}</p>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => copyBib(pub)}
                          className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 py-1 text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors cursor-pointer"
                        >
                          {copiedId === pub.id ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-[var(--signal-positive)]" />
                              <span className="text-[var(--signal-positive)]">Copied BibTeX</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copy BibTeX</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setOpenBibId((cur) => (cur === pub.id ? null : pub.id))}
                          className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
                        >
                          {openBibId === pub.id ? 'Hide BibTeX' : 'Inspect BibTeX'}
                        </button>
                      </div>

                      {openBibId === pub.id && (
                        <pre className="mt-2 overflow-x-auto rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-subtle)] p-3 font-mono text-xs text-[var(--text-secondary)]">
                          {pub.bibtex}
                        </pre>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
