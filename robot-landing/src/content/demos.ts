import { season } from './season'

/**
 * "Magic show" demos. Put the generated clips in public/demo/<id>.mp4
 * (and optionally <id>.jpg as poster). `prompt` is what the visitor sees.
 * Set `ready: true` once the clip is in place; only ready demos are offered.
 */
export const demos = [
  {
    id: 'paykan-rain',
    ready: true,
    chip: 'پیکانِ نوستالژی زیر بارانِ نئونی',
    prompt: 'یه پیکان قدیمی، شب بارونی تهران، نور نئون روی خیابون خیس، حس فیلم سینمایی',
  },
  {
    id: 'yalda-pomegranate',
    ready: true,
    chip: 'اناری که شب یلدا ستاره می‌شود',
    prompt: 'شب یلدا، اناری که باز می‌شه و دونه‌هاش مثل ستاره به آسمون می‌رن، کنار دیوان حافظ',
  },
  {
    id: 'flying-carpet',
    ready: true,
    chip: 'فرشِ پرنده بر فراز نقش جهان',
    prompt: 'فرش ایرانی که موقع غروب بالای میدون نقش جهان اصفهان پرواز می‌کنه',
  },
] as const

/** Ready demos, with the season's featured clip first. */
export const readyDemos = demos
  .filter((d) => d.ready)
  .sort((a, b) => Number(b.id === season.featuredDemo) - Number(a.id === season.featuredDemo))

export type Demo = (typeof demos)[number]
