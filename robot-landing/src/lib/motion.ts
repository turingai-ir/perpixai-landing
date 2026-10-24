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
