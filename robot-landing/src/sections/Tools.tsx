import { tools } from '@/content/sections'
import { toFa } from '@/lib/digits'
import { Icon } from '@/ui/Icon'
import { SplitHeading } from '@/ui/SplitHeading'

/** The showtimes board: what's playing at the studio, one row per tool. */
export function Tools() {
  return (
    <section id="tools" className="px-5 py-28 md:px-14 md:py-36">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
        <div className="md:sticky md:top-32 md:self-start">
          <span className="eyebrow mb-5">برنامه‌ی سانس‌ها</span>
          <SplitHeading
            lines={['یک استودیو،', 'هر چیزی که تصور کنی.']}
            text="یک استودیو، هر چیزی که تصور کنی."
            className="font-poster text-5xl leading-[1.15] md:text-6xl"
          />
          <p className="mt-5 max-w-sm text-lg leading-8 text-mute">همه با یک حساب و یک کیف پول.</p>
        </div>
        <ul className="rounded-3xl border border-line bg-ink-2/80 px-6 md:px-10">
          {tools.map((t, i) => (
            <li key={t.title} data-reveal className="group relative flex items-start gap-5 border-b border-line py-8 last:border-b-0 md:gap-8 md:py-10">
              <span className="font-poster pt-1 text-2xl leading-none text-amber/90">{toFa(`0${i + 1}`)}</span>
              <div className="flex-1">
                <h3 className="font-poster text-3xl leading-tight md:text-4xl">{t.title}</h3>
                <p className="mt-2 max-w-lg text-lg leading-8 text-mute">{t.body}</p>
              </div>
              <Icon name={t.icon} className="size-10 shrink-0 text-purple transition-colors duration-500 group-hover:text-cyan md:size-12" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
