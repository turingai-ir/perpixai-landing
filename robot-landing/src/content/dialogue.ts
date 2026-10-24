import { i18n } from '@/i18n'

/**
 * Everything Pixo says. Each line's `id` is also its audio file name:
 * public/audio/<lang>/<id>.mp3 (made with ElevenLabs). The spoken text is a translation
 * (`locales/<lang>/dialogue.json`, `lines.<id>`); `direction` is the English acting note for the voice session.
 * Missing audio is fine — the subtitle still shows and the machine "speaks" with a simulated envelope.
 */
export type Line = { id: string; text: string; direction: string }

type LineId =
  | 'intro-1' | 'intro-2' | 'greet-1' | 'greet-2' | 'greet-3' | 'back-1' | 'back-2' | 'login-1' | 'new-1'
  | 'phone-1' | 'phone-bad' | 'signup-1' | 'demo-ask' | 'compute-1' | 'compute-2' | 'reveal-1' | 'reveal-2'
  | 'scroll-1' | 'nudge-1' | 'nudge-2'

type Script = { id: LineId; direction: string }

const script = {
  intro: [
    { id: 'intro-1', direction: 'Surprised, waking up, then proud. Warm, playful.' },
    { id: 'intro-2', direction: 'Energetic, like a machine powering up. Friendly.' },
  ],
  greetNew: [
    { id: 'greet-1', direction: 'Casual, curious question.' },
    { id: 'greet-2', direction: 'Light, a bit cheeky.' },
    { id: 'greet-3', direction: 'Friendly and inviting.' },
  ],
  greetBack: [
    { id: 'back-1', direction: 'Happy recognition, upbeat.' },
    { id: 'back-2', direction: 'Teasing, smiling voice.' },
  ],
  toLogin: [{ id: 'login-1', direction: 'Quick, satisfied.' }],
  newcomer: [{ id: 'new-1', direction: 'Excited, clear, a little salesy but charming.' }],
  askPhone: [{ id: 'phone-1', direction: 'Confident, reassuring.' }],
  badPhone: [{ id: 'phone-bad', direction: 'Gentle, a little funny, not scolding.' }],
  toSignup: [{ id: 'signup-1', direction: 'Celebratory.' }],
  demoAsk: [{ id: 'demo-ask', direction: 'Showman, inviting.' }],
  computing: [
    { id: 'compute-1', direction: 'Concentrated, building tension.' },
    { id: 'compute-2', direction: 'Whispery, mysterious.' },
  ],
  reveal: [
    { id: 'reveal-1', direction: 'Proud reveal, then a direct invitation.' },
    { id: 'reveal-2', direction: 'Amazed, then encouraging.' },
  ],
  scrollMore: [{ id: 'scroll-1', direction: 'Relaxed, easygoing.' }],
  nudge: [
    { id: 'nudge-1', direction: 'Playful nudge.' },
    { id: 'nudge-2', direction: 'Cheeky.' },
  ],
} satisfies Record<string, Script[]>

export type DialogueKey = keyof typeof script

/** The line with its text in the current language. */
const resolve = ({ id, direction }: Script): Line => ({ id, direction, text: i18n.t(`lines.${id}`, { ns: 'dialogue' }) })

/** Lines of a group in the current language (read at call time, so a language switch is picked up). */
export const lines = (key: DialogueKey): Line[] => script[key].map(resolve)

export const pick = (key: DialogueKey): Line => {
  const group = script[key]
  return resolve(group[Math.floor(Math.random() * group.length)])
}

/** Pixo's name and title in the current language. */
export const character = () => ({
  name: i18n.t('character.name', { ns: 'dialogue' }),
  title: i18n.t('character.title', { ns: 'dialogue' }),
})
