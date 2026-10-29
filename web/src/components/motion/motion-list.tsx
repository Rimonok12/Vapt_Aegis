'use client';

import { useAutoAnimate } from '@formkit/auto-animate/react';
import type { ReactNode } from 'react';

/**
 * Drop-in animated list: items fade/slide automatically when added, removed
 * or reordered (AutoAnimate). Used for report grids, member tables, uploads.
 */
export function MotionList({
  children,
  duration = 320,
  className,
  style,
}: {
  children: ReactNode;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [ref] = useAutoAnimate<HTMLDivElement>({
    duration,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  });

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
