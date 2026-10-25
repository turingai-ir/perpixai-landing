'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { Footer } from '@/sections/Footer'
import { Icon } from '@/ui/Icon'
import { PageHeader } from '@/ui/PageHeader'

const card = 'flex flex-col rounded-3xl border border-border bg-card/80 p-6 md:p-8'
const label = 'text-sm text-subtle-foreground'
const action =
  'mt-6 inline-flex items-center gap-2 self-start rounded-full border border-foreground/25 px-5 py-3 text-sm font-semibold text-foreground transition duration-300 hover:-translate-y-0.5 hover:border-foreground/50 hover:bg-white/5 pointer-coarse:min-h-11'

/** Contact: the three ways to reach support, in the same cinema look as the legal pages. Copy: `locales/<lang>/contact.json`. */
export function Contact() {
  const { t } = useTranslation('contact')
  return (
    <>
      <PageHeader />
      <main className="relative overflow-hidden px-5 pt-32 pb-24 md:px-14 md:pt-40 md:pb-32">
        <div aria-hidden className="absolute inset-x-0 top-0 h-2/3 bg-radial-[ellipse_50%_60%_at_50%_0%] from-purple/15 to-transparent" />
        <div className="relative mx-auto max-w-6xl">
          <header className="mb-14 max-w-3xl md:mb-20">
            <div className="mb-6 inline-flex flex-col gap-1.5">
              <div className="bulbs w-full" />
              <span className="eyebrow px-4 py-1">{t('eyebrow')}</span>
              <div className="bulbs w-full" style={{ animationDelay: '-0.8s' }} />
            </div>
            <h1 className="font-poster text-5xl leading-[1.25] md:text-7xl">
              <span className="text-brand">{t('title')}</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">{t('intro')}</p>
          </header>

          <ul className="grid gap-6 md:grid-cols-2">
            <li className={card}>
              <p className={label}>{t('telegram.label')}</p>
              <p dir="ltr" className="mt-3 text-end font-poster text-3xl break-all">
                {t('telegram.value')}
              </p>
              <a
                href={t('telegram.url')}
                target="_blank"
                rel="noopener noreferrer"
                className={`bg-brand text-primary-foreground ${action} border-transparent`}
              >
                {t('telegram.action')}
                <Icon name="arrow" className="size-4" />
              </a>
            </li>
            <li className={card}>
              <p className={label}>{t('phone.label')}</p>
              <p dir="ltr" className="mt-3 text-end font-poster text-3xl">
                {t('phone.value')}
              </p>
              <a href={`tel:${t('phone.value')}`} className={action}>
                {t('phone.action')}
                <Icon name="arrow" className="size-4" />
              </a>
            </li>
            <li className={card}>
              <p className={label}>{t('email.label')}</p>
              <p dir="ltr" className="mt-3 text-end font-poster text-2xl break-all md:text-3xl">
                {t('email.value')}
              </p>
              <a href={`mailto:${t('email.value')}`} className={action}>
                {t('email.action')}
                <Icon name="arrow" className="size-4" />
              </a>
            </li>
            <li className={card}>
              <p className={label}>{t('address.label')}</p>
              <p className="mt-3 text-lg leading-8 text-foreground/90">{t('address.value')}</p>
            </li>
          </ul>

          <p className="mt-14">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground pointer-coarse:min-h-11"
            >
              <Icon name="arrow" className="size-4" /> {t('back')}
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
