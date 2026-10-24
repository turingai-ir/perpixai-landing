import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { asset } from '@/lib/asset'
import { prefersReducedMotion } from '@/lib/motion'
import { localizeDigits } from '@/i18n/format'
import { season } from '@/content/season'

type Props = {
  /** Resolves when the things the first scene needs are ready. */
  ready: Promise<unknown>
  /** Called from the visitor's click: the only moment browsers allow sound to start. */
  onEnter: (withSound: boolean) => void
}

/**
 * Film-leader countdown while the hall gets ready, then a gate — "click to start the
 * screening" — so the show can open with sound. The gate dissolves through an iris.
 */
export function Preloader({ ready, onEnter }: Props) {
  const { t } = useTranslation()
  const { t: ts } = useTranslation('season')
  const { t: tc } = useTranslation('dialogue')
  const root = useRef<HTMLDivElement>(null)
  const [count, setCount] = useState(3)
  const countRef = useRef(3)
  const bar = useRef<HTMLSpanElement>(null)
  const pct = useRef<HTMLSpanElement>(null)
  /** Progress is written straight to the DOM: no React render per animation frame. */
  const setProgress = (v: number) => {
    if (bar.current) bar.current.style.transform = `scaleX(${v / 100})`
    if (pct.current) pct.current.textContent = t('percent', { n: localizeDigits(v) })
  }
  const [gate, setGate] = useState(false)
  const [gone, setGone] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useGSAP(
    () => {
      const reduce = prefersReducedMotion()
      let loaded = false
      let alive = true
      // Never hold the audience hostage: open the gate after 7s whatever happens.
      const timeout = Promise.race([ready, new Promise((r) => setTimeout(r, 7000))]).then(() => (loaded = true))

      countRef.current = 3
      setCount(3)
      if (reduce) timeout.then(() => alive && (setProgress(100), setGate(true)))
      else {
        const sweep = { a: 0 }
        const tl = gsap.timeline({
          repeat: -1,
          onRepeat: () => {
            if (countRef.current <= 1 && loaded) {
              tl.kill()
              setProgress(100)
              setGate(true)
              return
            }
            // Still loading at "1": loop the last numbers rather than freeze.
            countRef.current = countRef.current <= 1 ? 3 : countRef.current - 1
            setCount(countRef.current)
          },
        })
        tl.to(sweep, {
          a: 360,
          duration: 0.62,
          ease: 'none',
          onUpdate: () => root.current?.style.setProperty('--sweep', `${sweep.a}deg`),
        })
        const p = { v: 0 }
        gsap.to(p, { v: 92, duration: 3.2, ease: 'power2.out', onUpdate: () => alive && setProgress(Math.round(p.v)) })
      }
      return () => void (alive = false)
    },
    { scope: root, dependencies: [ready] },
  )

  useGSAP(
    () => {
      if (!gate || prefersReducedMotion()) return
      gsap.fromTo(
        '[data-gate]',
        { opacity: 0, y: 16, filter: 'blur(8px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, ease: 'power4.out', stagger: 0.12 },
      )
    },
    { scope: root, dependencies: [gate] },
  )

  // Iris out — the oldest transition in cinema.
  useGSAP(
    () => {
      if (!leaving) return
      gsap.fromTo(
        root.current,
        { clipPath: 'circle(150% at 50% 50%)' },
        { clipPath: 'circle(0% at 50% 50%)', duration: 1.3, ease: 'power4.inOut', onComplete: () => setGone(true) },
      )
    },
    { scope: root, dependencies: [leaving] },
  )

  const enter = (withSound: boolean) => {
    onEnter(withSound)
    if (prefersReducedMotion()) setGone(true)
    else setLeaving(true)
  }

  if (gone) return null
  return (
    <div
      ref={root}
      data-preloader
      role="dialog"
      aria-modal="true"
      aria-label={t('preloader.label')}
      className="fixed inset-0 z-70 grid place-items-center overflow-hidden bg-background text-foreground"
      style={{ ['--sweep' as string]: '0deg' }}
    >
      {/*
        The marquee is on screen from the first paint (it is the page's largest content, so LCP
        lands immediately); only the slot below it changes from the leader countdown to the gate.
      */}
      <div className="flex flex-col items-center gap-7 px-6 text-center md:gap-8">
        {ts(`${season.id}.greeting`) && <p className="font-poster text-2xl neon-yalda">{ts(`${season.id}.greeting`)}</p>}
        <div className="flex flex-col items-center gap-3">
          <div className="bulbs w-[min(80vw,30rem)]" />
          <div className="flex items-center gap-4">
            <img src={asset('brand/logo-192.webp')} alt="" width={77} height={64} className="h-12 w-auto md:h-16" />
            <p className="neon font-poster text-6xl leading-none md:text-8xl">{t('preloader.title')}</p>
          </div>
          <div className="bulbs w-[min(80vw,30rem)]" style={{ animationDelay: '-0.8s' }} />
        </div>
        <p className="text-base text-muted-foreground">
          {t('preloader.showing', { showing: ts(`${season.id}.showing`) })}{' '}
          <span className="neon-cyan font-poster text-2xl">{tc('character.name')}</span>
          <span className="text-muted-foreground"> · {t('preloader.tagline')}</span>
        </p>

        <div className="grid min-h-[9.5rem] place-items-center md:min-h-[11rem]">
          {!gate ? (
            /* Film leader */
            <div className="relative grid size-[min(36vw,9rem)] place-items-center md:size-[10.5rem]" aria-hidden>
              <div className="absolute inset-0 rounded-full border-2 border-foreground/70" />
              <div className="absolute inset-[9%] rounded-full border border-foreground/40" />
              <div className="absolute inset-[9%] rounded-full leader-sweep" />
              <div className="absolute inset-x-0 top-1/2 h-px bg-foreground/50" />
              <div className="absolute inset-y-0 left-1/2 w-px bg-foreground/50" />
              <span className="relative font-poster text-countdown leading-none">{localizeDigits(count)}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-5">
              <button
                data-gate
                type="button"
                autoFocus
                onClick={() => enter(true)}
                className="cursor-pointer rounded-full border-2 border-foreground/80 px-10 py-4 font-poster text-2xl text-foreground transition duration-500 hover:border-accent hover:text-white hover:shadow-glow md:text-3xl"
              >
                {t('preloader.start')}
              </button>
              <p data-gate className="flex items-center gap-2 text-sm text-subtle-foreground">
                <span className="size-1.5 animate-pulse rounded-full bg-amber" /> {t('preloader.withSound')}
                <button
                  type="button"
                  onClick={() => enter(false)}
                  className="cursor-pointer underline-offset-4 hover:text-foreground hover:underline"
                >
                  {t('preloader.muted')}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 px-6 pb-6 text-xs text-subtle-foreground md:px-10">
        <span>{gate ? t('preloader.ready') : t('preloader.loading')}</span>
        <span className="h-px flex-1 bg-border">
          <span
            ref={bar}
            className="block h-full origin-right scale-x-0 bg-foreground/70 transition-transform duration-300 will-change-transform"
          />
        </span>
        <span ref={pct} dir="ltr" className="font-mono tabular-nums">
          {t('percent', { n: localizeDigits(0) })}
        </span>
      </div>
    </div>
  )
}
