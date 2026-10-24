import type { PhoneFormat } from '@/lib/auth'
import { asset } from '@/lib/asset'
import { i18n } from '@/i18n'

/**
 * External links and asset locations. Edit here, or override at build time with
 * NEXT_PUBLIC_PERPIX_APP_URL / NEXT_PUBLIC_PHONE_PARAM / NEXT_PUBLIC_PHONE_FORMAT (see .env.example).
 * Defaults use `||`, not `??`: an unset Docker build arg arrives as an empty string.
 */
export const config = {
  /** Login and sign-up share one page. */
  authUrl: (process.env.NEXT_PUBLIC_PERPIX_APP_URL || 'https://app.perpixai.ir') + '/auth/login',
  /**
   * How the phone typed to Pixo is handed to the auth page.
   * Agreed with the app team (Oct 2026): `/auth/login?phone=09121234567` prefills the phone field.
   */
  phone: {
    param: process.env.NEXT_PUBLIC_PHONE_PARAM || 'phone',
    format: (process.env.NEXT_PUBLIC_PHONE_FORMAT || 'local') as PhoneFormat,
  },
  /** Pixo's recorded lines are per language: public/audio/<lang>/<id>.mp3 */
  get voiceDir() {
    return asset(`audio/${i18n.language}`)
  },
  demoDir: asset('demo'),
  /** Seconds of inactivity before Pixo nudges the visitor. */
  nudgeAfter: 25,
}
