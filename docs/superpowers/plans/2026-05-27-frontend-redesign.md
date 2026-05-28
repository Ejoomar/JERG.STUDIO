# Frontend Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the indigo+cyan color system with esmeralda (#10b981), swap Syne display font for DM Serif Display, and rebuild the portfolio section with pure CSS device mockups — no external images.

**Architecture:** Pure CSS/HTML changes across 15 source files. No new dependencies except the Google Fonts link swap (Syne → DM Serif Display). Color tokens live in `src/styles/theme.css`; global utilities in `src/styles/global.css`; page-level chrome CSS in `src/pages/index.astro`. Every `#6366f1` (indigo) and `#22d3ee` (cyan) reference is replaced with `#10b981` (esmeralda) and `#34d399` (light esmeralda) respectively.

**Tech Stack:** Astro v4, Tailwind CSS v3, TypeScript, GSAP 3 (untouched), Google Fonts (DM Serif Display), Inter Variable (@fontsource-variable/inter, kept)

---

## File Map

| File | Change |
|---|---|
| `src/pages/index.astro` | Swap Syne → DM Serif Display Google Fonts link; update page-level chrome CSS |
| `src/styles/theme.css` | Update all CSS custom property token values |
| `src/styles/global.css` | Update `.gradient-text`, `.btn-primary`, `.btn-ghost`, `.section-accent-top`, scrollbar, selection; add `.accent-italic` |
| `src/components/splash.astro` | `<h1>` serif font, `PRESENCIAS` → `<em>`, bg-mark font+color, glow gradient |
| `src/components/header.astro` | Logo SVG gradient stops, wordmark font |
| `src/components/footer.astro` | Logo SVG gradient stops, wordmark font |
| `src/components/intro.astro` | `<h2>` serif font, gradient span → `<em class="accent-italic">` |
| `src/components/features.astro` | `<h2>` serif font, gradient span → `<em>`, `.feat-title` font |
| `src/components/showcase.astro` | Full rebuild: remove `<img>` / placehold.co, add CSS device mockups |
| `src/components/Process.astro` | `.step-title`, `.step-bg-num`, `.process-counter` fonts; all indigo/cyan hardcodes |
| `src/components/Clients.astro` | `.marquee-abbr` gradient secondary color fix |
| `src/components/Testimonials.astro` | Author avatar colors (indigo/cyan → esmeralda) |
| `src/components/FAQ.astro` | `.faq-item::before` gradient, `.faq-item.is-open` border |
| `src/components/ContactForm.astro` | `.contact-icon-wrap` colors, input focus shadow, success banner color |
| `src/scripts/scrollytelling.ts` | Cursor dot color string |

---

## Task 1 — Font Link: Syne → DM Serif Display

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Replace the Syne Google Fonts link with DM Serif Display**

  Find these lines in `src/pages/index.astro` (around line 49–52):
  ```html
  <!-- Syne (display font) from Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap"
    rel="stylesheet"
  />
  ```

  Replace with:
  ```html
  <!-- DM Serif Display (display font) from Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap"
    rel="stylesheet"
  />
  ```

- [ ] **Verify the build still compiles**

  ```bash
  cd "C:\Users\david\Documents\Landing page" && npm run build
  ```
  Expected: exits 0, no errors.

- [ ] **Commit**

  ```bash
  git add src/pages/index.astro
  git commit -m "feat: swap display font Syne → DM Serif Display"
  ```

---

## Task 2 — CSS Tokens: esmeralda palette

**Files:**
- Modify: `src/styles/theme.css`

- [ ] **Replace all token values in `src/styles/theme.css`**

  Current content:
  ```css
  [data-theme="dark"],
  :root {
    --color-primary: #6366f1;
    --color-secondary: #22d3ee;
    --color-text: #f9fafb;
    --color-text-offset: #9ca3af;
    --color-background: #0a0a0a;
    --color-background-offset: #111827;
    --color-border: rgba(255, 255, 255, 0.07);
  }
  ```

  Replace with:
  ```css
  [data-theme="dark"],
  :root {
    --color-primary: #10b981;
    --color-secondary: #34d399;
    --color-text: #f5f0e8;
    --color-text-offset: rgba(245, 240, 232, 0.45);
    --color-background: #050505;
    --color-background-offset: #0d0d0d;
    --color-border: rgba(255, 255, 255, 0.07);
  }
  ```

- [ ] **Verify build**

  ```bash
  npm run build
  ```
  Expected: exits 0.

- [ ] **Commit**

  ```bash
  git add src/styles/theme.css
  git commit -m "feat: update color tokens to esmeralda palette"
  ```

---

## Task 3 — Global CSS: utilities + accent-italic

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Update `.gradient-text`**

  Find:
  ```css
  .gradient-text {
    @apply bg-clip-text text-transparent;
    background-image: linear-gradient(90deg, #6366f1, #22d3ee);
  }
  ```
  Replace with:
  ```css
  .gradient-text {
    @apply bg-clip-text text-transparent;
    background-image: linear-gradient(90deg, #10b981, #34d399);
  }
  ```

- [ ] **Update `.btn-primary`**

  Find:
  ```css
  .btn-primary {
    @apply inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold text-white transition-all duration-200;
    background: linear-gradient(135deg, #6366f1, #22d3ee);
    box-shadow: 0 4px 20px rgba(99, 102, 241, 0.35);
  }
  .btn-primary:hover {
    @apply -translate-y-0.5 text-white;
    box-shadow: 0 8px 28px rgba(99, 102, 241, 0.5);
  }
  ```
  Replace with:
  ```css
  .btn-primary {
    @apply inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold transition-all duration-200;
    background: #10b981;
    color: #050505;
    box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
  }
  .btn-primary:hover {
    @apply -translate-y-0.5;
    color: #050505;
    box-shadow: 0 8px 28px rgba(16, 185, 129, 0.45);
  }
  ```

