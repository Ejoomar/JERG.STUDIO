import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const mm = gsap.matchMedia();

// Helper — broadcast which section is active
function dispatchSection(id: string) {
  window.dispatchEvent(new CustomEvent("section:active", { detail: { id } }));
}

// ═══════════════════════════════════════════════
// 1. PAGE INTRO CURTAIN  →  returns Promise<void>
// ═══════════════════════════════════════════════
function initCurtain(): Promise<void> {
  return new Promise((resolve) => {
    const curtain = document.getElementById("curtain");
    if (!curtain) { resolve(); return; }

    if (reduced) {
      curtain.style.display = "none";
      resolve();
      return;
    }

    document.body.style.overflow = "hidden";

    const left  = curtain.querySelector<HTMLElement>(".curtain-left");
    const right = curtain.querySelector<HTMLElement>(".curtain-right");

    gsap.to(left, { x: "-100%", duration: 1.1, ease: "expo.inOut", delay: 0.15 });
    gsap.to(right, {
      x: "100%",
      duration: 1.1,
      ease: "expo.inOut",
      delay: 0.15,
      onComplete: () => {
        curtain.style.display = "none";
        document.body.style.overflow = "";
        resolve();
      },
    });
  });
}

// ═══════════════════════════════════════════════
// 2. CUSTOM CURSOR — Opción A: código flotante
//    Dot marfil sutil como puntero guía +
//    caracteres de código que flotan y se desvanecen
// ═══════════════════════════════════════════════
function initCursor() {
  const dot = document.getElementById("cursor-dot");
  if (!dot) return;
  if (!window.matchMedia("(pointer: fine)").matches) return;

  document.documentElement.classList.add("custom-cursor");

  const CHARS = ["{}", "</>", "( )", "[]", "=>", "//", "_;", "/*", "fn", "&&", "==", "++"];
  const codeEls = Array.from(document.querySelectorAll<HTMLElement>(".c-code"));
  const active  = new Array(codeEls.length).fill(false);

  let mouseX   = window.innerWidth  / 2;
  let mouseY   = window.innerHeight / 2;
  let lastSpawn = 0;

  // Track mouse — dot follows instantly
  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    gsap.set(dot, { x: mouseX, y: mouseY });
  });

  // Spawn a floating code character near the cursor
  function spawnChar(now: number) {
    if (now - lastSpawn < 90) return;
    const slot = active.findIndex((a) => !a);
    if (slot < 0) return;

    active[slot] = true;
    lastSpawn    = now;

    const el    = codeEls[slot];
    const char  = CHARS[Math.floor(Math.random() * CHARS.length)];
    const ox    = (Math.random() - 0.5) * 22;  // horizontal scatter
    const drift = (Math.random() - 0.5) * 14;  // horizontal drift while rising
    const rise  = 20 + Math.random() * 22;      // how far up it floats

    el.textContent = char;
    gsap.set(el, { x: mouseX + ox, y: mouseY, opacity: 0.75, scale: 0.85 });
    gsap.to(el, {
      x:        mouseX + ox + drift,
      y:        mouseY - rise,
      opacity:  0,
      scale:    0.6,
      duration: 0.8 + Math.random() * 0.3,
      ease:     "power2.out",
      onComplete: () => { active[slot] = false; },
    });
  }

  // Drive spawning via rAF so we always have current mouse pos
  function spawnLoop(now: number) {
    spawnChar(now);
    requestAnimationFrame(spawnLoop);
  }
  requestAnimationFrame(spawnLoop);

  // Interactors — dot expands subtly to signal clickable
  const interactors = document.querySelectorAll(
    "a:not(.btn-magnetic), button:not(.btn-magnetic), [role=button]:not(.btn-magnetic), .bento-card, .faq-btn",
  );
  interactors.forEach((el) => {
    el.addEventListener("mouseenter", () =>
      gsap.to(dot, { scale: 3, opacity: 0.55, duration: 0.22, ease: "power2.out" }),
    );
    el.addEventListener("mouseleave", () =>
      gsap.to(dot, { scale: 1, opacity: 1, duration: 0.22 }),
    );
  });

  // Magnetic buttons — dim dot while button animates
  document.querySelectorAll(".btn-magnetic").forEach((el) => {
    el.addEventListener("mouseenter", () => gsap.to(dot, { opacity: 0.3, duration: 0.2 }));
    el.addEventListener("mouseleave", () => gsap.to(dot, { opacity: 1,   duration: 0.2 }));
  });

  document.addEventListener("mouseleave", () => gsap.to(dot, { opacity: 0, duration: 0.25 }));
  document.addEventListener("mouseenter", () => gsap.to(dot, { opacity: 1, duration: 0.25 }));
}

