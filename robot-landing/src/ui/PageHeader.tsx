import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { config } from '@/config'
import { asset } from '@/lib/asset'

/** Plain header for the standalone pages (terms, privacy, contact): the logo leads home, login and sign-up go to the app (no Pixo, no preloader). */
export function PageHeader() {
  const { t } = useTranslation()
  return (
    <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between gap-2 bg-gradient-to-b from-background via-background/80 to-transparent pt-[max(1rem,env(safe-area-inset-top))] pr-[max(1.25rem,env(safe-area-inset-right))] pb-4 pl-[max(1.25rem,env(safe-area-inset-left))] sm:gap-4 md:pt-[max(1.25rem,env(safe-area-inset-top))] md:pr-[max(2.5rem,env(safe-area-inset-right))] md:pb-5 md:pl-[max(2.5rem,env(safe-area-inset-left))]">
      <Link href="/" aria-label={t('brand')} className="flex items-center gap-3 pointer-coarse:min-h-11">
        <img src={asset('brand/logo-192.webp')} alt="" width={38} height={32} className="h-8 w-auto" />
        <span className="hidden font-poster text-2xl leading-none min-[360px]:inline">{t('brand')}</span>
      </Link>
      <div className="flex items-center gap-1 text-sm whitespace-nowrap sm:gap-2">
        <a
          href={config.authUrl}
          className="inline-flex items-center rounded-full px-3 py-2 text-foreground/85 transition hover:text-foreground sm:px-4 pointer-coarse:min-h-11"
        >
          {t('header.login')}
        </a>
        <a
          href={config.authUrl}
          className="bg-brand inline-flex items-center rounded-full px-4 py-2 font-semibold text-primary-foreground sm:px-5 pointer-coarse:min-h-11"
        >
          {t('header.signup')}
        </a>
      </div>
    </header>
  )
}
