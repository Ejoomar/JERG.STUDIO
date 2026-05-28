# Scroll Animations + Mobile Fixes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add scroll-triggered stagger animations across all sections and fix mobile layout issues for the JERG.STUDIO landing page.

**Architecture:** Extend the existing `fade-up` CSS system (IntersectionObserver + CSS transitions) with GSAP-powered stagger for child elements; add a new `src/scripts/scroll-animations.ts` file imported from `index.astro`. Mobile fixes are pure CSS, co-located in each component's `<style>` block.

**Tech Stack:** Astro v4, Tailwind CSS v3, GSAP 3 + ScrollTrigger (already installed), TypeScript, no React.

**Spec:** `docs/superpowers/specs/2026-05-28-scroll-animations-mobile-fixes-design.md`

---

## File Map

| File | Action | What changes |
|---|---|---|
| `src/styles/global.css` | Modify | Upgrade fade-up duration to 0.8s |
| `src/scripts/scroll-animations.ts` | **Create** | Hero parallax + all stagger animations |
| `src/pages/index.astro` | Modify | Import new scroll-animations script |
| `src/components/showcase.astro` | Modify | Remove fade-up from bento-grid; mobile device scaling |
| `src/components/splash.astro` | Modify | Mobile hero typography + stats row wrap |
| `src/components/features.astro` | Modify | Add `js-feat-item` selector for GSAP |
| `src/components/Testimonials.astro` | Modify | Add `js-testi-card` selector for GSAP |
| `src/components/FAQ.astro` | Modify | Add `js-faq-item` selector for GSAP |
| `src/pages/index.astro` | Modify | Touch targets + cursor hide on touch |

---

## Task 1 — Upgrade fade-up CSS timing

**Files:**
- Modify: `src/styles/global.css`

The current `fade-up` transition is 0.55s — too fast for the "fluido & premium" feel. Change to 0.8s with the same ease curve.

- [ ] **Step 1: Read the file to get the exact current line**

  Open `src/styles/global.css` and find lines 47–61 (the `.fade-up` block).

- [ ] **Step 2: Edit the transition duration**

  Find this block:
  ```css
  .fade-up {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1),
                transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
  }
  ```

  Replace with:
  ```css
  .fade-up {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
                transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }
  ```

- [ ] **Step 3: Verify**

  Run `npm run dev` and open `http://localhost:4321`. Scroll slowly — each section header should fade in with a slightly slower, heavier feel (0.8s instead of 0.55s).

- [ ] **Step 4: Commit**

  ```bash
  git add src/styles/global.css
  git commit -m "feat: upgrade fade-up transition to 0.8s for premium feel"
  ```

---

## Task 2 — Create scroll-animations.ts with hero parallax

**Files:**
- Create: `src/scripts/scroll-animations.ts`

Create the new animation module. It exports `initScrollAnimations()` which will be called from index.astro. Start with the hero scroll parallax: as the user scrolls past the hero, the h1 drifts upward 8% of its height. Desktop only.

**Note:** `ScrollTrigger` is already registered in `scrollytelling.ts`. Since both files share the same GSAP instance (same module), no need to re-register.

