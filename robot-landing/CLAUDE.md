# Perpix landing page

Conversion-first, RTL (Persian) landing page for perpixai.ir. A 3D character, **Pixo**
(a human whose head fuses a Turing machine and a Tesla coil), talks to the visitor and routes them:
returning member → login, newcomer → inline phone sign-up, or a "magic show" demo → sign-up.

## Commands
- `pnpm dev` (Next.js, :5176) / `pnpm build` (typecheck + static export to `out/`)
- `pnpm check` = typecheck + ESLint (`eslint-config-next`, flat config) + Prettier check. `pnpm lint:fix` / `pnpm format` fix them.
  Prettier: no semicolons, single quotes, 140 columns, Tailwind class sorting. Keep `pnpm check` clean before committing.
  Rules are relaxed only where justified in `eslint.config.mjs` (`<img>` under static export; three.js objects are mutable).
- Next.js App Router with `output: 'export'`: the page is pre-rendered to HTML at build time (SEO) and hydrated on the
  client, then nginx serves `out/`. `src/app/layout.tsx` holds the metadata, JSON-LD and `<html lang=fa dir=rtl>`;
  `robots.ts` / `sitemap.ts` generate those files. Env vars are `NEXT_PUBLIC_*` (inlined at build, so Docker build args).
- Anything that touches `window`/`document`/`localStorage` must run in an effect or behind a `typeof window` guard,
  because components are also rendered on the server at build time.

## Structure
- `src/config.ts` + `src/lib/auth.ts`: shared auth URL and how the phone is handed over (param + format, env-overridable).
  Agreed with the app team: `?phone=09xxxxxxxxx` (local format). Test with `?authDebug=1&phoneParam=…&phoneFormat=…` (see `docs/AUTH-TEST.md`)
- `src/i18n/`: i18next (+ react-i18next). **All copy lives in `src/i18n/locales/<lang>/*.json`** (namespaces: `ui`, `home`,
  `dialogue`, `demos`, `season`, `seo`); keys are type-checked (`i18next.d.ts`). Bundled resources + synchronous init, so the
  static export and the browser render the same text. Components use `useTranslation(ns)`; non-React code uses
  `i18n.t` / `i18n.getFixedT(locale, ns)`. Numbers go through `i18n/format.ts` (`formatNumber`, `localizeDigits`).
  Only `fa` exists today. To add a language: copy `locales/fa` → `locales/<code>`, register it in `resources.ts` and
  `config.ts` (`locales`, `localeMeta`), record Pixo's lines into `public/audio/<code>/<id>.mp3`. Routing per locale
  (`/en/…`) is not set up yet: the layout still renders `defaultLocale`.
- `src/content/`: language-neutral data only. `dialogue.ts` = Pixo's line ids + acting directions (id = audio file name;
  text is `dialogue.json` → `lines.<id>`), `demos.ts` (ids; chip/prompt in `demos.json`), `sections.ts` (plan prices/tokens
  as numbers, tool icons; copy in `home.json`)
