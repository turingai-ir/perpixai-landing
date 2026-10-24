import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/seo'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  // Everything is public marketing content: search engines and AI answer engines are welcome.
  return { rules: { userAgent: '*', allow: '/' }, sitemap: `${SITE}/sitemap.xml`, host: SITE }
}
