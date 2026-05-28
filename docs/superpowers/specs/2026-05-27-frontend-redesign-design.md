# JERG.STUDIO — Frontend Redesign Design Spec

**Date:** 2026-05-27  
**Status:** Approved  
**Scope:** Full visual overhaul of the existing Astro v4 static landing page — color system, typography, portfolio section, and global CSS tokens. No architectural changes to routing, scripts, or build pipeline.

---

## 1. Design Direction

**Style:** Editorial / Dark Luxury  
**Inspiration:** Architecture magazines, Stripe, Linear — minimal, opinionated, not a template.  
**Target audience:** Startups and emprendedores latinoamericanos.

### What changes
- Color system: indigo+cyan → esmeralda
- Typography: Syne display → DM Serif Display for hero/section headlines
- Portfolio: `placehold.co` images → CSS device mockups (no external images)
- Text color: pure white → warm off-white `#f5f0e8`
- Background: `#0a0a0a` → `#050505` (deeper near-black)

### What stays
- All GSAP scrollytelling logic (`src/scripts/scrollytelling.ts`) — untouched
- Component structure and layout proportions
- Tailwind CSS utility classes
- Inter Variable for body text
- Starfield, grid, grain, curtain effects

---

## 2. Color System

Replace every hardcoded `#6366f1` (indigo) and `#22d3ee` (cyan) reference with the new tokens.

| Token | Old value | New value | Usage |
|---|---|---|---|
| `--color-primary` | `#6366f1` | `#10b981` | Accent, CTAs, links, eyebrows |
| `--color-secondary` | `#22d3ee` | `#34d399` | Gradient second stop, hover states |
| `--color-background` | `#0a0a0a` | `#050505` | Page background |
| `--color-text` | `#ffffff` / pure white | `#f5f0e8` | Primary text |
| `--color-text-offset` | `rgba(255,255,255,0.4)` | `rgba(245,240,232,0.4)` | Secondary text |

### Gradient text
```css
/* Before */
background-image: linear-gradient(90deg, #6366f1, #22d3ee);
/* After */
background-image: linear-gradient(90deg, #10b981, #34d399);
```

### Button primary
```css
/* Before */
background: linear-gradient(135deg, #6366f1, #22d3ee);
box-shadow: 0 4px 20px rgba(99, 102, 241, 0.35);
/* After */
background: #10b981;
box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
color: #050505; /* dark text on light green */
```

### Button ghost hover
```css
/* After */
border-color: rgba(16, 185, 129, 0.5);
background: rgba(16, 185, 129, 0.08);
```

---

## 3. Typography

### Display font: DM Serif Display

Add to `<head>` in `src/pages/index.astro` (replace Syne Google Fonts link):

```html
<link
  href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap"
  rel="stylesheet"
/>
```

**Keep** `@fontsource-variable/inter` — Inter Variable stays for body text.  
**Remove** the Syne Google Fonts `<link>` from `<head>` — DM Serif Display replaces its role entirely. Any residual `font-family: "Syne"` references in CSS should be updated to `"DM Serif Display", Georgia, serif`.

### CSS variable update in `src/styles/index.css`
```css
/* Before */
--font-display: 'Syne', sans-serif;
/* After */
--font-display: 'DM Serif Display', Georgia, serif;
```

### Where DM Serif Display applies
- `src/components/splash.astro` — `<h1>` hero headline
- `src/components/intro.astro` — `<h2>` section headline
- `src/components/features.astro` — `<h2>` section headline + `.feat-title` service names
- `src/components/showcase.astro` — project names
- `src/components/Process.astro` — `<h2>` section headline
- `src/components/Testimonials.astro` — quote text
- `src/components/FAQ.astro` — `<h2>` section headline
- `src/components/footer.astro` — logo wordmark

### Hero headline style change
The `<h1>` in splash uses italic for the accent word `PRESENCIAS`:
```html
<!-- Before -->
<span class="gradient-text">PRESENCIAS</span>
<!-- After -->
<em style="color: #10b981; font-style: italic;">PRESENCIAS</em>
```
DM Serif Display has a beautiful italic cut — this is more distinctive than gradient-clip on a serif.

### Section headlines pattern
```html
<!-- Before -->
<h2 ...>Seis disciplinas.<br/><span class="gradient-text">Un propósito.</span></h2>
<!-- After -->
<h2 ...>Seis disciplinas.<br/><em class="accent-italic">Un propósito.</em></h2>
```
```css
.accent-italic {
  color: #10b981;
  font-style: italic;
}
```

