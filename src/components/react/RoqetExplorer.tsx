import { useState } from 'react';

interface ConditionRow {
  label: string;
  d: number;
  p: string;
  basis: 'X' | 'Z';
  lerMwpm: number;
  lerNn: number;
  ratio: number;
  regime: 'gain' | 'neutral' | 'hurt';
  ood?: boolean;
  note: string;
}

const PREDECODER_CONDITIONS: ConditionRow[] = [
  { label: 'd=5 · p=3e-3 · Z', d: 5, p: '3e-3', basis: 'Z', lerMwpm: 0.01225, lerNn: 0.0080, ratio: 1.53, regime: 'gain', note: 'NN clearly helps (in-distribution)' },
  { label: 'd=5 · p=6e-3 · X', d: 5, p: '6e-3', basis: 'X', lerMwpm: 0.07675, lerNn: 0.0593, ratio: 1.29, regime: 'gain', note: 'Strong gain; Pareto gate saves 72% NN cost' },
  { label: 'd=9 · p=3e-3 · X', d: 9, p: '3e-3', basis: 'X', lerMwpm: 0.00127, lerNn: 0.00129, ratio: 0.98, regime: 'neutral', note: 'McNemar p > 0.8 (1M shots); 4 µs wasted' },
  { label: 'd=13 · p=3e-3 · Z', d: 13, p: '3e-3', basis: 'Z', lerMwpm: 0.000113, lerNn: 0.000152, ratio: 0.74, regime: 'hurt', note: 'Statistically significant LER hurt (p < 0.01)' },
  { label: 'd=13 · p=3e-3 · X', d: 13, p: '3e-3', basis: 'X', lerMwpm: 0.000127, lerNn: 0.000182, ratio: 0.71, regime: 'hurt', note: 'Statistically significant LER hurt (p < 0.01)' },
  { label: 'd=17 · p=3e-3 · X', d: 17, p: '3e-3', basis: 'X', lerMwpm: 0.0000115, lerNn: 0.000019, ratio: 0.61, regime: 'hurt', ood: true, note: 'OOD 4M shots; gate auto-rejects (0% calls)' },
  { label: 'd=17 · p=3e-3 · Z', d: 17, p: '3e-3', basis: 'Z', lerMwpm: 0.0000108, lerNn: 0.0000263, ratio: 0.41, regime: 'hurt', ood: true, note: 'OOD LER >2× worse under uniform NN; gate rejects' },
];

const PARETO_POINTS = [
  { name: 'MWPM Only (τ → +∞)', callRate: 0.0, ler: 0.0746, saved: 100.0, tag: 'Baseline' },
  { name: 'Dispatch Gate (τ = −1.0)', callRate: 22.8, ler: 0.0654, saved: 77.2, tag: 'Low-cost Pareto' },
  { name: 'Dispatch Gate (τ = −2.0)', callRate: 27.7, ler: 0.0641, saved: 72.3, tag: 'Balanced Pareto' },
  { name: 'Always-NN (τ → −∞)', callRate: 100.0, ler: 0.0563, saved: 0.0, tag: 'Uniform Call' },
];

const COMPRESSION_STAGES = [
  { id: 'teacher', name: 'QECCT Teacher', precision: 'FP32', paramsK: 1193, sizeKB: 4772, latencyUs: 13.52, ler: '~0.9%', ber: '~2.5%' },
  { id: 'kd', name: 'KD Student Only', precision: 'FP32', paramsK: 26.7, sizeKB: 106.8, latencyUs: 0.68, ler: '~0.9%', ber: '~3.5%' },
  { id: 'ours', name: 'Ours (KD + INT8 PTQ)', precision: 'INT8', paramsK: 26.7, sizeKB: 26.7, latencyUs: 0.34, ler: '~0.9%', ber: '3.54%' },
];

