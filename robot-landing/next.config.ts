import type { NextConfig } from 'next'

const config: NextConfig = {
  // Fully pre-rendered HTML in `out/`, served by nginx. Crawlers get the real content without running JS.
  output: 'export',
  // /terms/ → out/terms/index.html: nginx serves directories without any rewrite.
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  // ArvanCloud's edge answers existing .js/.css under /_next/ with 302/502, so the build's assets are served under another prefix
  // (nginx maps it back to out/_next). Dev keeps the default path.
  assetPrefix: process.env.NODE_ENV === 'production' ? '/landing-assets' : undefined,
  // The year the static HTML was built in; the footer shows it during hydration, then the real current year.
  env: { NEXT_PUBLIC_BUILD_YEAR: String(new Date().getFullYear()) },
}

export default config
