'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

/**
 * Animates a number from 0 to `value` with GSAP when it scrolls into view.
 * Renders the final value server-side so prerendered HTML stays correct;
 * the count-up only plays client-side.
 */
export function CountUp({
  value,
  duration = 1.1,
  className,
  style,
}: {
  value: number;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const state = { n: 0 };
    const tween = gsap.to(state, {
      n: value,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        el.textContent = String(Math.round(state.n));
      },
    });

    return () => {
      tween.kill();
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className} style={style}>
      {value}
    </span>
  );
}
