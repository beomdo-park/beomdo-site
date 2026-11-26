export const prerender = false;

import type { APIRoute } from 'astro';

const BOT_PATTERN =
  /bot|crawl|spider|slurp|mediapartners|headless|lighthouse|pagespeed|curl|wget|python-urllib|python-requests|go-http-client|facebookexternalhit|twitterbot|slackbot|discordbot|kakaotalk-scrap|yeti|bingpreview|uptime|pingdom|datadog/i;

function getKstDateString(now = new Date()): string {
  // UTC+9 (Korea Standard Time)
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

async function computeVisitorHash(dateStr: string, ip: string, ua: string): Promise<string> {
  // Normalize UA lightly to family + OS level so minor header quirks stay stable
  const normalizedUa = ua.toLowerCase().slice(0, 120);
  const data = new TextEncoder().encode(`beomdo-uv-v1:${dateStr}:${ip}:${normalizedUa}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .slice(0, 12)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function ensureTable(db: D1Database) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS daily_unique_visitors (
        visit_date TEXT NOT NULL,
        visitor_hash TEXT NOT NULL,
        first_seen_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
        PRIMARY KEY (visit_date, visitor_hash)
      )`
    )
    .run();
}

async function readCounts(db: D1Database, today: string) {
  const row = await db
    .prepare(
      `SELECT
        (SELECT COUNT(*) FROM daily_unique_visitors WHERE visit_date = ?) AS today,
        (SELECT COUNT(*) FROM daily_unique_visitors) AS total`
    )
    .bind(today)
    .first<{ today: number; total: number }>();

  return {
    today: Number(row?.today ?? 0),
    total: Number(row?.total ?? 0),
    date: today,
  };
}

export const GET: APIRoute = async ({ locals }) => {
  const db = locals.runtime?.env?.DB;
  const today = getKstDateString();

  if (!db) {
    return new Response(JSON.stringify({ today: 0, total: 0, date: today }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }

  try {
    await ensureTable(db);
    const counts = await readCounts(db, today);
    return new Response(JSON.stringify(counts), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=15',
      },
    });
  } catch (err) {
    console.error('Visits GET failed:', err);
    return new Response(JSON.stringify({ today: 0, total: 0, date: today }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  const db = locals.runtime?.env?.DB;
  const today = getKstDateString();

  if (!db) {
    return new Response(JSON.stringify({ today: 0, total: 0, date: today, counted: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }

  try {
    await ensureTable(db);

    const ua = request.headers.get('user-agent') || '';
    const isBot = !ua || BOT_PATTERN.test(ua);
    let counted = false;

    if (!isBot) {
      const ip =
        request.headers.get('cf-connecting-ip') ||
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        'unknown';
      const hash = await computeVisitorHash(today, ip, ua);
      const res = await db
        .prepare(`INSERT OR IGNORE INTO daily_unique_visitors (visit_date, visitor_hash) VALUES (?, ?)`)
        .bind(today, hash)
        .run();
      counted = (res.meta.changes ?? 0) > 0;
    }

    const counts = await readCounts(db, today);
    return new Response(JSON.stringify({ ...counts, counted }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('Visits POST failed:', err);
    return new Response(JSON.stringify({ today: 0, total: 0, date: today, counted: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }
};
