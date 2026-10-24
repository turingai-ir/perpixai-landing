import type { MetadataRoute } from 'next'
import { BRAND, description } from '@/lib/seo'

export const dynamic = 'force-static'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND} — ساخت عکس و ویدیو با هوش مصنوعی`,
    short_name: BRAND,
    description,
    lang: 'fa',
    dir: 'rtl',
    start_url: '/',
    display: 'browser',
    background_color: '#030205',
    theme_color: '#030205',
    icons: [
      { src: '/brand/logo-192.png', sizes: '192x159', type: 'image/png' },
      { src: '/brand/logo.png', sizes: '529x437', type: 'image/png' },
    ],
  }
}
