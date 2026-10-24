import { config } from '@/config'
import { toFa } from '@/lib/digits'
import { asset } from '@/lib/asset'

export function Footer() {
  return (
    <footer className="border-t border-line px-5 pt-10 pb-28 text-sm text-mute md:px-14 md:pb-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <a href="#top" className="flex items-center gap-3 text-fog">
          <img src={asset('brand/logo-192.webp')} alt="" width={34} height={28} className="h-7 w-auto" />
          <span className="font-black">پرپیکس</span>
          <span className="text-mute">· ساخت تصویر و ویدیو با هوش مصنوعی</span>
        </a>
        <nav aria-label="پاورقی" className="flex flex-wrap gap-6">
          <a href="#plans" className="transition hover:text-fog">پلن‌ها</a>
          <a href="#faq" className="transition hover:text-fog">سؤال‌ها</a>
          <a href={config.authUrl} className="transition hover:text-fog">ورود / ثبت‌نام</a>
        </nav>
      </div>
      <div className="mt-8 flex flex-col gap-2 text-xs text-mute/70 md:flex-row md:justify-between">
        <span>© {toFa(new Date().getFullYear())} پرپیکس. همه‌ی ویدیوهای این صفحه با پرپیکس ساخته شده‌اند.</span>
        <span dir="ltr">Icons: Solar by 480 Design (CC BY 4.0)</span>
      </div>
    </footer>
  )
}
