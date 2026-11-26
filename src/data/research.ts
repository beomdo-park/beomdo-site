export interface ResearchTrack {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  question: string;
  methods: string[];
  keyResults: { label: string; value: string; note?: string }[];
  relatedPubIds: string[];
  relatedProjectSlug?: string;
  relatedLabTab?: 'qenvs' | 'roqet';
}

export const RESEARCH_TRACKS: ResearchTrack[] = [
  {
    id: 'quantum-batteries',
    title: 'Quantum Batteries & Open Quantum Control',
    subtitle: 'Physics-grounded reinforcement learning under dissipation and parameter uncertainty',
    summary:
      'Charging protocols for quantum batteries degrade rapidly under non-Markovian noise, dephasing, and Hamiltonian detuning. We design multi-stage curriculum RL, graph-transformer policies, and safe measurement-informed controllers that preserve ergotropy and collective superabsorption advantage.',
    question:
      'How can control policies remain robust across open-system dissipation and unknown system drift while remaining sample-efficient and physically verifiable?',
    methods: [
      'Multi-Stage & Curriculum RL (PPO / SAC)',
      'Physics-Informed Graph Transformers',
      'Lindblad & Non-Markovian Open Systems',
      'Differentiable JAX / dynamiqs Simulation',
    ],
    keyResults: [
      { label: 'Publications', value: '9 papers', note: 'AAAI-26, IEEE T-QE, IJCAI-26, KICS' },
      { label: 'Granted Patent', value: 'KR 10-3019388', note: 'Curriculum RL robust charging' },
      { label: 'Open Benchmark', value: 'QEnvS (PyPI)', note: '7 physics-validated models' },
    ],
    relatedPubIds: [
      'park-2026-aaai-qb',
      'lee-2026-tqe-safe-rl',
      'ijcai-2026-curriculum-oqc',
      'park-2026-kics-gtn-qb',
      'park-2025-kics-superabsorption',
      'patent-2026-qb-curriculum',
    ],
    relatedProjectSlug: 'qenvs',
    relatedLabTab: 'qenvs',
  },
  {
    id: 'qec-hardware',
    title: 'Hardware-Aware Quantum Error Correction',
    subtitle: 'Sub-microsecond neural decoders, selective dispatch gates, and on-chip RTL SoC',
    summary:
      'Superconducting surface codes demand syndrome decoding inside a ~1 µs coherence budget, yet neural decoders often suffer from latency overhead or out-of-distribution LER regressions at larger code distances. We study both neural pre-decoder calibration and end-to-end KD + INT8 quantization for on-device SoC deployment.',
    question:
      'When does a neural QEC decoder genuinely beat MWPM, and how small can a Transformer decoder become without sacrificing logical error rate inside a 1 µs cycle?',
    methods: [
      'Stim / SI1000 Circuit-Level Noise & PyMatching',
      'McNemar Paired Helpfulness Analysis',
      '58.9k-Param 3D-Conv Selective Dispatch Gate',
      'Hybrid KD + INT8 PTQ & Bit-Exact SystemVerilog RTL',
    ],
    keyResults: [
      { label: 'On-Chip Latency', value: '0.34 µs', note: '97.5% faster than Teacher (13.52 µs)' },
      { label: 'Model Footprint', value: '26.7 KB', note: '99.4% reduction; fits Zynq-7020 BRAM' },
      { label: 'OOD Rejection', value: '0% calls at d=15,17', note: 'Eliminates LER hurt automatically' },
    ],
    relatedPubIds: [
      'park-2026-ieie-predecoder',
      'ieie-2026-hybrid-kd-ptq',
      'ieie-2026-mlp-fpga-qec',
    ],
    relatedProjectSlug: 'roqet',
    relatedLabTab: 'roqet',
  },
  {
    id: 'scientific-ml',
    title: 'Scientific ML & Reliable Industrial Control',
    subtitle: 'Time-series anomaly detection, conservative RL, and verifiable ML workflows',
    summary:
      'Applying structured signal priors (FFT periodicity, DBA K-Means), conservative policy constraints, and structured feedback to safety-critical industrial systems, energy forecasting, and scientific computation.',
    question:
      'How do domain structure and conservative uncertainty bounds prevent silent failure in real-world industrial time-series and continuous control?',
    methods: [
      'FFT Periodicity & GELU CNN-GRU Autoencoders',
      'Capacity-Constrained & Conservative RL',
      'Structured EXPLAIN Feedback for SLMs',
      'Disciplined CV & Ensemble Decorrelation',
    ],
    keyResults: [
      { label: 'Venues', value: 'KDD · IJCAI · SCIE', note: 'MDPI Energies + KDD / Workshop' },
      { label: 'Competition', value: 'Top 2% (38 / 2,195)', note: 'DACON Wind Power Forecasting' },
    ],
    relatedPubIds: [
      'energies-2025-scie-power',
      'kdd-2026-less-safer',
      'ijcai-ecai-2026-deploy-rl',
      'park-2025-ieie-fft-cnn-gru',
    ],
  },
];
