import { useEffect, useMemo, useState } from 'react';
import type { Locale } from '../../data/i18n';

export interface BlogCardItem {
  id: string;
  title: string;
  description: string;
  pubDate: string;
  series?: string;
  seriesOrder?: number;
  categories: string[];
  tags: string[];
  readingMinutes: number;
  lang: 'ko' | 'en';
  thumbnail?: string;
}

interface Props {
  posts: BlogCardItem[];
  locale?: Locale;
}

export default function BlogFilter({ posts, locale = 'ko' }: Props) {
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get('series');
    if (s) setActiveFilter(`series:${s}`);
  }, []);

  const seriesCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of posts) {
      if (p.series) map.set(p.series, (map.get(p.series) ?? 0) + 1);
    }
    return Array.from(map.entries());
  }, [posts]);

  const topCategories = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of posts) {
      for (const c of p.categories) {
        if (['유클리드소프트', '고용노동부', '대한상공회의소', '미래내일일경험사업', 'ABC프로젝트멘토링'].includes(c)) {
          continue;
        }
        map.set(c, (map.get(c) ?? 0) + 1);
      }
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [posts]);

  const filtered = useMemo(() => {
    if (activeFilter === 'ALL') return posts;
    if (activeFilter.startsWith('series:')) {
      const s = activeFilter.slice(7);
      return posts
        .filter((p) => p.series === s)
        .sort((a, b) => (a.seriesOrder ?? 99) - (b.seriesOrder ?? 99));
    }
    if (activeFilter.startsWith('cat:')) {
      const c = activeFilter.slice(4);
      return posts.filter((p) => p.categories.includes(c));
    }
    return posts;
  }, [posts, activeFilter]);

  const allLabel = locale === 'ko' ? `전체 (${posts.length})` : `All (${posts.length})`;
  const seriesPrefix = locale === 'ko' ? '시리즈' : 'Series';
  const minRead = locale === 'ko' ? '분' : 'min';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => setActiveFilter('ALL')}
          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
            activeFilter === 'ALL'
              ? 'bg-[var(--text-primary)] text-[var(--bg-canvas)]'
              : 'border border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          {allLabel}
        </button>

        {seriesCounts.map(([name, count]) => {
          const key = `series:${name}`;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveFilter(key)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                activeFilter === key
                  ? 'bg-[var(--text-primary)] text-[var(--bg-canvas)]'
                  : 'border border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {seriesPrefix}: {name} ({count})
            </button>
          );
        })}

        {topCategories.map(([cat, count]) => {
          const key = `cat:${cat}`;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveFilter(key)}
              className={`rounded-md px-2.5 py-1 text-xs transition-colors cursor-pointer ${
                activeFilter === key
                  ? 'bg-[var(--bg-subtle)] font-semibold text-[var(--text-primary)] border border-[var(--border-strong)]'
                  : 'border border-[var(--border-hairline)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      <ul className="divide-y divide-[var(--border-hairline)] border-t border-[var(--border-hairline)]">
        {filtered.map((post) => {
          const fallbackCode = post.series
            ? `${post.series}${post.seriesOrder ? ` · #${post.seriesOrder}` : ''}`
            : post.categories[0] || 'NOTE';
          return (
            <li key={post.id} className="py-5">
              <a
                href={`/blog/${post.id}`}
                className="group flex items-start justify-between gap-4 sm:gap-6"
              >
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[var(--text-tertiary)]">
                    <time dateTime={post.pubDate} className="tabular-nums">
                      {post.pubDate}
                    </time>
                    <span>·</span>
                    <span>{post.readingMinutes} {minRead}</span>
                    {post.series && (
                      <span className="rounded bg-[var(--accent-primary-soft)] px-1.5 py-0.5 text-[11px] text-[var(--accent-primary)]">
                        {post.series}
                        {post.seriesOrder ? ` #${post.seriesOrder}` : ''}
                      </span>
                    )}
                  </div>

                  <h2 className="text-base sm:text-[17px] font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors leading-snug">
                    {post.title}
                  </h2>

                  {post.description && (
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-[66ch] line-clamp-2">
                      {post.description}
                    </p>
                  )}
                </div>

                {/* Compact Right-Hand Thumbnail (object-contain so scientific figures never crop) */}
                <div className="shrink-0 w-24 h-16 sm:w-44 sm:h-28 overflow-hidden rounded-lg border border-[var(--border-hairline)] group-hover:border-[var(--border-strong)] transition-colors">
                  {post.thumbnail ? (
                    <img
                      src={post.thumbnail}
                      alt={post.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-contain bg-white p-1.5"
                    />
                  ) : (
                    <div className="lab-grid-bg flex h-full w-full flex-col items-center justify-center bg-[var(--bg-subtle)] px-2 text-center">
                      <span className="font-mono text-[10px] sm:text-[11px] font-medium text-[var(--text-tertiary)]">
                        {fallbackCode}
                      </span>
                    </div>
                  )}
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
