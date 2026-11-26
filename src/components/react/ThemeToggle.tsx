import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';

type ThemePref = 'system' | 'light' | 'dark';

function applyTheme(pref: ThemePref) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = pref === 'dark' || (pref === 'system' && prefersDark);
  document.documentElement.classList.toggle('dark', isDark);
}

export default function ThemeToggle() {
  const [pref, setPref] = useState<ThemePref>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('theme_pref');
    const initial: ThemePref = stored === 'light' || stored === 'dark' ? stored : 'system';
    setPref(initial);
    applyTheme(initial);

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onSystemChange = () => {
      const current = localStorage.getItem('theme_pref') || 'system';
      if (current === 'system') applyTheme('system');
    };
    media.addEventListener('change', onSystemChange);
    return () => media.removeEventListener('change', onSystemChange);
  }, []);

  const cycle = () => {
    const order: ThemePref[] = ['system', 'light', 'dark'];
    const next = order[(order.indexOf(pref) + 1) % order.length];
    setPref(next);
    if (next === 'system') {
      localStorage.removeItem('theme_pref');
    } else {
      localStorage.setItem('theme_pref', next);
    }
    applyTheme(next);
  };

  const label =
    pref === 'system'
      ? 'Theme: System (click for Light)'
      : pref === 'light'
        ? 'Theme: Light (click for Dark)'
        : 'Theme: Dark (click for System)';

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={label}
      title={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors cursor-pointer"
    >
      {mounted ? (
        pref === 'system' ? (
          <Monitor className="h-3.5 w-3.5" />
        ) : pref === 'light' ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )
      ) : (
        <span className="h-4 w-4" />
      )}
    </button>
  );
}
