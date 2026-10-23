import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { film } from '@/content/sections'
import { toFa } from '@/lib/digits'
import { Icon } from '@/ui/Icon'
import { LazyVideo } from '@/ui/LazyVideo'
import { SplitHeading } from '@/ui/SplitHeading'

/**
 * Pinned, scroll-scrubbed sequence: the prompt is written word by word, then the frame
 * "develops" from noise into the finished clip. Without pinning (mobile / reduced motion)
 * everything simply shows in its final state.
 */
export function Film() {
  const root = useRef<HTMLElement>(null)
  const words = film.prompt.split(' ')

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: root.current, start: 'top top', end: '+=160%', scrub: 1, pin: true, anticipatePin: 1 },
        })
        const step = (i: number) => () =>
          gsap.utils.toArray<HTMLElement>('[data-step]').forEach((el, j) => el.toggleAttribute('data-active', j === i))

        tl.call(step(0), [], 0)
          .from('[data-pw]', { opacity: 0.12, stagger: 0.03, duration: 0.25 }, 0)
          .call(step(1), [], 0.7)
          .fromTo('[data-frame]', { scale: 0.92, filter: 'blur(14px) saturate(0.2) brightness(0.7)' }, { scale: 1, filter: 'blur(0px) saturate(1) brightness(1)', duration: 0.8 }, 0.7)
          .fromTo('[data-noise]', { opacity: 1 }, { opacity: 0, duration: 0.8 }, 0.7)
          .call(step(2), [], 1.5)
          .from('[data-done]', { y: 20, opacity: 0, duration: 0.3 }, 1.5)
          .to({}, { duration: 0.4 })
      })
    },
    { scope: root },
  )

  // Stable wrapper: ScrollTrigger re-parents the pinned <section> into a pin-spacer,
  // so React must never use the section itself as a sibling anchor.
  return (
    <div>
    <section ref={root} id="more" className="relative flex min-h-svh items-center px-5 py-24 md:px-14 md:py-0">
      <div className="grid w-full items-center gap-12 md:grid-cols-[0.9fr_1.1fr] md:gap-14">
        <div>
          <span className="eyebrow mb-5">{film.eyebrow}</span>
          <SplitHeading lines={film.title} text={film.title.join(' ')} className="font-poster text-5xl leading-[1.15] md:text-6xl xl:text-7xl" />
          <ol className="mt-10 space-y-5">
            {film.steps.map((s, i) => (
              <li
                key={s.title}
                data-step
                data-active={i === 2 ? '' : undefined}
                className="group flex gap-4 opacity-40 transition-opacity duration-500 data-[active]:opacity-100 max-md:opacity-100"
              >
                <span className="font-poster text-brand text-3xl leading-none">{toFa(i + 1)}</span>
                <div>
                  <h3 className="text-xl font-bold text-fog">{s.title}</h3>
                  <p className="mt-1 leading-7 text-mute">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="relative">
          {/* Prompt bar */}
          <div className="border-brand relative mb-5 flex items-center gap-3 rounded-2xl px-5 py-4">
            <Icon name="pen" className="size-6 shrink-0 text-cyan" />
            <p className="text-base leading-8 text-fog md:text-lg">
              {words.map((w, i) => (
                <span key={i} data-pw>
                  {w}{' '}
                </span>
              ))}
            </p>
          </div>

          {/* The frame */}
          <div className="relative aspect-video overflow-hidden rounded-2xl border-[10px] border-ink-3 bg-ink-2 shadow-[0_40px_140px_-30px_#863ed3,0_0_0_1px_rgb(245_239_228/.12)]">
            <div data-frame className="absolute inset-0">
              <LazyVideo id={film.demoId} className="size-full object-cover" />
            </div>
            <div
              data-noise
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 mix-blend-screen motion-reduce:hidden max-md:hidden"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, rgb(255 255 255 / .07) 0 1px, transparent 1px 3px), radial-gradient(circle at 30% 40%, #d92dd466, transparent 60%), radial-gradient(circle at 70% 60%, #06a1e966, transparent 60%)',
              }}
            />
            <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 text-xs text-fog/80">
              <span className="flex items-center gap-2">
                <span className="size-2 animate-pulse rounded-full bg-magenta" />
                PERPIX · REC
              </span>
              <span dir="ltr" className="font-mono">16:9 · 8s</span>
            </div>
          </div>

          <div data-done className="mt-5 flex flex-wrap items-center gap-3 text-sm text-mute">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/5 px-4 py-2 text-fog">
              <Icon name="check" className="size-4 text-cyan" />
              ساخته شد در پرپیکس
            </span>
            <span>بدون دوربین، بدون تدوین؛ فقط همین یک جمله.</span>
          </div>
        </div>
      </div>
    </section>
    </div>
  )
}