// ═══════════════════════════════════════════════
// 3. SCROLL PROGRESS BAR
// ═══════════════════════════════════════════════
function initProgressBar() {
  const bar = document.getElementById("scroll-progress");
  if (!bar) return;

  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => {
      gsap.set(bar, { scaleX: self.progress, transformOrigin: "left center" });
    },
  });
}

// ═══════════════════════════════════════════════
// 4. HERO PARALLAX GLOW
// ═══════════════════════════════════════════════
function initHeroParallax() {
  if (reduced) return;
  const glow = document.getElementById("hero-glow");
  if (!glow) return;
  const hero = glow.closest("section") as HTMLElement | null;
  if (!hero) return;

  mm.add("(pointer: fine)", () => {
    hero.addEventListener("mousemove", (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      const xPct = (e.clientX - rect.left) / rect.width  - 0.5;
      const yPct = (e.clientY - rect.top)  / rect.height - 0.5;
      gsap.to(glow, { x: xPct * 90, y: yPct * 45, duration: 1.4, ease: "power2.out" });
    });
    hero.addEventListener("mouseleave", () => {
      gsap.to(glow, { x: 0, y: 0, duration: 2, ease: "power2.out" });
    });
  });

  mm.add("(pointer: coarse)", () => {
    if (!window.DeviceOrientationEvent) return;
    window.addEventListener(
      "deviceorientation",
      (e: DeviceOrientationEvent) => {
        const g = Math.max(-30, Math.min(30, e.gamma ?? 0));
        const b = Math.max(-30, Math.min(30, (e.beta  ?? 0) - 45));
        gsap.to(glow, {
          x: (g / 30) * 45,
          y: (b / 30) * 20,
          duration: 1.6,
          ease: "power2.out",
        });
      },
      { passive: true },
    );
  });
}

// ═══════════════════════════════════════════════
// 5. NUMBER COUNTERS
// ═══════════════════════════════════════════════
function initCounters() {
  if (reduced) return;

  document.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
    const target   = parseFloat(el.dataset.count ?? "0");
    const suffix   = el.dataset.suffix ?? "";
    const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;

    el.textContent = decimals > 0 ? `0.${"0".repeat(decimals)}${suffix}` : `0${suffix}`;

    const obj = { val: 0 };

    ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: target,
          duration: 1.8,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent =
              (decimals > 0
                ? obj.val.toFixed(decimals)
                : Math.round(obj.val).toString()) + suffix;
          },
        });
      },
    });
  });
}

// ═══════════════════════════════════════════════
// 6. 3D TILT ON BENTO CARDS  (increased intensity)
// ═══════════════════════════════════════════════
function initCardTilt() {
  if (reduced) return;

  document.querySelectorAll<HTMLElement>(".bento-card").forEach((card) => {
    const shine = card.querySelector<HTMLElement>(".card-shine");

    function applyTilt(xPct: number, yPct: number) {
      gsap.to(card, {
        rotateX: -yPct * 10,
        rotateY:  xPct * 15,
        transformPerspective: 900,
        duration: 0.4,
        ease: "power2.out",
      });
      if (shine) {
        card.style.setProperty("--shine-x", (xPct * 50 + 50) + "%");
        card.style.setProperty("--shine-y", (yPct * 50 + 50) + "%");
        gsap.to(shine, { opacity: 1, duration: 0.3 });
      }
    }

    function resetTilt() {
      gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: "power3.out" });
      if (shine) gsap.to(shine, { opacity: 0, duration: 0.4 });
    }

    card.addEventListener("mousemove", (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      applyTilt(
        (e.clientX - rect.left) / rect.width  - 0.5,
        (e.clientY - rect.top)  / rect.height - 0.5,
      );
    });
    card.addEventListener("mouseleave", resetTilt);

    card.addEventListener(
      "touchmove",
      (e: TouchEvent) => {
        const t = e.touches[0];
        const rect = card.getBoundingClientRect();
        applyTilt(
          (t.clientX - rect.left) / rect.width  - 0.5,
          (t.clientY - rect.top)  / rect.height - 0.5,
        );
      },
      { passive: true },
    );
    card.addEventListener("touchend", resetTilt);
  });
}

// ═══════════════════════════════════════════════
// 7. MAGNETIC BUTTONS (desktop only)
// ═══════════════════════════════════════════════
function initMagnetic() {
  if (reduced) return;
  if (!window.matchMedia("(pointer: fine)").matches) return;

  document.querySelectorAll<HTMLElement>(".btn-magnetic").forEach((btn) => {
    let bounds: DOMRect;

    btn.addEventListener("mouseenter", () => { bounds = btn.getBoundingClientRect(); });

    btn.addEventListener("mousemove", (e: MouseEvent) => {
      if (!bounds) return;
      const xPct = (e.clientX - bounds.left - bounds.width  / 2) / (bounds.width  / 2);
      const yPct = (e.clientY - bounds.top  - bounds.height / 2) / (bounds.height / 2);
      gsap.to(btn, { x: xPct * 10, y: yPct * 6, duration: 0.35, ease: "power2.out" });
    });

    btn.addEventListener("mouseleave", () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
    });
  });
}

