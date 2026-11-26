import { useMemo, useState } from 'react';

function integrateQubit(omega: number, gamma1: number, gammaPhi: number) {
  // Exact RK4 integration of 2-level Bloch-Lindblad equations:
  // H = (omega / 2) * sigma_x, jump ops: sqrt(gamma1) sigma_-, sqrt(gammaPhi/2) sigma_z
  const steps = 120;
  const tMax = 4.0;
  const dt = tMax / steps;
  const g2 = gamma1 / 2 + gammaPhi;

  let y = 0;
  let z = -1; // |0> ground state -> z = -1, P(|1>) = (1 + z)/2
  const pts: { t: number; p1: number; erg: number }[] = [];

  const deriv = (yy: number, zz: number): [number, number] => [
    -omega * zz - g2 * yy,
    omega * yy - gamma1 * (zz + 1),
  ];

  for (let i = 0; i <= steps; i++) {
    const t = i * dt;
    const p1 = Math.max(0, Math.min(1, (1 + z) / 2));
    const r = Math.min(1, Math.hypot(y, z));
    // Ergotropy for H0 = (1/2) sigma_z (shifted to [0,1]): W = (r + z) / 2
    const erg = Math.max(0, (r + z) / 2);
    pts.push({ t, p1, erg });

    const [k1y, k1z] = deriv(y, z);
    const [k2y, k2z] = deriv(y + 0.5 * dt * k1y, z + 0.5 * dt * k1z);
    const [k3y, k3z] = deriv(y + 0.5 * dt * k2y, z + 0.5 * dt * k2z);
    const [k4y, k4z] = deriv(y + dt * k3y, z + dt * k3z);
    y += (dt / 6) * (k1y + 2 * k2y + 2 * k3y + k4y);
    z += (dt / 6) * (k1z + 2 * k2z + 2 * k3z + k4z);
  }
  return pts;
}

