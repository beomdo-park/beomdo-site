export const prerender = false;

import type { APIRoute } from 'astro';

interface GuestbookBody {
  name?: string;
  affiliation?: string;
  message?: string;
  website?: string; // honeypot
}

async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(`beomdo-gb:${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .slice(0, 12)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function ensureTable(db: D1Database) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS guestbook_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        affiliation TEXT,
        message TEXT NOT NULL,
        ip_hash TEXT,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
      )`
    )
    .run();
}

export const GET: APIRoute = async ({ locals }) => {
  const db = locals.runtime?.env?.DB;
  if (!db) {
    return new Response(JSON.stringify({ entries: [], error: 'D1 database binding not configured.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    await ensureTable(db);
    const { results } = await db
      .prepare(
        `SELECT id, name, affiliation, message, created_at
         FROM guestbook_entries
         ORDER BY id DESC
         LIMIT 50`
      )
      .all();

    return new Response(JSON.stringify({ entries: results ?? [] }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('Guestbook GET failed:', err);
    return new Response(JSON.stringify({ error: 'Failed to read guestbook entries.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  const db = locals.runtime?.env?.DB;
  if (!db) {
    return new Response(JSON.stringify({ error: 'D1 database binding not configured.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: GuestbookBody;
  try {
    body = (await request.json()) as GuestbookBody;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON request body.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Silently reject honeypot spam
  if (body.website && body.website.trim().length > 0) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const name = (body.name ?? '').trim().replace(/\s+/g, ' ');
  const affiliation = (body.affiliation ?? '').trim().replace(/\s+/g, ' ') || null;
  const message = (body.message ?? '').trim();

  if (name.length < 1 || name.length > 40) {
    return new Response(JSON.stringify({ error: 'Name must be between 1 and 40 characters.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (affiliation && affiliation.length > 60) {
    return new Response(JSON.stringify({ error: 'Affiliation must be 60 characters or fewer.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (message.length < 2 || message.length > 400) {
    return new Response(JSON.stringify({ error: 'Message must be between 2 and 400 characters.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    await ensureTable(db);
    const rawIp =
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      'unknown';
    const ipHash = await hashIp(rawIp);

    // Rate limit: max 1 post per 30 seconds per hashed IP
    const recent = await db
      .prepare(
        `SELECT id FROM guestbook_entries
         WHERE ip_hash = ? AND created_at > strftime('%Y-%m-%dT%H:%M:%SZ', 'now', '-30 seconds')
         LIMIT 1`
      )
      .bind(ipHash)
      .first();

    if (recent) {
      return new Response(JSON.stringify({ error: 'Please wait 30 seconds before posting another note.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const res = await db
      .prepare(
        `INSERT INTO guestbook_entries (name, affiliation, message, ip_hash)
         VALUES (?, ?, ?, ?)`
      )
      .bind(name, affiliation, message, ipHash)
      .run();

    return new Response(
      JSON.stringify({
        ok: true,
        entry: {
          id: res.meta.last_row_id,
          name,
          affiliation,
          message,
          created_at: new Date().toISOString(),
        },
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('Guestbook POST failed:', err);
    return new Response(JSON.stringify({ error: 'Failed to save guestbook entry.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
