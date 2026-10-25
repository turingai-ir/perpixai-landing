import { useSyncExternalStore } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { config } from '@/config'
import { localizeDigits } from '@/i18n/format'
import { asset } from '@/lib/asset'

const noSubscribe = () => () => {}
const BUILD_YEAR = Number(process.env.NEXT_PUBLIC_BUILD_YEAR)

/** The current year, without a hydration mismatch: the server snapshot is the build year. */
const useCurrentYear = () =>
  useSyncExternalStore(
    noSubscribe,
    () => new Date().getFullYear(),
    () => BUILD_YEAR,
  )

export function Footer() {
  const year = useCurrentYear()
  const { t } = useTranslation()
  return (
    <footer className="border-t border-border px-5 pt-10 pb-28 text-sm text-muted-foreground md:px-14 md:pb-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <Link href="/#top" className="flex items-center gap-3 text-foreground pointer-coarse:min-h-11">
          <img src={asset('brand/logo-192.webp')} alt="" width={34} height={28} className="h-7 w-auto" />
          <span className="font-black">{t('brand')}</span>
          <span className="text-muted-foreground">· {t('footer.tagline')}</span>
        </Link>
        <nav aria-label={t('footer.navLabel')} className="flex flex-wrap gap-x-6 gap-y-1">
          <Link href="/#plans" className="inline-flex items-center transition hover:text-foreground pointer-coarse:min-h-11">
            {t('footer.plans')}
          </Link>
          <Link href="/#faq" className="inline-flex items-center transition hover:text-foreground pointer-coarse:min-h-11">
            {t('footer.faq')}
          </Link>
          <a href="/terms/" className="inline-flex items-center transition hover:text-foreground pointer-coarse:min-h-11">
            {t('footer.terms')}
          </a>
          <a href="/privacy/" className="inline-flex items-center transition hover:text-foreground pointer-coarse:min-h-11">
            {t('footer.privacy')}
          </a>
          <a href="/contact/" className="inline-flex items-center transition hover:text-foreground pointer-coarse:min-h-11">
            {t('footer.contact')}
          </a>
          <a href={config.authUrl} className="inline-flex items-center transition hover:text-foreground pointer-coarse:min-h-11">
            {t('footer.login')}
          </a>
        </nav>
      </div>
      <div className="mt-8 flex flex-col gap-2 text-xs text-muted-foreground/70 md:flex-row md:justify-between">
        <span>{t('footer.copyright', { year: localizeDigits(year) })}</span>
        <span dir="ltr">{t('footer.icons')}</span>
      </div>
    </footer>
  )
}
