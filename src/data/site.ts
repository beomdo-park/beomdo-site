export const SITE = {
  name: 'Beomdo Park',
  title: 'Beomdo Park — Quantum AI & Scientific Machine Learning',
  shortTitle: 'Beomdo Park',
  description:
    'Research engineer working on reinforcement learning for open quantum control, sub-microsecond neural decoders for quantum error correction, and open-source quantum simulation (QEnvS).',
  author: 'Beomdo Park',
  email: 'pbeomdo@gmail.com',
  affiliation: 'Eco AI Lab, Hanbat National University',
  location: 'Daejeon, South Korea',
  verification: {
    google: 'tQV_UbBEk_vL_s9vxCne2Yd0GPHJ4vn8s2pPhfV0PYo',
    naver: '6c1006d6edf85b99c51f1f82aabd2a4fd68ec739',
  },
  links: {
    github: 'https://github.com/beomdo-park',
    qenvsGithub: 'https://github.com/beomdo-park/QEnvS',
    qenvsDocs: 'https://beomdo-park.github.io/QEnvS/',
    qenvsPypi: 'https://pypi.org/project/qenvs/',
    portfolioRepo: 'https://github.com/beomdo-park/Portfolio',
    orcid: 'https://orcid.org/0009-0005-9994-6369',
    scholar: 'https://scholar.google.com/citations?user=MHh0xpwAAAAJ&hl=ko',
    dbpia: 'https://www.dbpia.co.kr/author/authorDetail?ancId=535212349',
    ecoaiLab: 'https://sites.google.com/view/ecoai/introduction',
  },
} as const;

export const NAV_ITEMS = [
  { href: '/research', label: 'Research' },
  { href: '/projects', label: 'Projects' },
  { href: '/lab', label: 'Lab' },
  { href: '/publications', label: 'Publications' },
  { href: '/blog', label: 'Blog' },
  { href: '/guestbook', label: 'Guestbook' },
  { href: '/about', label: 'About' },
] as const;
