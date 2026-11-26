import { useEffect, useState } from 'react';
import type { Locale } from '../../data/i18n';

interface Counts {
  today: number;
  total: number;
  date: string;
}

function getKstToday(): string {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

export default function VisitCounter({ locale = 'ko' }: { locale?: Locale }) {
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    let cancelled = false;
    const today = getKstToday();
    const key = `beomdo_visited_${today}`;
    const alreadyRecorded = localStorage.getItem(key) === '1';

    const run = async () => {
      try {
        const res = await fetch('/api/visits', {
          method: alreadyRecorded ? 'GET' : 'POST',
          headers: alreadyRecorded ? undefined : { 'Content-Type': 'application/json' },
        });
        if (!res.ok) return;
        const data = (await res.json()) as Counts;
        if (!alreadyRecorded) {
          localStorage.setItem(key, '1');
        }
        if (!cancelled && typeof data.today === 'number') {
          setCounts(data);
        }
      } catch {
        // Silently degrade if offline
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const tooltip =
    locale === 'ko'
      ? 'KST 기준 일일 고유 방문자 수 (새로고침·중복 방문·봇 제외)'
      : 'Daily unique visitors (KST, reload & bot deduplicated)';

  return (
    <div
      title={tooltip}
      aria-label={tooltip}
      className="inline-flex items-center gap-2 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-subtle)] px-2.5 py-1 font-mono text-[11px] tabular-nums text-[var(--text-secondary)]"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--signal-positive)]" aria-hidden="true" />
      <span>
        Today <strong className="font-semibold text-[var(--text-primary)]">{counts ? counts.today.toLocaleString() : '—'}</strong>
      </span>
      <span className="text-[var(--border-strong)]" aria-hidden="true">·</span>
      <span>
        Total <strong className="font-semibold text-[var(--text-primary)]">{counts ? counts.total.toLocaleString() : '—'}</strong>
      </span>
    </div>
  );
}
