import { demos } from '@/content/demos'
import { faq, plans } from '@/content/sections'
import { toEn } from '@/lib/digits'

export const SITE = 'https://perpixai.ir'
export const BRAND = 'پرپیکس'
export const title = 'پرپیکس — ساخت عکس و ویدیو با هوش مصنوعی به فارسی'
export const description =
  'با پرپیکس از یک جمله فارسی، تصویر و ویدیو سینمایی بساز؛ ۱۶ مدل هوش مصنوعی با یک حساب. ثبت‌نام رایگان با اعتبار هدیه.'

/** Display prices are Toman; schema.org wants the amount in Rial (IRR). */
const toRial = (price: string) => String(Number(toEn(price).replace(/,/g, '')) * 10)

/** Date the demo clips were added (their upload date). */
const UPLOADED = '2026-10-23'

/** One @graph so entities reference each other instead of repeating. */
export const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE}/#org`,
      name: 'Perpix',
      alternateName: BRAND,
      url: SITE,
      logo: `${SITE}/brand/logo.png`,
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE}/#site`,
      url: SITE,
      name: BRAND,
      inLanguage: 'fa-IR',
      publisher: { '@id': `${SITE}/#org` },
    },
    {
      '@type': 'WebPage',
      '@id': `${SITE}/#page`,
      url: SITE,
      name: title,
      description,
      inLanguage: 'fa-IR',
      isPartOf: { '@id': `${SITE}/#site` },
      about: { '@id': `${SITE}/#app` },
      primaryImageOfPage: { '@type': 'ImageObject', url: `${SITE}/brand/og.jpg`, width: 1200, height: 630 },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${SITE}/#app`,
      name: 'Perpix',
      alternateName: BRAND,
      url: SITE,
      description,
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Web',
      inLanguage: 'fa-IR',
      image: `${SITE}/brand/og.jpg`,
      publisher: { '@id': `${SITE}/#org` },
      offers: plans.map((p) => ({
        '@type': 'Offer',
        name: p.name,
        description: p.tagline,
        price: toRial(p.price),
        priceCurrency: 'IRR',
        url: `${SITE}/#plans`,
        availability: 'https://schema.org/InStock',
      })),
    },
    {
      '@type': 'FAQPage',
      '@id': `${SITE}/#faq`,
      inLanguage: 'fa-IR',
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
        name: d.chip,
        description: `ویدیویی که با پرپیکس از این جمله ساخته شده: «${d.prompt}»`,
        thumbnailUrl: `${SITE}/demo/${d.id}.jpg`,
        contentUrl: `${SITE}/demo/${d.id}.mp4`,
        uploadDate: UPLOADED,
        inLanguage: 'fa-IR',
        isFamilyFriendly: true,
        publisher: { '@id': `${SITE}/#org` },
      })),
  ],
}
