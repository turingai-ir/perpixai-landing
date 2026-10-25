export type LandingEndpoints = { plans: string; models: string }

/** The Perpix API, called server-side at build time. */
export const directEndpoints = (base: string): LandingEndpoints => ({
  plans: `${base}/api/v1/user/subscription/plans`,
  models: `${base}/api/v1/ai-registry/models`,
})

/** The same-origin proxy served by nginx (see nginx.conf): the browser cannot call the API directly, CORS allows only app.perpixai.ir. */
export const proxyEndpoints = (base: string): LandingEndpoints => ({ plans: `${base}/plans`, models: `${base}/models` })

export async function fetchRawLanding(endpoints: LandingEndpoints, signal: AbortSignal) {
  const get = async (url: string) => {
    const res = await fetch(url, { signal, headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`)
    return res.json() as Promise<unknown>
  }
  const [plans, models] = await Promise.all([get(endpoints.plans), get(endpoints.models)])
  return { plans, models }
}
