import { useMemo, useState } from 'react';
import { Check, Copy, ExternalLink, Search } from 'lucide-react';
import type { Publication, ResearchTopic } from '../../data/publications';
import type { Locale } from '../../data/i18n';

interface Props {
  publications: Publication[];
  locale?: Locale;
}

const LABELS = {
  ko: {
    searchPlaceholder: '논문 제목, 학회(AAAI, IEEE, IEIE, KICS, KDD), 저자 검색...',
    firstOnly: '1저자만 보기',
    topics: {
      all: '전체 분야',
      'quantum-battery': '양자 배터리',
      qec: 'QEC · 하드웨어',
      'scientific-ml': '과학 ML · 산업 제어',
    },
    scopes: {
      all: '전체',
      international: '국제',
      domestic: '국내',
    },
    showing: (a: number, b: number) => `총 ${b}건 중 ${a}건 표시`,
    empty: '조건에 맞는 논문이나 특허가 없습니다.',
    entries: (n: number) => `${n}건`,
    copyBib: 'BibTeX 복사',
    copiedBib: '복사됨',
    inspectBib: 'BibTeX 보기',
    hideBib: '닫기',
    dbpia: 'DBpia',
  },
  en: {
    searchPlaceholder: 'Filter by title, venue (AAAI, IEEE, IEIE, KICS, KDD), or author...',
    firstOnly: '1st author only',
    topics: {
      all: 'All topics',
      'quantum-battery': 'Quantum Batteries',
      qec: 'QEC & Hardware',
      'scientific-ml': 'Scientific ML',
    },
    scopes: {
      all: 'All',
      international: 'International',
      domestic: 'Domestic',
    },
    showing: (a: number, b: number) => `Showing ${a} of ${b} entries`,
    empty: 'No entries match the current filters.',
    entries: (n: number) => `${n} entries`,
    copyBib: 'Copy BibTeX',
    copiedBib: 'Copied',
    inspectBib: 'View BibTeX',
    hideBib: 'Hide',
    dbpia: 'DBpia',
  },
} as const;

