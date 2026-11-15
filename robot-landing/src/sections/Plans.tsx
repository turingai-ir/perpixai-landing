import { useRef } from 'react'
import { clsx } from 'clsx'
import { useOffscreenPause } from '@/lib/useOffscreenPause'
import { useTranslation } from 'react-i18next'
import { formatNumber } from '@/i18n/format'
import { durationLabels, primaryDuration } from '@/lib/landing/format'
import { useLanding } from '@/lib/landing/client'
import { Icon } from '@/ui/Icon'
import { SplitHeading } from '@/ui/SplitHeading'

/** The API quotes the wallet top-up saving for this many credits. */
const TOPUP_SAVING_CREDITS = 1000

/** Desktop columns follow the number of paid plans the API returns (Tailwind needs the class names spelled out). */
const DESKTOP_COLUMNS: Record<number, string> = {
  1: 'lg:max-w-md lg:grid-cols-1',
  2: 'lg:max-w-3xl lg:grid-cols-2',
  3: 'lg:max-w-none lg:grid-cols-3',
  4: 'lg:max-w-none lg:grid-cols-2 xl:grid-cols-4',
}

/** The box office: each plan is a cinema ticket with a tear-off stub. Prices, credits and copy come from the API. */
export function Plans({ onChoose }: { onChoose: (planSlug: string) => void }) {
  const { t } = useTranslation('home')
  const { t: tu } = useTranslation()
  const landing = useLanding()
  const title = t('plans.title', { returnObjects: true })
  const { plans, freePlan } = landing
  const main = durationLabels(primaryDuration(landing), t)
  const root = useRef<HTMLElement>(null)
  useOffscreenPause(root)

  return (
    <section ref={root} id="plans" data-source={landing.source} className="relative px-5 py-28 md:px-14 md:py-36">
      <div aria-hidden className="absolute inset-x-0 top-0 h-2/3 bg-radial-[ellipse_50%_60%_at_50%_0%] from-purple/15 to-transparent" />
      <div className="relative mx-auto max-w-6xl">
        <header className="mb-16 flex flex-col items-center text-center">
          <div className="mb-6 inline-flex flex-col gap-1.5">
            <div className="bulbs w-full" />
            <span className="neon px-4 font-poster text-3xl md:text-4xl">{t('plans.box')}</span>
            <div className="bulbs w-full" style={{ animationDelay: '-0.8s' }} />
          </div>
          <SplitHeading lines={title} text={title.join(' ')} className="font-poster text-5xl leading-[1.15] md:text-7xl" />
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">{t('plans.body', { adj: main.adj })}</p>
        </header>

        <ul
          className={clsx(
            'mx-auto grid max-w-md items-stretch gap-8 lg:gap-6',
            DESKTOP_COLUMNS[plans.length] ?? 'lg:max-w-none lg:grid-cols-3',
          )}
        >
          {plans.map((p, i) => (
            <li key={p.id} data-reveal className="@container relative flex h-full flex-col">
              {p.recommended && (
                <div aria-hidden className="absolute -inset-3 rounded-4xl bg-radial from-primary/33 to-transparent to-70% blur-2xl" />
              )}
              <article
                className={clsx(
                  'ticket relative flex h-full flex-1 flex-col rounded-3xl',
                  p.recommended ? 'bg-linear-160 from-featured-start via-featured-mid via-55% to-featured-end' : 'bg-muted',
                )}
                style={{ ['--tear' as string]: 'calc(100% - 97px)' }}
              >
                {p.recommended && <div aria-hidden className="bg-brand absolute inset-x-0 top-0 h-1 rounded-t-3xl" />}
                <div className="flex flex-1 flex-col p-6 pb-5 md:p-7 xl:px-6">
                  <div className="flex items-center justify-between text-xs text-subtle-foreground">
                    <span>{t('plans.ticket', { adj: durationLabels(p.durationDays, t).adj })}</span>
                    <span dir="ltr" className="font-mono">
                      № {String(i + 1).padStart(3, '0')}
                    </span>
                  </div>
                  <div className="mt-5 flex min-h-10 items-center justify-between">
                    <h3 className={clsx('font-poster text-4xl', p.recommended && 'neon')}>{p.name}</h3>
                    {p.recommended && (
                      <span className="rotate-[-6deg] rounded-md border-2 border-amber/80 px-2.5 py-0.5 text-sm font-bold text-amber">
                        {t('plans.recommended')}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 min-h-[5.25rem] leading-7 text-muted-foreground">{p.tagline}</p>

                  <div className="mt-5 min-h-[1.6rem]">
                    {p.wasToman != null && p.offPercent != null && (
                      <span className="flex items-center gap-2 text-sm">
                        <s className="text-subtle-foreground">{formatNumber(p.wasToman)}</s>
                        <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-bold text-primary-soft">
                          {t('plans.percentOff', { percent: tu('percent', { n: formatNumber(p.offPercent) }) })}
                        </span>
                      </span>
                    )}
                  </div>
                  <p className="mt-1 flex flex-wrap items-baseline gap-x-1.5 font-poster leading-none">
                    <span className="text-3xl leading-none @min-[290px]:text-4xl @min-[330px]:text-5xl @min-[380px]:text-price">
                      {formatNumber(p.priceToman)}
                    </span>
                    <span className="text-lg text-muted-foreground @min-[330px]:text-xl">{t('plans.currency')}</span>
                  </p>

                  {p.topupSavingToman > 0 && (
                    <p className="mt-6 flex gap-3 text-body-sm leading-7 text-foreground/90">
                      <Icon name="check" className="mt-1.5 size-4 shrink-0 text-accent" />
                      {t('plans.topupSaving', { credits: formatNumber(TOPUP_SAVING_CREDITS), amount: formatNumber(p.topupSavingToman) })}
                    </p>
                  )}
                </div>

                {/* Tear line + stub */}
                <div aria-hidden className="mx-6 border-t-2 border-dashed border-foreground/15" />
                <div className="flex flex-col items-center justify-between gap-2 px-6 py-3 md:px-7">
                  <p className="flex items-center gap-2 text-sm font-semibold text-accent">
                    <Icon name="gift" className="size-5" />
                    {t('plans.tokens', { tokens: formatNumber(p.credits) })}
                  </p>
                  <button
                    type="button"
                    onClick={() => onChoose(p.slug)}
                    className={clsx(
                      'cursor-pointer rounded-full px-5 py-3 text-sm font-bold transition duration-300 hover:-translate-y-0.5 pointer-coarse:min-h-11',
                      p.recommended
                        ? 'bg-brand text-primary-foreground shadow-cta'
                        : 'border border-foreground/25 text-foreground hover:border-foreground/50 hover:bg-white/5',
                    )}
                  >
                    {t('plans.choose', { name: p.name })}
                  </button>
                </div>
              </article>
            </li>
          ))}
        </ul>

        {freePlan && (
          <div
            data-reveal
            className="mx-auto mt-12 flex max-w-md flex-col items-center gap-4 rounded-3xl border border-dashed border-foreground/20 p-6 text-center lg:max-w-3xl lg:flex-row lg:justify-between lg:text-start"
          >
            <div>
              <p className="text-sm text-muted-foreground">{t('plans.free.lead')}</p>
              <p className="mt-1 font-poster text-3xl">{freePlan.name}</p>
              <p className="mt-1 text-sm text-accent">{t('plans.free.meta', { credits: formatNumber(freePlan.credits) })}</p>
            </div>
            <button
              type="button"
              onClick={() => onChoose(freePlan.slug)}
              className="cursor-pointer rounded-full border border-foreground/25 px-6 py-3 text-sm font-bold text-foreground transition duration-300 hover:-translate-y-0.5 hover:border-foreground/50 hover:bg-white/5 pointer-coarse:min-h-11"
            >
              {t('plans.free.cta')}
            </button>
          </div>
        )}

        <p className="mt-10 text-center text-muted-foreground">{t('plans.note', { noun: main.noun })}</p>
      </div>
    </section>
  )
}
