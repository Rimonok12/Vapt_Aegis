'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Wraps children in a scroll-triggered reveal (fade + rise + slight blur-out).
 * Children can opt into staggered entrance by tagging elements with
 * `data-reveal-item` — they animate individually when the block enters view.
 */
export function Reveal({
  children,
  stagger = 0.08,
  y = 26,
  className,
  style,
}: {
  children: ReactNode;
  stagger?: number;
  y?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const items = el.querySelectorAll<HTMLElement>('[data-reveal-item]');
    const targets: HTMLElement[] = items.length > 0 ? Array.from(items) : [el];

    const tween = gsap.fromTo(
      targets,
      { y, opacity: 0, filter: 'blur(6px)' },
      {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.75,
        ease: 'power3.out',
        stagger,
        scrollTrigger: { trigger: el, start: 'top 86%', once: true },
      }
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      gsap.set(targets, { clearProps: 'all' });
    };
  }, [stagger, y]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
