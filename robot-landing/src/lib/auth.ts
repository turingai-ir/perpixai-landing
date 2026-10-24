import { config } from '@/config'

/** 09121234567 | 9121234567 | +989121234567 */
export type PhoneFormat = 'local' | 'national' | 'intl'
const FORMATS: PhoneFormat[] = ['local', 'national', 'intl']

export function formatPhone(local: string, format: PhoneFormat) {
  const national = local.slice(1)
  return format === 'national' ? national : format === 'intl' ? `+98${national}` : local
}

/**
 * Test overrides from the landing URL, so the backend team can try candidates without a deploy:
 *   ?phoneParam=mobile&phoneFormat=intl&authDebug=1
 * Only the param name and format can change — never the destination (no open redirect).
 */
function overrides() {
  const q = new URLSearchParams(window.location.search)
  const param = q.get('phoneParam')
  const format = q.get('phoneFormat') as PhoneFormat | null
  return {
    param: param && /^[A-Za-z_][\w.-]{0,31}$/.test(param) ? param : null,
    format: format && FORMATS.includes(format) ? format : null,
    // Previews run in a sandboxed frame that cannot navigate away, so they always show the hand-off.
    debug: q.get('authDebug') === '1' || process.env.NEXT_PUBLIC_PREVIEW === '1',
  }
}

export const authDebug = () => overrides().debug

export const loginUrl = () => config.authUrl

/** Auth page URL with the visitor's phone prefilled. `phone` is a normalised 09xxxxxxxxx. */
export function signupUrl(phone: string) {
  const o = overrides()
  const url = new URL(config.authUrl)
  url.searchParams.set(o.param ?? config.phone.param, formatPhone(phone, o.format ?? config.phone.format))
  return url.toString()
}