- [ ] **Update `.btn-ghost` hover**

  Find:
  ```css
  .btn-ghost:hover {
    border-color: rgba(99,102,241,0.5);
    background: rgba(99,102,241,0.1);
  }
  ```
  Replace with:
  ```css
  .btn-ghost:hover {
    border-color: rgba(16, 185, 129, 0.5);
    background: rgba(16, 185, 129, 0.08);
    color: #10b981;
  }
  ```

- [ ] **Update `.section-accent-top::before`**

  Find:
  ```css
  .section-accent-top::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, #6366f1 30%, #22d3ee 70%, transparent);
    opacity: 0.5;
  }
  ```
  Replace with:
  ```css
  .section-accent-top::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, #10b981 30%, #34d399 70%, transparent);
    opacity: 0.5;
  }
  ```

- [ ] **Update scrollbar thumb**

  Find:
  ```css
  ::-webkit-scrollbar-thumb { background: var(--color-primary); border-radius: 3px; }
  ```
  (No change needed — this uses `var(--color-primary)` which is already updated via Task 2.)

- [ ] **Update `::selection`**

  Find:
  ```css
  ::selection { background: #6366f1; color: #fff; }
  ```
  Replace with:
  ```css
  ::selection { background: #10b981; color: #050505; }
  ```

- [ ] **Add `.accent-italic` utility** (add at the end of the global utilities block, before `/* ── Reduced motion ──*/`)

  ```css
  /* ── Accent italic — editorial serif emphasis ── */
  .accent-italic {
    color: #10b981;
    font-style: italic;
  }
  ```

- [ ] **Verify build**

  ```bash
  npm run build
  ```
  Expected: exits 0.

- [ ] **Commit**

  ```bash
  git add src/styles/global.css
  git commit -m "feat: update global CSS to esmeralda — buttons, gradient, selection"
  ```

---

## Task 4 — index.astro: page chrome colors

**Files:**
- Modify: `src/pages/index.astro` (the `<style>` block at the bottom)

- [ ] **Update scroll progress bar gradient**

  In the `<style>` block of `src/pages/index.astro`, find:
  ```css
  #scroll-progress {
    ...
    background: linear-gradient(90deg, #6366f1, #22d3ee);
    ...
  }
  ```
  Replace `background: linear-gradient(90deg, #6366f1, #22d3ee);` with:
  ```css
  background: linear-gradient(90deg, #10b981, #34d399);
  ```

- [ ] **Update curtain border**

  Find:
  ```css
  .curtain-left {
    border-right: 1px solid rgba(99, 102, 241, 0.2);
  }
  ```
  Replace with:
  ```css
  .curtain-left {
    border-right: 1px solid rgba(16, 185, 129, 0.2);
  }
  ```

- [ ] **Update cursor dot**

  Find:
  ```css
  #cursor-dot {
    ...
    background: #6366f1;
    ...
  }
  ```
  Replace `background: #6366f1;` with:
  ```css
  background: #10b981;
  ```

- [ ] **Update cursor ring**

  Find:
  ```css
  #cursor-ring {
    ...
    border: 1.5px solid rgba(99, 102, 241, 0.75);
    ...
  }
  ```
  Replace with:
  ```css
  border: 1.5px solid rgba(16, 185, 129, 0.75);
  ```

- [ ] **Update nav dot active**

  Find:
  ```css
  :global(.nav-dot.is-active) {
    background: #6366f1;
    transform: scale(1.6);
  }
  ```
  Replace `background: #6366f1;` with:
  ```css
  background: #10b981;
  ```

- [ ] **Update nav dot focus**

  Find:
  ```css
  :global(.nav-dot:focus-visible) {
    outline: 2px solid #22d3ee;
    outline-offset: 3px;
  }
  ```
  Replace `#22d3ee` with `#34d399`.

- [ ] **Update nav link active**

  Find:
  ```css
  :global(a.nav-link-active) {
    color: white !important;
    background: rgba(255, 255, 255, 0.07) !important;
  }
  ```
  Replace with:
  ```css
  :global(a.nav-link-active) {
    color: #10b981 !important;
    background: rgba(16, 185, 129, 0.07) !important;
  }
  ```

- [ ] **Verify build**

  ```bash
  npm run build
  ```
  Expected: exits 0.

- [ ] **Commit**

  ```bash
  git add src/pages/index.astro
  git commit -m "feat: update page chrome colors to esmeralda"
  ```

---

## Task 5 — splash.astro: hero font + colors

**Files:**
- Modify: `src/components/splash.astro`

- [ ] **Add DM Serif Display to `<h1>` and change PRESENCIAS to italic em**

  Find in the frontmatter section the `<h1>` block:
  ```astro
  <h1
    class="fade-up delay-1 font-display font-extrabold uppercase text-white"
    style="font-size: clamp(3.8rem, 11vw, 9.5rem); line-height: 0.92; letter-spacing: -0.025em;"
  >
    CONSTRUIMOS<br/>
    <span class="gradient-text">PRESENCIAS</span><br/>
    DIGITALES.
  </h1>
  ```
  Replace with:
  ```astro
  <h1
    class="fade-up delay-1 uppercase"
    style="font-family: 'DM Serif Display', Georgia, serif; font-size: clamp(3.8rem, 11vw, 9.5rem); line-height: 0.92; letter-spacing: -0.025em; font-weight: 400; color: #f5f0e8;"
  >
    CONSTRUIMOS<br/>
    <em style="color: #10b981; font-style: italic;">PRESENCIAS</em><br/>
    DIGITALES.
  </h1>
  ```

