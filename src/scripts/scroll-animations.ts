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
