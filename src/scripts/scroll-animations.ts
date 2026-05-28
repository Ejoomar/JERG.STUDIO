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
// 6. INTRO — stagger children of left col + metric cards
// ─────────────────────────────────────
function initIntroStagger() {
  if (reduced) return;

  const leftCol = document.querySelector<HTMLElement>(".js-intro-left");
  const metrics = document.querySelectorAll<HTMLElement>(".js-intro-metrics .metric-card");

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
}

// ─────────────────────────────────────
// 7. CONTACT FORM — stagger field groups
// ─────────────────────────────────────
function initContactStagger() {
  if (reduced) return;

  const fields = document.querySelectorAll<HTMLElement>(".js-cf-field");
  if (!fields.length) return;

  gsap.from(fields, {
    y: 25,
    opacity: 0,
    duration: 0.7,
    ease: "power3.out",
    stagger: 0.1,
    scrollTrigger: {
      trigger: "#contact",
      start: "top 80%",
      once: true,
    },
  });
}

// ─────────────────────────────────────
// INIT
// ─────────────────────────────────────
export function initScrollAnimations() {
  initHeroScrollParallax();
  initIntroStagger();
  initFeaturesStagger();
  initShowcaseStagger();
  initTestimonialsStagger();
  initFaqStagger();
  initContactStagger();
  window.addEventListener("load", () => ScrollTrigger.refresh());
}
