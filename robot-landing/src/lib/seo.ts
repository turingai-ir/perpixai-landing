import { demos } from '@/content/demos'
import { plans } from '@/content/sections'
import { defaultLocale, localeMeta, type Locale } from '@/i18n/config'
import { i18n } from '@/i18n'

export const SITE = 'https://perpixai.ir'

/** `<meta name="theme-color">` and the manifest cannot read CSS variables: this is `--background` in styles/theme.css (`pnpm check:theme` verifies). */
export const THEME_COLOR = '#030205'

/** Date the demo clips were added (their upload date). */
const UPLOADED = '2026-10-23'

/** Display prices are Toman; schema.org wants the amount in Rial (IRR). */
const toRial = (toman: number) => String(toman * 10)

/** All SEO copy for a locale, read from the `seo`/`home`/`demos` translation namespaces. */
export function getSeo(locale: Locale = defaultLocale) {
  const t = i18n.getFixedT(locale, 'seo')
  const th = i18n.getFixedT(locale, 'home')
  const td = i18n.getFixedT(locale, 'demos')
  const meta = localeMeta[locale]

  const brand = t('siteName')
  const title = t('title')
  const description = t('description')
  const faq = th('faq.items', { returnObjects: true })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE}/#org`,
        name: 'Perpix',
        alternateName: brand,
        url: SITE,
        logo: `${SITE}/brand/logo.png`,
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE}/#site`,
        url: SITE,
        name: brand,
        inLanguage: meta.hreflang,
        publisher: { '@id': `${SITE}/#org` },
      },
      {
        '@type': 'WebPage',
        '@id': `${SITE}/#page`,
        url: SITE,
        name: title,
        description,
        inLanguage: meta.hreflang,
        isPartOf: { '@id': `${SITE}/#site` },
        about: { '@id': `${SITE}/#app` },
        primaryImageOfPage: { '@type': 'ImageObject', url: `${SITE}/brand/og.jpg`, width: 1200, height: 630 },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${SITE}/#app`,
        name: 'Perpix',
        alternateName: brand,
        url: SITE,
        description,
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'Web',
        inLanguage: meta.hreflang,
        image: `${SITE}/brand/og.jpg`,
        publisher: { '@id': `${SITE}/#org` },
        offers: plans.map((p) => ({
          '@type': 'Offer',
          name: th(`plans.items.${p.id}.name`),
          description: th(`plans.items.${p.id}.tagline`),
          price: toRial(p.price),
          priceCurrency: 'IRR',
          url: `${SITE}/#plans`,
          availability: 'https://schema.org/InStock',
        })),
      },
      {
        '@type': 'FAQPage',
        '@id': `${SITE}/#faq`,
        inLanguage: meta.hreflang,
        mainEntity: faq.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      ...demos
        .filter((d) => d.ready)
        .map((d) => ({
          '@type': 'VideoObject',
          name: td(`${d.id}.chip`),
          description: t('videoDescription', { prompt: td(`${d.id}.prompt`) }),
          thumbnailUrl: `${SITE}/demo/${d.id}.jpg`,
          contentUrl: `${SITE}/demo/${d.id}.mp4`,
          uploadDate: UPLOADED,
          inLanguage: meta.hreflang,
          isFamilyFriendly: true,
          publisher: { '@id': `${SITE}/#org` },
        })),
    ],
  }

  return {
    brand,
    title,
    description,
    shortDescription: t('shortDescription'),
    manifestName: t('manifestName'),
    keywords: t('keywords', { returnObjects: true }),
    jsonLd,
  }
}
