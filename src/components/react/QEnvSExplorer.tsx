import { useMemo, useState } from 'react';

interface QEnvSTask {
  id: string;
  model: string;
  dissipation: string;
  validation: string;
  status: string;
}

const QENVS_TASKS: QEnvSTask[] = [
  {
    id: 'transmon/XGate-v0 · SXGate-v0',
    model: 'Multi-level transmon (anharmonicity, I/Q drive, RWA, ns/GHz units)',
    dissipation: 'Optional T1, T2 Lindblad (superoperator fidelity)',
    validation: 'Rabi units, DRAG numerical optimum, CPTP, QuTiP cross-check',
    status: 'available',
  },
  {
    id: 'transmon/CRGate-v0',
    model: 'Two coupled Duffing transmons (J coupling, CR + cancellation drive)',
    dissipation: 'Optional T1, T2 on both transmons',
    validation: 'J=0 decoupling, 2nd-order static ZZ, leakage-aware fidelity, QuTiP',
    status: 'v0.3',
  },
  {
    id: 'qubit/StateTransfer-v0',
    model: 'Driven two-level qubit (GRAPE 1.0000 / PPO 0.9997 ± 0.0002)',
    dissipation: 'T1, T_phi Lindblad',
    validation: 'Rabi formula, pi-pulse, ergotropy, energy conservation',
    status: 'available',
  },
  {
    id: 'battery/TwoLevel-v0',
    model: 'Open qubit quantum battery (QubitBattery)',
    dissipation: 'Thermal bath (T1, n_th), T_phi',
    validation: 'Stationary Gibbs state, pi-pulse E = W = ω₀, power bound, QuTiP',
    status: 'available',
  },
  {
    id: 'battery/Dicke-v0',
    model: 'N battery cells + cavity (Tavis-Cummings / Dicke symmetric subspace)',
    dissipation: 'Cavity loss, collective emission & dephasing',
    validation: 'Jaynes-Cummings Rabi, Ferraro (2018) collective scaling, QuTiP',
    status: 'available',
  },
  {
    id: 'battery/DickeLocal-v0',
    model: 'N cells + cavity with per-cell local dissipation (PIQS all spin sectors)',
    dissipation: 'Local emission, dephasing, pumping + collective channels',
    validation: 'Brute-force 2^N to 1e-8, QuTiP PIQS cross-check',
    status: 'v0.3',
  },
  {
    id: 'transfer/LambdaSTIRAP-v0',
    model: 'Three-level Lambda system (pump + Stokes pulses)',
    dissipation: 'Spontaneous emission from excited state |2>',
    validation: 'Dark state, STIRAP transfer (P3 > 0.99, P2 < 0.05), QuTiP',
    status: 'available',
  },
];

function simulateLindbladBattery(omega: number, detuning: number, gamma1: number, gammaPhi: number) {
  // Exact 2-level Lindblad Bloch equations with drive H = (detuning/2) sigma_z + (omega/2) sigma_x
  const steps = 180;
  const tMax = 4.0;
  const dt = tMax / steps;
  const g2 = gamma1 / 2 + gammaPhi;

  let x = 0;
  let y = 0;
  let z = -1; // starts in ground state |0>

  const deriv = (xx: number, yy: number, zz: number): [number, number, number] => [
    -detuning * yy - g2 * xx,
    detuning * xx - omega * zz - g2 * yy,
    omega * yy - gamma1 * (zz + 1),
  ];

  const data: { t: number; energy: number; ergotropy: number; purity: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i * dt;
    const energy = Math.max(0, Math.min(1, (1 + z) / 2));
    const r = Math.min(1, Math.sqrt(x * x + y * y + z * z));
    const ergotropy = Math.max(0, (r + z) / 2);
    const purity = 0.5 * (1 + r * r);
    data.push({ t, energy, ergotropy, purity });

    const [k1x, k1y, k1z] = deriv(x, y, z);
    const [k2x, k2y, k2z] = deriv(x + 0.5 * dt * k1x, y + 0.5 * dt * k1y, z + 0.5 * dt * k1z);
    const [k3x, k3y, k3z] = deriv(x + 0.5 * dt * k2x, y + 0.5 * dt * k2y, z + 0.5 * dt * k2z);
    const [k4x, k4y, k4z] = deriv(x + dt * k3x, y + dt * k3y, z + dt * k3z);
    x += (dt / 6) * (k1x + 2 * k2x + 2 * k3x + k4x);
    y += (dt / 6) * (k1y + 2 * k2y + 2 * k3y + k4y);
    z += (dt / 6) * (k1z + 2 * k2z + 2 * k3z + k4z);
  }
  return data;
}