- `src/flow/useConversation.ts`: the funnel state machine. Every branch calls `begin()` so stale awaits are ignored
- `src/audio/voice.ts`: plays `public/audio/fa/<id>.mp3`, exposes loudness; simulates speech if a file is missing
- `src/stage/`: the 3D scene on react-three-fiber (`StageCanvas.tsx`, loaded as a separate chunk; `ui/PixoStage.tsx` lazy-loads it; `StageBoundary` falls back to
  the still image if WebGL fails; `world.ts` builds/disposes Pixo and the lights). R3F owns the canvas, resize and frame loop; three's own `EffectComposer` + UnrealBloom render
  (priority-1 `useFrame`). `controls.ts` is the plain object the conversation uses (`setMood/setPowered/setLayout/setComputing`).
  The character builders stay vanilla three: `character/head.ts` (Turing tape, reels, blinking eye,
  brass Tesla moustache, mood glyphs ؟/spiral/heart via `setMood`, springy valves), `character/tesla.ts` (coil + voice-driven
  arcs), `character/outfit.ts` (usher's velvet jacket, epaulettes, neon bow tie, badge; Yalda scarf + pomegranate brooch),
  `character/body.ts`, `character/cables.ts`
- `src/content/season.ts` (copy in `season.json`): seasonal dressing (`season = seasons.yalda`); drives the scarf, the gate/marquee copy,
  the rising pomegranate seeds (`ui/YaldaSeeds`) and which demo comes first. Set to `seasons.none` after Yalda
- `src/ui/`: Preloader (leader + gate), FilmFx (grain/vignette), Hero (canvas + conversation, letterbox intro, static `pixo.webp` fallback), Subtitle, Choice, PhoneForm,
  DemoScreen, Header, StickyCta, `SplitHeading` (accessible word reveal), `LazyVideo` (plays only in view), `Icon` (Solar subset)
- `src/sections/`: Film (pinned prompt→film scrub), Reel (horizontal film strip of the demo clips), Tools, Plans
  (real prices in `content/sections.ts`, copy in `home.json`), Faq, Finale, Footer. Page choreography lives in `App.tsx`
- `docs/ASSETS.md`: video prompts and voice-line script for the content team
- `docs/BACKEND-HANDOFF.md`: the phone-prefill request sent to the app team (`?phone=09xxxxxxxxx` on `/auth/login`)

## Art direction
"Cinema Perpix": an old Tehran picture palace re-wired with the logo's neon. Black ground (#030205), warm
projector-white type, Lalezar (`font-poster`) for poster headings, Vazirmatn for reading, neon (`.neon`) only on
things that emit light, tungsten `.bulbs` for marquee signs (max a few per page), plans as `.ticket`s.
Flow: film-leader preloader → "click to start" gate (unlocks sound + one projector clack; no continuous background audio) → iris → hero.

Clicking the logo restarts the show (remounts Preloader + Hero via a `run` key in `App.tsx`). Pinned sections
(Film, Reel) render inside a stable wrapper `<div>` because ScrollTrigger re-parents the pinned `<section>`.

## Performance & QA
- Measure with `?perf` (exposes `window.__stage`: `perf.frames/cpu`, `info` = renderer.info). Baseline → after
  (Oct 2026, prod build): video bytes before entering 3.5 MB → 0, offscreen CSS animations 29 → 0–1,
  geometries 105 → 67, JS per 3D frame 2.7 → 1.4 ms, loader LCP 9.9 s → 1.0 s, no growth over 3 restarts.
- Keep it that way: videos via `LazyVideo` only (sources attach near the viewport, play at ≥34% visible);
  decorative loops inside sections that use `useOffscreenPause`; animate only transform/opacity (no blend
  modes or animated filters on large layers); merge static meshes with `stage/merge.ts`; no allocation in the
  render loop (Tesla bolts are a pre-built pool); shaders compile via `compileAsync` before the first frame;
  `govern()` in `StageCanvas` steps DPR/bloom down on slow devices; bloom renders at half resolution.

## Theme (shadcn-style)
Colours are **semantic CSS variables** in `src/styles/theme.css` (`:root`), exposed to Tailwind with `@theme inline`. Components name a
role, never a colour: `bg-background text-foreground`, `bg-card`, `bg-muted`, `text-muted-foreground`, `text-subtle-foreground`,
`border-border`, `bg-primary text-primary-foreground` (magenta CTA), `text-accent` / `ring-ring` (cyan highlight / focus), plus the
brand palette `purple`, `blue`, `*-soft` (gradient text), light sources `amber`, `bulb`, `projector`, `neon-*`, the featured ticket
`featured-start/mid/end` and season `yalda*`. Re-theming = overriding variables under another selector (`.light { --background: …; }`).
- **Use Tailwind utilities first**: gradients and glows are `bg-radial-[…] from-primary/33 to-transparent`, `bg-linear-160 from-… via-… to-…`;
  translucency is `bg-primary/20`; z-index is `z-30 … z-80`; radius is `rounded-*` driven by one knob, `--radius`.
- Theme tokens that Tailwind has no scale for live in `theme.css`: elevation (`shadow-cta`, `-cta-lg`, `-cta-hover`, `-glow`, `-frame`,
  `-frame-accent`), type roles (`text-display`, `text-countdown`, `text-price`, `text-subtitle(-lg)`, `text-body-sm`), `--ease-cine`.
- A few named utilities exist in `globals.css` only where Tailwind cannot express them (repeating/conic gradients, masks, clip-paths,
  keyframes): `bg-brand`/`text-brand`/`border-brand`, `neon`, `neon-cyan`, `neon-yalda`, `bulbs`, `ticket`, `scanlines`, `film-noise`,
  `sprockets`, `leader-sweep`, `projector-beam`, `yalda-seed`. They are built from the same variables.
- JS: 3D brand lights read `--primary/--purple/--blue/--accent` from CSS at runtime (`stage/palette.ts`); 3D material colours are their own
  palette by role (`paint.*`). The only literal JS needs is `THEME_COLOR` (`<meta theme-color>`/manifest) in `lib/seo.ts`.
- `pnpm check:theme` (inside `pnpm check`) rejects raw hex/`rgb()`, `shadow-[…]`, `z-[…]` and the pre-shadcn names (`text-fog`, `bg-ink`,
  `text-mute` …), and verifies `THEME_COLOR` and the circuit SVG against `theme.css`. To add a colour: add the variable (+ its `--color-*`
  line in `@theme inline`), then use the utility.
- The cinema FX layers (vignette, letterbox bars, grain) and the 3D scene are deliberately dark in any theme.

## Responsive (mobile-first)
Base styles are the phone layout; wider screens add. **Portrait tablets (768–1023) are "big phones"**: two-column layouts and pinned
scenes start at `lg` (1024), not `md`; `md:` is only for spacing/type bumps. Two custom variants cover what a width cannot see
(`globals.css`):
- `wide` = `(min-width: 35rem) and (min-aspect-ratio: 9/10)`: the side-by-side hero (Pixo left, conversation right). `PixoStage` reads the
  same query (`WIDE_QUERY` in `lib/motion.ts`) and tells the 3D scene where to stand (`controls.setLayout`), so CSS and scene cannot
  disagree. Use `not-wide:` for the stacked case.
- `tall` = `(min-height: 40rem)`: needed for big type, pinned scenes and the sticky reel. Landscape phones and short windows get the
  flowing layout (`lg:tall:…`); the GSAP `matchMedia` in Film/Reel uses `(min-width: 1024px) and (min-height: 640px)`.
- Hero and Preloader are `min-h-svh` (never a fixed 640px) and may grow; the gate is height-aware (`tall:`) so "enter without sound"
  stays clickable on a 390px-tall phone. Touch targets: `pointer-coarse:min-h-11` (44px) on header/footer/sound/reel/choices.
- Notches: `viewport-fit=cover` + `env(safe-area-inset-*)` on the fixed header, sticky CTA and preloader status bar.
- `html { font-size: 100% }` (honours the user's text size). Prices sit in a container query (`@container` + `@min-[…]:`), and the
  price row wraps instead of overflowing.
- RTL gotcha: overflow to the LEFT is not scrollable, and mobile Chrome silently widens the layout viewport to fit it (so
  `innerWidth` > the device width). When auditing, compare against the emulated width, not `innerWidth`.
- Audited 20 viewports (280→2560, portrait/landscape phones, tablets, desktop): 0 horizontal overflow, no sub-44px touch targets
  except narrow text links (still ≥44 tall), choices visible without scrolling from 568×320 up.

## Conventions
- Brand colours come from the logo (see Theme): `.bg-brand`, `.text-brand`, `.border-brand` use `--gradient-brand(-soft)`.
- Every sign-up button routes to Pixo's inline phone form (`App.signup`). Keep login one tap away.
- Track funnel steps with `track()` (`lib/analytics.ts`, pushes to `dataLayer`).
- Never split Persian text below the word level. Use logical (`ps-`/`pe-`) spacing.
- GSAP in components goes through `useGSAP` (`@gsap/react`): it scopes selectors and reverts tweens/ScrollTriggers on unmount;
  use `contextSafe` for tweens started from event handlers. No hand-rolled `gsap.context` in effects.
- One smooth-scroll engine only (Lenis, driven by the GSAP ticker). Under reduced motion: no Lenis, no pins/scrubs,
  static Pixo image, everything in its final state.
- Demo clips: `public/demo/<id>.{webm,mp4,jpg}` (720p, no audio); set `ready: true` in `demos.ts`.
- Voice lines: run `scripts/prepare-voice.sh <file> <line-id>` before committing an ElevenLabs export.
- Skills for this work are in `.claude/skills` (see its README).
