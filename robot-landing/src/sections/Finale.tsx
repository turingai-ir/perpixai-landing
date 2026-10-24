import { useTranslation } from 'react-i18next'
import { config } from '@/config'
import { asset } from '@/lib/asset'
import { track } from '@/lib/analytics'
import { Icon } from '@/ui/Icon'

/** Closing card: "پایان", the way old Persian films ended — then one last invitation. */
export function Finale({ onSignup }: { onSignup: () => void }) {
  const { t } = useTranslation('home')
  const { t: tc } = useTranslation('dialogue')
  const title = t('finale.title', { returnObjects: true })
  return (
    <section className="relative overflow-hidden px-5 pt-28 md:px-14 md:pt-36">
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-3/4 bg-[radial-gradient(ellipse_55%_70%_at_50%_100%,#863ed340,transparent_70%)]" />
      <div className="relative mx-auto flex max-w-5xl flex-col items-center text-center">
        <p data-reveal className="font-poster neon text-[clamp(5rem,18vw,13rem)] leading-none">{t('finale.end')}</p>
        <p data-reveal className="mt-2 text-sm tracking-wide text-dim">{t('finale.endNote')}</p>
        <h2 data-reveal className="font-poster mt-12 text-4xl leading-[1.25] md:text-6xl">
          {title[0]} <span className="text-brand">{title[1]}</span>
        </h2>
        <p data-reveal className="mt-5 max-w-md text-lg leading-8 text-mute">{t('finale.body')}</p>
        <div data-reveal className="mt-10 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={onSignup}
            className="bg-brand inline-flex cursor-pointer items-center gap-2 rounded-full px-9 py-4 text-lg font-bold text-white shadow-[0_20px_60px_-15px_#d92dd4] transition hover:-translate-y-0.5"
          >
            <Icon name="gift" className="size-6" />
            {t('finale.signup')}
          </button>
          <a
            href={config.authUrl}
            onClick={() => track('finale_login')}
            className="inline-flex items-center gap-2 rounded-full border border-fog/25 px-7 py-4 text-fog/90 transition hover:border-fog/50"
          >
            <Icon name="login" className="size-5" />
            {t('finale.login')}
          </a>
        </div>
        <img
          src={asset('brand/pixo.webp')}
          alt={tc('character.label', { name: tc('character.name'), title: tc('character.title') })}
          width={840}
          height={1107}
          loading="lazy"
          data-reveal
          className="mt-14 w-[min(90vw,28rem)] [mask-image:radial-gradient(ellipse_70%_80%_at_50%_45%,black_55%,transparent)]"
        />
      </div>
    </section>
  )
}
