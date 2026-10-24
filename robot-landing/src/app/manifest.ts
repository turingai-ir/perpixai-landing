import type { MetadataRoute } from 'next'
import { defaultLocale, localeMeta } from '@/i18n/config'
import { THEME_COLOR, getSeo } from '@/lib/seo'

export const dynamic = 'force-static'

export default function manifest(): MetadataRoute.Manifest {
  const { brand, manifestName, description } = getSeo()
  return {
    name: manifestName,
    short_name: brand,
    description,
    lang: defaultLocale,
    dir: localeMeta[defaultLocale].dir,
    start_url: '/',
    display: 'browser',
    background_color: THEME_COLOR,
    theme_color: THEME_COLOR,
    icons: [
      { src: '/brand/logo-192.png', sizes: '192x159', type: 'image/png' },
      { src: '/brand/logo.png', sizes: '529x437', type: 'image/png' },
    ],
  }
}
