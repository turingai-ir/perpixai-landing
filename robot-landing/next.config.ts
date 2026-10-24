import type { NextConfig } from 'next'

const config: NextConfig = {
  // Fully pre-rendered HTML in `out/`, served by nginx. Crawlers get the real content without running JS.
  output: 'export',
  reactStrictMode: true,
  poweredByHeader: false,
  // The year the static HTML was built in; the footer shows it during hydration, then the real current year.
  env: { NEXT_PUBLIC_BUILD_YEAR: String(new Date().getFullYear()) },
}

export default config