export default function QEnvSExplorer() {
  const [mode, setMode] = useState<'lindblad' | 'dicke' | 'catalog'>('lindblad');
  const [omega, setOmega] = useState(Math.PI);
  const [detuning, setDetuning] = useState(0.0);
  const [gamma1, setGamma1] = useState(0.15);
  const [gammaPhi, setGammaPhi] = useState(0.1);
  const [dickeN, setDickeN] = useState(16);

  const trace = useMemo(
    () => simulateLindbladBattery(omega, detuning, gamma1, gammaPhi),
    [omega, detuning, gamma1, gammaPhi]
  );

  const peakEnergy = Math.max(...trace.map((d) => d.energy));
  const peakErg = Math.max(...trace.map((d) => d.ergotropy));
  const finalPurity = trace[trace.length - 1]?.purity ?? 1;
  const ergRatio = peakEnergy > 1e-6 ? peakErg / peakEnergy : 0;

  const toPath = (key: 'energy' | 'ergotropy' | 'purity') =>
    trace
      .map((pt, idx) => {
        const x = 44 + (pt.t / 4.0) * 526;
        const y = 212 - pt[key] * 184;
        return `${idx === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

  const dickePoints = useMemo(() => {
    const arr: { n: number; parallel: number; collective: number; speedup: number }[] = [];
    for (let n = 1; n <= 32; n++) {
      arr.push({
        n,
        parallel: n,
        collective: n * Math.sqrt(n),
        speedup: Math.sqrt(n),
      });
    }
    return arr;
  }, []);

  const maxDickePower = 32 * Math.sqrt(32);
  const curDicke = dickePoints[dickeN - 1];

  return (
    <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] overflow-hidden">
      {/* Top toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-hairline)] bg-[var(--bg-subtle)]/60 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            QEnvS Interactive Physics Explorer
          </h3>
          <p className="text-xs text-[var(--text-tertiary)]">
            Closed-form Lindblad dynamics & Dicke collective scaling verified in <code className="font-mono">qenvs.validation</code>
          </p>
        </div>
        <div className="flex items-center gap-1" role="tablist">
          {(
            [
              ['lindblad', 'Open Qubit Battery'],
              ['dicke', 'Dicke √N Scaling'],
              ['catalog', 'Validated Models (7)'],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={mode === k}
              onClick={() => setMode(k)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                mode === k
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-strong)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {mode === 'lindblad' && (
        <div className="p-4 sm:p-5 space-y-5">
          {/* Presets */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[var(--text-tertiary)]">Presets:</span>
            <button
              type="button"
              onClick={() => {
                setOmega(Math.PI);
                setDetuning(0);
                setGamma1(0);
                setGammaPhi(0);
              }}
              className="rounded-md border border-[var(--border-hairline)] bg-[var(--bg-subtle)]/60 px-2.5 py-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              Closed Ideal π-Pulse (E = W = 1)
            </button>
            <button
              type="button"
              onClick={() => {
                setOmega(Math.PI);
                setDetuning(0);
                setGamma1(0.2);
                setGammaPhi(0.25);
              }}
              className="rounded-md border border-[var(--border-hairline)] bg-[var(--bg-subtle)]/60 px-2.5 py-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              Open T₁ / T_φ Bath
            </button>
            <button
              type="button"
              onClick={() => {
                setOmega(Math.PI);
                setDetuning(1.8);
                setGamma1(0.1);
                setGammaPhi(0.1);
              }}
              className="rounded-md border border-[var(--border-hairline)] bg-[var(--bg-subtle)]/60 px-2.5 py-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              Detuned Drift (Δ = 1.8)
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* SVG Chart */}
            <div className="lg:col-span-8 space-y-2">
              <div className="lab-grid-bg rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-subtle)]/35 p-3">
                <svg viewBox="0 0 590 245" className="w-full h-auto" role="img" aria-label="Open quantum battery energy, ergotropy, and purity trajectories">
                  {[0, 0.25, 0.5, 0.75, 1.0].map((v) => {
                    const y = 212 - v * 184;
                    return (
                      <g key={v}>
                        <line x1="44" y1={y} x2="570" y2={y} stroke="var(--border-hairline)" strokeDasharray={v === 0 ? undefined : '3 3'} />
                        <text x="10" y={y + 3} fontSize="10" fill="var(--text-tertiary)" fontFamily="var(--font-mono)">
                          {v.toFixed(2)}
                        </text>
                      </g>
                    );
                  })}
                  <line x1="44" y1="28" x2="44" y2="212" stroke="var(--border-strong)" />
                  {[0, 1, 2, 3, 4].map((t) => {
                    const x = 44 + (t / 4) * 526;
                    return (
                      <text key={t} x={x - 4} y="230" fontSize="10" fill="var(--text-tertiary)" fontFamily="var(--font-mono)">
                        {t}
                      </text>
                    );
                  })}
                  <text x="570" y="242" textAnchor="end" fontSize="10" fill="var(--text-tertiary)" fontFamily="var(--font-mono)">
                    Time t (a.u.)
                  </text>

                  <path d={toPath('purity')} fill="none" stroke="var(--accent-secondary)" strokeWidth="1.5" strokeOpacity="0.8" />
                  <path d={toPath('energy')} fill="none" stroke="var(--accent-primary)" strokeWidth="2.2" />
                  <path d={toPath('ergotropy')} fill="none" stroke="var(--signal-positive)" strokeWidth="2" strokeDasharray="5 3" />
                </svg>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-tertiary)] px-1">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-0.5 w-4 bg-[var(--accent-primary)]" />
                    Stored Energy E(t)/ω₀
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-0.5 w-4 bg-[var(--signal-positive)]" />
                    Extractable Work (Ergotropy W)
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-0.5 w-4 bg-[var(--accent-secondary)]" />
                    State Purity Tr(ρ²)
                  </span>
                </div>
                <span className="font-mono">H = (Δ/2)σ_z + (Ω/2)σ_x</span>
              </div>
            </div>

            {/* Sliders & Live Readouts */}
            <div className="lg:col-span-4 space-y-4">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-subtle)]/50 p-2.5">
                  <div className="text-[11px] text-[var(--text-tertiary)]">Peak Energy</div>
                  <div className="font-mono text-base font-semibold tabular-nums text-[var(--accent-primary)]">
                    {(peakEnergy * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-subtle)]/50 p-2.5">
                  <div className="text-[11px] text-[var(--text-tertiary)]">Peak Ergotropy</div>
                  <div className="font-mono text-base font-semibold tabular-nums text-[var(--signal-positive)]">
                    {(peakErg * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-subtle)]/50 p-2.5">
                  <div className="text-[11px] text-[var(--text-tertiary)]">Work Ratio W/E</div>
                  <div className="font-mono text-base font-semibold tabular-nums text-[var(--text-primary)]">
                    {(ergRatio * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-subtle)]/50 p-2.5">
                  <div className="text-[11px] text-[var(--text-tertiary)]">Final Purity</div>
                  <div className="font-mono text-base font-semibold tabular-nums text-[var(--accent-secondary)]">
                    {finalPurity.toFixed(3)}
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                {[
                  { id: 'q-omega', label: 'Rabi Drive Ω', val: omega, min: 0.5, max: 6.28, step: 0.1, set: setOmega },
                  { id: 'q-detune', label: 'Detuning Δ', val: detuning, min: 0, max: 4.0, step: 0.1, set: setDetuning },
                  { id: 'q-g1', label: 'Relaxation γ₁ (1/T₁)', val: gamma1, min: 0, max: 1.0, step: 0.02, set: setGamma1 },
                  { id: 'q-gp', label: 'Dephasing γ_φ', val: gammaPhi, min: 0, max: 1.0, step: 0.02, set: setGammaPhi },
                ].map((c) => (
                  <div key={c.id} className="space-y-1">
                    <div className="flex justify-between">
                      <label htmlFor={c.id} className="text-[var(--text-secondary)]">{c.label}</label>
                      <span className="font-mono tabular-nums text-[var(--text-primary)]">{c.val.toFixed(2)}</span>
                    </div>
                    <input
                      id={c.id}
                      type="range"
                      min={c.min}
                      max={c.max}
                      step={c.step}
                      value={c.val}
                      onChange={(e) => c.set(parseFloat(e.target.value))}
                      className="w-full accent-[var(--accent-primary)] cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === 'dicke' && (
        <div className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            <div className="lg:col-span-8 lab-grid-bg rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-subtle)]/35 p-3">
              <svg viewBox="0 0 580 230" className="w-full h-auto" role="img" aria-label="Dicke collective quantum battery charging power scaling">
                <line x1="48" y1="24" x2="48" y2="196" stroke="var(--border-strong)" />
                <line x1="48" y1="196" x2="560" y2="196" stroke="var(--border-strong)" />

                {/* Parallel N line */}
                <path
                  d={dickePoints
                    .map((p, idx) => {
                      const x = 48 + ((p.n - 1) / 31) * 512;
                      const y = 196 - (p.parallel / maxDickePower) * 168;
                      return `${idx === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="var(--text-tertiary)"
                  strokeWidth="1.8"
                  strokeDasharray="4 3"
                />

                {/* Collective N*sqrt(N) line */}
                <path
                  d={dickePoints
                    .map((p, idx) => {
                      const x = 48 + ((p.n - 1) / 31) * 512;
                      const y = 196 - (p.collective / maxDickePower) * 168;
                      return `${idx === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="var(--accent-primary)"
                  strokeWidth="2.4"
                />

                {/* Selected N marker */}
                {(() => {
                  const x = 48 + ((dickeN - 1) / 31) * 512;
                  const yC = 196 - (curDicke.collective / maxDickePower) * 168;
                  const yP = 196 - (curDicke.parallel / maxDickePower) * 168;
                  return (
                    <g>
                      <line x1={x} y1="24" x2={x} y2="196" stroke="var(--accent-primary)" strokeOpacity="0.35" strokeDasharray="3 3" />
                      <circle cx={x} cy={yC} r="5" fill="var(--accent-primary)" />
                      <circle cx={x} cy={yP} r="4" fill="var(--text-tertiary)" />
                    </g>
                  );
                })()}

                <text x="52" y="38" fontSize="11" fill="var(--accent-primary)" fontFamily="var(--font-mono)">
                  Collective Dicke P ∝ N√N
                </text>
                <text x="415" y="162" fontSize="10" fill="var(--text-tertiary)" fontFamily="var(--font-mono)">
                  Parallel P ∝ N
                </text>
                <text x="456" y="218" fontSize="10" fill="var(--text-tertiary)" fontFamily="var(--font-mono)">
                  Battery cells N (1–32)
                </text>
              </svg>
            </div>

            <div className="lg:col-span-4 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <label htmlFor="dicke-n" className="text-[var(--text-secondary)]">Number of cells N</label>
                  <span className="font-mono text-sm font-semibold tabular-nums text-[var(--text-primary)]">N = {dickeN}</span>
                </div>
                <input
                  id="dicke-n"
                  type="range"
                  min="1"
                  max="32"
                  step="1"
                  value={dickeN}
                  onChange={(e) => setDickeN(parseInt(e.target.value, 10))}
                  className="w-full accent-[var(--accent-primary)] cursor-pointer"
                />
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-subtle)]/50 px-3 py-2">
                  <span className="text-[var(--text-secondary)]">Quantum Advantage Γ = √N</span>
                  <span className="font-mono font-semibold tabular-nums text-[var(--signal-positive)]">
                    {curDicke.speedup.toFixed(2)}×
                  </span>
                </div>
                <div className="flex justify-between rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-subtle)]/50 px-3 py-2">
                  <span className="text-[var(--text-secondary)]">Collective Power (rel.)</span>
                  <span className="font-mono tabular-nums text-[var(--accent-primary)]">
                    {curDicke.collective.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-subtle)]/50 px-3 py-2">
                  <span className="text-[var(--text-secondary)]">Parallel Power (rel.)</span>
                  <span className="font-mono tabular-nums text-[var(--text-secondary)]">
                    {curDicke.parallel.toFixed(1)}
                  </span>
                </div>
              </div>

              <p className="text-xs leading-relaxed text-[var(--text-tertiary)]">
                In <code className="font-mono">battery/Dicke-v0</code> & <code className="font-mono">DickeLocal-v0</code>,
                QEnvS verifies collective charging advantage (Ferraro et al., PRL 2018) against exact symmetric and PIQS local-dissipation solvers.
              </p>
            </div>
          </div>
        </div>
      )}

      {mode === 'catalog' && (
        <div className="p-4 sm:p-5 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-strong)] text-[var(--text-tertiary)]">
                  <th className="py-2 pr-3 font-medium">Task ID</th>
                  <th className="py-2 px-3 font-medium">Physics Model</th>
                  <th className="py-2 px-3 font-medium">Dissipation</th>
                  <th className="py-2 pl-3 font-medium">Validation Coverage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-hairline)]">
                {QENVS_TASKS.map((t) => (
                  <tr key={t.id} className="align-top">
                    <td className="py-2.5 pr-3 font-mono text-[var(--accent-primary)] whitespace-nowrap">{t.id}</td>
                    <td className="py-2.5 px-3 text-[var(--text-primary)]">{t.model}</td>
                    <td className="py-2.5 px-3 text-[var(--text-secondary)]">{t.dissipation}</td>
                    <td className="py-2.5 pl-3 text-[var(--text-secondary)]">{t.validation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-subtle)]/60 px-3.5 py-2.5 font-mono text-xs text-[var(--text-secondary)] flex flex-wrap items-center justify-between gap-2">
            <span>pip install qenvs &amp;&amp; qenvs validate</span>
            <a
              href="https://beomdo-park.github.io/QEnvS/"
              target="_blank"
              rel="noreferrer"
              className="text-[var(--accent-primary)] hover:underline"
            >
              Read full QEnvS docs
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
