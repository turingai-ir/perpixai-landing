import { config } from '@/config'
import { plans, toolItems } from '@/content/sections'
import { formatNumber } from '@/i18n/format'
import { defaultLocale } from '@/i18n/config'
import { i18n } from '@/i18n'
import { SITE, getSeo } from '@/lib/seo'

export const dynamic = 'force-static'

/** llms.txt: a plain-text summary for AI crawlers and answer engines, generated from the page's own translations. */
export function GET() {
  const t = i18n.getFixedT(defaultLocale, 'seo')
  const th = i18n.getFixedT(defaultLocale, 'home')
  const { brand, description } = getSeo(defaultLocale)
  const body = `# ${brand} (Perpix)

> ${description}

${t('llms.summaryEn')}

## ${t('llms.features')}
${toolItems.map((i) => `- ${th(`tools.items.${i.id}.title`)}: ${th(`tools.items.${i.id}.body`)}`).join('\n')}

## ${t('llms.plans')}
${plans.map((p) => `- ${t('llms.plan', { name: th(`plans.items.${p.id}.name`), price: formatNumber(p.price), tokens: formatNumber(p.tokens) })}`).join('\n')}

## ${t('llms.links')}
- [${t('llms.home')}](${SITE}/): ${t('llms.homeNote')}
- [${t('llms.login')}](${config.authUrl}): ${t('llms.loginNote')}
`
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