### `.hero-bg-mark` update
```css
/* Before */
font-family: "Syne", sans-serif;
color: rgba(99, 102, 241, 0.04);
/* After */
font-family: "DM Serif Display", serif;
font-style: italic;
color: rgba(16, 185, 129, 0.04);
```

### `.feat-title` (features accordion)
```css
/* Before */
font-family: "Syne", sans-serif;
/* After */
font-family: "DM Serif Display", serif;
font-weight: 400; /* DM Serif has no bold — weight is in the letterforms */
```

---

## 4. Showcase Section — CSS Device Mockups

Replace the `<img>` elements in `src/components/showcase.astro` with pure CSS device frames containing simplified UI representations of each project.

### Structure per project card
```html
<div class="sc-device-scene">
  <!-- Laptop frame -->
  <div class="sc-laptop">
    <div class="sc-laptop-camera"></div>
    <div class="sc-laptop-screen">
      <!-- Project UI rendered in CSS -->
      <div class="sc-ui sc-ui--[project-type]"></div>
    </div>
  </div>
  <!-- Phone frame -->
  <div class="sc-phone">
    <div class="sc-phone-notch"></div>
    <div class="sc-phone-screen">
      <div class="sc-ui sc-ui--[project-type]-mobile"></div>
    </div>
  </div>
</div>
```

### Four project UI types

| Project | Type | UI elements |
|---|---|---|
| FounderOS | SaaS dashboard | Dark bg, sidebar nav, card rows with green left-border, stat bars |
| PelicanDTC | E-commerce | Light bg, dark nav, green hero banner, product grid |
| TallerFlow | Booking app | Dark navy bg, calendar grid with green active slots |
| SeedLanding | Landing page | Near-black bg, green top accent line, headline blocks, green CTA |

### No external images
Zero `<img>` tags, zero network requests for visuals. All content is CSS. Performant, on-brand, works offline.

---

## 5. Global CSS Changes (`src/styles/global.css`)

### Color token replacements (exhaustive)
Every occurrence of `#6366f1`, `rgb(99, 102, 241)`, `rgba(99, 102, 241, ...)` → esmeralda equivalents.  
Every occurrence of `#22d3ee` → `#34d399`.

### `.gradient-text`
```css
.gradient-text {
  background-image: linear-gradient(90deg, #10b981, #34d399);
}
```

### `.btn-primary`
```css
.btn-primary {
  background: #10b981;
  color: #050505;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
}
.btn-primary:hover {
  box-shadow: 0 8px 28px rgba(16, 185, 129, 0.45);
}
```

### `.btn-ghost`
```css
.btn-ghost:hover {
  border-color: rgba(16, 185, 129, 0.5);
  background: rgba(16, 185, 129, 0.08);
  color: #10b981;
}
```

### `.eyebrow`
```css
.eyebrow {
  color: #10b981; /* was var(--color-primary) — token update covers this automatically */
}
```

### `.section-accent-top::before`
```css
background: linear-gradient(90deg, transparent, #10b981 30%, #34d399 70%, transparent);
```

### Scrollbar
```css
::-webkit-scrollbar-thumb { background: #10b981; }
```

### Selection
```css
::selection { background: #10b981; color: #050505; }
```

---

## 6. `src/styles/index.css` Changes

### Background
```css
/* Before */
--color-background: #0a0a0a;
/* After */
--color-background: #050505;
```

### Hero glow (`src/components/splash.astro` inline style)
```css
/* Before */
background: radial-gradient(ellipse 60% 55% at 50% 42%, rgba(99,102,241,0.16) ...)
/* After */
background: radial-gradient(ellipse 60% 55% at 50% 42%, rgba(16,185,129,0.10) ...)
```

### Scroll progress bar
```css
background: linear-gradient(90deg, #10b981, #34d399);
```

### Curtain panel border
```css
.curtain-left { border-right: 1px solid rgba(16, 185, 129, 0.2); }
```

### Custom cursor dot
```css
#cursor-dot { background: #10b981; }
```

### Cursor ring
```css
#cursor-ring { border: 1.5px solid rgba(16, 185, 129, 0.75); }
```

### Nav dot active
```css
:global(.nav-dot.is-active) { background: #10b981; }
```

### Nav dot focus
```css
:global(.nav-dot:focus-visible) { outline: 2px solid #34d399; }
```

### Nav link active
```css
:global(a.nav-link-active) {
  color: #10b981 !important;
  background: rgba(16, 185, 129, 0.07) !important;
}
```

