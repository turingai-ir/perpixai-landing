import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { voice } from '@/audio/voice'
import { character } from '@/content/dialogue'
import { readyDemos } from '@/content/demos'
import { useConversation } from '@/flow/useConversation'
import { isMobile, prefersReducedMotion } from '@/lib/motion'
import { useOffscreenPause } from '@/lib/useOffscreenPause'
import type { Stage } from '@/stage/Stage'
import { Choice, Choices } from './Choice'
import { DemoScreen } from './DemoScreen'
import { PhoneForm } from './PhoneForm'
import { SoundToggle } from './SoundToggle'
import { Subtitle } from './Subtitle'
import { Icon } from './Icon'
import { YaldaSeeds } from './YaldaSeeds'
import { season } from '@/content/season'
import { scrollToId } from './scroll'
import { asset } from '@/lib/asset'

export type HeroApi = ReturnType<typeof useConversation>

export function Hero({ onReady, entered }: { onReady: (api: HeroApi) => void; entered: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const stage = useRef<Stage | null>(null)
  const convo = useConversation(stage)
  const { state } = convo
  /** Static Pixo instead of WebGL: reduced motion, no WebGL, or a lost context. */
  const [still, setStill] = useState(false)
  const root = useRef<HTMLElement>(null)
  useOffscreenPause(root)

  useEffect(() => {
    let disposed = false
    if (prefersReducedMotion()) setStill(true)
    else {
      // The 3D scene loads in its own chunk so the conversation renders instantly.
      import('@/stage/Stage')
        .then(({ Stage }) => {
          if (disposed || !canvas.current) return
          stage.current = new Stage(canvas.current, () => voice.level(), {
            lite: isMobile(),
            yalda: season.id === 'yalda',
            onContextLost: () => setStill(true),
          })
          stage.current.setPowered(true)
          stage.current.setLayout('side')
          canvas.current.style.opacity = '1'
        })
        .catch(() => setStill(true))
    }
    return () => {
      disposed = true
      stage.current?.dispose()
      stage.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // The show starts when the visitor walks in through the preloader gate.
  useEffect(() => {
    if (entered) convo.start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entered])

  // Opening titles: letterbox bars part, then the chrome settles in. Content is usable throughout.
  useEffect(() => {
    if (!entered || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap
        .timeline({ delay: 0.15 })
        .to('[data-bar]', { scaleY: 0, duration: 1.4, ease: 'expo.inOut' })
        .from('[data-hero-chrome]', { opacity: 0, y: 16, duration: 1, ease: 'expo.out', stagger: 0.08 }, '-=0.6')
    })
    return () => ctx.revert()
  }, [entered])

  useEffect(() => {
    onReady(convo)
  })

  const r = state.ready
  return (
    <section ref={root} id="top" className="relative h-svh min-h-[640px] overflow-hidden">
      <div aria-hidden className="circuit absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_28%_55%,black,transparent_65%)]" />
      {/* Projector beam falling on the stage, and the neon spill around Pixo */}
      <div
        aria-hidden
        className="absolute top-[-15%] h-[125%] w-full opacity-70 mix-blend-screen md:left-[2%] md:w-[46%]"
        style={{
          clipPath: 'polygon(44% 0, 56% 0, 100% 100%, 0 100%)',
          background: 'linear-gradient(to bottom, rgb(255 236 210 / .22), rgb(255 236 210 / .06) 55%, transparent 80%)',
          filter: 'blur(18px)',
          animation: 'flicker 4s steps(1) infinite',
          willChange: 'opacity', // keep the blurred beam on its own layer: flicker = composite only
        }}
      />
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_32%_40%_at_14%_70%,#d92dd42e,transparent),radial-gradient(ellipse_30%_40%_at_44%_62%,#06a1e924,transparent)]" />
      {season.id === 'yalda' && <YaldaSeeds />}
      {still && (
        <img
          src={asset('brand/pixo.webp')}
          alt={`${character.name}، ${character.title}`}
          className="absolute top-0 h-[66%] w-full object-contain object-bottom [mask-image:linear-gradient(black_78%,transparent)] md:left-0 md:h-full md:w-1/2 md:[mask-image:radial-gradient(ellipse_60%_65%_at_50%_55%,black_60%,transparent)]"
        />
      )}
      <canvas
        ref={canvas}
        hidden={still}
        aria-label={`${character.name}، ${character.title}`}
        role="img"
        style={{ opacity: 0 }}
        className="transition-opacity duration-[1500ms] absolute inset-x-0 top-0 h-[66%] w-full [mask-image:linear-gradient(black_78%,transparent)] md:h-full md:[mask-image:none]"
      />

      <div className="relative flex h-full flex-col justify-end px-5 pb-8 md:w-1/2 md:justify-center md:px-14 md:pb-0">
        <div className="bg-gradient-to-t from-ink via-ink/95 to-transparent pt-10 md:bg-none md:pt-0">
          <div className="mb-5 flex items-center justify-between gap-3 md:mb-7">
            {/* Marquee sign: what's showing tonight */}
            <div className="inline-flex flex-col gap-1.5">
              <div className="bulbs w-full" />
              <p className="flex items-baseline gap-3 px-1">
                <span className="text-sm text-amber">{season.showing}</span>
                <span className="font-poster neon text-4xl leading-none md:text-5xl">{character.name}</span>
                <span className="hidden text-sm text-mute md:inline">{character.title}</span>
              </p>
              <div className="bulbs w-full" style={{ animationDelay: '-0.8s' }} />
            </div>
            <div className="md:hidden">
              <SoundToggle compact onEnable={convo.replay} />
            </div>
          </div>

          <Subtitle line={state.line} prev={state.prev} />

          {r && (state.step === 'greet' || state.step === 'greetBack') && (
            <Choices>
              {state.step === 'greetBack' ? (
                <>
                  <Choice primary onClick={convo.toLogin}>آره، بریم ورود</Choice>
                  <Choice index={1} onClick={convo.asNewcomer}>نه، حساب ندارم</Choice>
                </>
              ) : (
                <>
                  <Choice onClick={convo.toLogin}>آره، عضوم؛ ورود</Choice>
                  <Choice primary index={1} onClick={convo.asNewcomer}>نه، تازه‌واردم</Choice>
                </>
              )}
            </Choices>
          )}

          {r && state.step === 'newcomer' && (
            <Choices>
              <Choice primary onClick={convo.toPhone}>ثبت‌نام سریع + اعتبار هدیه</Choice>
              <Choice index={1} onClick={convo.toDemo}>اول نشونم بده ✦</Choice>
              <Choice index={2} onClick={() => (convo.browse(), scrollToId('plans'))}>قیمت‌ها چنده؟</Choice>
            </Choices>
          )}

          {state.step === 'phone' && <PhoneForm onSubmit={convo.submitPhone} error={state.phoneError} />}

          {r && state.step === 'demoPick' && (
            <Choices>
              {readyDemos.map((d, i) => (
                <Choice key={d.id} index={i} onClick={() => convo.runDemo(d)}>
                  {d.chip}
                </Choice>
              ))}
            </Choices>
          )}

          {state.demo && (state.step === 'computing' || state.step === 'reveal') && (
            <DemoScreen demo={state.demo} developing={state.step === 'computing'} />
          )}

          {r && state.step === 'reveal' && (
            <Choices>
              <Choice primary onClick={convo.toPhone}>خودم بسازم؛ ثبت‌نام رایگان</Choice>
              <Choice index={1} onClick={convo.toDemo}>یه نمونه‌ی دیگه</Choice>
            </Choices>
          )}

          {(state.step === 'signup' || state.step === 'login') && !state.handoff && (
            <p className="word mt-6 text-sm text-mute">در حال انتقال…</p>
          )}

          {state.handoff && (
            <div className="word mt-6 max-w-xl rounded-2xl border border-dashed border-cyan/50 bg-cyan/5 p-4 text-sm">
              <p className="font-semibold text-cyan">حالت تست: کاربر به این آدرس فرستاده می‌شود</p>
              <code dir="ltr" className="mt-2 block break-all text-fog/90">{state.handoff}</code>
              <a href={state.handoff} className="mt-3 inline-block rounded-full bg-cyan/15 px-4 py-2 text-cyan hover:bg-cyan/25">
                باز کردن صفحه‌ی ورود
              </a>
            </div>
          )}
        </div>
      </div>

      <div aria-hidden data-bar className="pointer-events-none absolute inset-x-0 top-0 z-30 h-[11vh] origin-top bg-black max-md:hidden motion-reduce:hidden" />
      <div aria-hidden data-bar className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[11vh] origin-bottom bg-black max-md:hidden motion-reduce:hidden" />

      <div data-hero-chrome className="absolute inset-x-0 bottom-0 hidden items-center justify-between px-14 pb-8 md:flex">
        <SoundToggle onEnable={convo.replay} />
        <div className="flex items-center gap-3">
          {!['boot', 'greet', 'greetBack'].includes(state.step) && (
            <button type="button" onClick={convo.back} className="flex cursor-pointer items-center gap-2 rounded-full border border-line px-4 py-2 text-xs text-fog/80 transition hover:text-fog">
              <Icon name="restart" className="size-4" /> از اول
            </button>
          )}
          <button type="button" onClick={() => scrollToId('more')} className="flex cursor-pointer items-center gap-2 text-sm text-mute transition hover:text-fog">
            ادامه‌ی فیلم
            <Icon name="down" className="size-4 animate-bounce" />
          </button>
        </div>
      </div>
    </section>
  )
}
