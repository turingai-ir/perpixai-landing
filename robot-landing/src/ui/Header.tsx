import { config } from '@/config'
import { asset } from '@/lib/asset'
import { track } from '@/lib/analytics'
import { scrollToId } from './scroll'

const nav = [
  { id: 'more', label: 'از ایده تا اکران' },
  { id: 'reel', label: 'نمونه‌ها' },
  { id: 'plans', label: 'قیمت‌ها' },
  { id: 'faq', label: 'سؤال‌ها' },
]

/** Login and sign-up stay one tap away no matter where the conversation is. */
export function Header({ onSignup, onRestart }: { onSignup: () => void; onRestart: () => void }) {
  return (
    <header
      data-hero-chrome
      className="fixed inset-x-0 top-0 z-40 flex items-center justify-between gap-4 bg-gradient-to-b from-ink via-ink/80 to-transparent px-5 py-4 md:px-10 md:py-5"
    >
      <a
        href="#top"
        onClick={(e) => (e.preventDefault(), onRestart())}
        aria-label="پرپیکس — شروع دوباره‌ی اکران"
        className="flex items-center gap-3"
      >
        <img src={asset('brand/logo-192.webp')} alt="" width={38} height={32} className="h-8 w-auto" />
        <span className="font-poster text-2xl leading-none">پرپیکس</span>
      </a>
      <nav aria-label="بخش‌ها" className="hidden lg:block">
        <ul className="flex items-center gap-8 text-sm text-mute">
          {nav.map((n) => (
            <li key={n.id}>
              <a
                href={`#${n.id}`}
                onClick={(e) => (e.preventDefault(), scrollToId(n.id))}
                className="relative py-2 transition hover:text-fog after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-right after:scale-x-0 after:bg-fog after:transition-transform after:duration-500 hover:after:scale-x-100"
              >
                {n.label}
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
          ورود
        </a>
        <button type="button" onClick={onSignup} className="bg-brand cursor-pointer rounded-full px-5 py-2 font-semibold text-white">
          ثبت‌نام رایگان
        </button>
      </div>
    </header>
  )
}
