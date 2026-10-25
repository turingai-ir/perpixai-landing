import { App } from '@/App'
import { getLandingData } from '@/lib/landing/server'

export default async function Page() {
  // Plans and models are fetched once at build time and baked into the page (see lib/landing).
  return <App landing={await getLandingData()} />
}
