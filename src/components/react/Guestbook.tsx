import { useEffect, useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';

interface Entry {
  id: number;
  name: string;
  affiliation: string | null;
  message: string;
  created_at: string;
}

export default function Guestbook() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [affiliation, setAffiliation] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchEntries = async () => {
    try {
      setError(null);
      const res = await fetch('/api/guestbook');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { entries: Entry[] };
      setEntries(data.entries ?? []);
    } catch {
      setError('Could not load guestbook entries right now. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    setError(null);

    if (name.trim().length < 1 || message.trim().length < 2) {
      setError('Please enter your name and a message (at least 2 characters).');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          affiliation: affiliation.trim() || undefined,
          message: message.trim(),
          website,
        }),
      });
      const payload = (await res.json()) as { error?: string; entry?: Entry };
      if (!res.ok) {
        setError(payload.error || 'Could not save your note.');
      } else {
        setName('');
        setAffiliation('');
        setMessage('');
        setNotice('Posted to the Cloudflare D1 guestbook.');
        await fetchEntries();
      }
    } catch {
      setError('Network error while posting. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 space-y-4"
      >
        <div>
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Leave a note</h2>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Stored directly in Cloudflare D1 at the edge. Research inquiries, feedback on QEnvS/ROQET, or a quick hello are all welcome.
          </p>
        </div>

        {/* Honeypot field hidden from real users */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="gb-website">Website</label>
          <input
            id="gb-website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="gb-name" className="block text-xs font-medium text-[var(--text-secondary)]">
            Name *
          </label>
          <input
            id="gb-name"
            type="text"
            required
            maxLength={40}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name or handle"
            className="w-full rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-subtle)]/60 px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-primary)] focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="gb-aff" className="block text-xs font-medium text-[var(--text-secondary)]">
            Affiliation / Role (optional)
          </label>
          <input
            id="gb-aff"
            type="text"
            maxLength={60}
            value={affiliation}
            onChange={(e) => setAffiliation(e.target.value)}
            placeholder="Lab, university, or company"
            className="w-full rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-subtle)]/60 px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-primary)] focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between">
            <label htmlFor="gb-msg" className="block text-xs font-medium text-[var(--text-secondary)]">
              Message *
            </label>
            <span className="font-mono text-[11px] text-[var(--text-tertiary)]">{message.length}/400</span>
          </div>
          <textarea
            id="gb-msg"
            required
            rows={4}
            maxLength={400}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write a message in English or Korean..."
            className="w-full rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-subtle)]/60 px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-primary)] focus:outline-none resize-y"
          />
        </div>

        {error && (
          <p role="alert" className="rounded-md border border-[var(--signal-negative)]/40 bg-[var(--signal-negative)]/10 px-3 py-2 text-xs text-[var(--signal-negative)]">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="rounded-md border border-[var(--signal-positive)]/40 bg-[var(--signal-positive)]/10 px-3 py-2 text-xs text-[var(--signal-positive)]">
            {notice}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent-primary)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
        >
          <Send className="h-4 w-4" />
          <span>{submitting ? 'Posting…' : 'Post note'}</span>
        </button>
      </form>

      {/* Entries feed */}
      <div className="lg:col-span-7 space-y-3">
        <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-2">
          <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
            <MessageSquare className="h-4 w-4 text-[var(--accent-primary)]" />
            <span>Recent notes</span>
          </div>
          <span className="font-mono text-xs text-[var(--text-tertiary)]">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        {loading ? (
          <div className="py-10 text-center text-sm text-[var(--text-tertiary)]">Loading entries…</div>
        ) : entries.length === 0 ? (
          <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-8 text-center text-sm text-[var(--text-secondary)]">
            No notes yet. Be the first to sign the guestbook.
          </div>
        ) : (
          <ul className="space-y-3">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 space-y-2"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{entry.name}</span>
                    {entry.affiliation && (
                      <span className="text-xs text-[var(--text-tertiary)]">{entry.affiliation}</span>
                    )}
                  </div>
                  <time className="font-mono text-[11px] text-[var(--text-tertiary)] tabular-nums">
                    {new Date(entry.created_at).toLocaleDateString('en-CA')}
                  </time>
                </div>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)] whitespace-pre-wrap break-words">
                  {entry.message}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
