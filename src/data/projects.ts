export interface ProjectItem {
  slug: string;
  name: string;
  tagline: string;
  period: string;
  status: 'Active' | 'Completed' | 'Competition';
  featured: boolean;
  summary: string;
  problem: string;
  architecture: string[];
  metrics: { label: string; value: string; context?: string }[];
  stack: string[];
  links: { label: string; href: string }[];
  labTab?: 'qenvs' | 'roqet';
  relatedBlogPrefix?: string;
}

export const PROJECTS: ProjectItem[] = [
  {
    slug: 'qenvs',
    name: 'QEnvS',
    tagline: 'Physically validated quantum-control environments for RL and optimal control',
    period: '2026 – Present',
    status: 'Active',
    featured: true,
    summary:
      'An open-source JAX + dynamiqs library providing jit-able, vmap-able, differentiable quantum control environments—spanning transmon gates, open quantum batteries, Dicke collective charging, and STIRAP state transfer—with automated closed-form and QuTiP cross-validation.',
    problem:
      'Quantum RL papers routinely re-implement Hamiltonians from scratch with subtle sign, unit, or Lindblad solver bugs, making cross-paper comparison unreliable and slowing iteration.',
    architecture: [
      'Strict separation of physics (Model: drift, controls, jump ops, observables) from RL/control adapters (Environment: reset, step, rollout).',
      'Full JAX compatibility: jax.vmap over 1,024+ trajectories on a single GPU and jax.grad through rollouts for GRAPE-style gradient control.',
      'Automated validation suite (qenvs validate) verifying closed-form Rabi/pi-pulse/Gibbs limits, CPTP constraints, solver convergence, and QuTiP cross-checks.',
      'Realistic RL wrappers: ParameterRandomization, ControlErrors, finite-shot ObservationModel, GymnasiumEnv, and hardware-unit pulse export (qenvs.pulses).',
    ],
    metrics: [
      { label: 'Validated Tasks', value: '8 tasks', context: '7 model families (Transmon, Qubit, Battery, STIRAP)' },
      { label: 'GRAPE / PPO Fidelity', value: '1.0000 / 0.9997', context: 'qubit/StateTransfer-v0 (3 seeds)' },
      { label: 'Distribution', value: 'PyPI + Zenodo', context: 'Apache-2.0 · DOI 10.5281/zenodo.23359969' },
      { label: 'Batch Throughput', value: '1,024+ traj', context: 'Single-GPU jit + vmap rollouts' },
    ],
    stack: ['Python', 'JAX', 'dynamiqs', 'Gymnasium', 'QuTiP', 'PyPI'],
    links: [
      { label: 'GitHub Repository', href: 'https://github.com/beomdo-park/QEnvS' },
      { label: 'Documentation', href: 'https://beomdo-park.github.io/QEnvS/' },
      { label: 'PyPI Package', href: 'https://pypi.org/project/qenvs/' },
      { label: 'Zenodo DOI', href: 'https://doi.org/10.5281/zenodo.23359969' },
    ],
    labTab: 'qenvs',
  },
  {
    slug: 'roqet',
    name: 'ROQET',
    tagline: 'Sub-microsecond on-device QEC neural decoder & RTL SoC accelerator',
    period: '2026.03 – 2026.11',
    status: 'Completed',
    featured: true,
    summary:
      'End-to-end hardware-software co-design for rotated surface-code quantum error correction: (1) Hybrid Knowledge Distillation + INT8 PTQ compression of QECCT into a 26.7 KB, 0.34 µs decoder with bit-exact integer RTL, and (2) a 58.9k-parameter selective dispatch gate that eliminates out-of-distribution pre-decoder LER regressions.',
    problem:
      'Superconducting qubits decohere on the ~1 µs timescale. Off-chip server decoding incurs 10–100 µs round-trip latency, while dense neural decoders exceed edge memory and can actively degrade LER at large code distances (d=13, 17).',
    architecture: [
      'Hybrid KD (Task + Response MSE + Attention Transfer) compresses QECCT Teacher (1,193K params, 4,772 KB) to Student (26.7K params, 106.8 KB).',
      'Symmetric INT8 PTQ reduces final weight footprint to 26.7 KB (99.4% reduction) and inference latency to 0.34 µs—well inside the 1 µs coherence budget.',
      'ASIC/FPGA Frontend SoC: PicoRV32 (RV32IM) + 16×16 INT8 systolic array, 117-cycle pipeline, bit-exact integer RTL (256/256 verified) targeting Zynq-7020 & Samsung 8nm LPP MPW.',
      'Parallel 5-layer 3D-Conv Dispatch Gate (58,881 params) trained on McNemar-verified helpfulness labels: achieves 0% calls on neutral d=9 and OOD d=15/17 while cutting NN calls by 72% at d=5.',
    ],
    metrics: [
      { label: 'Model Compression', value: '26.7 KB', context: '−99.4% vs 4,772 KB Teacher' },
      { label: 'Inference Latency', value: '0.34 µs', context: '−97.5% vs 13.52 µs Teacher (1 µs limit)' },
      { label: 'd=3 Faulty Syndrome LER', value: '~0.9%', context: 'vs 7.0% Union-Find / MWPM at p=0.12' },
      { label: 'BRAM Footprint', value: '4.2%', context: '26.7 KB / 630 KB on Xilinx Zynq-7020' },
    ],
    stack: ['PyTorch', 'Stim', 'PyMatching', 'INT8 PTQ', 'SystemVerilog', 'Verilator', 'Cocotb', 'Vivado'],
    links: [
      { label: '8-Week Technical Series', href: '/blog?series=ROQET' },
      { label: 'Interactive ROQET Lab', href: '/lab#roqet' },
    ],
    labTab: 'roqet',
    relatedBlogPrefix: 'project-roqet-',
  },
  {
    slug: 'kaggle-vqcc',
    name: 'Verifiable Quantum Circuit Compilation',
    tagline: 'Automated circuit synthesis and verifier-in-the-loop optimization for Google Quantum AI Kaggle challenge',
    period: '2026.10 – Present',
    status: 'Competition',
    featured: false,
    summary:
      'High-throughput automated search and mathematical synthesis pipeline targeting minimal T-count / Clifford+T gate depth under strict unitary verification tolerances.',
    problem:
      'Compiling arbitrary multi-qubit unitaries into fault-tolerant gate sets requires balancing approximation fidelity against non-Clifford gate cost across diverse circuit families.',
    architecture: [
      'Deterministic verifier-loop harness checking exact operator norm error and gate count before accepting any candidate.',
      'Hybrid decomposition combining analytical Cartan/Solovay-Kitaev passes with local template rewriting and peephole cancellation.',
    ],
    metrics: [
      { label: 'Host', value: 'Google Quantum AI', context: 'Kaggle Competition (2026–2027)' },
      { label: 'Optimization Loop', value: 'Verifier-closed', context: 'Zero-tolerance unitary validation' },
    ],
    stack: ['Python', 'NumPy', 'SciPy', 'Qiskit', 'Clifford+T Synthesis'],
    links: [],
  },
  {
    slug: 'industrial-power-ad',
    name: 'Industrial Power Anomaly Detection',
    tagline: 'FFT periodicity extraction + GELU CNN-GRU Autoencoder & DBA K-Means benchmark',
    period: '2025.02 – 2025.07',
    status: 'Completed',
    featured: false,
    summary:
      'End-to-end industrial electricity consumption anomaly detection research spanning dynamic time warping barycenter averaging (DBA K-Means) and frequency-guided deep autoencoders, resulting in an SCIE journal publication (MDPI Energies) and 1st-author IEIE paper.',
    problem:
      'Factory power load curves exhibit multi-scale operating cycles and irregular shift schedules, causing naive windowing and threshold detectors to generate high false-positive rates.',
    architecture: [
      'FFT dominant-period extraction automatically sizes sliding windows to true industrial duty cycles.',
      'GELU CNN-GRU Autoencoder captures both local transient spikes and multi-hour sequential drift.',
    ],
    metrics: [
      { label: 'Journal Paper', value: 'MDPI Energies', context: 'SCIE (Vol. 18, Issue 14, 2025)' },
      { label: 'Conference Paper', value: 'IEIE 2025', context: '1st Author (Jeju)' },
    ],
    stack: ['PyTorch', 'FFT / Signal Processing', 'scikit-learn', 'Time-Series', 'Pandas'],
    links: [
      { label: 'MDPI Energies Paper', href: 'https://www.mdpi.com/1996-1073/18/14/3720' },
      { label: '5-Week Technical Series', href: '/blog?series=ABC-2025' },
    ],
    relatedBlogPrefix: 'project-abc-',
  },
];