- [ ] **Update hero glow gradient**

  Find in the `<div id="hero-glow">` inline style:
  ```
  rgba(99,102,241,0.16)
  ```
  Replace with:
  ```
  rgba(16,185,129,0.10)
  ```
  Full updated style attribute:
  ```
  style="background: radial-gradient(ellipse 60% 55% at 50% 42%, rgba(16,185,129,0.10) 0%, rgba(5,5,5,0.55) 60%, rgba(5,5,5,0.98) 100%)"
  ```

- [ ] **Update `.hero-bg-mark` CSS in the `<style>` block**

  Find:
  ```css
  .hero-bg-mark {
    position: absolute;
    bottom: -4vw;
    right: -2vw;
    font-family: "Syne", sans-serif;
    font-size: clamp(10rem, 28vw, 28rem);
    font-weight: 900;
    line-height: 1;
    letter-spacing: -0.07em;
    color: rgba(99, 102, 241, 0.04);
    pointer-events: none;
    user-select: none;
    text-transform: uppercase;
  }
  ```
  Replace with:
  ```css
  .hero-bg-mark {
    position: absolute;
    bottom: -4vw;
    right: -2vw;
    font-family: "DM Serif Display", Georgia, serif;
    font-size: clamp(10rem, 28vw, 28rem);
    font-weight: 400;
    font-style: italic;
    line-height: 1;
    letter-spacing: -0.07em;
    color: rgba(16, 185, 129, 0.04);
    pointer-events: none;
    user-select: none;
    text-transform: uppercase;
  }
  ```

- [ ] **Update stats gradient-text spans font**

  The three stat `<span class="gradient-text" ...>` elements stay as-is (gradient auto-updates via global.css). No change needed.

- [ ] **Verify build**

  ```bash
  npm run build
  ```
  Expected: exits 0.

- [ ] **Commit**

  ```bash
  git add src/components/splash.astro
  git commit -m "feat: splash hero — DM Serif Display, esmeralda italic PRESENCIAS"
  ```

---

## Task 6 — header.astro: logo + wordmark

**Files:**
- Modify: `src/components/header.astro`

- [ ] **Update SVG logo gradient stops (desktop logo)**

  Find in the SVG `<defs>` block (around line 22–27):
  ```html
  <defs>
    <linearGradient id="hg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
      <stop stop-color="#6366f1"/><stop offset="1" stop-color="#22d3ee"/>
    </linearGradient>
  </defs>
  ```
  Replace with:
  ```html
  <defs>
    <linearGradient id="hg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
      <stop stop-color="#10b981"/><stop offset="1" stop-color="#34d399"/>
    </linearGradient>
  </defs>
  ```

- [ ] **Update desktop wordmark dot color and add serif font**

  Find (line 29):
  ```html
  <span class="font-display font-extrabold text-lg tracking-tight">JERG<span style="color:#6366f1">.</span>STUDIO</span>
  ```
  Replace with:
  ```html
  <span style="font-family: 'DM Serif Display', Georgia, serif; font-size: 1.1rem; letter-spacing: -0.02em;">JERG<span style="color:#10b981">.</span>STUDIO</span>
  ```

- [ ] **Update mobile modal wordmark**

  Find (line 76):
  ```html
  <span class="font-display font-extrabold text-lg">JERG<span style="color:#6366f1">.</span>STUDIO</span>
  ```
  Replace with:
  ```html
  <span style="font-family: 'DM Serif Display', Georgia, serif; font-size: 1.1rem; letter-spacing: -0.02em;">JERG<span style="color:#10b981">.</span>STUDIO</span>
  ```

- [ ] **Verify build**

  ```bash
  npm run build
  ```
  Expected: exits 0.

- [ ] **Commit**

  ```bash
  git add src/components/header.astro
  git commit -m "feat: header — esmeralda logo gradient, DM Serif wordmark"
  ```

---

## Task 7 — footer.astro: logo + wordmark

**Files:**
- Modify: `src/components/footer.astro`

- [ ] **Update SVG logo gradient stops**

  Find in the footer SVG `<defs>` block (around line 52–55):
  ```html
  <defs>
    <linearGradient id="fg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
      <stop stop-color="#6366f1"/><stop offset="1" stop-color="#22d3ee"/>
    </linearGradient>
  </defs>
  ```
  Replace with:
  ```html
  <defs>
    <linearGradient id="fg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
      <stop stop-color="#10b981"/><stop offset="1" stop-color="#34d399"/>
    </linearGradient>
  </defs>
  ```

- [ ] **Update footer wordmark dot color and add serif font**

  Find (line 57):
  ```html
  <span class="font-display font-extrabold text-lg tracking-tight">JERG<span style="color:#6366f1">.</span>STUDIO</span>
  ```
  Replace with:
  ```html
  <span style="font-family: 'DM Serif Display', Georgia, serif; font-size: 1.1rem; letter-spacing: -0.02em;">JERG<span style="color:#10b981">.</span>STUDIO</span>
  ```

- [ ] **Verify build**

  ```bash
  npm run build
  ```
  Expected: exits 0.

- [ ] **Commit**

  ```bash
  git add src/components/footer.astro
  git commit -m "feat: footer — esmeralda logo gradient, DM Serif wordmark"
  ```

---

## Task 8 — intro.astro: serif headline + accent-italic

**Files:**
- Modify: `src/components/intro.astro`

