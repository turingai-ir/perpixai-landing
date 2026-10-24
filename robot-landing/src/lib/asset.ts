/** Public-folder URL (absolute, served from the site root). */
export const asset = (path: string) => `/${path.replace(/^\//, '')}`
