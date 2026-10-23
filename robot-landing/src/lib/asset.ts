/** Public-folder URL that respects Vite's `base` (absolute on the real site, relative in previews). */
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