// ═══════════════════════════════════════════════
// 8. CENTRALIZED SECTION WATCHER
//    Single ScrollTrigger per section.
//    Consumers subscribe via window "section:active" event.
// ═══════════════════════════════════════════════
function initSectionWatcher() {
  const ids = ["intro", "features", "process", "showcase", "testimonials", "faq", "contact"];

  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    ScrollTrigger.create({
      trigger: el,
      start: "top center",
      end: "bottom center",
      onEnter:     () => dispatchSection(id),
      onEnterBack: () => dispatchSection(id),
    });
  });
}

// ═══════════════════════════════════════════════
// 10. SECTION DOTS NAV
//     Uses "section:active" event from sectionWatcher
// ═══════════════════════════════════════════════
function initDotsNav() {
  const nav = document.getElementById("dots-nav");
  if (!nav) return;

  const sections = [
    { id: "intro",    label: "Intro" },
    { id: "features", label: "Servicios" },
    { id: "process",  label: "Proceso" },
    { id: "showcase", label: "Portafolio" },
    { id: "faq",      label: "FAQ" },
    { id: "contact",  label: "Contacto" },
  ];

  sections.forEach(({ id, label }) => {
    const a = document.createElement("a");
    a.href = "#" + id;
    a.dataset.dotSection = id;
    a.className = "nav-dot";
    a.setAttribute("aria-label", label);
    a.title = label;
    nav.appendChild(a);
  });

  const dots = nav.querySelectorAll<HTMLElement>("[data-dot-section]");

  window.addEventListener("section:active", (e) => {
    const id = (e as CustomEvent<{ id: string }>).detail.id;
    dots.forEach((d) => {
      d.classList.toggle("is-active", d.dataset.dotSection === id);
    });
  });
}

// ═══════════════════════════════════════════════
// 11. HEADER NAV INDICATOR
//     Highlights the matching nav link as you scroll
// ═══════════════════════════════════════════════
function initNavIndicator() {
  const navLinks = document.querySelectorAll<HTMLAnchorElement>(
    "#page-header nav a[href^='#']",
  );
  if (!navLinks.length) return;

  window.addEventListener("section:active", (e) => {
    const id = (e as CustomEvent<{ id: string }>).detail.id;
    navLinks.forEach((link) => {
      const target = link.getAttribute("href")?.slice(1) ?? "";
      link.classList.toggle("nav-link-active", target === id);
    });
  });
}

// ═══════════════════════════════════════════════
// 12. HORIZONTAL SCROLL — PROCESS SECTION
// ═══════════════════════════════════════════════
function initProcessHorizontal() {
  if (reduced) return;

  mm.add("(min-width: 768px)", () => {
    const pinZone = document.getElementById("process-pin-zone");
    const track   = document.getElementById("process-track");
    const counter = document.getElementById("process-step-num");
    if (!pinZone || !track) return;

    const labels = ["01", "02", "03", "04"];
    const steps  = Array.from(track.querySelectorAll<HTMLElement>(".process-step"));
    const revealed = new Set<number>();

    // ── Set initial hidden state for each step's content ──
    steps.forEach((step) => {
      const bgNum = step.querySelector<HTMLElement>(".step-bg-num");
      const inner = step.querySelector<HTMLElement>(".step-inner");
      if (bgNum) gsap.set(bgNum, { opacity: 0, scale: 1.08 });
      if (inner) gsap.set(inner, { opacity: 0, y: 28 });
    });

    // ── Reveal a single step (runs once per step) ──
    function revealStep(i: number) {
      if (revealed.has(i) || i >= steps.length) return;
      revealed.add(i);
      const step  = steps[i];
      const bgNum = step.querySelector<HTMLElement>(".step-bg-num");
      const inner = step.querySelector<HTMLElement>(".step-inner");
      gsap.timeline()
        .to(bgNum ?? [], { opacity: 1, scale: 1, duration: 0.7,  ease: "power2.out" }, 0)
        .to(inner ?? [], { opacity: 1, y: 0,     duration: 0.65, ease: "power3.out" }, 0.25);
    }

    gsap.to(track, {
      x: () => -(track.scrollWidth - pinZone.clientWidth),
      ease: "none",
      scrollTrigger: {
        trigger: pinZone,
        start: "top top",
        end: () => "+=" + (track.scrollWidth - pinZone.clientWidth),
        pin: true,
        scrub: 1.2,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onEnter: () => revealStep(0),
        onUpdate: (self) => {
          if (!counter) return;
          const idx = Math.min(3, Math.floor(self.progress * 4 + 0.05));
          counter.textContent = labels[idx];
          revealStep(idx);
        },
      },
    });
  });
}

