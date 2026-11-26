export interface ExperienceItem {
  period: string;
  role: string;
  org: string;
  detail: string;
  url?: string;
}

export interface AwardItem {
  date: string;
  title: string;
  org: string;
  detail?: string;
  kind: 'award' | 'competition' | 'certification';
}

export const PROFILE = {
  headline: 'Quantum AI & Scientific ML Researcher',
  summary:
    'Computer Engineering researcher at Eco AI Lab (Hanbat National University), building physics-validated quantum control environments (QEnvS) and sub-microsecond hardware-aware neural decoders for fault-tolerant quantum computing (ROQET).',
  education: [
    {
      period: '2023 – 2027 (Expected)',
      degree: 'B.S. in Computer Engineering',
      institution: 'Hanbat National University (HBNU), Daejeon, South Korea',
      detail: 'Undergraduate Researcher & Former Lab Lead, Eco AI Lab',
    },
  ],
  experiences: [
    {
      period: '2025.05 – 2026.03',
      role: 'Lab Lead & Undergraduate Researcher',
      org: 'Eco AI Lab, Hanbat National University',
      detail:
        'Led lab research operations and co-authored 20 papers across quantum battery RL control, quantum error correction decoders, and industrial time-series ML.',
      url: 'https://sites.google.com/view/ecoai/introduction',
    },
    {
      period: '2026.03 – 2026.05',
      role: 'Team Lead — ROQET QEC Accelerator SoC',
      org: '2026 ABC Project Mentoring (Euclid Soft)',
      detail:
        'Designed Hybrid KD + INT8 PTQ QECCT decoder (26.7 KB, 0.34 µs) and 58.9k-param selective pre-decoder dispatch gate with bit-exact RTL verification.',
    },
    {
      period: '2025.06 – 2025.07',
      role: 'Software Engineering Intern',
      org: 'Argoon Co., Ltd. ((주)아군)',
      detail:
        'Simulated autonomous parking robots in Gazebo and optimized navigation trajectories and runtime software performance.',
      url: 'https://argoon.net',
    },
    {
      period: '2025.05 – 2025.06',
      role: 'Research Mentee — Industrial Power Anomaly Detection',
      org: '2025 ABC Project Mentoring (Euclid Soft)',
      detail:
        'Developed FFT periodicity extraction + GELU CNN-GRU Autoencoder anomaly detection pipeline published at IEIE 2025.',
    },
    {
      period: '2025.03 – 2025.06',
      role: 'Teaching Assistant — Data Science',
      org: 'Dept. of Computer Engineering, HBNU',
      detail:
        'Prepared lab notebooks and supported student Q&A for Prof. Sanggeum Lee’s undergraduate Data Science course.',
    },
  ] satisfies ExperienceItem[],
  awards: [
    {
      date: '2026.11',
      title: 'Excellence Award — Computer Engineering Portfolio Competition',
      org: 'Hanbat National University',
      kind: 'award',
    },
    {
      date: '2026.10',
      title: 'Encouragement Award — Creative Comprehensive Design Competition',
      org: 'Hanbat National University',
      detail: 'ROQET: On-Device AI Accelerator SoC for Surface-Code QEC',
      kind: 'award',
    },
    {
      date: '2026.08',
      title: 'Top 2% (38th / 2,195, Private LB) — 3rd Wind Power Forecasting AI Competition',
      org: 'DACON',
      kind: 'competition',
    },
    {
      date: '2025.11',
      title: 'Excellence Award — KICS Fall Undergraduate Capstone Competition',
      org: 'Korean Institute of Communications and Information Sciences (KICS)',
      detail: 'GNN-based RL for Quantum Battery Superabsorption Advantage',
      kind: 'award',
    },
    {
      date: '2025.11',
      title: 'Encouragement Award — KICS Fall Best Undergraduate Paper',
      org: 'Korean Institute of Communications and Information Sciences (KICS)',
      detail: 'Multi-Stage RL Framework for Robust Quantum Battery Charging',
      kind: 'award',
    },
    {
      date: '2025.10',
      title: 'Excellence Award — Computer Engineering Portfolio Competition',
      org: 'Hanbat National University',
      kind: 'award',
    },
    {
      date: '2025.11',
      title: 'TOPCIT Level 3',
      org: 'Institute of Information & Communications Technology Planning & Evaluation (IITP)',
      kind: 'certification',
    },
    {
      date: '2025.06',
      title: 'ADsP (Advanced Data Analytics Semi-Professional)',
      org: 'Korea Data Agency (K-DATA)',
      kind: 'certification',
    },
  ] satisfies AwardItem[],
  techStack: [
    {
      group: 'Quantum & Physics',
      items: ['JAX', 'dynamiqs', 'Stim', 'PyMatching', 'QuTiP', 'Qiskit'],
    },
    {
      group: 'Machine Learning & RL',
      items: ['PyTorch', 'PyTorch Geometric', 'Gymnasium', 'Stable-Baselines3', 'scikit-learn', 'LightGBM'],
    },
    {
      group: 'Hardware & Edge AI',
      items: ['SystemVerilog / RTL', 'INT8 PTQ', 'Knowledge Distillation', 'Xilinx Vivado', 'Verilator', 'Cocotb'],
    },
    {
      group: 'Web, Data & Infra',
      items: ['Python', 'TypeScript', 'Astro', 'React', 'Cloudflare Workers / D1', 'PostgreSQL', 'LaTeX / TikZ'],
    },
  ],
};
