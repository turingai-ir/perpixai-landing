import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { useTranslation } from 'react-i18next'
import { readyDemos } from '@/content/demos'
import { useConversation } from '@/flow/useConversation'
import { prefersReducedMotion } from '@/lib/motion'
import { useOffscreenPause } from '@/lib/useOffscreenPause'
import { StageControls } from '@/stage/controls'
import { Choice, Choices } from './Choice'
import { DemoScreen } from './DemoScreen'
import { PhoneForm } from './PhoneForm'
import { PixoStage } from './PixoStage'
import { SoundToggle } from './SoundToggle'
import { Subtitle } from './Subtitle'
import { Icon } from './Icon'
import { YaldaSeeds } from './YaldaSeeds'
import { season } from '@/content/season'
import { scrollToId } from './scroll'

export type HeroApi = ReturnType<typeof useConversation>

export function Hero({ onReady, entered }: { onReady: (api: HeroApi) => void; entered: boolean }) {
  const { t } = useTranslation()
  const { t: ts } = useTranslation('season')
  const { t: td } = useTranslation('demos')
  const { t: tc } = useTranslation('dialogue')
  const characterName = tc('character.name')
  const characterLabel = tc('character.label', { name: characterName, title: tc('character.title') })
  const [stage] = useState(() => new StageControls())
  const convo = useConversation(stage)
  const { state } = convo
  const root = useRef<HTMLElement>(null)
  useOffscreenPause(root)

  // The show starts when the visitor walks in through the preloader gate.
  useEffect(() => {
    if (entered) convo.start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entered])

  // Opening titles: letterbox bars part, then the chrome settles in. Content is usable throughout.
  // (No scope: the chrome includes the header, which lives outside this section.)
  useGSAP(
    () => {
      if (!entered || prefersReducedMotion()) return
      gsap
        .timeline({ delay: 0.15 })
        .to('[data-bar]', { scaleY: 0, duration: 1.4, ease: 'expo.inOut' })
        .from('[data-hero-chrome]', { opacity: 0, y: 16, duration: 1, ease: 'expo.out', stagger: 0.08 }, '-=0.6')
    },
    { dependencies: [entered] },
  )

  useEffect(() => {
    onReady(convo)
  })

  const r = state.ready
  return (
    <section ref={root} id="top" className="relative min-h-svh overflow-hidden">
      <div
        aria-hidden
        className="circuit absolute inset-0 [mask-image:radial-gradient(ellipse_at_28%_55%,black,transparent_65%)] opacity-40"
      />
      {/* Projector beam falling on the stage, and the neon spill around Pixo */}
      <div
        aria-hidden
        className="absolute top-[-15%] h-[125%] w-full projector-beam opacity-70 mix-blend-screen wide:left-[2%] wide:w-[46%]"
      />
      {/* Neon spill around Pixo */}
      <div aria-hidden className="absolute inset-0 bg-radial-[ellipse_32%_40%_at_14%_70%] from-primary/18 to-transparent" />
      <div aria-hidden className="absolute inset-0 bg-radial-[ellipse_30%_40%_at_44%_62%] from-accent/14 to-transparent" />
      {season.id === 'yalda' && <YaldaSeeds />}
      <PixoStage controls={stage} label={characterLabel} badge={{ name: characterName, role: t('stage.badgeRole') }} />

      <div className="relative flex min-h-svh flex-col justify-end px-5 pt-24 pb-8 lg:px-14 wide:w-1/2 wide:justify-center wide:px-6 wide:py-16 tall:wide:py-24">
        <div className="bg-gradient-to-t from-background via-background/95 to-transparent pt-10 wide:bg-none wide:pt-0">
          <div className="mb-5 flex items-center justify-between gap-3 lg:mb-7">
            {/* Marquee sign: what's showing tonight */}
            <div className="inline-flex flex-col gap-1.5">
              <div className="bulbs w-full" />
              <p className="flex items-baseline gap-3 px-1">
                <span className="text-sm text-amber">{ts(`${season.id}.showing`)}</span>
                <span className="neon font-poster text-4xl leading-none lg:text-5xl">{characterName}</span>
                <span className="hidden text-sm text-muted-foreground lg:inline">{tc('character.title')}</span>
              </p>
              <div className="bulbs w-full" style={{ animationDelay: '-0.8s' }} />
            </div>
            <div className="wide:hidden">
              <SoundToggle compact onEnable={convo.replay} />
            </div>
          </div>

          <Subtitle line={state.line} prev={state.prev} />

          {r && (state.step === 'greet' || state.step === 'greetBack') && (
            <Choices>
              {state.step === 'greetBack' ? (
                <>
                  <Choice primary onClick={convo.toLogin}>
                    {t('hero.back.yes')}
                  </Choice>
                  <Choice index={1} onClick={convo.asNewcomer}>
                    {t('hero.back.no')}
                  </Choice>
                </>
              ) : (
                <>
                  <Choice onClick={convo.toLogin}>{t('hero.greet.member')}</Choice>
                  <Choice primary index={1} onClick={convo.asNewcomer}>
                    {t('hero.greet.newcomer')}
                  </Choice>
                </>
              )}
            </Choices>
          )}

          {r && state.step === 'newcomer' && (
            <Choices>
              <Choice primary onClick={convo.toPhone}>
                {t('hero.newcomer.signup')}
              </Choice>
              <Choice index={1} onClick={convo.toDemo}>
                {t('hero.newcomer.demo')}
              </Choice>
              <Choice index={2} onClick={() => (convo.browse(), scrollToId('plans'))}>
                {t('hero.newcomer.prices')}
              </Choice>
            </Choices>
          )}

          {state.step === 'phone' && <PhoneForm onSubmit={convo.submitPhone} error={state.phoneError} />}

          {r && state.step === 'demoPick' && (
            <Choices>
              {readyDemos.map((d, i) => (
                <Choice key={d.id} index={i} onClick={() => convo.runDemo(d)}>
                  {td(`${d.id}.chip`)}
                </Choice>
              ))}
            </Choices>
          )}

          {state.demo && (state.step === 'computing' || state.step === 'reveal') && (
            <DemoScreen demo={state.demo} developing={state.step === 'computing'} />
          )}

          {r && state.step === 'reveal' && (
            <Choices>
              <Choice primary onClick={convo.toPhone}>
                {t('hero.reveal.signup')}
              </Choice>
              <Choice index={1} onClick={convo.toDemo}>
                {t('hero.reveal.again')}
              </Choice>
            </Choices>
          )}

          {(state.step === 'signup' || state.step === 'login') && !state.handoff && (
            <p className="word mt-6 text-sm text-muted-foreground">{t('hero.redirecting')}</p>
          )}

          {state.handoff && (
            <div className="word mt-6 max-w-xl rounded-2xl border border-dashed border-accent/50 bg-accent/5 p-4 text-sm">
              <p className="font-semibold text-accent">{t('hero.handoff.title')}</p>
              <code dir="ltr" className="mt-2 block break-all text-foreground/90">
                {state.handoff}
              </code>
              <a href={state.handoff} className="mt-3 inline-block rounded-full bg-accent/15 px-4 py-2 text-accent hover:bg-accent/25">
                {t('hero.handoff.open')}
              </a>
            </div>
          )}
        </div>
      </div>

      <div
        aria-hidden
        data-bar
        className="pointer-events-none absolute inset-x-0 top-0 z-30 h-[11vh] origin-top bg-black motion-reduce:hidden not-wide:hidden"
      />
      <div
        aria-hidden
        data-bar
        className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[11vh] origin-bottom bg-black motion-reduce:hidden not-wide:hidden"
      />

      <div data-hero-chrome className="absolute inset-x-0 bottom-0 hidden items-center justify-between px-6 pb-8 lg:px-14 wide:flex">
        <SoundToggle onEnable={convo.replay} />
        <div className="flex items-center gap-3">
          {!['boot', 'greet', 'greetBack'].includes(state.step) && (
            <button
              type="button"
              onClick={convo.back}
              className="flex cursor-pointer items-center gap-2 rounded-full border border-border px-4 py-2 text-xs text-foreground/80 transition hover:text-foreground pointer-coarse:min-h-11"
            >
              <Icon name="restart" className="size-4" /> {t('hero.restart')}
            </button>
          )}
          <button
            type="button"
            onClick={() => scrollToId('more')}
            className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground pointer-coarse:min-h-11"
          >
            {t('hero.continue')}
            <Icon name="down" className="size-4 animate-bounce" />
          </button>
        </div>
      </div>
    </section>
  )
}
