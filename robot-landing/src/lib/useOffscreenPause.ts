import { useEffect, type RefObject } from 'react'

/**
 * Marks a section `data-offscreen` while it is out of view; CSS pauses every animation inside it
 * (see globals.css). Keeps decorative loops — seeds, bulbs, beams — from burning frames off screen.
 */
export function useOffscreenPause(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => el.toggleAttribute('data-offscreen', !e.isIntersecting), {
      threshold: 0.01,
    })
    io.observe(el)
    return () => io.disconnect()
  }, [ref])
}
