import { config } from '@/config'
import { toolItems } from '@/content/sections'
import { formatNumber } from '@/i18n/format'
import { defaultLocale } from '@/i18n/config'
import { i18n } from '@/i18n'
import { durationLabels, primaryDuration, roundCredits } from '@/lib/landing/format'
import { getLandingData } from '@/lib/landing/server'
import { SITE, getSeo } from '@/lib/seo'

export const dynamic = 'force-static'

/** llms.txt: a plain-text summary for AI crawlers and answer engines, generated from the page's own translations and data. */
export async function GET() {
  const landing = await getLandingData()
  const t = i18n.getFixedT(defaultLocale, 'seo')
  const th = i18n.getFixedT(defaultLocale, 'home')
  const { brand, description } = getSeo(landing, defaultLocale)
  const { adj } = durationLabels(primaryDuration(landing), th)
  const models = formatNumber(landing.models.length)
  const body = `# ${brand} (Perpix)

> ${description}

${t('llms.summaryEn', { modelsLatin: String(landing.models.length) })}

## ${t('llms.features')}
${toolItems.map((i) => `- ${th(`tools.items.${i.id}.title`, { models })}: ${th(`tools.items.${i.id}.body`, { models })}`).join('\n')}

## ${t('llms.plans', { adj })}
${landing.plans.map((p) => `- ${t('llms.plan', { name: p.name, price: formatNumber(p.priceToman), tokens: formatNumber(p.credits) })}`).join('\n')}

## ${t('llms.models')}
${landing.models.map((m) => `- ${t('llms.model', { name: m.name, owner: m.owner, kind: th(`models.kind.${m.kind}`), credits: formatNumber(roundCredits(m.minCredits)) })}`).join('\n')}

## ${t('llms.links')}
- [${t('llms.home')}](${SITE}/): ${t('llms.homeNote')}
- [${t('llms.login')}](${config.authUrl}): ${t('llms.loginNote')}
`
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
