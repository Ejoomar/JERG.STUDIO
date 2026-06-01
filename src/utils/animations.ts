import { gsap } from "gsap";

export interface StaggerConfig {
  selector: string;
  desktopTrigger: string;
  mobileTrigger?: string;
  y?: number;
  stagger?: number;
  duration?: number;
  desktopStart?: string;
}

export function registerScrollStagger(
  mm: ReturnType<typeof gsap.matchMedia>,
  reduced: boolean,
  config: StaggerConfig,
): void {
  if (reduced) return;

  const items = document.querySelectorAll<HTMLElement>(config.selector);
  if (!items.length) return;

  const {
    desktopTrigger,
    mobileTrigger = desktopTrigger,
    y = 40,
    stagger = 0.12,
    duration = 0.8,
    desktopStart = "top 82%",
  } = config;

  mm.add("(min-width: 769px)", () => {
    gsap.from(items, {
      y,
      opacity: 0,
      duration,
      ease: "power3.out",
      stagger,
      scrollTrigger: {
        trigger: desktopTrigger,
        start: desktopStart,
        once: true,
      },
    });
  });

  mm.add("(max-width: 768px)", () => {
    gsap.from(items, {
      opacity: 0,
      duration: 0.4,
      scrollTrigger: {
        trigger: mobileTrigger,
        start: "top 85%",
        once: true,
      },
    });
  });
}