- [ ] **Step 1: Create the file**

  Create `src/scripts/scroll-animations.ts` with this content:

  ```typescript
  import { gsap } from "gsap";
  import { ScrollTrigger } from "gsap/ScrollTrigger";

  gsap.registerPlugin(ScrollTrigger);

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mm = gsap.matchMedia();

  // ─────────────────────────────────────
  // 1. HERO SCROLL PARALLAX
  //    h1 + subline drift upward as user scrolls past hero (desktop only)
  // ─────────────────────────────────────
  function initHeroScrollParallax() {
    if (reduced) return;

    const headline = document.querySelector<HTMLElement>("#splash h1");
    const subline  = document.querySelector<HTMLElement>("#splash .fade-up.delay-2");
    const stats    = document.querySelector<HTMLElement>("#splash .stats-row");
    if (!headline) return;

    mm.add("(min-width: 769px)", () => {
      const targets = [headline, subline, stats].filter((el): el is HTMLElement => el !== null);
      gsap.to(targets, {
        yPercent: -10,
        ease: "none",
        scrollTrigger: {
          trigger: "#splash",
          start: "top top",
          end: "bottom top",
          scrub: 1.5,
        },
      });
    });
  }

  // ─────────────────────────────────────
  // 2. FEATURES — stagger feat-items
  // ─────────────────────────────────────
  function initFeaturesStagger() {
    if (reduced) return;

    const items = document.querySelectorAll<HTMLElement>(".js-feat-item");
    if (!items.length) return;

    gsap.from(items, {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.12,
      scrollTrigger: {
        trigger: "#features-list",
        start: "top 82%",
        once: true,
      },
    });
  }

  // ─────────────────────────────────────
  // 3. SHOWCASE — stagger bento cards
  // ─────────────────────────────────────
  function initShowcaseStagger() {
    if (reduced) return;

    const cards = document.querySelectorAll<HTMLElement>(".js-bento-card");
    if (!cards.length) return;

    gsap.from(cards, {
      y: 60,
      opacity: 0,
      duration: 0.85,
      ease: "power3.out",
      stagger: 0.15,
      scrollTrigger: {
        trigger: ".bento-grid",
        start: "top 80%",
        once: true,
      },
    });
  }

  // ─────────────────────────────────────
  // 4. TESTIMONIALS — stagger cards
  // ─────────────────────────────────────
  function initTestimonialsStagger() {
    if (reduced) return;

    const cards = document.querySelectorAll<HTMLElement>(".js-testi-card");
    if (!cards.length) return;

    gsap.from(cards, {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.12,
      scrollTrigger: {
        trigger: "#testimonials .grid",
        start: "top 82%",
        once: true,
      },
    });
  }

  // ─────────────────────────────────────
  // 5. FAQ — stagger items
  // ─────────────────────────────────────
  function initFaqStagger() {
    if (reduced) return;

    const items = document.querySelectorAll<HTMLElement>(".js-faq-item");
    if (!items.length) return;

    gsap.from(items, {
      y: 30,
      opacity: 0,
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.09,
      scrollTrigger: {
        trigger: ".faq-list",
        start: "top 82%",
        once: true,
      },
    });
  }

  // ─────────────────────────────────────
  // INIT
  // ─────────────────────────────────────
  export function initScrollAnimations() {
    initHeroScrollParallax();
    initFeaturesStagger();
    initShowcaseStagger();
    initTestimonialsStagger();
    initFaqStagger();
    window.addEventListener("load", () => ScrollTrigger.refresh());
  }
  ```

- [ ] **Step 2: Verify the file exists**

  ```bash
  ls src/scripts/scroll-animations.ts
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add src/scripts/scroll-animations.ts
  git commit -m "feat: add scroll-animations.ts with hero parallax and stagger functions"
  ```

---

## Task 3 — Add JS selector classes to features.astro

**Files:**
- Modify: `src/components/features.astro`

The GSAP stagger in `scroll-animations.ts` targets `.js-feat-item`. Add that class to each feature item in the template.

- [ ] **Step 1: Read the file**

  Open `src/components/features.astro` and find the `.feat-item` div (around line 82).

- [ ] **Step 2: Add js-feat-item class**

  Find:
  ```astro
  <div
    class="feat-item"
  ```

  Replace with:
  ```astro
  <div
    class="feat-item js-feat-item"
  ```

- [ ] **Step 3: Verify in browser**

  Run `npm run dev`. Open `http://localhost:4321`. Scroll to the Features section — the feature rows should appear one by one with a 0.12s stagger.

- [ ] **Step 4: Commit**

  ```bash
  git add src/components/features.astro
  git commit -m "feat: add js-feat-item class for GSAP stagger"
  ```

---

