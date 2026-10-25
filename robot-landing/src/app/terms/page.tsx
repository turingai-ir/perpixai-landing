import type { Metadata } from 'next'
import { i18n } from '@/i18n'
import { defaultLocale, localeMeta } from '@/i18n/config'
import { LegalPage } from '@/sections/LegalPage'

export function generateMetadata(): Metadata {
  const t = i18n.getFixedT(defaultLocale, 'terms')
  const title = t('meta.title')
  const description = t('meta.description')
  const meta = localeMeta[defaultLocale]
  return {
    title,
    description,
    alternates: { canonical: '/terms/', languages: { [meta.hreflang]: '/terms/', 'x-default': '/terms/' } },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: meta.ogLocale,
      url: '/terms/',
      images: [{ url: '/brand/og.jpg', width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [{ url: '/brand/og.jpg', alt: title }] },
  }
}

export default function TermsPage() {
  return <LegalPage ns="terms" />
}
