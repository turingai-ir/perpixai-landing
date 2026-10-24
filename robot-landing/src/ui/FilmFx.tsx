const noise = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`

/**
 * The projector: grain, a breathing vignette and the odd scratch across the frame.
 * Purely decorative, never intercepts input; reduced motion leaves a still frame.
 * Every layer animates only transform/opacity on its own compositor layer (no blend modes),
 * so the overlay costs no main-thread paint per frame.
 */
export function FilmFx() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-60 overflow-hidden">
      <div
        className="absolute -inset-[20%] opacity-[0.05] will-change-transform"
        style={{ backgroundImage: noise, animation: 'grain 0.9s steps(5) infinite' }}
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,transparent_55%,black_120%)] will-change-[opacity]"
        style={{ animation: 'flicker 5s steps(1) infinite' }}
      />
      <div
        className="absolute inset-y-0 left-[63%] w-px bg-foreground/60 opacity-0 will-change-transform motion-reduce:hidden"
        style={{ animation: 'scratch 11s linear infinite' }}
      />
    </div>
  )
}
