import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const mm = gsap.matchMedia();

// ═══════════════════════════════════════════════
// 1. PAGE INTRO CURTAIN
// ═══════════════════════════════════════════════
function initCurtain() {
  const curtain = document.getElementById("curtain");
  if (!curtain) return;

  if (reduced) {
    curtain.style.display = "none";
    return;
  }

  document.body.style.overflow = "hidden";

  const left = curtain.querySelector<HTMLElement>(".curtain-left");
  const right = curtain.querySelector<HTMLElement>(".curtain-right");

  gsap.to(left, {
    x: "-100%",
    duration: 1.1,
    ease: "expo.inOut",
    delay: 0.15,
  });
  gsap.to(
    right,
    {
      x: "100%",
      duration: 1.1,
      ease: "expo.inOut",
      delay: 0.15,
      onComplete: () => {
        curtain.style.display = "none";
        document.body.style.overflow = "";
      },
    },
  );
}

// ═══════════════════════════════════════════════
// 2. CUSTOM CURSOR (desktop / pointer: fine only)
// ═══════════════════════════════════════════════
function initCursor() {
  const dot = document.getElementById("cursor-dot");
  const ring = document.getElementById("cursor-ring");
  if (!dot || !ring) return;
  if (!window.matchMedia("(pointer: fine)").matches) return;

  document.documentElement.classList.add("custom-cursor");

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  const LERP = 0.1;
  let rafId = 0;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    gsap.set(dot, { x: mouseX, y: mouseY });
  });

  function lerpRing() {
    ringX += (mouseX - ringX) * LERP;
    ringY += (mouseY - ringY) * LERP;
    gsap.set(ring, { x: ringX, y: ringY });
    rafId = requestAnimationFrame(lerpRing);
  }
  lerpRing();

  // Scale on interactive elements
  const interactors = document.querySelectorAll(
    "a, button, [role=button], .bento-card, .faq-btn",
  );
  interactors.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      gsap.to(ring, { scale: 2.5, opacity: 0.45, duration: 0.3 });
      gsap.to(dot, { scale: 0, duration: 0.2 });
    });
    el.addEventListener("mouseleave", () => {
      gsap.to(ring, { scale: 1, opacity: 1, duration: 0.3 });
      gsap.to(dot, { scale: 1, duration: 0.2 });
    });
  });

  document.addEventListener("mouseleave", () => {
    gsap.to([dot, ring], { opacity: 0, duration: 0.25 });
  });
  document.addEventListener("mouseenter", () => {
    gsap.to([dot, ring], { opacity: 1, duration: 0.25 });
  });
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

  // Desktop: mouse parallax
  mm.add("(pointer: fine)", () => {
    hero.addEventListener("mousemove", (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      const xPct = (e.clientX - rect.left) / rect.width - 0.5;
      const yPct = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(glow, {
        x: xPct * 90,
        y: yPct * 45,
        duration: 1.4,
        ease: "power2.out",
      });
    });
    hero.addEventListener("mouseleave", () => {
      gsap.to(glow, { x: 0, y: 0, duration: 2, ease: "power2.out" });
    });
  });

  // Mobile: gyroscope
  mm.add("(pointer: coarse)", () => {
    if (!window.DeviceOrientationEvent) return;
    window.addEventListener(
      "deviceorientation",
      (e: DeviceOrientationEvent) => {
        const g = Math.max(-30, Math.min(30, e.gamma ?? 0));
        const b = Math.max(-30, Math.min(30, (e.beta ?? 0) - 45));
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
    const target = parseFloat(el.dataset.count ?? "0");
    const suffix = el.dataset.suffix ?? "";
    const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;

    // Show 0 immediately (avoids static value flash)
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
// 6. 3D TILT ON BENTO CARDS
// ═══════════════════════════════════════════════
function initCardTilt() {
  if (reduced) return;

  document.querySelectorAll<HTMLElement>(".bento-card").forEach((card) => {
    const shine = card.querySelector<HTMLElement>(".card-shine");

    function applyTilt(xPct: number, yPct: number) {
      gsap.to(card, {
        rotateX: -yPct * 8,
        rotateY: xPct * 12,
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
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.6,
        ease: "power3.out",
      });
      if (shine) gsap.to(shine, { opacity: 0, duration: 0.4 });
    }

    // Desktop
    card.addEventListener("mousemove", (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      applyTilt(
        (e.clientX - rect.left) / rect.width - 0.5,
        (e.clientY - rect.top) / rect.height - 0.5,
      );
    });
    card.addEventListener("mouseleave", resetTilt);

    // Mobile touch
    card.addEventListener(
      "touchmove",
      (e: TouchEvent) => {
        const t = e.touches[0];
        const rect = card.getBoundingClientRect();
        applyTilt(
          (t.clientX - rect.left) / rect.width - 0.5,
          (t.clientY - rect.top) / rect.height - 0.5,
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

    btn.addEventListener("mouseenter", () => {
      bounds = btn.getBoundingClientRect();
    });

    btn.addEventListener("mousemove", (e: MouseEvent) => {
      if (!bounds) return;
      const xPct =
        (e.clientX - bounds.left - bounds.width / 2) / (bounds.width / 2);
      const yPct =
        (e.clientY - bounds.top - bounds.height / 2) / (bounds.height / 2);
      gsap.to(btn, {
        x: xPct * 10,
        y: yPct * 6,
        duration: 0.35,
        ease: "power2.out",
      });
    });

    btn.addEventListener("mouseleave", () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.4)",
      });
    });
  });
}

// ═══════════════════════════════════════════════
// 8. FEATURES SPOTLIGHT CURSOR
// ═══════════════════════════════════════════════
function initSpotlight() {
  const grid = document.getElementById("features-grid");
  const overlay = document.getElementById("features-spotlight");
  if (!grid || !overlay) return;

  function updateSpot(x: number, y: number) {
    overlay.style.setProperty("--spot-x", x + "px");
    overlay.style.setProperty("--spot-y", y + "px");
  }

  mm.add("(pointer: fine)", () => {
    grid.addEventListener("mousemove", (e: MouseEvent) => {
      const rect = (grid.parentElement ?? grid).getBoundingClientRect();
      updateSpot(e.clientX - rect.left, e.clientY - rect.top);
      gsap.to(overlay, { opacity: 1, duration: 0.3 });
    });
    grid.addEventListener("mouseleave", () => {
      gsap.to(overlay, { opacity: 0, duration: 0.5 });
    });
  });

  mm.add("(pointer: coarse)", () => {
    grid.addEventListener(
      "touchmove",
      (e: TouchEvent) => {
        const t = e.touches[0];
        const rect = (grid.parentElement ?? grid).getBoundingClientRect();
        updateSpot(t.clientX - rect.left, t.clientY - rect.top);
        gsap.set(overlay, { opacity: 0.8 });
      },
      { passive: true },
    );
    grid.addEventListener("touchend", () => {
      gsap.to(overlay, { opacity: 0, duration: 0.5 });
    });
  });
}

// ═══════════════════════════════════════════════
// 9. SECTION DOTS NAV
// ═══════════════════════════════════════════════
function initDotsNav() {
  const nav = document.getElementById("dots-nav");
  if (!nav) return;

  const sections = [
    { id: "intro",    label: "Intro" },
    { id: "features", label: "Servicios" },
    { id: "process",  label: "Proceso" },
    { id: "showcase", label: "Portfolio" },
    { id: "faq",      label: "FAQ" },
    { id: "contact",  label: "Contacto" },
  ];

  // Build dot elements
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

  function setActive(id: string) {
    dots.forEach((d) => {
      d.classList.toggle("is-active", d.dataset.dotSection === id);
    });
  }

  sections.forEach(({ id }) => {
    const el = document.getElementById(id);
    if (!el) return;
    ScrollTrigger.create({
      trigger: el,
      start: "top center",
      end: "bottom center",
      onEnter: () => setActive(id),
      onEnterBack: () => setActive(id),
    });
  });
}

// ═══════════════════════════════════════════════
// 10. HORIZONTAL SCROLL — PROCESS SECTION
// ═══════════════════════════════════════════════
function initProcessHorizontal() {
  if (reduced) return;

  mm.add("(min-width: 768px)", () => {
    const pinZone = document.getElementById("process-pin-zone");
    const track = document.getElementById("process-track");
    const counter = document.getElementById("process-step-num");
    if (!pinZone || !track) return;

    const labels = ["01", "02", "03", "04"];

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
        onUpdate: (self) => {
          if (!counter) return;
          const idx = Math.min(3, Math.floor(self.progress * 4 + 0.05));
          counter.textContent = labels[idx];
        },
      },
    });
  });
}

// ═══════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════
function init() {
  initCurtain();
  initCursor();
  initProgressBar();
  initHeroParallax();
  initCounters();
  initCardTilt();
  initMagnetic();
  initSpotlight();
  initDotsNav();
  initProcessHorizontal();

  // Refresh ScrollTrigger after all assets load
  window.addEventListener("load", () => ScrollTrigger.refresh());
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
