import { useTranslation } from 'react-i18next'
import { config } from '@/config'
import { asset } from '@/lib/asset'
import { track } from '@/lib/analytics'
import { scrollToId } from './scroll'

const nav = ['more', 'reel', 'models', 'plans', 'faq'] as const

/** Login and sign-up stay one tap away no matter where the conversation is. */
export function Header({ onSignup, onRestart }: { onSignup: () => void; onRestart: () => void }) {
  const { t } = useTranslation()
  return (
    <header
      data-hero-chrome
      className="fixed inset-x-0 top-0 z-40 flex items-center justify-between gap-2 bg-gradient-to-b from-background via-background/80 to-transparent pt-[max(1rem,env(safe-area-inset-top))] pr-[max(1.25rem,env(safe-area-inset-right))] pb-4 pl-[max(1.25rem,env(safe-area-inset-left))] sm:gap-4 md:pt-[max(1.25rem,env(safe-area-inset-top))] md:pr-[max(2.5rem,env(safe-area-inset-right))] md:pb-5 md:pl-[max(2.5rem,env(safe-area-inset-left))]"
    >
      <a
        href="#top"
        onClick={(e) => (e.preventDefault(), onRestart())}
        aria-label={t('header.restart')}
        className="flex items-center gap-3 pointer-coarse:min-h-11"
      >
        <img src={asset('brand/logo-192.webp')} alt="" width={38} height={32} className="h-8 w-auto" />
        <span className="hidden font-poster text-2xl leading-none min-[360px]:inline">{t('brand')}</span>
      </a>
      <nav aria-label={t('header.navLabel')} className="hidden lg:block">
        <ul className="flex items-center gap-8 text-sm text-muted-foreground">
          {nav.map((id) => (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(e) => (e.preventDefault(), scrollToId(id))}
                className="relative py-2 transition after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-right after:scale-x-0 after:bg-foreground after:transition-transform after:duration-500 hover:text-foreground hover:after:scale-x-100 pointer-coarse:py-3"
              >
                {t(`header.nav.${id}`)}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="flex items-center gap-1 text-sm whitespace-nowrap sm:gap-2">
        <a
          href={config.authUrl}
          onClick={() => track('header_login')}
          className="inline-flex items-center rounded-full px-3 py-2 text-foreground/85 transition hover:text-foreground sm:px-4 pointer-coarse:min-h-11"
        >
          {t('header.login')}
        </a>
        <button
          type="button"
          onClick={onSignup}
          className="bg-brand inline-flex cursor-pointer items-center rounded-full px-4 py-2 font-semibold text-primary-foreground sm:px-5 pointer-coarse:min-h-11"
        >
          {t('header.signup')}
        </button>
      </div>
    </header>
  )
}