- [ ] **Add DM Serif Display to `<h2>` and replace gradient span**

  Find the `<h2>` block (around line 42–48):
  ```astro
  <h2
    id="intro-heading"
    class="font-display font-extrabold leading-[1.06]"
    style="font-size: clamp(2rem, 4.5vw + 0.5rem, 3.6rem);"
    data-split
  >
    No vendemos proyectos.<br/>
    <span class="gradient-text">Construimos</span> resultados.
  </h2>
  ```
  Replace with:
  ```astro
  <h2
    id="intro-heading"
    class="leading-[1.06]"
    style="font-family: 'DM Serif Display', Georgia, serif; font-size: clamp(2rem, 4.5vw + 0.5rem, 3.6rem); font-weight: 400;"
    data-split
  >
    No vendemos proyectos.<br/>
    <em class="accent-italic">Construimos</em> resultados.
  </h2>
  ```

- [ ] **Verify build**

  ```bash
  npm run build
  ```
  Expected: exits 0.

- [ ] **Commit**

  ```bash
  git add src/components/intro.astro
  git commit -m "feat: intro — DM Serif Display h2, accent-italic Construimos"
  ```

---

## Task 9 — features.astro: serif headlines + feat-title font

**Files:**
- Modify: `src/components/features.astro`

- [ ] **Update section `<h2>`**

  Find (around line 63–69):
  ```astro
  <h2
    class="font-display font-extrabold uppercase text-white"
    style="font-size: clamp(2.8rem, 7vw, 6rem); line-height: 0.95; letter-spacing: -0.025em;"
    data-split
  >
    Seis disciplinas.<br/>
    <span class="gradient-text">Un propósito.</span>
  </h2>
  ```
  Replace with:
  ```astro
  <h2
    class="uppercase text-white"
    style="font-family: 'DM Serif Display', Georgia, serif; font-size: clamp(2.8rem, 7vw, 6rem); line-height: 0.95; letter-spacing: -0.025em; font-weight: 400;"
    data-split
  >
    Seis disciplinas.<br/>
    <em class="accent-italic">Un propósito.</em>
  </h2>
  ```

- [ ] **Update `.feat-title` CSS in the `<style>` block**

  Find:
  ```css
  .feat-title {
    font-family: "Syne", sans-serif;
    font-size: clamp(1.15rem, 2.2vw, 1.75rem);
    font-weight: 800;
    letter-spacing: -0.01em;
    line-height: 1.1;
    color: rgba(255, 255, 255, 0.88);
    transition: color 0.2s;
    text-align: left;
  }
  ```
  Replace with:
  ```css
  .feat-title {
    font-family: "DM Serif Display", Georgia, serif;
    font-size: clamp(1.15rem, 2.2vw, 1.75rem);
    font-weight: 400;
    letter-spacing: -0.01em;
    line-height: 1.1;
    color: rgba(245, 240, 232, 0.88);
    transition: color 0.2s;
    text-align: left;
  }
  ```

- [ ] **Update `.feat-num` CSS — warm text color**

  Find:
  ```css
  .feat-num {
    font-family: "Syne", sans-serif;
  ```
  Replace `font-family: "Syne", sans-serif;` with:
  ```css
  font-family: "DM Serif Display", Georgia, serif;
  ```

- [ ] **Verify build**

  ```bash
  npm run build
  ```
  Expected: exits 0.

- [ ] **Commit**

  ```bash
  git add src/components/features.astro
  git commit -m "feat: features — DM Serif h2 and feat-title, accent-italic"
  ```

---

## Task 10 — showcase.astro: CSS device mockup rebuild

**Files:**
- Modify: `src/components/showcase.astro`

This task replaces all four `<img>` tags and their placehold.co sources with pure CSS device mockups. The bento grid layout, card structure, and GSAP tilt interaction are preserved. Only the image element and its container are replaced with a CSS device scene.

- [ ] **Replace the frontmatter `image` properties** (they will no longer be used)

  In the frontmatter, remove the `image` key from each project object:
  ```astro
  ---
  import ContentSection from "~/components/content-section.astro";

  const projects = [
    {
      title: "FounderOS",
      category: "App Web SaaS",
      result: "↑ 8x retención de usuarios",
      desc: "Dashboard all-in-one para founders en etapa pre-seed: gestión de tareas, pipeline de inversores y métricas clave. MVP lanzado en 3 semanas con 0 bugs en producción.",
      tech: ["React", "Supabase", "Vercel"],
      color: "#6366f1",
      span: "big",
    },
    {
      title: "PelicanDTC",
      category: "E-commerce D2C",
      result: "↑ 250% ventas primer mes",
      desc: "Tienda D2C con Stripe y gestión de stock.",
      tech: ["Astro", "Stripe"],
      color: "#10b981",
      span: "sm",
    },
    {
      title: "TallerFlow",
      category: "App Reservas",
      result: "↓ 70% ausencias a citas",
      desc: "Sistema de agenda y seguimiento para talleres.",
      tech: ["Next.js", "Supabase"],
      color: "#8b5cf6",
      span: "sm",
    },
    {
      title: "SeedLanding",
      category: "Landing + Automatización",
      result: "+800 leads / mes",
      desc: "Landing page de alta conversión para startup fintech con embudo automatizado: captura, calificación por WhatsApp y nurturing por email. Integrado con n8n y Supabase.",
      tech: ["Astro", "n8n", "WhatsApp API"],
      color: "#10b981",
      span: "wide",
    },
  ];
  ---
  ```

