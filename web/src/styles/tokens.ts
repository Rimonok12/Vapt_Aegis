/**
 * Design tokens.
 *
 * These are plain string/number constants so yak can inline them at build time
 * (cross-file resolution from a normal `.ts` module). Colours themselves live in
 * CSS custom properties declared in `globals.ts` so light/dark switching costs
 * nothing at runtime.
 */

export const fontSans = 'var(--font-geist-sans)';
export const fontMono = 'var(--font-geist-mono)';

export const radiusSm = '6px';
export const radiusMd = '10px';
export const radiusLg = '14px';
export const radiusXl = '20px';

export const space1 = '4px';
export const space2 = '8px';
export const space3 = '12px';
export const space4 = '16px';
export const space5 = '20px';
export const space6 = '24px';
export const space8 = '32px';
export const space10 = '40px';
export const space12 = '48px';
export const space16 = '64px';

export const textXs = '0.75rem';
export const textSm = '0.8125rem';
export const textBase = '0.875rem';
export const textLg = '1rem';
export const textXl = '1.125rem';
export const text2xl = '1.5rem';
export const text3xl = '1.875rem';
export const text4xl = '2.25rem';

export const shellMax = '1400px';
export const sidebarWidth = '264px';
export const sidebarWidthCollapsed = '68px';

export const easeOut = 'cubic-bezier(0.16, 1, 0.3, 1)';
export const durationFast = '120ms';
export const durationBase = '180ms';

/** Severity palette — also mirrored as CSS custom properties for charts. */
export const severityVar = {
  critical: 'var(--aq-sev-critical)',
  high: 'var(--aq-sev-high)',
  medium: 'var(--aq-sev-medium)',
  low: 'var(--aq-sev-low)',
  info: 'var(--aq-sev-info)',
} as const;
