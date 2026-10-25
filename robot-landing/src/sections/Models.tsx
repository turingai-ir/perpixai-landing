import { useState } from 'react'
import { clsx } from 'clsx'
import { useTranslation } from 'react-i18next'
import { formatNumber } from '@/i18n/format'
import { roundCredits } from '@/lib/landing/format'
import { useLanding } from '@/lib/landing/client'
import type { ModelKind } from '@/lib/landing/types'
import { Icon } from '@/ui/Icon'
import { SplitHeading } from '@/ui/SplitHeading'

/** Cards visible before "show all": enough to feel the range without a wall of 18 on a phone. */
const PREVIEW = 6

type Filter = 'all' | ModelKind

/**
 * The cast: every model the account unlocks, with what it makes and where its price starts. All cards are in the HTML (crawlers and
 * no-JS visitors see every model); the filter and "show all" only hide the ones that are not wanted right now.
 */
export function Models() {
  const { t } = useTranslation('home')
  const { models } = useLanding()
  const title = t('models.title', { returnObjects: true })
  const [filter, setFilter] = useState<Filter>('all')
  const [expanded, setExpanded] = useState(false)

  const count = (f: Filter) => (f === 'all' ? models.length : models.filter((m) => m.kind === f).length)
  const matching = models.filter((m) => filter === 'all' || m.kind === filter)
  const shownIds = new Set((expanded ? matching : matching.slice(0, PREVIEW)).map((m) => m.id))
  const filters: Filter[] = ['all', 'image', 'video']

  return (
    <section id="models" className="px-5 py-28 md:px-14 md:py-36">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 max-w-2xl">
          <span className="eyebrow mb-5">{t('models.eyebrow')}</span>
          <SplitHeading lines={title} text={title.join(' ')} className="font-poster text-5xl leading-[1.15] md:text-6xl" />
          <p className="mt-5 text-lg leading-8 text-muted-foreground">{t('models.body')}</p>
        </header>

        <div role="group" aria-label={t('models.filterLabel')} className="mb-8 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => {
                setFilter(f)
                setExpanded(false)
              }}
              className={clsx(
                'cursor-pointer rounded-full border px-4 py-2 text-sm transition duration-300 pointer-coarse:min-h-11',
                filter === f
                  ? 'border-transparent bg-primary text-primary-foreground'
                  : 'border-border bg-white/5 text-foreground hover:border-foreground/40',
              )}
            >
              {t(`models.filter.${f}`)} <span className="opacity-70">({formatNumber(count(f))})</span>
            </button>
          ))}
        </div>

        <ul data-reveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {models.map((m) => (
            <li
              key={m.id}
              hidden={!shownIds.has(m.id)}
              className="flex flex-col rounded-3xl border border-border bg-card/80 p-5 transition duration-300 hover:border-foreground/25 md:p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-xs text-muted-foreground">
                  <Icon name={m.kind === 'video' ? 'video' : 'image'} className="size-4 text-purple" />
                  {t(`models.kind.${m.kind}`)}
                </span>
                <span dir="ltr" className="text-xs text-subtle-foreground">
                  {m.owner}
                </span>
              </div>
              <h3 dir="auto" className="mt-4 text-start font-poster text-2xl leading-tight">
                {m.name}
              </h3>
              <p dir="auto" className="mt-2 line-clamp-3 flex-1 text-start text-sm leading-7 text-muted-foreground">
                {m.description}
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-border pt-4 text-xs">
                <p className="text-subtle-foreground">
                  {t('models.inputsLabel')} {m.inputs.map((i) => t(`models.inputs.${i}`)).join('، ')}
                </p>
                <p className="font-semibold text-accent">{t('models.from', { credits: formatNumber(roundCredits(m.minCredits)) })}</p>
              </div>
            </li>
          ))}
        </ul>

        {matching.length > PREVIEW && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              aria-expanded={expanded}
              onClick={() => setExpanded((v) => !v)}
              className="cursor-pointer rounded-full border border-foreground/25 px-6 py-3 text-sm font-semibold text-foreground transition duration-300 hover:border-foreground/50 hover:bg-white/5 pointer-coarse:min-h-11"
            >
              {expanded ? t('models.showLess') : t('models.showAll', { n: formatNumber(matching.length) })}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
