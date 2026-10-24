import type { Metadata, Viewport } from 'next'
import { BRAND, SITE, description, jsonLd, title } from '@/lib/seo'
import '@/styles/globals.css'

const ogImage = { url: '/brand/og.jpg', width: 1200, height: 630, alt: title }

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title,
  description,
  applicationName: BRAND,
  keywords: ['پرپیکس', 'ساخت عکس با هوش مصنوعی', 'ساخت ویدیو با هوش مصنوعی', 'هوش مصنوعی فارسی', 'متن به تصویر', 'متن به ویدیو', 'ویرایش عکس با هوش مصنوعی'],
  alternates: { canonical: '/', languages: { 'fa-IR': '/', 'x-default': '/' } },
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
  openGraph: {
    title,
    description,
    type: 'website',
    locale: 'fa_IR',
    url: '/',
    siteName: BRAND,
    images: [ogImage],
  },
  twitter: { card: 'summary_large_image', title, description, images: [{ url: ogImage.url, alt: title }] },
}

export const viewport: Viewport = {
  themeColor: '#030205',
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'dark',
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
