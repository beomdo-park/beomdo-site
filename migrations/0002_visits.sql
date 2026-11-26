DROP TABLE IF EXISTS guestbook_entries;

CREATE TABLE IF NOT EXISTS daily_unique_visitors (
  visit_date TEXT NOT NULL,
  visitor_hash TEXT NOT NULL,
  first_seen_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  PRIMARY KEY (visit_date, visitor_hash)
);

CREATE INDEX IF NOT EXISTS idx_daily_visitors_date ON daily_unique_visitors(visit_date);