export default function HeroTelemetry() {
  const [tab, setTab] = useState<'qenvs' | 'roqet'>('qenvs');
  const [gamma1, setGamma1] = useState(0.18);

  const trace = useMemo(() => integrateQubit(Math.PI, gamma1, gamma1 * 0.4), [gamma1]);

  const toPath = (key: 'p1' | 'erg') =>
    trace
      .map((pt, idx) => {
        const x = 28 + (pt.t / 4.0) * 292;
        const y = 132 - pt[key] * 108;
        return `${idx === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

  const peakErg = Math.max(...trace.map((p) => p.erg));

  return (
    <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] overflow-hidden">
      {/* Header tabs */}
      <div className="flex items-center justify-between border-b border-[var(--border-hairline)] bg-[var(--bg-subtle)]/60 px-3.5 py-2">
        <div className="flex items-center gap-1" role="tablist" aria-label="Live telemetry preview">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'qenvs'}
            onClick={() => setTab('qenvs')}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
              tab === 'qenvs'
                ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-hairline)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            QEnvS · Open Qubit
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'roqet'}
            onClick={() => setTab('roqet')}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
              tab === 'roqet'
                ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-hairline)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            ROQET · QEC SoC
          </button>
        </div>
        <a
          href={tab === 'qenvs' ? '/lab#qenvs' : '/lab#roqet'}
          className="text-xs font-medium text-[var(--accent-primary)] hover:underline"
        >
          Open Lab
        </a>
      </div>

      {tab === 'qenvs' ? (
        <div className="p-4 space-y-3">
          <div className="flex items-baseline justify-between text-xs">
            <span className="font-mono text-[var(--text-secondary)]">battery/TwoLevel-v0</span>
            <span className="font-mono tabular-nums text-[var(--text-primary)]">
              Peak W = {(peakErg * 100).toFixed(1)}%
            </span>
          </div>

          <div className="lab-grid-bg rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-subtle)]/40 p-2">
            <svg viewBox="0 0 340 152" className="w-full h-auto" role="img" aria-label="Lindblad qubit population and ergotropy trace">
              {/* Axes */}
              <line x1="28" y1="24" x2="28" y2="132" stroke="var(--border-strong)" strokeWidth="1" />
              <line x1="28" y1="132" x2="320" y2="132" stroke="var(--border-strong)" strokeWidth="1" />
              <line x1="28" y1="24" x2="320" y2="24" stroke="var(--border-hairline)" strokeDasharray="3 3" strokeWidth="1" />
              <line x1="28" y1="78" x2="320" y2="78" stroke="var(--border-hairline)" strokeDasharray="3 3" strokeWidth="1" />

              {/* Labels */}
              <text x="6" y="28" fontSize="9" fill="var(--text-tertiary)" fontFamily="var(--font-mono)">1.0</text>
              <text x="6" y="81" fontSize="9" fill="var(--text-tertiary)" fontFamily="var(--font-mono)">0.5</text>
              <text x="6" y="135" fontSize="9" fill="var(--text-tertiary)" fontFamily="var(--font-mono)">0.0</text>
              <text x="278" y="146" fontSize="9" fill="var(--text-tertiary)" fontFamily="var(--font-mono)">t / t_π</text>

              {/* Population & Ergotropy paths */}
              <path d={toPath('p1')} fill="none" stroke="var(--accent-primary)" strokeWidth="2" />
              <path d={toPath('erg')} fill="none" stroke="var(--signal-positive)" strokeWidth="1.75" strokeDasharray="4 2.5" />
            </svg>
          </div>

          <div className="flex items-center justify-between gap-3 text-xs">
            <label htmlFor="hero-gamma1" className="flex items-center gap-2 text-[var(--text-secondary)] shrink-0">
              <span>Dissipation</span>
              <span className="font-mono tabular-nums text-[var(--text-primary)]">γ₁={gamma1.toFixed(2)}</span>
            </label>
            <input
              id="hero-gamma1"
              type="range"
              min="0"
              max="0.8"
              step="0.02"
              value={gamma1}
              onChange={(e) => setGamma1(parseFloat(e.target.value))}
              className="w-full accent-[var(--accent-primary)] cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[var(--text-tertiary)] pt-1 border-t border-[var(--border-hairline)]">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-0.5 w-3 bg-[var(--accent-primary)]" />
                Energy E(t)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-0.5 w-3 bg-[var(--signal-positive)]" />
                Ergotropy W(t)
              </span>
            </div>
            <span className="font-mono">Lindblad RK4</span>
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-3.5">
          <div className="flex items-baseline justify-between text-xs">
            <span className="font-mono text-[var(--text-secondary)]">QECCT d=3 · Zynq-7020 / 8nm</span>
            <span className="font-mono tabular-nums text-[var(--signal-positive)]">0.34 µs &lt; 1.0 µs</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {[
              { label: 'QECCT Teacher (FP32)', val: '13.52 µs', pct: 100, color: 'var(--text-tertiary)', meta: '4,772 KB' },
              { label: 'Coherence Limit', val: '1.00 µs', pct: 26, color: 'var(--signal-warn)', meta: 'Deadline' },
              { label: 'KD Student (FP32)', val: '0.68 µs', pct: 18, color: 'var(--accent-secondary)', meta: '106.8 KB' },
              { label: 'Ours (KD + INT8 PTQ)', val: '0.34 µs', pct: 9, color: 'var(--signal-positive)', meta: '26.7 KB' },
            ].map((row) => (
              <div key={row.label} className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">{row.label}</span>
                  <span className="font-mono tabular-nums text-[var(--text-primary)]">
                    {row.val} <span className="text-[var(--text-tertiary)]">({row.meta})</span>
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-[var(--bg-subtle)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${row.pct}%`, backgroundColor: row.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[var(--border-hairline)] text-center">
            <div className="rounded-md bg-[var(--bg-subtle)]/70 py-1.5">
              <div className="font-mono text-sm font-semibold tabular-nums text-[var(--text-primary)]">−99.4%</div>
              <div className="text-[11px] text-[var(--text-tertiary)]">Model size</div>
            </div>
            <div className="rounded-md bg-[var(--bg-subtle)]/70 py-1.5">
              <div className="font-mono text-sm font-semibold tabular-nums text-[var(--text-primary)]">−97.5%</div>
              <div className="text-[11px] text-[var(--text-tertiary)]">Latency</div>
            </div>
            <div className="rounded-md bg-[var(--bg-subtle)]/70 py-1.5">
              <div className="font-mono text-sm font-semibold tabular-nums text-[var(--signal-positive)]">~0.9%</div>
              <div className="text-[11px] text-[var(--text-tertiary)]">LER (vs 7.0%)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
