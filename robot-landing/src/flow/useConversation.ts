import { useCallback, useEffect, useRef, useState } from 'react'
import { voice } from '@/audio/voice'
import { config } from '@/config'
import { authDebug, loginUrl, signupUrl } from '@/lib/auth'
import { lines, pick, type DialogueKey, type Line } from '@/content/dialogue'
import type { Demo } from '@/content/demos'
import { normalizeIranMobile } from '@/lib/digits'
import { visitor } from '@/lib/storage'
import { track } from '@/lib/analytics'
import type { StageControls } from '@/stage/controls'
import type { Mood } from '@/stage/types'

export type Step = 'boot' | 'greet' | 'greetBack' | 'login' | 'newcomer' | 'phone' | 'signup' | 'demoPick' | 'computing' | 'reveal'

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
  step === 'computing' ? 'think' : step === 'reveal' || step === 'signup' || step === 'login' ? 'love' : step === 'boot' ? 'neutral' : 'ask'

/** Read once per page load (StrictMode runs effects twice). */
const RETURNING = visitor.isReturning()

const initial: State = { step: 'boot', line: null, prev: null, ready: false, demo: null, phoneError: false, handoff: null }

/**
 * The landing's conversion funnel as a tiny state machine:
 * greet → member? → login | (signup | demo → reveal → signup).
 */
export function useConversation(stage: StageControls) {
  const [state, setState] = useState<State>(initial)
  const flow = useRef(0)
  const readyTimer = useRef(0)
  const nudged = useRef(false)
  const lastAction = useRef(0)

  /** Leave for the auth page — or, in test mode, show where we would go. */
  const go = useCallback((url: string) => {
    if (authDebug()) setState((s) => ({ ...s, handoff: url }))
    else window.setTimeout(() => window.location.assign(url), 250)
  }, [])

  const say = useCallback(
    async (key: DialogueKey, step: Step, extra: Partial<State> = {}) => {
      const line = pick(key)
      window.clearTimeout(readyTimer.current)
      setState((s) => ({ ...s, ...extra, step, prev: s.line, line, ready: false }))
      stage.setMood(moodFor(step))
      readyTimer.current = window.setTimeout(() => setState((s) => ({ ...s, ready: true })), 650)
      await voice.say(line)
    },
    [stage],
  )

  /** Starts a new branch; anything awaited by an older branch is ignored. */
  const begin = useCallback(() => {
    lastAction.current = performance.now()
    voice.unlock()
    return ++flow.current
  }, [])
  const current = (id: number) => id === flow.current

  const start = useCallback(async () => {
    const id = ++flow.current
    lastAction.current = performance.now() // the idle clock for the nudge starts when the visitor walks in
    const returning = RETURNING
    visitor.markVisited()
    stage.setPowered(true)
    track('view', { returning })
    voice.preload([...lines('intro'), ...lines('greetNew'), ...lines('greetBack'), ...lines('newcomer')])
    await new Promise((r) => setTimeout(r, 900))
    if (!current(id)) return
    if (returning) return void say('greetBack', 'greetBack')
    await say('intro', 'boot')
    if (current(id)) await say('greetNew', 'greet')
  }, [say, stage])

  const toLogin = useCallback(() => {
    begin()
    track('choose_login')
    // Leave right away: the line plays while the page changes, nobody waits for speech to log in.
    void say('toLogin', 'login')
    go(loginUrl())
  }, [begin, say, go])

  const asNewcomer = useCallback(() => {
    begin()
    track('choose_new')
    voice.preload([...lines('askPhone'), ...lines('demoAsk'), ...lines('computing'), ...lines('reveal')])
    say('newcomer', 'newcomer')
  }, [begin, say])

  const toPhone = useCallback(() => {
    begin()
    track('choose_signup')
    say('askPhone', 'phone', { phoneError: false })
  }, [begin, say])

  const submitPhone = useCallback(
    (raw: string) => {
      begin()
      const phone = normalizeIranMobile(raw)
      if (!phone) {
        track('phone_invalid')
        return void say('badPhone', 'phone', { phoneError: true })
      }
      track('signup_redirect', { method: 'phone' })
      const url = signupUrl(phone)
      void say('toSignup', 'signup', { phoneError: false })
      go(url)
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
      stage.setComputing(true)
      await Promise.all([say('computing', 'computing', { demo }), new Promise((r) => setTimeout(r, 2600))])
      stage.setComputing(false)
      if (current(id)) say('reveal', 'reveal')
    },
    [begin, say, stage],
  )

  const back = useCallback(() => {
    begin()
    stage.setComputing(false)
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
