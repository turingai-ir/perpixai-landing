import { useMemo } from 'react'

/**
 * Yalda night: pomegranate seeds drifting up and turning into stars — the same idea as
 * the Yalda clip. Decorative only; reduced motion leaves them resting in place.
 */
export function YaldaSeeds({ count = 22 }: { count?: number }) {
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: (i * 37) % 100,
        size: 4 + ((i * 7) % 5),
        delay: -((i * 1.37) % 14),
        duration: 12 + ((i * 3) % 9),
      })),
    [count],
  )
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {seeds.map((s, i) => (
        <span
          key={i}
          className="absolute bottom-[-5%] yalda-seed"
          style={{
            left: `${s.left}%`,
            width: s.size,
            height: s.size * 1.25,
            animation: `seed ${s.duration}s linear ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}