- [ ] **Replace P1 (FounderOS) card content — swap `<img>` + `.bento-overlay` for CSS device scene**

  Find the entire P1 card interior (lines 67–89), the part between `<a ... class="bento-card bento-big group">` opening and the `<div class="bento-content">`:
  ```astro
      <div class="card-shine" aria-hidden="true"></div>
      <img
        src={projects[0].image}
        alt="Captura del proyecto FounderOS"
        class="bento-img"
        loading="eager"
        width="900" height="600"
      />
      <div class="bento-overlay"></div>
  ```
  Replace with:
  ```astro
      <div class="card-shine" aria-hidden="true"></div>
      <div class="device-scene" aria-hidden="true">
        <div class="dev-laptop">
          <div class="dev-cam"></div>
          <div class="dev-screen">
            <div class="ui-saas">
              <div class="ui-hdr"></div>
              <div class="ui-row">
                <div class="ui-side"></div>
                <div class="ui-main">
                  <div class="ui-card" style="border-left-color:#6366f1"></div>
                  <div class="ui-stat" style="background:#6366f1;width:65%"></div>
                  <div class="ui-line" style="width:80%"></div>
                  <div class="ui-card" style="border-left-color:#6366f1"></div>
                  <div class="ui-line" style="width:55%"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="dev-phone">
          <div class="dev-notch"></div>
          <div class="dev-screen">
            <div class="ui-phone" style="background:#0d1117">
              <div class="ui-ph-bar" style="background:#6366f1"></div>
              <div class="ui-ph-card" style="border-left-color:#6366f1"></div>
              <div class="ui-ph-btn" style="background:#6366f1"></div>
            </div>
          </div>
        </div>
      </div>
  ```

  Also update the `--accent` and `aria-label` on the `<a>` opening tag for P1 — keep `--accent: #6366f1` (it's FounderOS's brand color, kept intentionally distinct).

- [ ] **Replace P2 (PelicanDTC) card content**

  Find the P2 `<img>` block:
  ```astro
      <div class="card-shine" aria-hidden="true"></div>
      <img
        src={projects[1].image}
        alt="Captura del proyecto PelicanDTC"
        class="bento-img"
        loading="lazy"
        width="600" height="300"
      />
      <div class="bento-overlay"></div>
  ```
  Replace with:
  ```astro
      <div class="card-shine" aria-hidden="true"></div>
      <div class="device-scene" aria-hidden="true">
        <div class="dev-laptop">
          <div class="dev-cam"></div>
          <div class="dev-screen">
            <div class="ui-ecom">
              <div class="ui-ecom-nav"></div>
              <div class="ui-ecom-hero" style="background:linear-gradient(90deg,#10b981,#059669)"></div>
              <div class="ui-ecom-grid">
                <div class="ui-ecom-item"></div>
                <div class="ui-ecom-item"></div>
                <div class="ui-ecom-item"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="dev-phone">
          <div class="dev-notch"></div>
          <div class="dev-screen">
            <div class="ui-phone" style="background:#fafaf9">
              <div class="ui-ph-bar" style="background:#059669"></div>
              <div class="ui-ph-card" style="background:#e5e7eb;border:none"></div>
              <div class="ui-ph-btn" style="background:#10b981"></div>
            </div>
          </div>
        </div>
      </div>
  ```

- [ ] **Replace P3 (TallerFlow) card content**

  Find the P3 `<img>` block and replace with:
  ```astro
      <div class="card-shine" aria-hidden="true"></div>
      <div class="device-scene" aria-hidden="true">
        <div class="dev-laptop">
          <div class="dev-cam"></div>
          <div class="dev-screen">
            <div class="ui-booking">
              <div class="ui-booking-hdr"></div>
              <div class="ui-booking-cal">
                <div class="ui-day"></div>
                <div class="ui-day active" style="background:#8b5cf6"></div>
                <div class="ui-day"></div>
                <div class="ui-day"></div>
                <div class="ui-day active" style="background:#8b5cf6"></div>
                <div class="ui-day active" style="background:#8b5cf6"></div>
                <div class="ui-day"></div>
                <div class="ui-day"></div>
                <div class="ui-day"></div>
                <div class="ui-day active" style="background:#8b5cf6"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="dev-phone">
          <div class="dev-notch"></div>
          <div class="dev-screen">
            <div class="ui-phone" style="background:#050a0f">
              <div class="ui-ph-bar" style="background:#8b5cf6"></div>
              <div class="ui-ph-card" style="border-left-color:#8b5cf6;background:#0d1f2d"></div>
              <div class="ui-ph-btn" style="background:#8b5cf6"></div>
            </div>
          </div>
        </div>
      </div>
  ```

- [ ] **Replace P4 (SeedLanding) card content**

  Find the P4 `<img>` block and replace with:
  ```astro
      <div class="card-shine" aria-hidden="true"></div>
      <div class="device-scene" aria-hidden="true">
        <div class="dev-laptop" style="flex:1">
          <div class="dev-cam"></div>
          <div class="dev-screen">
            <div class="ui-landing">
              <div class="ui-landing-hero"></div>
              <div class="ui-line" style="width:70%;margin-top:6px"></div>
              <div class="ui-line" style="width:50%"></div>
              <div class="ui-landing-btn"></div>
            </div>
          </div>
        </div>
        <div class="dev-phone">
          <div class="dev-notch"></div>
          <div class="dev-screen">
            <div class="ui-phone" style="background:#050505">
              <div class="ui-ph-bar" style="background:#10b981"></div>
              <div class="ui-ph-card" style="border-top:2px solid #10b981;border-left:none;background:#0a1a0f"></div>
              <div class="ui-ph-btn" style="background:#10b981"></div>
            </div>
          </div>
        </div>
      </div>
  ```