// ═══════════════════════════════════════════════
// 13. SPLIT TEXT REVEAL
//     Wraps words in .word-outer > .word-inner and
//     animates them up from behind a clip mask.
//     Gradient-text spans are preserved intact.
// ═══════════════════════════════════════════════
function initSplitText() {
  if (reduced) return;

  document.querySelectorAll<HTMLElement>("[data-split]").forEach((el) => {
    // Step 1: Replace .gradient-text children with markers
    const gradientSpans = Array.from(el.querySelectorAll<HTMLElement>(".gradient-text"));
    const markers = new Map<HTMLElement, HTMLElement>(); // placeholder → original

    gradientSpans.forEach((span) => {
      if (!span.parentNode) return;
      const placeholder = document.createElement("span");
      placeholder.className = "__split-marker__";
      span.parentNode.replaceChild(placeholder, span);
      markers.set(placeholder, span);
    });

    // Step 2: Split text nodes word-by-word
    const wordInners: HTMLElement[] = [];

    function splitNode(node: Node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text   = node.textContent ?? "";
        const parts  = text.split(/(\s+)/);
        const frag   = document.createDocumentFragment();

        parts.forEach((part) => {
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part));
          } else if (part) {
            const outer = document.createElement("span");
            outer.className = "word-outer";
            const inner = document.createElement("span");
            inner.className = "word-inner";
            inner.textContent = part;
            outer.appendChild(inner);
            frag.appendChild(outer);
            wordInners.push(inner);
          }
        });
        node.parentNode?.replaceChild(frag, node);
      } else if ((node as HTMLElement).classList?.contains("__split-marker__")) {
        // Leave markers in place — they'll be replaced in step 3
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Recurse into other element children (e.g. <br> has no text children)
        Array.from(node.childNodes).forEach(splitNode);
      }
    }

    Array.from(el.childNodes).forEach(splitNode);

    // Step 3: Restore gradient-text spans wrapped as word units
    markers.forEach((originalSpan, placeholder) => {
      if (!placeholder.parentNode) return;
      const outer = document.createElement("span");
      outer.className = "word-outer";
      const inner = document.createElement("span");
      inner.className = "word-inner";
      inner.appendChild(originalSpan);
      outer.appendChild(inner);
      placeholder.parentNode.replaceChild(outer, placeholder);
      wordInners.push(inner);
    });

    if (!wordInners.length) return;

    // Step 4: Animate
    gsap.fromTo(
      wordInners,
      { y: "110%", opacity: 0 },
      {
        y: "0%",
        opacity: 1,
        duration: 0.75,
        ease: "power3.out",
        stagger: 0.045,
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          once: true,
        },
      },
    );
  });
}

// ═══════════════════════════════════════════════
// 14. SCRAMBLE TEXT
//     Characters randomize, then resolve to real text
// ═══════════════════════════════════════════════
function initScrambleText() {
  if (reduced) return;

  const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#$%&@";

  document.querySelectorAll<HTMLElement>("[data-scramble]").forEach((el) => {
    const original = el.textContent ?? "";

    ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () => {
        const DURATION = 900;
        const startTime = performance.now();

        function step(now: number) {
          const t        = Math.min((now - startTime) / DURATION, 1);
          const resolved = Math.floor(t * original.length);

          let result = "";
          for (let i = 0; i < original.length; i++) {
            if (i < resolved || original[i] === " " || original[i] === "\n") {
              result += original[i];
            } else {
              result += CHARS[Math.floor(Math.random() * CHARS.length)];
            }
          }
          el.textContent = result;
          if (t < 1) requestAnimationFrame(step);
          else el.textContent = original;
        }

        requestAnimationFrame(step);
      },
    });
  });
}

// ═══════════════════════════════════════════════
// 15. ANIMATED GRAIN (CSS-driven, JS just respects reduced-motion)
// ═══════════════════════════════════════════════
function initGrain() {
  if (!reduced) return;
  const grain = document.getElementById("grain-overlay");
  if (grain) grain.style.display = "none";
}

// ═══════════════════════════════════════════════
// INIT — curtain returns a Promise so text effects
// wait for it to open before running
// ═══════════════════════════════════════════════
function init() {
  const curtainDone = initCurtain();

  // Fire immediately — independent of curtain
  initCursor();
  initProgressBar();
  initHeroParallax();
  initCounters();
  initCardTilt();
  initMagnetic();
  initSectionWatcher();
  initDotsNav();
  initNavIndicator();
  initProcessHorizontal();
  initGrain();

  // Text effects run after curtain opens
  curtainDone.then(() => {
    initSplitText();
    initScrambleText();
    ScrollTrigger.refresh();
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
