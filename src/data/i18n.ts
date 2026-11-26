export type Locale = 'ko' | 'en';

export function getLocalePath(locale: Locale, path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (locale === 'en') {
    return clean === '/' ? '/en/' : `/en${clean}`;
  }
  return clean;
}

export function switchLocalePath(currentPathname: string, target: Locale): string {
  const p = currentPathname || '/';
  // Blog post slugs live under /blog/<slug> (original Korean prose)
  if (p.startsWith('/blog/') && p !== '/blog/' && target === 'en') {
    return '/en/blog/';
  }
  if (p === '/en' || p === '/en/') {
    return target === 'ko' ? '/' : '/en/';
  }
  if (p.startsWith('/en/')) {
    const stripped = p.slice(3) || '/';
    return target === 'ko' ? stripped : p;
  }
  return target === 'en' ? (p === '/' ? '/en/' : `/en${p}`) : p;
}

export const NAV_LABELS: Record<Locale, { href: string; label: string }[]> = {
  ko: [
    { href: '/', label: '소개' },
    { href: '/publications', label: '논문' },
    { href: '/projects', label: '프로젝트' },
    { href: '/blog', label: '블로그' },
    { href: '/cv', label: '이력' },
  ],
  en: [
    { href: '/en/', label: 'Home' },
    { href: '/en/publications', label: 'Publications' },
    { href: '/en/projects', label: 'Projects' },
    { href: '/en/blog', label: 'Blog' },
    { href: '/en/cv', label: 'CV' },
  ],
};

export const UI_STRINGS = {
  ko: {
    brandName: '박범도',
    brandSub: 'Beomdo Park',
    searchPlaceholder: '검색',
    footerNote: 'Astro · React · Cloudflare Workers & D1 기반 개인 연구 홈페이지 및 기술 블로그',
    guestbook: '방명록',
    allPublications: '전체 20편 + 특허 보기',
    allProjects: '프로젝트 전체 보기',
    allPosts: '블로그 전체 글 보기',
    interactiveDemo: '인터랙티브 데모',
    caseStudy: '상세 보기',
    selectedPubs: '대표 논문 및 특허',
    selectedProjects: '주요 프로젝트',
    researchFocus: '연구 분야',
    recentWriting: '기술 블로그 최근 글',
    recentWritingDesc: '포트폴리오와 별개로 운영하는 연구·구현 기록 공간입니다.',
    viewDbpiaAuthor: 'DBpia 저자 페이지',
    skipToContent: '본문으로 건너뛰기',
  },
  en: {
    brandName: 'Beomdo Park',
    brandSub: '박범도',
    searchPlaceholder: 'Search',
    footerNote: 'Personal researcher homepage & engineering blog on Astro, React, and Cloudflare Workers + D1.',
    guestbook: 'Guestbook',
    allPublications: 'View all 20 papers & patent',
    allProjects: 'All projects',
    allPosts: 'Browse all blog posts',
    interactiveDemo: 'Interactive demo',
    caseStudy: 'Case study',
    selectedPubs: 'Selected Publications & Patent',
    selectedProjects: 'Selected Projects',
    researchFocus: 'Research Focus',
    recentWriting: 'Recent Technical Notes',
    recentWritingDesc: 'Implementation logs and experiment notes (written primarily in Korean).',
    viewDbpiaAuthor: 'DBpia Author Profile',
    skipToContent: 'Skip to content',
  },
} as const;
