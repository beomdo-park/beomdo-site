export interface ProjectItem {
  slug: string;
  name: string;
  period: string;
  statusKo: string;
  statusEn: string;
  featured: boolean;
  tagline: { ko: string; en: string };
  summary: { ko: string; en: string };
  problem: { ko: string; en: string };
  architecture: { ko: string[]; en: string[] };
  metrics: { labelKo: string; labelEn: string; value: string; contextKo?: string; contextEn?: string }[];
  stack: string[];
  links: { labelKo: string; labelEn: string; href: string }[];
  labTab?: 'qenvs' | 'roqet';
  relatedBlogPrefix?: string;
}

export const PROJECTS: ProjectItem[] = [
  {
    slug: 'qenvs',
    name: 'QEnvS',
    period: '2026 – Present',
    statusKo: '오픈소스 유지보수',
    statusEn: 'Active Open Source',
    featured: true,
    tagline: {
      ko: '강화학습과 최적제어를 위한 물리 검증 양자 제어 환경 라이브러리 (JAX · dynamiqs)',
      en: 'Physically validated quantum-control environments for RL and optimal control (JAX · dynamiqs)',
    },
    summary: {
      ko: '트랜스몬 게이트, 개방 양자 배터리, Dicke 집단 충전, STIRAP 상태 전송까지 7종 물리 모델을 해석해·QuTiP로 자동 교차 검증하고, JAX jit/vmap/grad로 바로 학습·미분할 수 있게 만든 오픈소스 패키지입니다.',
      en: 'An open-source JAX + dynamiqs library providing jit-able, vmap-able, differentiable quantum control environments—spanning transmon gates, open quantum batteries, Dicke collective charging, and STIRAP—with automated analytic and QuTiP cross-validation.',
    },
    problem: {
      ko: '양자 강화학습 연구마다 해밀토니안과 린드블라드 솔버를 매번 새로 구현하다 보니 부호·단위·수치 오차가 잦고 논문 간 공정 비교가 어렵습니다.',
      en: 'Quantum RL papers routinely re-implement Hamiltonians from scratch with subtle sign, unit, or solver bugs, making cross-paper comparison unreliable.',
    },
    architecture: {
      ko: [
        '물리 모델(Model: drift, controls, jump ops)과 강화학습 어댑터(Environment: reset, step, rollout)를 완전히 분리한 계층 설계.',
        '단일 GPU에서 1,024+ 궤적을 병렬 실행하는 jax.vmap 및 GRAPE형 기울기 제어용 jax.grad 완전 지원.',
        'qenvs validate 명령으로 라비 공식, Gibbs 정상상태, CPTP 제약, QuTiP 교차 검증을 자동화.',
        '파라미터 무작위화, 제어 오차, 유한 샷 관측, Gymnasium 래퍼 및 하드웨어 단위 펄스 내보내기(qenvs.pulses) 제공.',
      ],
      en: [
        'Strict separation of physics (Model: drift, controls, jump ops) from RL/control adapters (Environment: reset, step, rollout).',
        'Full JAX compatibility: jax.vmap over 1,024+ trajectories on one GPU and jax.grad through rollouts for GRAPE-style control.',
        'Automated validation suite (qenvs validate) verifying closed-form Rabi/Gibbs limits, CPTP constraints, and QuTiP cross-checks.',
        'Realistic RL wrappers: ParameterRandomization, ControlErrors, finite-shot ObservationModel, GymnasiumEnv, and pulse export.',
      ],
    },
    metrics: [
      { labelKo: '검증 환경', labelEn: 'Validated Tasks', value: '8 tasks', contextKo: '7종 물리 모델 계열', contextEn: '7 physics model families' },
      { labelKo: 'GRAPE / PPO 충실도', labelEn: 'GRAPE / PPO Fidelity', value: '1.0000 / 0.9997', contextKo: 'qubit/StateTransfer-v0 (3 seeds)', contextEn: 'qubit/StateTransfer-v0 (3 seeds)' },
      { labelKo: '배포 채널', labelEn: 'Distribution', value: 'PyPI · Zenodo', contextKo: 'Apache-2.0 · DOI 발급', contextEn: 'Apache-2.0 · Zenodo DOI' },
      { labelKo: '배치 처리량', labelEn: 'Batch Rollouts', value: '1,024+ traj', contextKo: '단일 GPU jit + vmap', contextEn: 'Single-GPU jit + vmap' },
    ],
    stack: ['Python', 'JAX', 'dynamiqs', 'Gymnasium', 'QuTiP', 'PyPI'],
    links: [
      { labelKo: 'GitHub 저장소', labelEn: 'GitHub Repository', href: 'https://github.com/beomdo-park/QEnvS' },
      { labelKo: '공식 문서', labelEn: 'Documentation', href: 'https://beomdo-park.github.io/QEnvS/' },
      { labelKo: 'PyPI 패키지', labelEn: 'PyPI Package', href: 'https://pypi.org/project/qenvs/' },
      { labelKo: 'Zenodo DOI', labelEn: 'Zenodo DOI', href: 'https://doi.org/10.5281/zenodo.23359969' },
    ],
    labTab: 'qenvs',
  },
  {
    slug: 'roqet',
    name: 'ROQET',
    period: '2026.03 – 2026.11',
    statusKo: '캡스톤 · 학회 발표 완료',
    statusEn: 'Completed · Published',
    featured: true,
    tagline: {
      ko: '1 µs 코히런스 한도 내에서 동작하는 표면 부호 QEC 온칩 AI 디코더 & RTL SoC 가속기',
      en: 'Sub-microsecond on-device surface-code QEC neural decoder & bit-exact RTL SoC accelerator',
    },
    summary: {
      ko: 'Hybrid 지식 증류 + INT8 PTQ로 QECCT 디코더를 26.7 KB·0.34 µs까지 압축해 FPGA/ASIC(PicoRV32 + 16×16 INT8 Systolic Array)에 매핑하고, 분포 외 거리(d=15,17) 손해를 자동 기각하는 58.9k 파라미터 선택적 호출 게이트를 설계했습니다.',
      en: 'Hardware-software co-design for rotated surface-code QEC: (1) Hybrid KD + INT8 PTQ compressing QECCT to 26.7 KB and 0.34 µs with bit-exact RTL, and (2) a 58.9k-param selective dispatch gate that eliminates OOD LER regressions at d=15, 17.',
    },
    problem: {
      ko: '초전도 큐비트의 코히런스 시간은 약 1 µs입니다. 외부 서버로 신드롬을 전송하면 10~100 µs가 걸려 한도를 넘고, 신경망 사전 디코더를 모든 샷에 균일 호출하면 큰 부호 거리(d=13, 17)에서는 오히려 LER이 악화됩니다.',
      en: 'Superconducting qubits decohere within ~1 µs. Off-chip decoding incurs 10–100 µs latency, while uniform neural pre-decoding actively degrades LER at larger code distances (d=13, 17).',
    },
    architecture: {
      ko: [
        'Hybrid KD(Task + Response MSE + Attention Transfer) + 대칭 INT8 PTQ로 모델 크기 99.4% 절감(4,772 KB → 26.7 KB), 지연시간 97.5% 단축(13.52 µs → 0.34 µs).',
        'Xilinx Zynq-7020 BRAM(630 KB)의 4.2%에 가중치 전량 상주 및 Samsung 8nm LPP MPW 타깃 117-cycle 파이프라인 비트정확 RTL(256/256) 검증.',
        '신드롬 텐서 X를 사전 디코더와 병렬로 입력받는 5층 3D-Conv 선택적 호출 게이트(58,881 파라미터): 거리 9 무이득 및 분포 외 거리 15/17에서 호출률 0% 자동 기각, 거리 5에서 27.7% 호출만으로 MWPM 단독 LER 하회.',
      ],
      en: [
        'Hybrid KD + symmetric INT8 PTQ reduces footprint by 99.4% (4,772 KB → 26.7 KB) and latency by 97.5% (13.52 µs → 0.34 µs).',
        'Fits in 4.2% of Xilinx Zynq-7020 BRAM (630 KB); bit-exact integer RTL (256/256) with PicoRV32 + 16×16 systolic array targeting 117-cycle latency.',
        'Parallel 5-layer 3D-Conv Dispatch Gate (58,881 params) achieves 0% calls on neutral d=9 and OOD d=15/17 while cutting NN calls by 72% at d=5.',
      ],
    },
    metrics: [
      { labelKo: '모델 크기', labelEn: 'Model Footprint', value: '26.7 KB', contextKo: 'Teacher 대비 −99.4%', contextEn: '−99.4% vs Teacher' },
      { labelKo: '온칩 추론 지연', labelEn: 'On-Chip Latency', value: '0.34 µs', contextKo: '1 µs 코히런스 한도 충족', contextEn: 'Inside 1 µs coherence limit' },
      { labelKo: 'Faulty Syndrome LER', labelEn: 'Faulty Syndrome LER', value: '~0.9%', contextKo: 'p=0.12 기준 MWPM(7.0%) 대비 우위', contextEn: 'vs 7.0% Union-Find/MWPM at p=0.12' },
      { labelKo: 'Zynq-7020 BRAM', labelEn: 'Zynq-7020 BRAM', value: '4.2%', contextKo: '26.7 / 630 KB 온칩 상주', contextEn: '26.7 / 630 KB on-chip' },
    ],
    stack: ['PyTorch', 'Stim', 'PyMatching', 'INT8 PTQ', 'SystemVerilog', 'Verilator', 'Cocotb', 'Vivado'],
    links: [
      { labelKo: '8주차 개발 기록 시리즈', labelEn: '8-Week Technical Series', href: '/blog?series=ROQET' },
      { labelKo: 'IEIE 2026 포스터', labelEn: 'IEIE 2026 Poster', href: 'https://github.com/beomdo-park/Portfolio/tree/main/2026/0624_IEIE26_Summer' },
    ],
    labTab: 'roqet',
    relatedBlogPrefix: 'project-roqet-',
  },
  {
    slug: 'kaggle-vqcc',
    name: 'Kaggle VQCC',
    period: '2026.10 – Present',
    statusKo: '대회 진행 중',
    statusEn: 'Active Competition',
    featured: false,
    tagline: {
      ko: 'Google Quantum AI Verifiable Quantum Circuit Compilation 자동 합성·검증 파이프라인',
      en: 'Automated circuit synthesis and verifier-closed optimization for Google Quantum AI Kaggle challenge',
    },
    summary: {
      ko: '엄격한 유니터리 오차 허용치 아래 Clifford+T 게이트 수와 회로 깊이를 최소화하기 위한 검증기 폐루프(verifier-in-the-loop) 자동 회로 최적화 파이프라인을 구축했습니다.',
      en: 'High-throughput automated search and mathematical synthesis pipeline targeting minimal T-count and Clifford+T depth under strict unitary verification tolerances.',
    },
    problem: {
      ko: '임의의 다중 큐비트 유니터리 연산을 내결함 게이트 집합으로 컴파일할 때 근사 충실도와 비-Clifford 게이트 비용 사이의 극한 균형을 맞춰야 합니다.',
      en: 'Compiling multi-qubit unitaries into fault-tolerant gate sets requires balancing approximation fidelity against non-Clifford gate cost.',
    },
    architecture: {
      ko: [
        '공식 채점 검증기와 동일한 연산자 노름 오차·게이트 수 검사를 통과한 후보만 채택하는 결정론적 폐루프 하네스.',
        '해석적 분해(Cartan/Solovay-Kitaev)와 국소 템플릿 재작성·게이트 소거를 결합한 하이브리드 컴파일 패스.',
      ],
      en: [
        'Deterministic verifier-closed harness checking exact operator norm error and gate count before accepting candidates.',
        'Hybrid decomposition combining analytical Cartan/Solovay-Kitaev passes with local template rewriting.',
      ],
    },
    metrics: [
      { labelKo: '주최', labelEn: 'Host', value: 'Google Quantum AI', contextKo: 'Kaggle (2026–2027)', contextEn: 'Kaggle Competition (2026–2027)' },
      { labelKo: '검증 방식', labelEn: 'Verification', value: 'Verifier-closed', contextKo: '유니터리 정합성 자동 검증', contextEn: 'Zero-tolerance unitary check' },
    ],
    stack: ['Python', 'NumPy', 'SciPy', 'Qiskit', 'Clifford+T Synthesis'],
    links: [],
  },
  {
    slug: 'industrial-power-ad',
    name: 'Industrial Power AD',
    period: '2025.02 – 2025.07',
    statusKo: 'SCIE · 학회 게재 완료',
    statusEn: 'SCIE · Published',
    featured: false,
    tagline: {
      ko: 'FFT 주기 추출 기반 GELU CNN-GRU 오토인코더 및 DBA K-Means 산업 전력 이상치 탐지',
      en: 'FFT periodicity extraction + GELU CNN-GRU Autoencoder & DBA K-Means power anomaly detection',
    },
    summary: {
      ko: '제조·화공 산업 전력 시계열의 다중 운전 주기를 FFT로 추출해 슬라이딩 윈도우를 자동 구성하고, GELU CNN-GRU 오토인코더 및 DBA K-Means로 이상 구간을 정밀 탐지해 MDPI Energies(SCIE)와 IEIE 1저자 논문으로 발표했습니다.',
      en: 'Industrial electricity consumption anomaly detection combining FFT periodicity-guided windowing, GELU CNN-GRU autoencoders, and DBA K-Means—published in MDPI Energies (SCIE) and IEIE 2025.',
    },
    problem: {
      ko: '공장 전력 부하는 교대 근무와 공정 주기마다 패턴이 달라 고정 윈도우나 단순 임계치 기반 탐지기는 오탐률이 높습니다.',
      en: 'Factory power load curves exhibit multi-scale operating cycles, causing naive windowing and thresholds to produce high false positives.',
    },
    architecture: {
      ko: [
        'FFT 지배 주기 추출을 통해 공정별 실제 운전 주기에 맞춰 입력 윈도우 길이를 자동 산정.',
        'GELU CNN-GRU 오토인코더로 국소 스파이크와 장시간 시계열 드리프트를 동시에 포착.',
      ],
      en: [
        'FFT dominant-period extraction sizes sliding windows automatically to industrial duty cycles.',
        'GELU CNN-GRU Autoencoder captures both local transient spikes and multi-hour sequential drift.',
      ],
    },
    metrics: [
      { labelKo: '국제 저널', labelEn: 'Journal', value: 'MDPI Energies', contextKo: 'SCIE (Vol. 18, Issue 14)', contextEn: 'SCIE (Vol. 18, Issue 14, 2025)' },
      { labelKo: '국내 학회', labelEn: 'Conference', value: 'IEIE 2025', contextKo: '1저자 발표 (제주)', contextEn: '1st Author (Jeju)' },
    ],
    stack: ['PyTorch', 'FFT / Signal Processing', 'scikit-learn', 'Time-Series', 'Pandas'],
    links: [
      { labelKo: 'MDPI Energies 원문', labelEn: 'MDPI Energies Paper', href: 'https://www.mdpi.com/1996-1073/18/14/3720' },
      { labelKo: '5주차 분석 기록', labelEn: '5-Week Technical Series', href: '/blog?series=ABC-2025' },
    ],
    relatedBlogPrefix: 'project-abc-',
  },
];
