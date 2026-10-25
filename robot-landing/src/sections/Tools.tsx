import { useTranslation } from 'react-i18next'
import { useLanding } from '@/lib/landing/client'
import { toolItems } from '@/content/sections'
import { formatNumber, localizeDigits } from '@/i18n/format'
import { Icon } from '@/ui/Icon'
import { SplitHeading } from '@/ui/SplitHeading'

/** The showtimes board: what's playing at the studio, one row per tool. */
export function Tools() {
  const { t } = useTranslation('home')
  const title = t('tools.title', { returnObjects: true })
  const models = formatNumber(useLanding().models.length)
  return (
    <section id="tools" className="px-5 py-28 md:px-14 md:py-36">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <span className="eyebrow mb-5">{t('tools.eyebrow')}</span>
          <SplitHeading lines={title} text={title.join(' ')} className="font-poster text-5xl leading-[1.15] md:text-6xl" />
          <p className="mt-5 max-w-sm text-lg leading-8 text-muted-foreground">{t('tools.body')}</p>
        </div>
        <ul className="rounded-3xl border border-border bg-card/80 px-6 md:px-10">
          {toolItems.map((item, i) => (
            <li
              key={item.id}
              data-reveal
              className="group relative flex items-start gap-5 border-b border-border py-8 last:border-b-0 md:gap-8 md:py-10"
            >
              <span className="pt-1 font-poster text-2xl leading-none text-amber/90">{localizeDigits(`0${i + 1}`)}</span>
              <div className="flex-1">
                <h3 className="font-poster text-3xl leading-tight md:text-4xl">{t(`tools.items.${item.id}.title`, { models })}</h3>
                <p className="mt-2 max-w-lg text-lg leading-8 text-muted-foreground">{t(`tools.items.${item.id}.body`, { models })}</p>
              </div>
              <Icon
                name={item.icon}
                className="size-10 shrink-0 text-purple transition-colors duration-500 group-hover:text-accent md:size-12"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
