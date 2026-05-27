# Scrollytelling GSAP — Design Spec
**Date:** 2026-05-27  
**Status:** Approved — implementing

## Architecture
Single file: `src/scripts/scrollytelling.ts`  
Imports GSAP + ScrollTrigger. Runs as Astro deferred module. Uses `gsap.matchMedia()` for responsive breakpoints. All effects respect `prefers-reduced-motion`.

## 10 Effects

| # | Effect | Desktop | Mobile |
|---|--------|---------|--------|
| 1 | Page curtain | Two panels split open | Same |
| 2 | Custom cursor | Dot + ring with lerp | Hidden |
| 3 | Scroll progress bar | Gradient top bar | Same |
| 4 | Hero parallax glow | Mousemove | DeviceOrientation |
| 5 | Number counters | ScrollTrigger count-up | Same |
| 6 | 3D Tilt bento cards | Mousemove | Touchmove |
| 7 | Magnetic buttons | ±10px translate on hover | Disabled |
| 8 | Features spotlight | Cursor radial gradient | Touch |
| 9 | Section dots nav | Right sidebar | Hidden |
| 10 | Horizontal Process | GSAP pin + scrub | CSS scroll-snap |

## HTML Additions (index.astro)
- `#curtain > .curtain-panel × 2`
- `#cursor-dot`, `#cursor-ring`
- `#scroll-progress`
- `#dots-nav` (populated by JS)

## Component Changes
- `Process.astro`: `#process-pin-zone` > `#process-track` > `.process-step × 4`
- `features.astro`: `id="features-grid"` on `<ul>`, `#features-spotlight` overlay
- `showcase.astro`: `.card-shine` inside each `.bento-card`
- `intro.astro`: `data-count` on metric value spans
- `splash.astro`: `id="hero-glow"` on gradient div, `data-count`/`data-suffix` on stats
