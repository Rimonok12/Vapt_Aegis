'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { gsap } from 'gsap';

/**
 * GSAP entrance stagger for app pages: direct children rise + fade in on
 * mount (and on route change when keyed by pathname). No-op for users who
 * prefer reduced motion.
 */
export function PageEnter({
  children,
  style,
  className,
  stagger = 0.07,
}: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  stagger?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const tween = gsap.from(el.children, {
      y: 14,
      opacity: 0,
      duration: 0.55,
      stagger,
      ease: 'power3.out',
      clearProps: 'all',
    });

    return () => {
      tween.kill();
    };
  }, [stagger]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
