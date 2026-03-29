import type { IconMap, SocialLink, Site } from '@/types'

export const SITE: Site = {
  title: 'carta na garrafa',
  description:
    'delírios de uma pessoa insubordinada e ingovernável.',
  href: 'https://alanmm.dev/blog',
  author: 'alein',
  locale: 'pt-BR',
  featuredPostCount: 2,
  postsPerPage: 3,
}

export const NAV_LINKS: SocialLink[] = [
  // {
  //   href: '/blog',
  //   label: 'blog',
  // },
  // {
  //   href: '/authors',
  //   label: 'authors',
  // },
  // {
  //   href: '/about',
  //   label: 'Sobre',
  // },
]

export const SOCIAL_LINKS: SocialLink[] = [
  {
    href: 'https://bsky.app/profile/piratariaonline.bsky.social',
    label: 'Bluesky',
  },
  {
    href: '/rss.xml',
    label: 'RSS',
  },
]

export const ICON_MAP: IconMap = {
  Bluesky: 'simple-icons:bluesky',
  Email: 'lucide:mail',
  RSS: 'lucide:rss',
}
