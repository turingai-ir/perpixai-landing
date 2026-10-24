import { useRef } from 'react'
import { clsx } from 'clsx'
import { useOffscreenPause } from '@/lib/useOffscreenPause'
import { useTranslation } from 'react-i18next'
import { plans } from '@/content/sections'
import { formatNumber } from '@/i18n/format'
import { Icon } from '@/ui/Icon'
import { SplitHeading } from '@/ui/SplitHeading'

/** The box office: each plan is a cinema ticket with a tear-off stub. */
export function Plans({ onChoose }: { onChoose: (planId: string) => void }) {
  const { t } = useTranslation('home')
  const { t: tu } = useTranslation()
  const title = t('plans.title', { returnObjects: true })
  const root = useRef<HTMLElement>(null)
  useOffscreenPause(root)
  return (
    <section ref={root} id="plans" className="relative px-5 py-28 md:px-14 md:py-36">
      <div aria-hidden className="absolute inset-x-0 top-0 h-2/3 bg-radial-[ellipse_50%_60%_at_50%_0%] from-purple/15 to-transparent" />
      <div className="relative mx-auto max-w-6xl">
        <header className="mb-16 flex flex-col items-center text-center">
          <div className="mb-6 inline-flex flex-col gap-1.5">
            <div className="bulbs w-full" />
            <span className="neon px-4 font-poster text-3xl md:text-4xl">{t('plans.box')}</span>
            <div className="bulbs w-full" style={{ animationDelay: '-0.8s' }} />
          </div>
          <SplitHeading lines={title} text={title.join(' ')} className="font-poster text-5xl leading-[1.15] md:text-7xl" />
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">{t('plans.body')}</p>
        </header>

        <ul className="mx-auto grid max-w-md items-start gap-8 lg:max-w-none lg:grid-cols-3 lg:gap-6">
          {plans.map((p, i) => (
            <li key={p.id} data-reveal className={clsx('@container relative', p.featured && 'lg:-mt-6')}>
              {p.featured && (
                <div aria-hidden className="absolute -inset-3 rounded-4xl bg-radial from-primary/33 to-transparent to-70% blur-2xl" />
              )}
              <article
                className={clsx(
                  'ticket relative flex flex-col rounded-3xl',
                  p.featured ? 'bg-linear-160 from-featured-start via-featured-mid via-55% to-featured-end' : 'bg-muted',
                )}
                style={{ ['--tear' as string]: 'calc(100% - 97px)' }}
              >
                {p.featured && <div aria-hidden className="bg-brand absolute inset-x-0 top-0 h-1 rounded-t-3xl" />}
                <div className="flex flex-col p-7 pb-6 md:p-8">
                  <div className="flex items-center justify-between text-xs text-subtle-foreground">
                    <span>{t('plans.ticket')}</span>
                    <span dir="ltr" className="font-mono">
                      № {String(i + 1).padStart(3, '0')}
                    </span>
                  </div>
                  <div className="mt-5 flex items-center justify-between">
                    <h3 className={clsx('font-poster text-4xl', p.featured && 'neon')}>{t(`plans.items.${p.id}.name`)}</h3>
                    {p.featured && (
                      <span className="rotate-[-6deg] rounded-md border-2 border-amber/80 px-2.5 py-0.5 text-sm font-bold text-amber">
                        {t('plans.recommended')}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 min-h-[3.4rem] leading-7 text-muted-foreground">{t(`plans.items.${p.id}.tagline`)}</p>

                  <div className="mt-5 min-h-[1.6rem]">
                    {p.was && p.off != null && (
                      <span className="flex items-center gap-2 text-sm">
                        <s className="text-subtle-foreground">{formatNumber(p.was)}</s>
                        <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-bold text-primary-soft">
                          {t('plans.percentOff', { percent: tu('percent', { n: formatNumber(p.off) }) })}
                        </span>
                      </span>
                    )}
                  </div>
                  <p className="mt-1 flex flex-wrap items-baseline gap-x-2 font-poster leading-none">
                    <span className="text-4xl @min-[320px]:text-5xl @min-[368px]:text-price">{formatNumber(p.price)}</span>
                    <span className="text-xl text-muted-foreground">{t('plans.currency')}</span>
                  </p>

                  <ul className="mt-7 space-y-3">
                    {t(`plans.items.${p.id}.features`, { returnObjects: true, tokens: formatNumber(p.tokens) }).map((f) => (
                      <li key={f} className="flex gap-3 text-body-sm leading-7 text-foreground/90">
                        <Icon name="check" className="mt-1.5 size-4 shrink-0 text-accent" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tear line + stub */}
                <div aria-hidden className="mx-6 border-t-2 border-dashed border-foreground/15" />
                <div className="flex h-24 items-center justify-between gap-4 px-7 md:px-8">
                  <p className="flex items-center gap-2 text-sm font-semibold text-accent">
                    <Icon name="gift" className="size-5" />
                    {t('plans.tokens', { tokens: formatNumber(p.tokens) })}
                  </p>
                  <button
                    type="button"
                    onClick={() => onChoose(p.id)}
                    className={clsx(
                      'cursor-pointer rounded-full px-5 py-3 text-sm font-bold transition duration-300 hover:-translate-y-0.5',
                      p.featured
                        ? 'bg-brand text-primary-foreground shadow-cta'
                        : 'border border-foreground/25 text-foreground hover:border-foreground/50 hover:bg-white/5',
                    )}
                  >
                    {t('plans.choose', { name: t(`plans.items.${p.id}.name`) })}
                  </button>
                </div>
              </article>
            </li>
          ))}
        </ul>
        <p className="mt-10 text-center text-muted-foreground">{t('plans.note')}</p>
      </div>
    </section>
  )
}
