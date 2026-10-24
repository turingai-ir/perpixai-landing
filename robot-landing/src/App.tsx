'use client'

import { useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Header } from '@/ui/Header'
import { Hero, type HeroApi } from '@/ui/Hero'
import { StickyCta } from '@/ui/StickyCta'
import { FilmFx } from '@/ui/FilmFx'
import { Preloader } from '@/ui/Preloader'
import { voice } from '@/audio/voice'
import { asset } from '@/lib/asset'
import { config } from '@/config'
import { Film } from '@/sections/Film'
import { Reel } from '@/sections/Reel'
import { Tools } from '@/sections/Tools'
import { Plans } from '@/sections/Plans'
import { Faq } from '@/sections/Faq'
import { Finale } from '@/sections/Finale'
import { Footer } from '@/sections/Footer'
import { scrollToId, setLenis } from '@/ui/scroll'
import { prefersReducedMotion } from '@/lib/motion'
import { track } from '@/lib/analytics'

gsap.registerPlugin(ScrollTrigger)

const loadImage = (src: string) =>
  new Promise((resolve) => {
    const img = new Image()
    img.onload = img.onerror = resolve
    img.src = src
  })

/** What the first scene needs before the gate opens: the 3D chunk, fonts, Pixo's first lines. */
const firstScene = () =>
  Promise.all([
    import('@/stage/Stage').catch(() => null),
    document.fonts?.ready,
    loadImage(asset('brand/pixo.webp')),
    ...['intro-1', 'intro-2', 'greet-1', 'greet-2', 'greet-3'].map((id) =>
      fetch(`${config.voiceDir}/${id}.mp3`).catch(() => null),
    ),
  ])

/** Started at module load in the browser (as before), never during server pre-rendering. */
const firstSceneReady: Promise<unknown> = typeof window === 'undefined' ? new Promise(() => {}) : firstScene()

export function App() {
  const api = useRef<HeroApi | null>(null)
  const [entered, setEntered] = useState(false)
  /** Bumped by the logo: remounts the preloader and Pixo so the show starts over. */
  const [run, setRun] = useState(0)
  const lenisRef = useRef<Lenis | null>(null)

  const enter = (withSound: boolean) => {
    voice.unlock()
    voice.setMuted(!withSound)
    if (withSound) voice.projector()
    track('enter', { sound: withSound })
    setEntered(true)
    lenisRef.current?.start()
  }

  const restart = () => {
    track('restart')
    voice.stop()
    lenisRef.current?.scrollTo(0, { immediate: true, force: true })
    lenisRef.current?.stop()
    if (!lenisRef.current) window.scrollTo(0, 0)
    setEntered(false)
    setRun((r) => r + 1)
  }

  // Every sign-up button brings people back to Pixo's inline phone field.
  const signup = (from: string, extra: Record<string, unknown> = {}) => {
    track('cta_signup', { from, ...extra })
    scrollToId('top')
    api.current?.toPhone()
  }

  useEffect(() => {
    // Reduced motion: no smooth scroll, no scrubbing — everything renders in its final state.
    if (prefersReducedMotion()) return

    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 })
    lenis.stop() // held until the visitor walks in through the gate
    lenisRef.current = lenis
    setLenis(lenis)
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (t: number) => lenis.raf(t * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-split]').forEach((el) =>
        gsap.from(el.querySelectorAll('[data-w]'), {
          yPercent: 110,
          opacity: 0,
          filter: 'blur(8px)',
          duration: 0.95,
          ease: 'power4.out',
          stagger: 0.05,
          scrollTrigger: { trigger: el, start: 'top 82%', once: true },
        }),
      )
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) =>
        gsap.from(el, {
          y: 36,
          opacity: 0,
          filter: 'blur(8px)',
          duration: 1,
          ease: 'power4.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        }),
      )
    })

    // Pinned sections depend on font and media metrics.
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true })

    return () => {
      ctx.revert()
      gsap.ticker.remove(tick)
      lenis.destroy()
      lenisRef.current = null
      setLenis(null)
    }
  }, [])

  return (
    <>
      <a href="#more" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:right-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2">
        رفتن به محتوا
      </a>
      <Preloader key={`pre-${run}`} ready={firstSceneReady} onEnter={enter} />
      <FilmFx />
      <Header onSignup={() => signup('header')} onRestart={restart} />
      <main>
        <h1 className="sr-only">پرپیکس — ساخت تصویر و ویدیو با هوش مصنوعی از یک جمله</h1>
        <Hero key={`hero-${run}`} entered={entered} onReady={(a) => (api.current = a)} />
        <Film />
        <Reel onMake={(demo) => signup('reel', { demo })} />
        <Tools />
        <Plans onChoose={(plan) => signup('plan', { plan })} />
        <Faq />
        <Finale onSignup={() => signup('finale')} />
      </main>
      <Footer />
      <StickyCta onSignup={() => signup('sticky')} />
    </>
  )
}
