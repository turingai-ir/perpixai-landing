import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/seo'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${SITE}/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 }]
}