export default function PublicationList({ publications, locale = 'ko' }: Props) {
  const L = LABELS[locale];
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
        const hay = `${p.title} ${p.venueKo} ${p.venueEn} ${p.venueShort} ${p.authorsKo} ${p.authorsEn} ${p.year}`.toLowerCase();
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
      {/* Compact filter bar */}
      <div className="space-y-3 pb-4 border-b border-[var(--border-hairline)]">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={L.searchPlaceholder}
              className="w-full rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-subtle)] pl-9 pr-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-primary)] focus:outline-none"
            />
          </div>
          <label className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-subtle)]/50 px-3 py-2 text-xs font-medium text-[var(--text-secondary)] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={firstOnly}
              onChange={(e) => setFirstOnly(e.target.checked)}
              className="accent-[var(--accent-primary)]"
            />
            <span>{L.firstOnly}</span>
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {(['all', 'quantum-battery', 'qec', 'scientific-ml'] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setTopic(k)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  topic === k
                    ? 'bg-[var(--text-primary)] text-[var(--bg-canvas)]'
                    : 'border border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {L.topics[k]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 text-xs">
            {(['all', 'international', 'domestic'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setScope(s)}
                className={`rounded-md px-2.5 py-1 transition-colors cursor-pointer ${
                  scope === s
                    ? 'bg-[var(--bg-subtle)] font-semibold text-[var(--text-primary)] border border-[var(--border-strong)]'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {L.scopes[s]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="text-xs font-mono text-[var(--text-tertiary)]">
        {L.showing(filtered.length, publications.length)}
      </div>

      {filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-[var(--text-secondary)]">{L.empty}</p>
      ) : (
        <div className="space-y-9">
          {years.map((year) => {
            const group = filtered.filter((p) => p.year === year);
            return (
              <section key={year} className="space-y-2">
                <div className="flex items-baseline gap-3 border-b border-[var(--border-hairline)] pb-2">
                  <h2 className="font-mono text-base font-semibold tabular-nums text-[var(--text-primary)]">
                    {year}
                  </h2>
                  <span className="text-xs text-[var(--text-tertiary)]">{L.entries(group.length)}</span>
                </div>

                <ul className="divide-y divide-[var(--border-hairline)]">
                  {group.map((pub) => {
                    const primaryHref = pub.url || pub.dbpiaUrl;
                    const authors = locale === 'ko' ? pub.authorsKo : pub.authorsEn;
                    const venue = locale === 'ko' ? pub.venueKo : pub.venueEn;
                    const role = locale === 'ko' ? pub.roleKo : pub.roleEn;
                    const award = locale === 'ko' ? pub.awardKo : pub.awardEn;

                    return (
                      <li key={pub.id} className="py-4 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-1.5 text-xs">
                          <span className="font-mono font-semibold text-[var(--accent-primary)]">
                            {pub.venueShort}
                          </span>
                          {pub.indexing && (
                            <span className="rounded bg-[var(--bg-subtle)] border border-[var(--border-hairline)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--text-secondary)]">
                              {pub.indexing}
                            </span>
                          )}
                          <span
                            className={`text-[11px] ${
                              pub.isFirstAuthor
                                ? 'font-semibold text-[var(--signal-positive)]'
                                : 'text-[var(--text-tertiary)]'
                            }`}
                          >
                            {role}
                          </span>
                          {award && (
                            <span className="rounded bg-[var(--signal-warn)]/10 px-1.5 py-0.5 text-[11px] font-medium text-[var(--signal-warn)]">
                              {award}
                            </span>
                          )}
                        </div>

                        <h3 className="text-[15px] font-semibold leading-snug text-[var(--text-primary)]">
                          {primaryHref ? (
                            <a
                              href={primaryHref}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:text-[var(--accent-primary)] transition-colors"
                            >
                              {pub.title}
                            </a>
                          ) : (
                            pub.title
                          )}
                        </h3>

                        <p className="text-xs sm:text-sm text-[var(--text-secondary)]">{authors}</p>
                        <p className="text-xs text-[var(--text-tertiary)]">{venue}</p>

                        {/* Clean Academic Inline Artifact Pills */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                          {pub.dbpiaUrl && (
                            <a
                              href={pub.dbpiaUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded border border-[var(--accent-primary)]/40 bg-[var(--accent-primary-soft)] px-2 py-0.5 font-mono text-[11px] font-medium text-[var(--accent-primary)] hover:opacity-85 transition-opacity"
                            >
                              <span>{L.dbpia}</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          {pub.url && (
                            <a
                              href={pub.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded border border-[var(--border-strong)] bg-[var(--bg-surface)] px-2 py-0.5 font-mono text-[11px] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors"
                            >
                              <span>{pub.urlLabel || 'Paper'}</span>
                              <ExternalLink className="h-3 w-3 opacity-70" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => copyBib(pub)}
                            className="inline-flex items-center gap-1 rounded border border-[var(--border-hairline)] px-2 py-0.5 font-mono text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors cursor-pointer"
                          >
                            {copiedId === pub.id ? (
                              <>
                                <Check className="h-3 w-3 text-[var(--signal-positive)]" />
                                <span className="text-[var(--signal-positive)]">{L.copiedBib}</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>{L.copyBib}</span>
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setOpenBibId((cur) => (cur === pub.id ? null : pub.id))}
                            className="text-[11px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
                          >
                            {openBibId === pub.id ? L.hideBib : L.inspectBib}
                          </button>
                        </div>

                        {openBibId === pub.id && (
                          <pre className="mt-2 overflow-x-auto rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-subtle)] p-3 font-mono text-xs text-[var(--text-secondary)]">
                            {pub.bibtex}
                          </pre>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