## Task 4 — Showcase: swap fade-up for GSAP stagger

**Files:**
- Modify: `src/components/showcase.astro`

Currently `.bento-grid` has a single `fade-up` that animates the whole grid. Replace with individual card-level GSAP stagger for more impact. Steps: remove `fade-up` from `.bento-grid`, add `js-bento-card` to each `.bento-card`.

- [ ] **Step 1: Read showcase.astro**

  Open `src/components/showcase.astro` and find the `.bento-grid` div (around line 54) and `.bento-card` elements.

- [ ] **Step 2: Remove fade-up from bento-grid**

  Find:
  ```astro
  <div class="bento-grid w-full max-w-6xl fade-up">
  ```

  Replace with:
  ```astro
  <div class="bento-grid w-full max-w-6xl">
  ```

- [ ] **Step 3: Add js-bento-card to the big card**

  Find the first bento-card (the big one):
  ```astro
  class="bento-card bento-big group"
  ```

  Replace with:
  ```astro
  class="bento-card bento-big group js-bento-card"
  ```

- [ ] **Step 4: Add js-bento-card to the small cards**

  Find the small card loop. Each small card will have something like:
  ```astro
  class="bento-card group"
  ```

  Replace with:
  ```astro
  class="bento-card group js-bento-card"
  ```

  (There are 3 small cards — apply to each.)

- [ ] **Step 5: Verify in browser**

  Scroll to the Showcase section — the big card and then the 3 smaller cards should appear with staggered 0.15s delay, sliding up from y:60.

- [ ] **Step 6: Commit**

  ```bash
  git add src/components/showcase.astro
  git commit -m "feat: swap bento-grid fade-up for individual card GSAP stagger"
  ```

---

## Task 5 — Add JS selector classes to Testimonials and FAQ

**Files:**
- Modify: `src/components/Testimonials.astro`
- Modify: `src/components/FAQ.astro`

- [ ] **Step 1: Read Testimonials.astro**

  Open `src/components/Testimonials.astro` and find the `blockquote` element (around line 43).

- [ ] **Step 2: Add js-testi-card to each blockquote**

  Find:
  ```astro
  <blockquote class="group flex flex-col gap-6 border border-default bg-offset p-8 transition-colors duration-300 hover:border-primary/30 cursor-default">
  ```

  Replace with:
  ```astro
  <blockquote class="group flex flex-col gap-6 border border-default bg-offset p-8 transition-colors duration-300 hover:border-primary/30 cursor-default js-testi-card">
  ```

- [ ] **Step 3: Read FAQ.astro**

  Open `src/components/FAQ.astro` and find the `.faq-item` div (around line 47).

- [ ] **Step 4: Add js-faq-item to each faq-item**

  Find:
  ```astro
  <div class="faq-item border border-default transition-all duration-200 hover:border-primary/30 mt-[-1px]">
  ```

  Replace with:
  ```astro
  <div class="faq-item js-faq-item border border-default transition-all duration-200 hover:border-primary/30 mt-[-1px]">
  ```

- [ ] **Step 5: Verify in browser**

  Scroll to Testimonials — 3 cards appear with stagger. Scroll to FAQ — items appear with stagger.

- [ ] **Step 6: Commit**

  ```bash
  git add src/components/Testimonials.astro src/components/FAQ.astro
  git commit -m "feat: add js selector classes for testimonials and FAQ stagger"
  ```

---

## Task 6 — Wire initScrollAnimations into index.astro

**Files:**
- Modify: `src/pages/index.astro`

Import and call `initScrollAnimations()` after the existing GSAP scrollytelling import.

- [ ] **Step 1: Read index.astro**

  Open `src/pages/index.astro` and find the GSAP script block (around line 143):
  ```astro
  <!-- GSAP Scrollytelling -->
  <script>
    import '../scripts/scrollytelling';
  </script>
  ```

