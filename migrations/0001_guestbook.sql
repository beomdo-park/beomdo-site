CREATE TABLE IF NOT EXISTS guestbook_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  affiliation TEXT,
  message TEXT NOT NULL,
  ip_hash TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_guestbook_created_at ON guestbook_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_guestbook_ip_hash ON guestbook_entries(ip_hash, created_at);

INSERT INTO guestbook_entries (name, affiliation, message, ip_hash)
SELECT
  'Beomdo Park',
  'Eco AI Lab, HBNU',
  'Welcome to the new Cloudflare Workers + Astro portal! Feel free to leave a note or ask about QEnvS, ROQET, or quantum control research.',
  'seed'
WHERE NOT EXISTS (SELECT 1 FROM guestbook_entries LIMIT 1);
