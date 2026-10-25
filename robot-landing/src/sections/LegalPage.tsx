'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { localizeDigits } from '@/i18n/format'
import { Footer } from '@/sections/Footer'
import { Icon } from '@/ui/Icon'
import { PageHeader } from '@/ui/PageHeader'

const sectionId = (i: number) => `s${i + 1}`
const number = (i: number) => localizeDigits(String(i + 1).padStart(2, '0'))

/** A legal document (terms, privacy): the cinema look of the landing as a readable page with a section index. Copy: `locales/<lang>/<ns>.json`. */
export function LegalPage({ ns }: { ns: 'terms' | 'privacy' }) {
  const { t } = useTranslation(ns)
  const sections = t('sections', { returnObjects: true })
  const contact = t('contact', { returnObjects: true })

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
            <h1 className="font-poster text-4xl leading-[1.25] md:text-6xl">
              <span className="text-brand">{t('title')}</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">{t('intro')}</p>
            <p className="mt-4 text-sm text-subtle-foreground">{t('updated')}</p>
          </header>

          <div className="grid gap-10 lg:grid-cols-[15rem_1fr] lg:gap-16">
            <nav aria-label={t('tocLabel')} className="lg:sticky lg:top-28 lg:self-start">
              <p className="mb-3 text-sm font-semibold text-foreground">{t('tocLabel')}</p>
              <ol className="space-y-1 border-s border-border">
                {sections.map((s, i) => (
                  <li key={s.title}>
                    <a
                      href={`#${sectionId(i)}`}
                      className="flex gap-3 py-1.5 ps-4 text-sm text-muted-foreground transition hover:text-foreground pointer-coarse:min-h-11 pointer-coarse:items-center"
                    >
                      <span className="font-poster text-foreground/60">{number(i)}</span>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="space-y-6">
              {sections.map((s, i) => (
                <section
                  key={s.title}
                  id={sectionId(i)}
                  className="scroll-mt-28 rounded-3xl border border-border bg-card/80 p-6 md:p-8"
                  aria-labelledby={`${sectionId(i)}-title`}
                >
                  <div className="mb-5 flex items-center gap-4">
                    <span className="text-brand font-poster text-3xl leading-none">{number(i)}</span>
                    <h2 id={`${sectionId(i)}-title`} className="font-poster text-2xl leading-snug md:text-3xl">
                      {s.title}
                    </h2>
                  </div>
                  <div className="space-y-4 leading-8 text-muted-foreground">
                    {s.lead.map((p) => (
                      <p key={p}>{p}</p>
                    ))}
                    {s.note.map((p) => (
                      <p key={p} className="rounded-xl border-s-2 border-amber bg-amber/5 p-4 text-foreground/90">
                        {p}
                      </p>
                    ))}
                    {s.items.length > 0 && (
                      <ul className="space-y-3">
                        {s.items.map((item) => (
                          <li key={item} className="flex gap-3">
                            <span aria-hidden className="mt-3 size-1.5 shrink-0 rounded-full bg-primary" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                    {s.tail.map((p) => (
                      <p key={p}>{p}</p>
                    ))}
                    {i === sections.length - 1 && (
                      <p>
                        {contact.before}{' '}
                        <a
                          href={`mailto:${contact.email}`}
                          dir="ltr"
                          className="inline-block text-accent underline-offset-4 hover:underline"
                        >
                          {contact.email}
                        </a>
                        {contact.after && ` ${contact.after}`}
                      </p>
                    )}
                  </div>
                </section>
              ))}
            </div>
          </div>

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
