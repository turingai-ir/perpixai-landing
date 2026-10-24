import type { Metadata, Viewport } from 'next'
import { config } from '@/config'
import { i18n } from '@/i18n'
import { defaultLocale, localeMeta } from '@/i18n/config'
import { I18nProvider } from '@/i18n/I18nProvider'
import { SITE, getSeo } from '@/lib/seo'
import '@/styles/globals.css'

const locale = defaultLocale

export function generateMetadata(): Metadata {
  const { title, description, brand, keywords } = getSeo(locale)
  const meta = localeMeta[locale]
  const ogImage = { url: '/brand/og.jpg', width: 1200, height: 630, alt: title }
  return {
    metadataBase: new URL(SITE),
    title,
    description,
    applicationName: brand,
    keywords,
    alternates: { canonical: '/', languages: { [meta.hreflang]: '/', 'x-default': '/' } },
    manifest: '/manifest.webmanifest',
    icons: {
      icon: { url: '/brand/logo-192.png', type: 'image/png' },
      apple: { url: '/brand/logo-192.png', type: 'image/png' },
    },
    formatDetection: { telephone: false, email: false, address: false },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-video-preview': -1, 'max-snippet': -1 },
    },
    openGraph: { title, description, type: 'website', locale: meta.ogLocale, url: '/', siteName: brand, images: [ogImage] },
    twitter: { card: 'summary_large_image', title, description, images: [{ url: ogImage.url, alt: title }] },
  }
}

export const viewport: Viewport = {
  themeColor: '#030205',
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'dark',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { jsonLd } = getSeo(locale)
  return (
    <html lang={locale} dir={localeMeta[locale].dir}>
      <head>
        <link rel="preload" href="/brand/logo-192.webp" as="image" type="image/webp" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      </head>
      <body>
        <noscript>
          {/* Without JS the full-screen preloader would never open: hide it (and the letterbox bars) and keep login one tap away. */}
          <style dangerouslySetInnerHTML={{ __html: '[data-preloader],[data-bar]{display:none!important}' }} />
          <p style={{ position: 'relative', zIndex: 80, margin: 0, padding: '1rem', textAlign: 'center', background: '#14111c', color: '#f5efe4' }}>
            {i18n.t('noscript.text', { lng: locale })}{' '}
            <a href={config.authUrl} style={{ color: '#06a1e9' }}>
              {i18n.t('noscript.login', { lng: locale })}
            </a>
          </p>
        </noscript>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  )
}
