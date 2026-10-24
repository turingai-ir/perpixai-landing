import { useTranslation } from 'react-i18next'
import { config } from '@/config'
import { asset } from '@/lib/asset'
import { track } from '@/lib/analytics'
import { scrollToId } from './scroll'

const nav = ['more', 'reel', 'plans', 'faq'] as const

/** Login and sign-up stay one tap away no matter where the conversation is. */
export function Header({ onSignup, onRestart }: { onSignup: () => void; onRestart: () => void }) {
  const { t } = useTranslation()
  return (
    <header
      data-hero-chrome
      className="fixed inset-x-0 top-0 z-(--z-chrome) flex items-center justify-between gap-4 bg-gradient-to-b from-ink via-ink/80 to-transparent px-5 py-4 md:px-10 md:py-5"
    >
      <a
        href="#top"
        onClick={(e) => (e.preventDefault(), onRestart())}
        aria-label={t('header.restart')}
        className="flex items-center gap-3"
      >
        <img src={asset('brand/logo-192.webp')} alt="" width={38} height={32} className="h-8 w-auto" />
        <span className="font-poster text-2xl leading-none">{t('brand')}</span>
      </a>
      <nav aria-label={t('header.navLabel')} className="hidden lg:block">
        <ul className="flex items-center gap-8 text-sm text-mute">
          {nav.map((id) => (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(e) => (e.preventDefault(), scrollToId(id))}
                className="relative py-2 transition after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-right after:scale-x-0 after:bg-fog after:transition-transform after:duration-500 hover:text-fog hover:after:scale-x-100"
              >
                {t(`header.nav.${id}`)}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="flex items-center gap-2 text-sm">
        <a
          href={config.authUrl}
          onClick={() => track('header_login')}
          className="rounded-full px-4 py-2 text-fog/85 transition hover:text-fog"
        >
          {t('header.login')}
        </a>
        <button type="button" onClick={onSignup} className="bg-brand cursor-pointer rounded-full px-5 py-2 font-semibold text-white">
          {t('header.signup')}
        </button>
      </div>
    </header>
  )
}
