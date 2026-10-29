import { globalStyle, keyframes } from '@yak/react';
import { fontMono, fontSans, radiusMd, shellMax, textBase } from './tokens';

const shellFadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const aqSpin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

/**
 * Global stylesheet — extracted at build time, no runtime cost.
 * Imported once from the root layout.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-expressions -- yak extracts this tagged template at build time
globalStyle`
  :root {
    color-scheme: light;

    --aq-bg: oklch(0.99 0.002 255);
    --aq-fg: oklch(0.21 0.02 255);
    --aq-muted: oklch(0.955 0.005 255);
    --aq-muted-fg: oklch(0.48 0.015 255);
    --aq-card: oklch(1 0 0);
    --aq-card-fg: oklch(0.21 0.02 255);
    --aq-border: oklch(0.9 0.006 255);
    --aq-border-strong: oklch(0.83 0.01 255);
    --aq-input: oklch(0.9 0.006 255);
    --aq-ring: oklch(0.55 0.19 255);
    --aq-accent: oklch(0.94 0.03 255);
    --aq-accent-fg: oklch(0.28 0.06 255);
    --aq-primary: oklch(0.5 0.19 258);
    --aq-primary-hover: oklch(0.44 0.19 258);
    --aq-primary-fg: oklch(0.98 0.005 255);
    --aq-primary-soft: oklch(0.5 0.19 258 / 0.12);
    --aq-destructive: oklch(0.58 0.22 25);
    --aq-destructive-fg: oklch(0.98 0.005 255);
    --aq-success: oklch(0.6 0.15 152);
    --aq-warning: oklch(0.72 0.15 75);

    --aq-sev-critical: oklch(0.53 0.23 22);
    --aq-sev-high: oklch(0.66 0.19 42);
    --aq-sev-medium: oklch(0.78 0.16 85);
    --aq-sev-low: oklch(0.72 0.14 195);
    --aq-sev-info: oklch(0.72 0.02 255);

    --aq-shadow-sm: 0 1px 2px oklch(0.2 0.02 255 / 0.06);
    --aq-shadow-md: 0 4px 18px -6px oklch(0.2 0.02 255 / 0.16);
    --aq-shadow-lg: 0 18px 48px -20px oklch(0.2 0.02 255 / 0.28);

    --aq-grid: oklch(0.92 0.006 255);
  }

  :root[data-theme="dark"] {
    color-scheme: dark;

    --aq-bg: oklch(0.17 0.014 258);
    --aq-fg: oklch(0.96 0.006 255);
    --aq-muted: oklch(0.24 0.016 258);
    --aq-muted-fg: oklch(0.72 0.02 255);
    --aq-card: oklch(0.2 0.016 258);
    --aq-card-fg: oklch(0.96 0.006 255);
    --aq-border: oklch(0.3 0.02 258);
    --aq-border-strong: oklch(0.38 0.02 258);
    --aq-input: oklch(0.3 0.02 258);
    --aq-ring: oklch(0.62 0.17 255);
    --aq-accent: oklch(0.28 0.03 258);
    --aq-accent-fg: oklch(0.96 0.006 255);
    --aq-primary: oklch(0.68 0.16 254);
    --aq-primary-hover: oklch(0.74 0.16 254);
    --aq-primary-fg: oklch(0.16 0.02 258);
    --aq-primary-soft: oklch(0.68 0.16 254 / 0.16);
    --aq-destructive: oklch(0.64 0.21 24);
    --aq-destructive-fg: oklch(0.16 0.02 258);
    --aq-success: oklch(0.7 0.15 152);
    --aq-warning: oklch(0.8 0.14 78);

    --aq-sev-critical: oklch(0.62 0.22 22);
    --aq-sev-high: oklch(0.72 0.18 45);
    --aq-sev-medium: oklch(0.82 0.15 86);
    --aq-sev-low: oklch(0.76 0.12 196);
    --aq-sev-info: oklch(0.74 0.02 255);

    --aq-shadow-sm: 0 1px 2px oklch(0 0 0 / 0.4);
    --aq-shadow-md: 0 6px 22px -8px oklch(0 0 0 / 0.55);
    --aq-shadow-lg: 0 22px 60px -24px oklch(0 0 0 / 0.7);

    --aq-grid: oklch(0.27 0.02 258);
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  * {
    margin: 0;
  }

  html {
    -webkit-text-size-adjust: 100%;
    scroll-behavior: smooth;
  }

  @media (prefers-reduced-motion: reduce) {
    html {
      scroll-behavior: auto;
    }

    *, *::before, *::after {
      animation-duration: 1ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 1ms !important;
    }
  }

  body {
    background: var(--aq-bg);
    color: var(--aq-fg);
    font-family: ${fontSans}, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    font-size: ${textBase};
    line-height: 1.55;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    min-height: 100dvh;
    overflow-x: hidden;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button, input, select, textarea {
    font: inherit;
    color: inherit;
    background: none;
    border: none;
  }

  button {
    cursor: pointer;
  }

  button:disabled {
    cursor: not-allowed;
  }

  ul, ol {
    list-style: none;
    padding: 0;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    letter-spacing: -0.018em;
    line-height: 1.2;
  }

  ::selection {
    background: color-mix(in oklab, var(--aq-primary) 26%, transparent);
  }

  :focus-visible {
    outline: 2px solid var(--aq-ring);
    outline-offset: 2px;
    border-radius: ${radiusMd};
  }

  [hidden] {
    display: none !important;
  }

  svg {
    display: block;
  }

  code, pre, kbd {
    font-family: ${fontMono}, ui-monospace, "SF Mono", Menlo, monospace;
    font-size: 0.85em;
  }

  /* Thin, unobtrusive scrollbars */
  * {
    scrollbar-width: thin;
    scrollbar-color: var(--aq-border-strong) transparent;
  }

  *::-webkit-scrollbar {
    width: 9px;
    height: 9px;
  }

  *::-webkit-scrollbar-track {
    background: transparent;
  }

  *::-webkit-scrollbar-thumb {
    background: var(--aq-border-strong);
    border-radius: 999px;
    border: 2px solid var(--aq-bg);
  }

  /* App shell: fades in on first paint (view transitions handle the rest). */
  .aq-shell {
    max-width: ${shellMax};
    margin-inline: auto;
    padding-inline: 20px;
    animation: ${shellFadeIn} 240ms ease-out both;
  }

  .aq-grid-bg {
    background-image:
      linear-gradient(to right, var(--aq-grid) 1px, transparent 1px),
      linear-gradient(to bottom, var(--aq-grid) 1px, transparent 1px);
    background-size: 44px 44px;
    mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 100%);
  }

  /* Floating glow orbs behind the hero (CSS-only, GPU friendly). */
  .aq-orb {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    filter: blur(70px);
    opacity: 0.5;
    background: radial-gradient(
      circle at 35% 35%,
      color-mix(in oklab, var(--aq-primary) 55%, transparent),
      transparent 70%
    );
    animation: aq-float 14s ease-in-out infinite alternate;
  }

  .aq-orb[data-i="1"] {
    animation-delay: -7s;
    animation-duration: 18s;
    opacity: 0.35;
  }

  @keyframes aq-float {
    from {
      transform: translate3d(0, 0, 0) scale(1);
    }
    to {
      transform: translate3d(48px, 34px, 0) scale(1.12);
    }
  }

  /* Pulsing "live" dot inside the hero pill. */
  .aq-live-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--aq-success);
    box-shadow: 0 0 0 0 color-mix(in oklab, var(--aq-success) 55%, transparent);
    animation: aq-pulse 2.2s ease-out infinite;
  }

  @keyframes aq-pulse {
    0% {
      box-shadow: 0 0 0 0 color-mix(in oklab, var(--aq-success) 50%, transparent);
    }
    70% {
      box-shadow: 0 0 0 7px transparent;
    }
    100% {
      box-shadow: 0 0 0 0 transparent;
    }
  }

  /* Staggered entrance for page-level blocks (used with .aq-enter children). */
  .aq-enter > * {
    animation: aq-rise 480ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .aq-enter > *:nth-child(1) { animation-delay: 40ms; }
  .aq-enter > *:nth-child(2) { animation-delay: 100ms; }
  .aq-enter > *:nth-child(3) { animation-delay: 160ms; }
  .aq-enter > *:nth-child(4) { animation-delay: 220ms; }
  .aq-enter > *:nth-child(5) { animation-delay: 280ms; }
  .aq-enter > *:nth-child(6) { animation-delay: 340ms; }

  @keyframes aq-rise {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
  }

  .aq-sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  .aq-spin {
    animation: ${aqSpin} 0.9s linear infinite;
  }

  @media print {
    .aq-no-print {
      display: none !important;
    }
  }
`;
