const FA = '۰۱۲۳۴۵۶۷۸۹'
const AR = '٠١٢٣٤٥٦٧٨٩'

export const toFa = (v: string | number) => String(v).replace(/\d/g, (d) => FA[Number(d)])

export const toEn = (v: string) =>
  v.replace(/[۰-۹]/g, (d) => String(FA.indexOf(d))).replace(/[٠-٩]/g, (d) => String(AR.indexOf(d)))

/** Normalises Persian/Arabic digits, +98 / 0098 prefixes and spaces into 09xxxxxxxxx. */
export function normalizeIranMobile(raw: string): string | null {
  let n = toEn(raw).replace(/[\s\-()]/g, '')
  if (n.startsWith('+98')) n = '0' + n.slice(3)
  else if (n.startsWith('0098')) n = '0' + n.slice(4)
  else if (n.startsWith('98') && n.length === 12) n = '0' + n.slice(2)
  else if (n.startsWith('9') && n.length === 10) n = '0' + n
  return /^09\d{9}$/.test(n) ? n : null
}
