import { useEffect, useRef, useState } from 'react'
import { config } from '@/config'
import { prefersReducedMotion } from '@/lib/motion'

/**
 * Muted loop that costs nothing until it is about to be seen:
 * - sources and poster attach only within ~1 viewport of the screen (no bytes before that);
 * - it plays only while at least a third of it is visible, so a reel never decodes several clips at once;
 * - never plays under reduced motion or in a hidden tab.
 * MP4 first for Safari/Apple, WebM for Chromium builds without H.264; poster if neither plays.
 */
export function LazyVideo({ id, className }: { id: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [near, setNear] = useState(false)
  const [failed, setFailed] = useState(false)
  const poster = `${config.demoDir}/${id}.jpg`

  useEffect(() => {
    const v = ref.current
    if (!v) return
    // React doesn't reflect `muted` as an attribute; Safari's autoplay policy needs both.
    v.muted = true
    v.setAttribute('muted', '')
    const nearIo = new IntersectionObserver(([e]) => e.isIntersecting && (setNear(true), nearIo.disconnect()), {
      rootMargin: '100% 100%',
    })
    nearIo.observe(v)
    return () => nearIo.disconnect()
  }, [])

  useEffect(() => {
    const v = ref.current
    if (!v || !near || prefersReducedMotion()) return
    v.load()
    let inView = false
    const play = () => (inView && !document.hidden ? v.play().catch(() => {}) : v.pause())
    const io = new IntersectionObserver(
      ([e]) => {
        inView = e.intersectionRatio >= 0.34
        play()
      },
      { threshold: [0, 0.34, 0.6] },
    )
    io.observe(v)
    document.addEventListener('visibilitychange', play)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', play)
      v.pause()
    }
  }, [near])

  if (failed) return <img src={poster} alt="" loading="lazy" decoding="async" className={className} />
  return (
    <video
      ref={ref}
      poster={near ? poster : undefined}
      muted
      loop
      playsInline
      preload="none"
      className={className}
      aria-hidden
    >
      {near && (
        <>
          <source src={`${config.demoDir}/${id}.mp4`} type="video/mp4" />
          <source src={`${config.demoDir}/${id}.webm`} type="video/webm" onError={() => setFailed(true)} />
        </>
      )}
    </video>
  )
}
