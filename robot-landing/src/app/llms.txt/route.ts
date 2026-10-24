import { config } from '@/config'
import { plans, tools } from '@/content/sections'
import { SITE, description } from '@/lib/seo'

export const dynamic = 'force-static'

/** llms.txt: a plain-text summary for AI crawlers and answer engines, generated from the page's own content. */
export function GET() {
  const body = `# پرپیکس (Perpix)

> ${description}

Perpix is a Persian-language AI image and video generator: write an idea in Persian (or upload a photo) and get an image or video, using 16 AI models from a single account. Sign-up is free and includes gift credits.

## قابلیت‌ها
${tools.map((t) => `- ${t.title}: ${t.body}`).join('\n')}

## پلن‌ها (یک‌ماهه، قیمت به تومان)
${plans.map((p) => `- ${p.name}: ${p.price} تومان، ${p.tokens} اعتبار`).join('\n')}

## لینک‌ها
- [صفحه‌ی اصلی](${SITE}/): معرفی، نمونه‌ی ویدیوها، پلن‌ها و سؤال‌های متداول
- [ورود / ثبت‌نام](${config.authUrl}): ساخت حساب و شروع
`
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
