import type { NextConfig } from 'next'

const config: NextConfig = {
  // Fully pre-rendered HTML in `out/`, served by nginx. Crawlers get the real content without running JS.
  output: 'export',
  reactStrictMode: true,
  poweredByHeader: false,
}

export default config
