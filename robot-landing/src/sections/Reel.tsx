import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { readyDemos } from '@/content/demos'
import { useTranslation } from 'react-i18next'
import { localizeDigits } from '@/i18n/format'
import { Icon } from '@/ui/Icon'
import { LazyVideo } from '@/ui/LazyVideo'
import { SplitHeading } from '@/ui/SplitHeading'

const sprockets = {
  backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 14px, rgb(233 230 245 / .14) 14px 26px)',
}

/**
 * The film reel: real Perpix clips on a strip that travels sideways while you scroll down.
 * RTL — the strip overflows to the left, so it moves in +x. Touch/narrow screens get native swipe.
 */
export function Reel({ onMake }: { onMake: (demoId: string) => void }) {
  const { t } = useTranslation('home')
  const { t: td } = useTranslation('demos')
  const title = t('reel.title', { returnObjects: true })
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
        const distance = () => Math.max(0, track.current!.scrollWidth - window.innerWidth)
        const move = gsap.to(track.current, {
          x: () => distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: () => `+=${distance()}`,
            scrub: 1,
            pin: true,
            invalidateOnRefresh: true,
          },
        })
        gsap.utils.toArray<HTMLElement>('[data-reel-media]').forEach((el) =>
          gsap.fromTo(
            el,
            { xPercent: -8, scale: 1.15 },
            {
              xPercent: 8,
              scale: 1.15,
              ease: 'none',
              scrollTrigger: { trigger: el.parentElement, containerAnimation: move, start: 'left right', end: 'right left', scrub: true },
            },
          ),
        )
      })
    },
    { scope: root },
  )

  // Stable wrapper: ScrollTrigger re-parents the pinned <section> into a pin-spacer,
  // so React must never use the section itself as a sibling anchor.
  return (
    <div>
    <section ref={root} id="reel" className="relative overflow-hidden py-24 md:flex md:h-svh md:items-center md:py-0">
      <div
        ref={track}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-4 md:w-max md:snap-none md:gap-10 md:overflow-visible md:px-14 md:pb-0 md:motion-reduce:w-auto md:motion-reduce:snap-x md:motion-reduce:overflow-x-auto"
      >
        <header className="flex w-[80vw] shrink-0 snap-start flex-col justify-center md:w-[34vw]">
          <span className="eyebrow mb-5">{t('reel.eyebrow')}</span>
          <SplitHeading lines={title} text={title.join(' ')} className="font-poster text-5xl leading-[1.15] md:text-6xl" />
          <p className="mt-5 max-w-sm leading-8 text-mute">
            {t('reel.body')}
          </p>
          <p className="mt-8 hidden items-center gap-2 text-sm text-mute md:flex">
            <Icon name="arrow" className="size-4" /> {t('reel.scrollHint')}
          </p>
        </header>

        {readyDemos.map((d, i) => (
          <figure key={d.id} className="w-[85vw] shrink-0 snap-center md:w-[52vw]">
            <div className="rounded-[1.75rem] bg-ink-3 p-3 shadow-[0_30px_100px_-40px_#06a1e9] md:p-4">
              <div aria-hidden className="mb-3 h-3 rounded-sm" style={sprockets} />
              <div className="relative aspect-video overflow-hidden rounded-xl">
                <div data-reel-media className="absolute inset-0">
                  <LazyVideo id={d.id} className="size-full object-cover" />
                </div>
                <span className="absolute top-3 right-3 rounded-full bg-ink/70 px-3 py-1 text-xs text-fog backdrop-blur">
                  {t('reel.scene', { n: localizeDigits(i + 1) })}
                </span>
              </div>
              <div aria-hidden className="mt-3 h-3 rounded-sm" style={sprockets} />
            </div>
            <figcaption className="mt-5 flex flex-col gap-4 px-1 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="font-poster text-2xl md:text-3xl">{td(`${d.id}.chip`)}</h3>
                <p className="mt-2 max-w-md text-sm leading-7 text-mute">
                  <span className="text-brand font-semibold">{t('reel.promptLabel')}</span>
                  {td(`${d.id}.prompt`)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onMake(d.id)}
                className="inline-flex shrink-0 cursor-pointer items-center gap-2 self-start rounded-full border border-line bg-white/5 px-5 py-2.5 text-sm text-fog transition hover:border-white/30 hover:bg-white/10"
              >
                {t('reel.make')}
                <Icon name="arrow" className="size-4" />
              </button>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
    </div>
  )
}
