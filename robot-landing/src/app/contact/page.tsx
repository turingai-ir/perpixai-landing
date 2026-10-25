import type { Metadata } from 'next'
import { i18n } from '@/i18n'
import { defaultLocale, localeMeta } from '@/i18n/config'
import { Contact } from '@/sections/Contact'

export function generateMetadata(): Metadata {
  const t = i18n.getFixedT(defaultLocale, 'contact')
  const title = t('meta.title')
  const description = t('meta.description')
  const meta = localeMeta[defaultLocale]
  return {
    title,
    description,
    alternates: { canonical: '/contact/', languages: { [meta.hreflang]: '/contact/', 'x-default': '/contact/' } },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: meta.ogLocale,
      url: '/contact/',
      images: [{ url: '/brand/og.jpg', width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [{ url: '/brand/og.jpg', alt: title }] },
  }
}

export default function ContactPage() {
  return <Contact />
}
