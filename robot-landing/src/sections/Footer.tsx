import { useSyncExternalStore } from 'react'
import { useTranslation } from 'react-i18next'
import { config } from '@/config'
import { localizeDigits } from '@/i18n/format'
import { asset } from '@/lib/asset'

const noSubscribe = () => () => {}
const BUILD_YEAR = Number(process.env.NEXT_PUBLIC_BUILD_YEAR)

/** The current year, without a hydration mismatch: the server snapshot is the build year. */
const useCurrentYear = () => useSyncExternalStore(noSubscribe, () => new Date().getFullYear(), () => BUILD_YEAR)

export function Footer() {
  const year = useCurrentYear()
  const { t } = useTranslation()
  return (
    <footer className="border-t border-line px-5 pt-10 pb-28 text-sm text-mute md:px-14 md:pb-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <a href="#top" className="flex items-center gap-3 text-fog">
          <img src={asset('brand/logo-192.webp')} alt="" width={34} height={28} className="h-7 w-auto" />
          <span className="font-black">{t('brand')}</span>
          <span className="text-mute">· {t('footer.tagline')}</span>
        </a>
        <nav aria-label={t('footer.navLabel')} className="flex flex-wrap gap-6">
          <a href="#plans" className="transition hover:text-fog">{t('footer.plans')}</a>
          <a href="#faq" className="transition hover:text-fog">{t('footer.faq')}</a>
          <a href={config.authUrl} className="transition hover:text-fog">{t('footer.login')}</a>
        </nav>
      </div>
      <div className="mt-8 flex flex-col gap-2 text-xs text-mute/70 md:flex-row md:justify-between">
        <span>{t('footer.copyright', { year: localizeDigits(year) })}</span>
        <span dir="ltr">{t('footer.icons')}</span>
      </div>
    </footer>
  )
}