---

## 7. Component-Level Changes

### `src/components/header.astro`
- Logo: apply `font-family: 'DM Serif Display', serif` to the wordmark text
- The `.` accent: `color: #10b981` (already done via brand update)
- CTA button: update any hardcoded indigo references to esmeralda

### `src/components/splash.astro`
- `<h1>` class: add `font-family: 'DM Serif Display', serif`
- Replace `<span class="gradient-text">PRESENCIAS</span>` → `<em style="color:#10b981;font-style:italic;">PRESENCIAS</em>`
- `.hero-bg-mark`: update `font-family` and `color` (see §3)
- Hero glow gradient: update rgba values (see §6)
- Stats `.gradient-text` spans: kept as-is, gradient auto-updates via token

### `src/components/intro.astro`
- `<h2>` : `font-family: 'DM Serif Display', serif`
- `gradient-text` span → `<em class="accent-italic">Construimos</em>`

### `src/components/features.astro`
- `<h2>`: `font-family: 'DM Serif Display', serif`
- `gradient-text` span → `<em class="accent-italic">Un propósito.</em>`
- `.feat-title`: `font-family: 'DM Serif Display', serif; font-weight: 400`
- `.feat-item::before` accent bar: colors come from `var(--accent)` inline style — keep per-service accent colors but add esmeralda as default
- All service `accent` values: keep individual colors (they look good against the dark bg)

### `src/components/showcase.astro`
- Remove all `<img>` tags and `placehold.co` references
- Add CSS device mockup structure (see §4)
- Add CSS for laptop/phone frames and project UIs to component `<style>`

### `src/components/Process.astro`
- `<h2>` and step titles: `font-family: 'DM Serif Display', serif`
- Any indigo color references → esmeralda

### `src/components/Clients.astro`
- Any indigo border/accent → esmeralda

### `src/components/Testimonials.astro`
- Quote text: `font-family: 'DM Serif Display', serif; font-style: italic`
- Any indigo references → esmeralda

### `src/components/FAQ.astro`
- `<h2>`: `font-family: 'DM Serif Display', serif`
- Accordion accent: esmeralda

### `src/components/ContactForm.astro`
- Form focus ring, submit button: esmeralda
- Any indigo references → esmeralda

### `src/components/footer.astro`
- Logo wordmark: `font-family: 'DM Serif Display', serif`
- Any indigo/cyan accent references → esmeralda

### `src/scripts/scrollytelling.ts`
- `#cursor-dot` background set via JS: update to `#10b981`
- Any hardcoded color strings in GSAP animations → esmeralda
- No logic changes — purely cosmetic color string updates

---

## 8. Files Touched (Implementation Order)

1. `src/pages/index.astro` — swap Google Fonts link (Syne → DM Serif Display)
2. `src/styles/global.css` — color token global swap (primary, secondary, gradient)
3. `src/styles/index.css` — background, UI chrome colors
4. `src/components/splash.astro` — headline font, PRESENCIAS em, bg mark, glow
5. `src/components/header.astro` — logo font, CTA colors
6. `src/components/footer.astro` — logo font, accent colors
7. `src/components/intro.astro` — headline font, accent-italic
8. `src/components/features.astro` — headline font, feat-title font, accent colors
9. `src/components/showcase.astro` — full rebuild with CSS device mockups
10. `src/components/Process.astro` — headline font, accent colors
11. `src/components/Clients.astro` — accent colors
12. `src/components/Testimonials.astro` — quote font, accent colors
13. `src/components/FAQ.astro` — headline font, accent colors
14. `src/components/ContactForm.astro` — form accent colors
15. `src/scripts/scrollytelling.ts` — cursor color string, any hardcoded colors

---

## 9. Out of Scope

- No layout or spacing changes
- No new sections or components
- No changes to GSAP animation logic
- No changes to Tailwind config
- No new dependencies beyond the Google Fonts link swap
- No changes to Astro config or build pipeline

---

## 10. Success Criteria

- [ ] Zero indigo (`#6366f1`) or cyan (`#22d3ee`) references remaining in any source file
- [ ] DM Serif Display renders on hero h1, all section h2s, and feat-titles
- [ ] Showcase shows CSS device mockups for all 4 projects — no `<img>` tags, no placehold.co
- [ ] `btn-primary` renders as solid esmeralda with dark text (legible)
- [ ] Custom cursor dot is green
- [ ] Scroll progress bar is green
- [ ] `npm run build` exits 0 with no type errors
