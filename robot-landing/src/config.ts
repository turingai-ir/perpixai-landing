import type { PhoneFormat } from '@/lib/auth'
import { asset } from '@/lib/asset'

const env = import.meta.env

/**
 * External links and asset locations. Edit here, or override at build time with
 * VITE_PERPIX_APP_URL / VITE_PHONE_PARAM / VITE_PHONE_FORMAT (see .env.example).
 */
export const config = {
  /** Login and sign-up share one page. */
  authUrl: ((env.VITE_PERPIX_APP_URL as string | undefined) ?? 'https://app.perpixai.ir') + '/auth/login',
  /**
   * How the phone typed to Pixo is handed to the auth page.
   * Agreed with the app team (Oct 2026): `/auth/login?phone=09121234567` prefills the phone field.
   */
  phone: {
    param: (env.VITE_PHONE_PARAM as string | undefined) ?? 'phone',
    format: ((env.VITE_PHONE_FORMAT as string | undefined) ?? 'local') as PhoneFormat,
  },
  voiceDir: asset('audio/fa'),
  demoDir: asset('demo'),
  /** Seconds of inactivity before Pixo nudges the visitor. */
  nudgeAfter: 25,
}
