# Scroll Animations + Mobile Fixes — Design Spec

**Date:** 2026-05-28  
**Project:** JERG.STUDIO landing page (Astro v4 + Tailwind CSS + GSAP 3 + TypeScript)  
**Status:** Approved

---

## 1. Goal

Add meaningful scroll-triggered animations across all sections for visual impact, and fix the mobile experience so the site runs smoothly and correctly on small screens.

This is **not** full scrollytelling — it is calibrated motion that enhances the editorial feel without distracting from the content.

---

## 2. Animation System

### Timing & Easing

| Parameter | Value |
|---|---|
| Default duration | `0.8s` |
| Fast elements (badges, lines) | `0.5s` |
| Stagger between children | `0.12s` |
| Easing | `power3.out` |
| Parallax easing | `none` (linear, scrubbed) |

### ScrollTrigger defaults

```ts
start: "top 80%"  // trigger when element is 80% into viewport
toggleActions: "play none none none"  // plays once, no reverse
```

### Responsive behaviour

- **Desktop (≥ 769px):** Full animation set — parallax, stagger, counters
- **Mobile (≤ 768px):** Simplified — only opacity fade-in (0.4s, no stagger, no parallax)
- **`prefers-reduced-motion`:** All GSAP animations skipped; CSS fallback only

### New file

Create `src/scripts/scroll-animations.ts` — keeps `scrollytelling.ts` (615 lines) under the 800-line limit. Export a single `initScrollAnimations()` function, imported from `src/pages/index.astro`.

---

## 3. Section-by-Section Animations

### 3.1 Hero (`splash.astro`)

**Parallax (desktop only)**  
The h1 headline and subline move at 60% of scroll speed — as the user scrolls down, text drifts upward slightly.  
- `gsap.to(headline, { yPercent: -8, ease: "none", scrollTrigger: { scrub: 1 } })`

**Stat counters**  
Stats already have `data-count` and `data-suffix` attributes. When the stats row enters the viewport, count from 0 to the target value over 1.5s using `gsap.to()` with an `onUpdate` that writes `Math.round(proxy.val) + suffix` to the element's `textContent`.

### 3.2 Intro (`intro.astro`)

- h2 headline: fade-up (y: 40 → 0, opacity: 0 → 1, duration: 0.8s)
- Paragraph lines: stagger 0.12s after headline

### 3.3 Features (`features.astro`)

- Section header: fade-up
- Feature cards: stagger fade-up from y: 50 → 0

### 3.4 Showcase (`showcase.astro`)

- Section header: fade-up
- Project cards: stagger entrance y: 60 → 0
- Accent line on each card: width 0 → 100% slide-in (clip-path or scaleX) with 0.1s delay after card

### 3.5 Process (`Process.astro`)

Each step reveals as the user scrolls:
- Step number (big background digit): fade-in with slight scale (1.05 → 1)
- Step title + description: fade-up, slightly delayed after number
- Steps are sequential — each step's ScrollTrigger fires when the previous finishes

### 3.6 Clients (`Clients.astro`)

- Section header: fade-up
- Marquee already animates via CSS — no additional scroll animation needed

### 3.7 Testimonials (`Testimonials.astro`)

- Section header: fade-up
- Testimonial cards: stagger fade-up from y: 40

### 3.8 FAQ (`FAQ.astro`)

- Section header: fade-up
- FAQ items: stagger fade-up on section enter
- Accordion: smooth `max-height` transition via CSS (not GSAP) for the open/close toggle

### 3.9 Contact (`ContactForm.astro`)

- Section header: fade-up
- Form fields: stagger fade-up (each input/label pair enters 0.1s after the previous)

---

## 4. Mobile Fixes

### 4.1 Hero typography

Current clamp on h1: `clamp(3.8rem, 11vw, 9.5rem)` — causes text overflow / tight layout at 320px.  
Fix: `clamp(2.8rem, 9.5vw, 9.5rem)` — gives more breathing room on small screens.

Letter-spacing on mobile: reduce from `-0.025em` to `-0.01em` at `< 480px` via media query.

### 4.2 Stats row

At `< 480px`, the 3 stats sitting in a horizontal row get too compressed.  
Fix: wrap to 2-column grid (2 stats top row, 1 centered bottom) with `flex-wrap: wrap`.

### 4.3 Showcase device frames

The CSS device mockups use `px` sizing that can overflow on mobile.  
Fix: apply `transform: scale(0.72)` on the `.scene` container at `< 480px`, with `transform-origin: top center` and `overflow: hidden` on the card wrapper.

### 4.4 Process section — horizontal to vertical

The Process section uses horizontal scroll (ScrollTrigger pin) on desktop.  
On mobile (`≤ 768px`), disable the pin and horizontal scroll; render steps in a normal vertical stack.  
This requires a `gsap.matchMedia()` block separating desktop and mobile logic.

### 4.5 Touch targets

All CTA buttons and nav links must have `min-height: 44px` and sufficient padding for touch.  
Check: `.btn-primary`, `.btn-ghost`, header nav links, mobile menu items.

### 4.6 Cursor & glow on touch devices

The custom cursor (dot + ring) should not render on touch devices.  
Add `@media (hover: none) { #cursor-dot, #cursor-ring { display: none; } }` if not already present.

---

## 5. Implementation Order

1. Create `src/scripts/scroll-animations.ts` with the animation scaffold
2. Hero parallax + stat counters
3. Intro + Features fade-ups
4. Showcase entrance animations
5. Process section scroll reveals + mobile layout fix
6. Testimonials + FAQ + Contact fade-ups
7. Mobile CSS fixes (typography, stats, showcase, touch targets, cursor)
8. Wire `initScrollAnimations()` into `index.astro`

---

## 6. Out of Scope

- No new sections or content changes
- No changes to color palette or typography
- No new npm dependencies (GSAP already installed)
- No changes to the scrollytelling.ts existing animations

---

## 7. Success Criteria

- [ ] All sections animate on scroll (desktop)
- [ ] No layout jank or CLS from animations
- [ ] Mobile (375px) has no horizontal overflow
- [ ] Process section scrolls correctly on both desktop and mobile
- [ ] Stats count up when they enter the viewport
- [ ] `prefers-reduced-motion` users see no GSAP animations
- [ ] Touch devices show no custom cursor
- [ ] All CTAs are ≥ 44px tall on mobile