- [ ] **Step 2: Add new script import after it**

  After the scrollytelling script block, add:
  ```astro
  <!-- Scroll animations: stagger + parallax -->
  <script>
    import { initScrollAnimations } from '../scripts/scroll-animations';
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initScrollAnimations);
    } else {
      initScrollAnimations();
    }
  </script>
  ```

- [ ] **Step 3: Verify no TypeScript errors**

  ```bash
  npm run build 2>&1 | tail -20
  ```

  Expected: no errors (or the same warnings as before, none new).

- [ ] **Step 4: Verify in browser**

  Run `npm run dev`. Scroll through entire page. Each section's elements should animate in with stagger. Check: features rows, showcase cards, testimonial cards, FAQ items, hero text drifting on scroll.

- [ ] **Step 5: Commit**

  ```bash
  git add src/pages/index.astro
  git commit -m "feat: wire initScrollAnimations into index.astro"
  ```

---

## Task 7 — Mobile CSS: hero typography + stats row

**Files:**
- Modify: `src/components/splash.astro`

Fix two issues at small screens (≤ 480px):
1. Hero h1: tighten the minimum clamp so it fits 320px screens without overflow
2. Stats row: allow wrapping to 2 items per row at 360px

- [ ] **Step 1: Read splash.astro**

  Open `src/components/splash.astro` and find the `<h1>` inline style (around line 50) and the stats `@media (max-width: 480px)` block (around line 151).

- [ ] **Step 2: Fix h1 clamp for small screens**

  Find the h1 style attribute:
  ```astro
  style="font-family: 'DM Serif Display', Georgia, serif; font-size: clamp(3.8rem, 11vw, 9.5rem); line-height: 0.92; letter-spacing: -0.025em; font-weight: 400; color: #f5f0e8;"
  ```

  Replace with:
  ```astro
  style="font-family: 'DM Serif Display', Georgia, serif; font-size: clamp(2.8rem, 10vw, 9.5rem); line-height: 0.94; letter-spacing: -0.025em; font-weight: 400; color: #f5f0e8;"
  ```

  (Minimum size drops from 3.8rem → 2.8rem so it fits 320px screens. Line-height loosens slightly from 0.92 → 0.94 to prevent descenders clipping.)

- [ ] **Step 3: Fix stats row wrapping**

  In the `<style>` block, find the existing media query:
  ```css
  @media (max-width: 480px) {
    .stats-row { gap: 1.5rem; }
    .stats-row > div + div { padding-left: 1.5rem; }
  }
  ```

  Replace with:
  ```css
  @media (max-width: 480px) {
    .stats-row {
      gap: 1.25rem 2rem;
      flex-wrap: wrap;
      justify-content: center;
      border-top: none;
      padding-top: 0;
    }
    .stats-row > div {
      border-left: none !important;
      padding-left: 0 !important;
    }
  }
  ```

  (Removes the left border dividers on mobile since wrap breaks the 3-in-a-row layout, and uses gap instead.)

- [ ] **Step 4: Verify at 375px**

  Open browser DevTools → set to 375px width. Hero h1 should be readable without overflow. The 3 stats should wrap gracefully.

- [ ] **Step 5: Commit**

  ```bash
  git add src/components/splash.astro
  git commit -m "fix(mobile): hero h1 clamp and stats row wrap at small screens"
  ```

---