- [ ] **Add CSS for device mockups to the `<style>` block**

  Add the following CSS rules at the top of the existing `<style>` block in showcase.astro (before `/* ── Bento grid layout ── */`):

  ```css
  /* ── CSS Device Mockups ── */
  .device-scene {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 10px;
    padding: 16px 12px 0;
    pointer-events: none;
  }

  /* Laptop */
  .dev-laptop {
    background: #1a1a1a;
    border-radius: 6px 6px 0 0;
    padding: 6px;
    border: 1.5px solid #2a2a2a;
    flex: 1;
    max-width: 320px;
    position: relative;
  }
  .dev-laptop::after {
    content: '';
    display: block;
    height: 5px;
    background: #1a1a1a;
    border-radius: 0 0 3px 3px;
    border: 1.5px solid #2a2a2a;
    border-top: none;
    margin: 0 -8px -6px;
  }
  .dev-cam {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #2a2a2a;
    margin: 0 auto 4px;
  }
  .dev-screen {
    border-radius: 3px;
    overflow: hidden;
    aspect-ratio: 16/9;
  }

  /* Phone */
  .dev-phone {
    background: #1a1a1a;
    border-radius: 12px;
    padding: 5px 3px;
    border: 1.5px solid #2a2a2a;
    width: 52px;
    flex-shrink: 0;
  }
  .dev-notch {
    width: 16px;
    height: 3px;
    border-radius: 2px;
    background: #2a2a2a;
    margin: 0 auto 3px;
  }
  .dev-phone .dev-screen {
    aspect-ratio: 9/16;
    border-radius: 8px;
  }

  /* ── SaaS Dashboard UI (FounderOS) ── */
  .ui-saas {
    background: #0d1117;
    height: 100%;
    padding: 5px;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .ui-hdr  { height: 7px; background: #21262d; border-radius: 2px; }
  .ui-row  { display: flex; gap: 3px; flex: 1; }
  .ui-side { width: 20px; background: #161b22; border-radius: 2px; flex-shrink: 0; }
  .ui-main { flex: 1; display: flex; flex-direction: column; gap: 2px; }
  .ui-card { height: 9px; background: #21262d; border-radius: 2px; border-left: 2px solid; }
  .ui-stat { height: 5px; border-radius: 2px; opacity: 0.6; }
  .ui-line { height: 4px; background: rgba(255,255,255,0.05); border-radius: 2px; }

  /* ── E-commerce UI (PelicanDTC) ── */
  .ui-ecom      { background: #fafaf9; height: 100%; padding: 4px; display: flex; flex-direction: column; gap: 2px; }
  .ui-ecom-nav  { height: 6px; background: #0a0a0a; border-radius: 1px; }
  .ui-ecom-hero { height: 18px; border-radius: 2px; }
  .ui-ecom-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; flex: 1; }
  .ui-ecom-item { background: #e5e7eb; border-radius: 1px; }

  /* ── Booking Calendar UI (TallerFlow) ── */
  .ui-booking     { background: #050a0f; height: 100%; padding: 5px; display: flex; flex-direction: column; gap: 3px; }
  .ui-booking-hdr { height: 6px; background: #0d1f2d; border-radius: 2px; border-bottom: 1px solid rgba(139,92,246,0.2); }
  .ui-booking-cal { flex: 1; display: grid; grid-template-columns: repeat(5, 1fr); gap: 2px; }
  .ui-day         { background: #0d1f2d; border-radius: 1px; }

  /* ── Landing Page UI (SeedLanding) ── */
  .ui-landing      { background: #050505; height: 100%; padding: 5px; display: flex; flex-direction: column; gap: 2px; }
  .ui-landing-hero { height: 22px; background: linear-gradient(135deg, #0a1a0f, #051208); border-radius: 2px; border-top: 1.5px solid rgba(16,185,129,0.4); }
  .ui-landing-btn  { height: 7px; background: #10b981; border-radius: 3px; width: 40%; margin-top: 2px; }

  /* ── Phone UI (shared) ── */
  .ui-phone    { height: 100%; padding: 3px; display: flex; flex-direction: column; gap: 2px; }
  .ui-ph-bar   { height: 4px; border-radius: 2px; flex-shrink: 0; }
  .ui-ph-card  { flex: 1; border-radius: 3px; border-left: 2px solid; }
  .ui-ph-btn   { height: 6px; border-radius: 3px; margin: 0 2px; flex-shrink: 0; }
  ```

- [ ] **Verify no `<img>` tags remain in showcase.astro**

  ```bash
  grep -n "<img" "src/components/showcase.astro"
  ```
  Expected: no output (zero matches).

- [ ] **Verify build**

  ```bash
  npm run build
  ```
  Expected: exits 0.

- [ ] **Commit**

  ```bash
  git add src/components/showcase.astro
  git commit -m "feat: showcase — replace placeholder images with CSS device mockups"
  ```

---

## Task 11 — Process.astro: font + color sweep

**Files:**
- Modify: `src/components/Process.astro`

- [ ] **Update section `<h2>` from gradient-text class to accent-italic em**

  Find (line 36–38):
  ```astro
  <h2 id="process-heading" class="gradient-text font-display font-extrabold tracking-tight" style="font-size: clamp(3rem,7vw,5.5rem);">
    El Proceso
  </h2>
  ```
  Replace with:
  ```astro
  <h2 id="process-heading" class="tracking-tight" style="font-family: 'DM Serif Display', Georgia, serif; font-size: clamp(3rem,7vw,5.5rem); font-weight: 400; color: #f5f0e8;">
    <em class="accent-italic">El Proceso</em>
  </h2>
  ```

- [ ] **Update `.step-bg-num` font**

  Find:
  ```css
  .step-bg-num {
    ...
    font-family: "Syne", var(--font-display, sans-serif);
    ...
  }
  ```
  Replace `font-family: "Syne", var(--font-display, sans-serif);` with:
  ```css
  font-family: "DM Serif Display", Georgia, serif;
  ```

  Also update its hover color:
  ```css
  .process-step:hover .step-bg-num {
    color: rgba(99, 102, 241, 0.07);
  }
  ```
  Replace with:
  ```css
  .process-step:hover .step-bg-num {
    color: rgba(16, 185, 129, 0.07);
  }
  ```

