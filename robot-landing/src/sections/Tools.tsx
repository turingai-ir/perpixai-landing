import { useTranslation } from 'react-i18next'
import { toolItems } from '@/content/sections'
import { localizeDigits } from '@/i18n/format'
import { Icon } from '@/ui/Icon'
import { SplitHeading } from '@/ui/SplitHeading'

/** The showtimes board: what's playing at the studio, one row per tool. */
export function Tools() {
  const { t } = useTranslation('home')
  const title = t('tools.title', { returnObjects: true })
  return (
    <section id="tools" className="px-5 py-28 md:px-14 md:py-36">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
        <div className="md:sticky md:top-32 md:self-start">
          <span className="eyebrow mb-5">{t('tools.eyebrow')}</span>
          <SplitHeading lines={title} text={title.join(' ')} className="font-poster text-5xl leading-[1.15] md:text-6xl" />
          <p className="mt-5 max-w-sm text-lg leading-8 text-mute">{t('tools.body')}</p>
        </div>
        <ul className="rounded-3xl border border-line bg-ink-2/80 px-6 md:px-10">
          {toolItems.map((item, i) => (
            <li
              key={item.id}
              data-reveal
              className="group relative flex items-start gap-5 border-b border-line py-8 last:border-b-0 md:gap-8 md:py-10"
            >
              <span className="pt-1 font-poster text-2xl leading-none text-amber/90">{localizeDigits(`0${i + 1}`)}</span>
              <div className="flex-1">
                <h3 className="font-poster text-3xl leading-tight md:text-4xl">{t(`tools.items.${item.id}.title`)}</h3>
                <p className="mt-2 max-w-lg text-lg leading-8 text-mute">{t(`tools.items.${item.id}.body`)}</p>
              </div>
              <Icon
                name={item.icon}
                className="size-10 shrink-0 text-purple transition-colors duration-500 group-hover:text-cyan md:size-12"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
