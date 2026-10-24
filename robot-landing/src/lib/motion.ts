import { useSyncExternalStore } from 'react'

const REDUCED = '(prefers-reduced-motion: reduce)'

export const prefersReducedMotion = () => window.matchMedia(REDUCED).matches

export const isMobile = () => window.matchMedia('(max-width: 767px), (pointer: coarse)').matches

const subscribeReduced = (onChange: () => void) => {
  const mq = window.matchMedia(REDUCED)
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}

/** Reactive `prefers-reduced-motion`. False on the server, so the pre-rendered HTML and hydration agree. */
export const useReducedMotion = () => useSyncExternalStore(subscribeReduced, prefersReducedMotion, () => false)

/** Reactive media query. False on the server, so the pre-rendered HTML and hydration agree. */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query)
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

/** Side-by-side hero. Must match `@custom-variant wide` in styles/globals.css. */
export const WIDE_QUERY = '(min-width: 35rem) and (min-aspect-ratio: 9/10)'