- [ ] **Update `.step-title` font**

  Find:
  ```css
  .step-title {
    font-family: "Syne", var(--font-display, sans-serif);
  ```
  Replace with:
  ```css
  .step-title {
    font-family: "DM Serif Display", Georgia, serif;
    font-weight: 400;
  ```

- [ ] **Update `.step-icon` colors**

  Find:
  ```css
  .step-icon {
    ...
    border: 1px solid rgba(99, 102, 241, 0.3);
    background: rgba(99, 102, 241, 0.1);
    color: #6366f1;
    ...
  }
  ```
  Replace those three lines with:
  ```css
  border: 1px solid rgba(16, 185, 129, 0.3);
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  ```

  Also update `.process-step:hover .step-icon`:
  ```css
  .process-step:hover .step-icon {
    border-color: rgba(99, 102, 241, 0.7);
    background: #6366f1;
    color: white;
  }
  ```
  Replace with:
  ```css
  .process-step:hover .step-icon {
    border-color: rgba(16, 185, 129, 0.7);
    background: #10b981;
    color: #050505;
  }
  ```

- [ ] **Update `.process-counter` font**

  Find:
  ```css
  .process-counter {
    ...
    font-family: "Syne", var(--font-display, sans-serif);
    ...
    color: rgba(255, 255, 255, 0.3);
    ...
  }
  ```
  Replace `font-family: "Syne", var(--font-display, sans-serif);` with:
  ```css
  font-family: "DM Serif Display", Georgia, serif;
  ```

- [ ] **Update `#process-step-num` color**

  Find:
  ```css
  #process-step-num {
    font-size: 1.2rem;
    color: var(--color-primary, #6366f1);
  }
  ```
  Replace with (token change covers this, but update fallback):
  ```css
  #process-step-num {
    font-size: 1.2rem;
    color: var(--color-primary, #10b981);
  }
  ```

- [ ] **Update left accent bar gradient**

  Find:
  ```css
  .process-step::after {
    ...
    background: linear-gradient(to bottom, #6366f1, #22d3ee);
    ...
  }
  ```
  Replace with:
  ```css
  background: linear-gradient(to bottom, #10b981, #34d399);
  ```

- [ ] **Verify build**

  ```bash
  npm run build
  ```
  Expected: exits 0.

- [ ] **Commit**

  ```bash
  git add src/components/Process.astro
  git commit -m "feat: Process — DM Serif fonts, esmeralda step icon and accent bar"
  ```

---

## Task 12 — Clients.astro: marquee gradient fix

**Files:**
- Modify: `src/components/Clients.astro`

- [ ] **Update `.marquee-abbr` gradient secondary stop**

  Find:
  ```css
  .marquee-abbr {
    font-family: var(--font-display, "Syne", sans-serif);
    font-weight: 800;
    font-size: 1.35rem;
    background: linear-gradient(135deg, var(--c), color-mix(in srgb, var(--c) 60%, #22d3ee));
    ...
  }
  ```
  Replace `color-mix(in srgb, var(--c) 60%, #22d3ee)` with `color-mix(in srgb, var(--c) 60%, #34d399)`.
  Also update `font-family`:
  ```css
  font-family: "DM Serif Display", Georgia, serif;
  font-weight: 400;
  ```

- [ ] **Verify build**

  ```bash
  npm run build
  ```
  Expected: exits 0.

- [ ] **Commit**

  ```bash
  git add src/components/Clients.astro
  git commit -m "feat: Clients — esmeralda marquee gradient, DM Serif abbr"
  ```

---

## Task 13 — Testimonials.astro: color sweep

**Files:**
- Modify: `src/components/Testimonials.astro`

