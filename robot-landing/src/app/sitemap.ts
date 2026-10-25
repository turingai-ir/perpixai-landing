import type { MetadataRoute } from 'next'
import { getLandingData } from '@/lib/landing/server'
import { SITE } from '@/lib/seo'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${SITE}/`, lastModified: getLandingData().fetchedAt, changeFrequency: 'weekly', priority: 1 }]
}
