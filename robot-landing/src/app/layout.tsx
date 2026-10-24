import type { Metadata, Viewport } from 'next'
import '@/styles/globals.css'

const SITE = 'https://perpixai.ir'
const title = 'پرپیکس — ساخت تصویر و ویدیو با هوش مصنوعی'
const description = 'با پرپیکس از یک جمله، تصویر و ویدیو بساز. ثبت‌نام رایگان با اعتبار هدیه.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title,
  description,
  applicationName: 'پرپیکس',
  alternates: { canonical: '/' },
  icons: { icon: { url: '/brand/logo-192.png', type: 'image/png' } },
  openGraph: {
    title,
    description,
    type: 'website',
    locale: 'fa_IR',
    url: '/',
    siteName: 'پرپیکس',
    images: [{ url: '/brand/og.jpg' }],
  },
  twitter: { card: 'summary_large_image', title, description, images: ['/brand/og.jpg'] },
}

export const viewport: Viewport = {
  themeColor: '#07060d',
  width: 'device-width',
  initialScale: 1,
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Perpix',
  alternateName: 'پرپیکس',
  url: SITE,
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Web',
  inLanguage: 'fa',
  description: 'ساخت تصویر و ویدیو با هوش مصنوعی',
  offers: { '@type': 'AggregateOffer', priceCurrency: 'IRR', lowPrice: '5648400', highPrice: '37656000', offerCount: '3' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="preload" href="/brand/logo-192.webp" as="image" type="image/webp" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