- [ ] **Update testimonial avatar colors in the data array**

  Find in the frontmatter (lines 10–29) the `color` values for the three testimonials:
  ```astro
  color: "#6366f1",   // Andrés Vargas
  color: "#22d3ee",   // Sofía Herrera
  ```
  Replace:
  - `"#6366f1"` → `"#10b981"` (Andrés Vargas — first testimonial)
  - `"#22d3ee"` → `"#34d399"` (Sofía Herrera — second testimonial)
  - `"#8b5cf6"` → `"#8b5cf6"` (Mateo Rojas — keep purple, it's distinct)

- [ ] **Add italic serif style to the quote text `<p>`**

  Find (line 54):
  ```astro
  <p class="relative text-sm text-offset leading-relaxed flex-1 italic before:content-['"'] before:text-4xl before:text-primary/20 before:font-display before:font-extrabold before:leading-none before:float-left before:mr-1 before:-mt-1">
  ```
  Add `font-family` via a style attribute:
  ```astro
  <p class="relative text-sm text-offset leading-relaxed flex-1 italic before:content-['"'] before:text-4xl before:text-primary/20 before:leading-none before:float-left before:mr-1 before:-mt-1" style="font-family: 'DM Serif Display', Georgia, serif;">
  ```

- [ ] **Verify build**

  ```bash
  npm run build
  ```
  Expected: exits 0.

- [ ] **Commit**

  ```bash
  git add src/components/Testimonials.astro
  git commit -m "feat: Testimonials — esmeralda avatars, DM Serif quote text"
  ```

---

## Task 14 — FAQ.astro: accent bar + open state

**Files:**
- Modify: `src/components/FAQ.astro`

- [ ] **Update `.faq-item::before` gradient**

  Find in the `<style>` block:
  ```css
  .faq-item::before {
    content: '';
    position: absolute;
    left: -1px;
    top: -1px;
    bottom: -1px;
    width: 2px;
    background: linear-gradient(to bottom, #6366f1, #22d3ee);
    opacity: 0;
    transition: opacity 0.25s;
    z-index: 1;
  }
  ```
  Replace the `background` line with:
  ```css
  background: linear-gradient(to bottom, #10b981, #34d399);
  ```

- [ ] **Update `.faq-item.is-open` border color**

  Find:
  ```css
  .faq-item.is-open {
    border-color: rgba(99, 102, 241, 0.3);
  }
  ```
  Replace with:
  ```css
  .faq-item.is-open {
    border-color: rgba(16, 185, 129, 0.3);
  }
  ```

- [ ] **Verify build**

  ```bash
  npm run build
  ```
  Expected: exits 0.

- [ ] **Commit**

  ```bash
  git add src/components/FAQ.astro
  git commit -m "feat: FAQ — esmeralda accent bar and open state"
  ```

---

## Task 15 — ContactForm.astro: form colors

**Files:**
- Modify: `src/components/ContactForm.astro`

- [ ] **Update `.contact-icon-wrap` background and color**

  Find in the `<style>` block:
  ```css
  .contact-icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    border: 1px solid rgba(255, 255, 255, 0.07);
    background: rgba(99, 102, 241, 0.08);
    color: #6366f1;
    flex-shrink: 0;
  }
  ```
  Replace `rgba(99, 102, 241, 0.08)` and `#6366f1` with:
  ```css
  background: rgba(16, 185, 129, 0.08);
  color: #10b981;
  ```

- [ ] **Update input focus shadow**

  Find:
  ```css
  .cf-input:focus {
    @apply border-primary;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
  }
  ```
  Replace `rgba(99,102,241,0.15)` with `rgba(16,185,129,0.15)`.

- [ ] **Update success banner background class**

  Find in the HTML template (line 183):
  ```astro
  <div id="cf-success" class="mt-6 hidden items-center gap-4 border border-secondary/30 bg-secondary/8 p-5" ...>
  ```
  The `bg-secondary/8` is a custom class defined at the bottom of the `<style>` block:
  ```css
  .bg-secondary\/8 { background: rgba(34,211,238,0.08); }
  ```
  Replace with:
  ```css
  .bg-secondary\/8 { background: rgba(52,211,153,0.08); }
  ```

- [ ] **Verify build**

  ```bash
  npm run build
  ```
  Expected: exits 0.

- [ ] **Commit**

  ```bash
  git add src/components/ContactForm.astro
  git commit -m "feat: ContactForm — esmeralda icon wrap, focus ring, success banner"
  ```

---

## Task 16 — scrollytelling.ts: cursor color

**Files:**
- Modify: `src/scripts/scrollytelling.ts`

- [ ] **Find and update any hardcoded `#6366f1` or `#22d3ee` color strings**

  Search for all color occurrences:
  ```bash
  grep -n "6366f1\|22d3ee\|99,102,241\|34,211,238" "src/scripts/scrollytelling.ts"
  ```

  For every match found, replace:
  - `#6366f1` → `#10b981`
  - `rgba(99, 102, 241, ...)` → `rgba(16, 185, 129, ...)`
  - `#22d3ee` → `#34d399`
  - `rgba(34, 211, 238, ...)` → `rgba(52, 211, 153, ...)`

  Common location is where GSAP sets the cursor dot background:
  ```typescript
  gsap.set('#cursor-dot', { backgroundColor: '#6366f1' });
  ```
  Replace with:
  ```typescript
  gsap.set('#cursor-dot', { backgroundColor: '#10b981' });
  ```

- [ ] **Verify build**

  ```bash
  npm run build
  ```
  Expected: exits 0.

- [ ] **Commit**

  ```bash
  git add src/scripts/scrollytelling.ts
  git commit -m "feat: scrollytelling — esmeralda cursor color"
  ```

---

## Task 17 — Final verification

**Files:** All source files (read-only grep)

- [ ] **Grep for any remaining indigo/cyan references**

  ```bash
  grep -rn "6366f1\|22d3ee\|99,102,241\|34,211,238" src/
  ```
  Expected: **zero matches**. If any appear, edit those files to replace with esmeralda equivalents before continuing.

- [ ] **Grep for any remaining Syne font references**

  ```bash
  grep -rn '"Syne"' src/
  ```
  Expected: zero matches. Any `"Syne"` occurrences should be replaced with `"DM Serif Display", Georgia, serif`.

- [ ] **Grep for any remaining placehold.co references**

  ```bash
  grep -rn "placehold.co" src/
  ```
  Expected: zero matches.

- [ ] **Grep for any remaining `<img` in showcase**

  ```bash
  grep -n "<img" src/components/showcase.astro
  ```
  Expected: zero matches.

- [ ] **Run production build**

  ```bash
  npm run build
  ```
  Expected: exits 0, no TypeScript errors, no Astro errors.

- [ ] **Commit final state**

  ```bash
  git add -A
  git commit -m "chore: verify esmeralda redesign — all tokens, fonts, images replaced"
  ```

---

## Success Criteria Checklist

- [ ] Zero `#6366f1` or `#22d3ee` references in `src/`
- [ ] DM Serif Display renders on: hero `<h1>`, all section `<h2>`s, `.feat-title`, step titles, testimonial quotes, wordmark logos
- [ ] Showcase has zero `<img>` tags, zero placehold.co references
- [ ] `btn-primary` is solid esmeralda `#10b981` with dark text `#050505` (legible)
- [ ] Custom cursor dot is green (`#10b981`)
- [ ] Scroll progress bar is green (`#10b981 → #34d399`)
- [ ] `npm run build` exits 0 with no errors