export default function RoqetExplorer() {
  const [tab, setTab] = useState<'dispatch' | 'soc'>('dispatch');
  const [paretoIdx, setParetoIdx] = useState(2);

  const selectedOp = PARETO_POINTS[paretoIdx];

  return (
    <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-hairline)] bg-[var(--bg-subtle)]/60 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            ROQET Interactive QEC Experiment Explorer
          </h3>
          <p className="text-xs text-[var(--text-tertiary)]">
            Verified Stim / SI1000 surface-code measurements &amp; Zynq-7020 / 8nm RTL SoC telemetry
          </p>
        </div>
        <div className="flex items-center gap-1" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'dispatch'}
            onClick={() => setTab('dispatch')}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
              tab === 'dispatch'
                ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-strong)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Selective Dispatch Gate (IEIE ’26)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'soc'}
            onClick={() => setTab('soc')}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
              tab === 'soc'
                ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-strong)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            KD + INT8 SoC Compression
          </button>
        </div>
      </div>

      {tab === 'dispatch' ? (
        <div className="p-4 sm:p-5 space-y-6">
          {/* LER Ratio across distances */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h4 className="text-xs font-semibold text-[var(--text-primary)]">
                Uniform Pre-Decoder Helpfulness Across Code Distances (LER_MWPM / LER_NN)
              </h4>
              <span className="font-mono text-[11px] text-[var(--text-tertiary)]">
                &gt; 1.0 NN gain · &lt; 1.0 NN hurt (McNemar p &lt; 0.01)
              </span>
            </div>

            <div className="space-y-2">
              {PREDECODER_CONDITIONS.map((c) => {
                // Map ratio [0.3, 1.7] to 0..100% with 1.0 at 50%
                const pct = Math.max(4, Math.min(96, ((c.ratio - 0.3) / 1.4) * 100));
                const color =
                  c.regime === 'gain'
                    ? 'var(--signal-positive)'
                    : c.regime === 'neutral'
                      ? 'var(--signal-warn)'
                      : 'var(--signal-negative)';
                return (
                  <div
                    key={c.label}
                    className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-subtle)]/35 px-3 py-2 text-xs"
                  >
                    <div className="sm:col-span-3 flex items-center gap-1.5 font-mono text-[var(--text-primary)]">
                      <span>{c.label}</span>
                      {c.ood && (
                        <span className="rounded bg-[var(--signal-negative)]/15 px-1.5 py-0.5 text-[10px] text-[var(--signal-negative)]">
                          OOD
                        </span>
                      )}
                    </div>
                    <div className="sm:col-span-4 relative h-5 flex items-center">
                      <div className="h-1.5 w-full rounded-full bg-[var(--bg-subtle)]" />
                      {/* Reference 1.0 line */}
                      <div
                        className="absolute top-0 bottom-0 w-px bg-[var(--border-strong)]"
                        style={{ left: '50%' }}
                        title="Ratio = 1.00 (Neutral)"
                      />
                      {/* Bar from 50% to pct */}
                      <div
                        className="absolute h-2 rounded-full"
                        style={{
                          left: `${Math.min(50, pct)}%`,
                          width: `${Math.abs(pct - 50)}%`,
                          backgroundColor: color,
                        }}
                      />
                      <div
                        className="absolute h-3 w-3 -ml-1.5 rounded-full border-2 border-[var(--bg-surface)]"
                        style={{ left: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                    <div className="sm:col-span-1 font-mono font-semibold tabular-nums" style={{ color }}>
                      {c.ratio.toFixed(2)}×
                    </div>
                    <div className="sm:col-span-4 text-[11px] text-[var(--text-secondary)]">
                      {c.note}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pareto Operating Point Explorer */}
          <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-subtle)]/35 p-4 space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h4 className="text-xs font-semibold text-[var(--text-primary)]">
                  Selective Dispatch Pareto Operating Point (d=5, p=6×10⁻³, 58.9k-param 3D-Conv Gate)
                </h4>
                <p className="text-[11px] text-[var(--text-tertiary)]">
                  Gate takes raw syndrome X in parallel with the 912.8k-param pre-decoder; select threshold τ below.
                </p>
              </div>
              <span className="font-mono text-xs text-[var(--accent-primary)]">{selectedOp.name}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PARETO_POINTS.map((op, i) => (
                <button
                  key={op.name}
                  type="button"
                  onClick={() => setParetoIdx(i)}
                  className={`rounded-lg border p-2.5 text-left transition-colors cursor-pointer ${
                    paretoIdx === i
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-primary-soft)]'
                      : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div className="text-[11px] text-[var(--text-tertiary)]">{op.tag}</div>
                  <div className="font-mono text-xs font-semibold text-[var(--text-primary)] mt-0.5">
                    {op.callRate.toFixed(1)}% calls
                  </div>
                  <div className="font-mono text-[11px] text-[var(--text-secondary)] tabular-nums">
                    LER {op.ler.toFixed(4)}
                  </div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-3">
                <div className="text-[11px] text-[var(--text-tertiary)]">Combined LER (d=5)</div>
                <div className="font-mono text-lg font-semibold tabular-nums text-[var(--text-primary)]">
                  {selectedOp.ler.toFixed(4)}
                </div>
                <div className="text-[11px] text-[var(--signal-positive)]">
                  {selectedOp.ler < 0.0746
                    ? `−${(((0.0746 - selectedOp.ler) / 0.0746) * 100).toFixed(1)}% vs MWPM only`
                    : 'MWPM baseline'}
                </div>
              </div>
              <div className="rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-3">
                <div className="text-[11px] text-[var(--text-tertiary)]">NN Compute Saved</div>
                <div className="font-mono text-lg font-semibold tabular-nums text-[var(--accent-primary)]">
                  {selectedOp.saved.toFixed(1)}%
                </div>
                <div className="text-[11px] text-[var(--text-tertiary)]">
                  Batch avg latency 0.87 µs in neutral regime
                </div>
              </div>
              <div className="rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-3">
                <div className="text-[11px] text-[var(--text-tertiary)]">OOD d=15 / d=17 Safety</div>
                <div className="font-mono text-lg font-semibold tabular-nums text-[var(--signal-positive)]">
                  {paretoIdx === 3 ? '100% (Risk!)' : '0.0% calls'}
                </div>
                <div className="text-[11px] text-[var(--text-tertiary)]">
                  {paretoIdx === 3
                    ? 'Uniform call doubles LER at d=17'
                    : 'Auto-rejected without manual rules'}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 sm:p-5 space-y-5">
          {/* Compression stage table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-strong)] text-[var(--text-tertiary)]">
                  <th className="py-2 pr-3 font-medium">Stage</th>
                  <th className="py-2 px-3 font-medium">Precision</th>
                  <th className="py-2 px-3 font-medium">Parameters</th>
                  <th className="py-2 px-3 font-medium">Footprint</th>
                  <th className="py-2 px-3 font-medium">Latency</th>
                  <th className="py-2 pl-3 font-medium">vs 1.0 µs Limit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-hairline)] font-mono tabular-nums">
                {COMPRESSION_STAGES.map((st) => {
                  const pass = st.latencyUs < 1.0;
                  return (
                    <tr key={st.id} className={st.id === 'ours' ? 'bg-[var(--accent-primary-soft)]/50' : ''}>
                      <td className="py-2.5 pr-3 font-sans font-medium text-[var(--text-primary)]">{st.name}</td>
                      <td className="py-2.5 px-3 text-[var(--text-secondary)]">{st.precision}</td>
                      <td className="py-2.5 px-3 text-[var(--text-primary)]">{st.paramsK.toLocaleString()} K</td>
                      <td className="py-2.5 px-3 text-[var(--text-primary)]">{st.sizeKB.toLocaleString()} KB</td>
                      <td className="py-2.5 px-3 text-[var(--text-primary)]">{st.latencyUs.toFixed(2)} µs</td>
                      <td className="py-2.5 pl-3">
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-[11px] font-sans font-medium ${
                            pass
                              ? 'bg-[var(--signal-positive)]/15 text-[var(--signal-positive)]'
                              : 'bg-[var(--signal-negative)]/15 text-[var(--signal-negative)]'
                          }`}
                        >
                          {pass ? `Pass (+${(1 - st.latencyUs).toFixed(2)} µs margin)` : 'Exceeds 13.5×'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Accuracy & Hardware Fit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-subtle)]/35 p-4 space-y-3">
              <h4 className="text-xs font-semibold text-[var(--text-primary)]">
                Faulty-Syndrome Accuracy at p = 0.12 (Surface Code a = 3, T = 3)
              </h4>
              {[
                { label: 'Union-Find / MWPM — LER', val: 7.0, max: 8, color: 'var(--text-tertiary)' },
                { label: 'Ours (KD + INT8 PTQ) — LER', val: 0.9, max: 8, color: 'var(--signal-positive)' },
                { label: 'Union-Find / MWPM — BER', val: 7.2, max: 8, color: 'var(--text-tertiary)' },
                { label: 'Ours (KD + INT8 PTQ) — BER', val: 3.54, max: 8, color: 'var(--accent-primary)' },
              ].map((b) => (
                <div key={b.label} className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">{b.label}</span>
                    <span className="font-mono tabular-nums text-[var(--text-primary)]">{b.val.toFixed(2)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--bg-subtle)] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(b.val / b.max) * 100}%`, backgroundColor: b.color }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-subtle)]/35 p-4 space-y-3">
              <h4 className="text-xs font-semibold text-[var(--text-primary)]">
                On-Chip Hardware Mapping (Xilinx Zynq-7020 &amp; 8nm MPW SoC)
              </h4>
              <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
                <li className="flex justify-between border-b border-[var(--border-hairline)] pb-1.5">
                  <span>On-chip Weight BRAM</span>
                  <span className="font-mono text-[var(--signal-positive)]">26.7 / 630 KB (4.2%)</span>
                </li>
                <li className="flex justify-between border-b border-[var(--border-hairline)] pb-1.5">
                  <span>INT8 MAC Parallelism</span>
                  <span className="font-mono text-[var(--text-primary)]">16×16 Systolic / 220 DSP48</span>
                </li>
                <li className="flex justify-between border-b border-[var(--border-hairline)] pb-1.5">
                  <span>RTL Verification</span>
                  <span className="font-mono text-[var(--text-primary)]">Bit-exact 256/256 · 117 cycles</span>
                </li>
                <li className="flex justify-between">
                  <span>Edge Power Envelope</span>
                  <span className="font-mono text-[var(--text-primary)]">≈ 2 W fanless (PYNQ-Z2)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