## Task 8 — Mobile CSS: touch targets, cursor, button sizing

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/styles/global.css`

Ensure all interactive elements have at least 44×44px touch targets. Hide the custom cursor on touch devices.

- [ ] **Step 1: Read global.css — find .btn-primary and .btn-ghost**

  Open `src/styles/global.css` and find the `.btn-primary` and `.btn-ghost` rule blocks.

- [ ] **Step 2: Add min-height to buttons**

  In the `.btn-primary` rule, if `min-height` is not set, add it. Find the `.btn-primary` block and ensure it includes:
  ```css
  min-height: 44px;
  ```

  Do the same for `.btn-ghost`:
  ```css
  min-height: 44px;
  ```

  If these classes use `padding` to define height, add `min-height: 44px;` as an additional property rather than replacing padding.

- [ ] **Step 3: Hide custom cursor on touch devices**

  Open `src/pages/index.astro`. Find the `<style>` block inside the file. Add the following rule at the end of the style block:

  ```css
  @media (hover: none) {
    #cursor-dot,
    #cursor-ring {
      display: none !important;
    }
  }
  ```

- [ ] **Step 4: Verify at 390px on touch simulation**

  In DevTools, switch to a mobile device profile (e.g., iPhone 12). Tap interactions should feel accurate. The cursor overlay should not appear.

- [ ] **Step 5: Commit**

  ```bash
  git add src/styles/global.css src/pages/index.astro
  git commit -m "fix(mobile): 44px touch targets and hide cursor on touch devices"
  ```

---

## Task 9 — Mobile CSS: Showcase device frame scaling

**Files:**
- Modify: `src/components/showcase.astro`

The CSS device frames (laptop + phone mockups) are sized with fixed px values that can overflow on small screens. Scale down the `.device-scene` container at ≤ 480px.

- [ ] **Step 1: Read showcase.astro — find the .device-scene CSS**

  Open `src/components/showcase.astro` and scroll to the `<style>` block. Find the `.device-scene` rule.

- [ ] **Step 2: Add responsive scaling**

  Find the existing `.device-scene` CSS rule (which likely has `position: absolute` and sizing). After the existing `.device-scene` rule, add a mobile override:

  ```css
  @media (max-width: 640px) {
    .device-scene {
      transform: scale(0.65);
      transform-origin: center center;
    }
  }

  @media (max-width: 480px) {
    .device-scene {
      transform: scale(0.52);
      transform-origin: center center;
    }
  }
  ```

- [ ] **Step 3: Verify at 375px**

  Open DevTools at 375px. Scroll to the Showcase section. The laptop and phone frames should be visible and not overflowing the card edges.

- [ ] **Step 4: Commit**

  ```bash
  git add src/components/showcase.astro
  git commit -m "fix(mobile): scale down device-scene frames at small screens"
  ```

---

## Task 10 — Final verification and deploy

**Files:** No changes.

- [ ] **Step 1: Full desktop scroll-through**

  Run `npm run dev`. Open at 1440px width. Scroll top to bottom:
  - [ ] Hero text drifts slightly upward as you scroll (parallax)
  - [ ] Intro section header fades up
  - [ ] Features rows appear with stagger
  - [ ] Showcase: big card appears, then 3 small cards stagger in
  - [ ] Process: horizontal scroll works, step number updates
  - [ ] Testimonials: 3 cards stagger in
  - [ ] FAQ items stagger in
  - [ ] Contact form fields visible

- [ ] **Step 2: Mobile check at 375px**

  Switch DevTools to 375px:
  - [ ] Hero h1 fits without overflow
  - [ ] Stats wrap gracefully (no horizontal overflow)
  - [ ] Process section is swipeable horizontally (native scroll snap)
  - [ ] Showcase cards don't overflow
  - [ ] All buttons are tall enough to tap
  - [ ] No custom cursor visible

- [ ] **Step 3: Reduced-motion check**

  In DevTools: Rendering → Emulate CSS media feature → prefers-reduced-motion: reduce.
  - [ ] Page loads with all content visible (no invisible elements)
  - [ ] No GSAP animations run
  - [ ] Starfield hidden (handled by existing CSS)

- [ ] **Step 4: Production build check**

  ```bash
  npm run build 2>&1 | tail -30
  ```

  Expected: build completes with no errors.

- [ ] **Step 5: Deploy to Vercel**

  ```bash
  vercel --prod
  ```

  Note the deployment URL and verify at that URL too.

- [ ] **Step 6: Final commit if any last fixes were needed**

  ```bash
  git add -p
  git commit -m "fix: final mobile and animation adjustments"
  ```
