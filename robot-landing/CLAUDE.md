# Perpix landing page

Conversion-first, RTL (Persian) landing page for perpixai.ir. A 3D character, **Pixo**
(a human whose head fuses a Turing machine and a Tesla coil), talks to the visitor and routes them:
returning member → login, newcomer → inline phone sign-up, or a "magic show" demo → sign-up.

## Commands
- `pnpm dev` / `pnpm build` (typecheck + build) / `pnpm preview`

## Structure
- `src/config.ts` + `src/lib/auth.ts`: shared auth URL and how the phone is handed over (param + format, env-overridable).
  Agreed with the app team: `?phone=09xxxxxxxxx` (local format). Test with `?authDebug=1&phoneParam=…&phoneFormat=…` (see `docs/AUTH-TEST.md`)
- `src/content/`: all copy. `dialogue.ts` = Pixo's lines (id = audio file name), `demos.ts`, `sections.ts`
- `src/flow/useConversation.ts`: the funnel state machine. Every branch calls `begin()` so stale awaits are ignored
- `src/audio/voice.ts`: plays `public/audio/fa/<id>.mp3`, exposes loudness; simulates speech if a file is missing
- `src/stage/`: vanilla three.js scene (loaded as a separate chunk). `character/head.ts` (Turing tape, reels, blinking eye,
  brass Tesla moustache, mood glyphs ؟/spiral/heart via `setMood`, springy valves), `character/tesla.ts` (coil + voice-driven
  arcs), `character/outfit.ts` (usher's velvet jacket, epaulettes, neon bow tie, badge; Yalda scarf + pomegranate brooch),
  `character/body.ts`, `character/cables.ts`
- `src/content/season.ts`: seasonal dressing (`season = seasons.yalda`); drives the scarf, the gate/marquee copy,
  the rising pomegranate seeds (`ui/YaldaSeeds`) and which demo comes first. Set to `seasons.none` after Yalda
- `src/ui/`: Preloader (leader + gate), FilmFx (grain/vignette), Hero (canvas + conversation, letterbox intro, static `pixo.webp` fallback), Subtitle, Choice, PhoneForm,
  DemoScreen, Header, StickyCta, `SplitHeading` (accessible word reveal), `LazyVideo` (plays only in view), `Icon` (Solar subset)
- `src/sections/`: Film (pinned prompt→film scrub), Reel (horizontal film strip of the demo clips), Tools, Plans
  (real prices in `content/sections.ts`), Faq, Finale, Footer. Page choreography lives in `App.tsx`
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
  `Stage.govern()` steps DPR/bloom down on slow devices; bloom renders at half resolution.

## Conventions
- Brand colours come from the logo: magenta `#d92dd4`, purple `#863ed3`, blue `#128ce3`, cyan `#06a1e9`
  (`.bg-brand`, `.text-brand`, `.border-brand`, and `stage/palette.ts`).
- Every sign-up button routes to Pixo's inline phone form (`App.signup`). Keep login one tap away.
- Track funnel steps with `track()` (`lib/analytics.ts`, pushes to `dataLayer`).
- Never split Persian text below the word level. Use logical (`ps-`/`pe-`) spacing.
- One smooth-scroll engine only (Lenis, driven by the GSAP ticker). Under reduced motion: no Lenis, no pins/scrubs,
  static Pixo image, everything in its final state.
- Demo clips: `public/demo/<id>.{webm,mp4,jpg}` (720p, no audio); set `ready: true` in `demos.ts`.
- Voice lines: run `scripts/prepare-voice.sh <file> <line-id>` before committing an ElevenLabs export.
- Skills for this work are in `.claude/skills` (see its README).
