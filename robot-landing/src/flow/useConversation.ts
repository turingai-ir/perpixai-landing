import { useCallback, useEffect, useRef, useState } from 'react'
import { voice } from '@/audio/voice'
import { config } from '@/config'
import { authDebug, loginUrl, signupUrl } from '@/lib/auth'
import { dialogue, pick, type DialogueKey, type Line } from '@/content/dialogue'
import type { Demo } from '@/content/demos'
import { normalizeIranMobile } from '@/lib/digits'
import { visitor } from '@/lib/storage'
import { track } from '@/lib/analytics'
import type { Stage } from '@/stage/Stage'
import type { Mood } from '@/stage/types'

export type Step =
  | 'boot'
  | 'greet'
  | 'greetBack'
  | 'login'
  | 'newcomer'
  | 'phone'
  | 'signup'
  | 'demoPick'
  | 'computing'
  | 'reveal'

type State = {
  step: Step
  line: Line | null
  prev: Line | null
  /** Choices fade in shortly after a line starts — never make people wait for speech. */
  ready: boolean
  demo: Demo | null
  phoneError: boolean
  /** Test mode (?authDebug=1): the URL we would have redirected to. */
  handoff: string | null
}

/** Pixo's face for each step of the conversation. */
const moodFor = (step: Step): Mood =>
  step === 'computing'
    ? 'think'
    : step === 'reveal' || step === 'signup' || step === 'login'
      ? 'love'
      : step === 'boot'
        ? 'neutral'
        : 'ask'

/** Read once per page load (StrictMode runs effects twice). */
const RETURNING = visitor.isReturning()

const initial: State = { step: 'boot', line: null, prev: null, ready: false, demo: null, phoneError: false, handoff: null }

/**
 * The landing's conversion funnel as a tiny state machine:
 * greet → member? → login | (signup | demo → reveal → signup).
 */
export function useConversation(stage: React.RefObject<Stage | null>) {
  const [state, setState] = useState<State>(initial)
  const flow = useRef(0)
  const readyTimer = useRef(0)
  const nudged = useRef(false)
  const lastAction = useRef(performance.now())

  /** Leave for the auth page — or, in test mode, show where we would go. */
  const go = useCallback((url: string) => {
    if (authDebug()) setState((s) => ({ ...s, handoff: url }))
    else window.setTimeout(() => window.location.assign(url), 250)
  }, [])

  const say = useCallback(async (key: DialogueKey, step: Step, extra: Partial<State> = {}) => {
    const line = pick(key)
    window.clearTimeout(readyTimer.current)
    setState((s) => ({ ...s, ...extra, step, prev: s.line, line, ready: false }))
    stage.current?.setMood(moodFor(step))
    readyTimer.current = window.setTimeout(() => setState((s) => ({ ...s, ready: true })), 650)
    await voice.say(line)
  }, [stage])

  /** Starts a new branch; anything awaited by an older branch is ignored. */
  const begin = useCallback(() => {
    lastAction.current = performance.now()
    voice.unlock()
    return ++flow.current
  }, [])
  const current = (id: number) => id === flow.current

  const start = useCallback(async () => {
    const id = ++flow.current
    const returning = RETURNING
    visitor.markVisited()
    stage.current?.setPowered(true)
    track('view', { returning })
    voice.preload([...dialogue.intro, ...dialogue.greetNew, ...dialogue.greetBack, ...dialogue.newcomer])
    await new Promise((r) => setTimeout(r, 900))
    if (!current(id)) return
    stage.current?.setLayout('side')
    if (returning) return void say('greetBack', 'greetBack')
    await say('intro', 'boot')
    if (current(id)) await say('greetNew', 'greet')
  }, [say, stage])

  const toLogin = useCallback(async () => {
    const id = begin()
    track('choose_login')
    await say('toLogin', 'login')
    if (current(id)) go(loginUrl())
  }, [begin, say, go])

  const asNewcomer = useCallback(() => {
    begin()
    track('choose_new')
    voice.preload([...dialogue.askPhone, ...dialogue.demoAsk, ...dialogue.computing, ...dialogue.reveal])
    say('newcomer', 'newcomer')
  }, [begin, say])

  const toPhone = useCallback(() => {
    begin()
    track('choose_signup')
    say('askPhone', 'phone', { phoneError: false })
  }, [begin, say])

  const submitPhone = useCallback(
    async (raw: string) => {
      const id = begin()
      const phone = normalizeIranMobile(raw)
      if (!phone) {
        track('phone_invalid')
        return void say('badPhone', 'phone', { phoneError: true })
      }
      track('signup_redirect', { method: 'phone' })
      const url = signupUrl(phone)
      await say('toSignup', 'signup', { phoneError: false })
      if (current(id)) go(url)
    },
    [begin, say, go],
  )

  const toDemo = useCallback(() => {
    begin()
    track('choose_demo')
    say('demoAsk', 'demoPick', { demo: null })
  }, [begin, say])

  const runDemo = useCallback(
    async (demo: Demo) => {
      const id = begin()
      track('demo_pick', { demo: demo.id })
      stage.current?.setComputing(true)
      await Promise.all([say('computing', 'computing', { demo }), new Promise((r) => setTimeout(r, 2600))])
      stage.current?.setComputing(false)
      if (current(id)) say('reveal', 'reveal')
    },
    [begin, say, stage],
  )

  const back = useCallback(() => {
    begin()
    stage.current?.setComputing(false)
    say('greetNew', 'greet', { demo: null, phoneError: false, handoff: null })
  }, [begin, say, stage])

  const browse = useCallback(() => {
    begin()
    track('choose_browse')
    say('scrollMore', state.step)
  }, [begin, say, state.step])

  /** Voice the line on screen when sound is switched on (unless something is already playing). */
  const replay = useCallback(() => {
    if (state.line && state.step !== 'boot' && !voice.speaking) voice.say(state.line)
  }, [state.line, state.step])

  // One gentle nudge when someone lingers on a decision.
  useEffect(() => {
    const id = window.setInterval(() => {
      const idle = (performance.now() - lastAction.current) / 1000
      const deciding = ['greet', 'newcomer', 'demoPick', 'reveal'].includes(state.step)
      if (deciding && !nudged.current && !voice.speaking && idle > config.nudgeAfter) {
        nudged.current = true
        say('nudge', state.step)
      }
    }, 2000)
    return () => window.clearInterval(id)
  }, [say, state.step])

  return { state, start, replay, toLogin, asNewcomer, toPhone, submitPhone, toDemo, runDemo, back, browse }
}
