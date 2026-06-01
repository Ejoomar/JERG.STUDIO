import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { registerScrollStagger } from "~/utils/animations";

let gsapReady = false;
try {
  gsap.registerPlugin(ScrollTrigger);
  gsapReady = true;
} catch (e) {
  console.warn("[scroll-animations] GSAP failed to initialize:", e);
}

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
// 2. FEATURES — stagger feat-items (desktop) / simple fade (mobile)
// ─────────────────────────────────────
function initFeaturesStagger() {
  registerScrollStagger(mm, reduced, {
    selector: ".js-feat-item",
    desktopTrigger: "#features-list",
  });
}

// ─────────────────────────────────────
// 3. SHOWCASE — stagger bento cards + accent line slide-in
// ─────────────────────────────────────
function initShowcaseStagger() {
  if (reduced) return;

  const cards = document.querySelectorAll<HTMLElement>(".js-bento-card");
  if (!cards.length) return;

  // Desktop: stagger completo + accent lines
  mm.add("(min-width: 769px)", () => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".bento-grid",
        start: "top 80%",
        once: true,
      },
    });

    // Cards entran con stagger
    tl.from(cards, {
      y: 60,
      opacity: 0,
      duration: 0.85,
      ease: "power3.out",
      stagger: 0.15,
    });

    // Accent lines slide-in con 0.1s de delay por card
    cards.forEach((card, i) => {
      const line = card.querySelector<HTMLElement>(".card-accent-line");
      if (!line) return;
      tl.to(
        line,
        { scaleX: 1, duration: 0.5, ease: "power2.out" },
        i * 0.15 + 0.5   // se solapan ligeramente con la entrada del card
      );
    });
  });

  // Mobile: solo fade simple
  mm.add("(max-width: 768px)", () => {
    gsap.from(cards, {
      opacity: 0,
      duration: 0.4,
      scrollTrigger: {
        trigger: ".bento-grid",
        start: "top 85%",
        once: true,
      },
    });
  });
}

// ─────────────────────────────────────
// 4. TESTIMONIALS — stagger cards (desktop) / fade (mobile)
// ─────────────────────────────────────
function initTestimonialsStagger() {
  registerScrollStagger(mm, reduced, {
    selector: ".js-testi-card",
    desktopTrigger: "#testimonials .grid",
    mobileTrigger: "#testimonials",
  });
}

// ─────────────────────────────────────
// 5. FAQ — stagger items (desktop) / fade (mobile)
// ─────────────────────────────────────
function initFaqStagger() {
  registerScrollStagger(mm, reduced, {
    selector: ".js-faq-item",
    desktopTrigger: ".faq-list",
    y: 30,
    stagger: 0.09,
    duration: 0.7,
  });
}

// ─────────────────────────────────────
// 6. INTRO — stagger children (desktop) / fade (mobile)
// ─────────────────────────────────────
function initIntroStagger() {
  if (reduced) return;

  const leftCol = document.querySelector<HTMLElement>(".js-intro-left");
  const metrics = document.querySelectorAll<HTMLElement>(".js-intro-metrics .metric-card");

  mm.add("(min-width: 769px)", () => {
    if (leftCol) {
      const children = Array.from(leftCol.children) as HTMLElement[];
      gsap.from(children, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: {
          trigger: leftCol,
          start: "top 82%",
          once: true,
        },
      });
    }

    if (metrics.length) {
      gsap.from(metrics, {
        y: 25,
        opacity: 0,
        duration: 0.75,
        ease: "power3.out",
        stagger: 0.14,
        scrollTrigger: {
          trigger: ".js-intro-metrics",
          start: "top 82%",
          once: true,
        },
      });
    }
  });

  mm.add("(max-width: 768px)", () => {
    const targets = [
      leftCol,
      ...Array.from(metrics),
    ].filter((el): el is HTMLElement => el !== null);
    if (!targets.length) return;
    gsap.from(targets, {
      opacity: 0,
      duration: 0.4,
      scrollTrigger: {
        trigger: "#intro",
        start: "top 85%",
        once: true,
      },
    });
  });
}

// ─────────────────────────────────────
// 7. CONTACT FORM — stagger fields (desktop) / fade (mobile)
// ─────────────────────────────────────
function initContactStagger() {
  registerScrollStagger(mm, reduced, {
    selector: ".js-cf-field",
    desktopTrigger: "#contact",
    y: 25,
    stagger: 0.1,
    duration: 0.7,
    desktopStart: "top 80%",
  });
}

// ─────────────────────────────────────
// 8. PRICING — stagger cards (desktop) / fade (mobile)
// ─────────────────────────────────────
function initPricingStagger() {
  registerScrollStagger(mm, reduced, {
    selector: ".js-pricing-card",
    desktopTrigger: ".pricing-grid",
    y: 40,
    stagger: 0.15,
    duration: 0.85,
  });
}

// ─────────────────────────────────────
// INIT
// ─────────────────────────────────────
export function initScrollAnimations() {
  if (!gsapReady) return;
  initHeroScrollParallax();
  initIntroStagger();
  initFeaturesStagger();
  initShowcaseStagger();
  initTestimonialsStagger();
  initPricingStagger();
  initFaqStagger();
  initContactStagger();
  window.addEventListener("load", () => {
    try { ScrollTrigger.refresh(); } catch (_) {}
  });
}
