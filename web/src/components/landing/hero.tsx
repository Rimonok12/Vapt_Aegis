'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { styled } from '@yak/react';

import { AnchorButton } from '@/components/ui/button';
import { shellMax, textSm, textXl } from '@/styles/tokens';

gsap.registerPlugin(ScrollTrigger, SplitText);

const Hero = styled.section`
  position: relative;
  overflow: hidden;
`;

const HeroInner = styled.div`
  max-width: ${shellMax};
  margin-inline: auto;
  padding: 84px 20px 72px;
  display: grid;
  gap: 26px;
  justify-items: center;
  text-align: center;
  position: relative;
  z-index: 1;
`;

const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid var(--aq-border-strong);
  background: var(--aq-card);
  font-size: 0.78rem;
  font-weight: 550;
  color: var(--aq-muted-fg);
  box-shadow: var(--aq-shadow-sm);

  & b {
    color: var(--aq-primary);
    font-weight: 650;
  }
`;

const Headline = styled.h1`
  font-size: clamp(2.4rem, 6vw, 4.1rem);
  line-height: 1.04;
  letter-spacing: -0.045em;
  font-weight: 720;
  max-width: 22ch;

  /* Gradient text. Keep to background-image with sRGB colours: an oklch() stop
     makes the CSS compiler emit a later @supports rule using the background
     shorthand, which resets background-clip to border-box (solid blocks).
     SplitText wraps words in transformed inline-blocks, so each word carries
     its own gradient once split. */
  & .aq-gradient:not(:has(.aq-word)),
  & .aq-gradient .aq-word {
    background-image: linear-gradient(100deg, var(--aq-primary), #00b2c4);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  /* SplitText word masks */
  & .aq-word {
    display: inline-block;
    overflow: hidden;
    vertical-align: top;
    padding-bottom: 0.08em;
    margin-bottom: -0.08em;
  }
`;

const Sub = styled.p`
  font-size: ${textXl};
  color: var(--aq-muted-fg);
  max-width: 62ch;
  line-height: 1.55;
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 6px;
`;

const Stats = styled.div`
  display: flex;
  gap: 34px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 18px;
`;

const Stat = styled.div`
  display: grid;
  gap: 2px;

  & strong {
    font-size: 1.5rem;
    font-weight: 680;
    letter-spacing: -0.03em;
    font-variant-numeric: tabular-nums;
  }

  & span {
    font-size: ${textSm};
    color: var(--aq-muted-fg);
  }
`;

/**
 * Animated marketing hero: GSAP entrance timeline (word-mask headline reveal),
 * scroll-parallax on the grid backdrop and CSS-floating glow orbs.
 */
export function LandingHero() {
  const rootRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // gsap.context() records every tween, SplitText and ScrollTrigger so a
    // single revert() restores the original DOM and inline styles. Killing the
    // timeline instead leaves `.from()` targets frozen at opacity 0, which hides
    // the hero on React Strict Mode's mount → unmount → mount in development.
    const ctx = gsap.context(() => {
      const split = headlineRef.current
        ? SplitText.create(headlineRef.current, { type: 'words', wordsClass: 'aq-word' })
        : null;

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from(pillRef.current, { y: -16, opacity: 0, duration: 0.55 })
        .from(
          split?.words ?? [],
          { yPercent: 115, opacity: 0, duration: 0.85, stagger: 0.05, ease: 'power4.out' },
          '-=0.2'
        )
        .from(subRef.current, { y: 18, opacity: 0, duration: 0.7 }, '-=0.5')
        .from(
          actionsRef.current?.children ?? [],
          { y: 14, opacity: 0, duration: 0.55, stagger: 0.09 },
          '-=0.45'
        )
        .from(
          statsRef.current?.children ?? [],
          { y: 12, opacity: 0, duration: 0.5, stagger: 0.08 },
          '-=0.35'
        );

      ScrollTrigger.create({
        trigger: root,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          if (gridRef.current) {
            gsap.set(gridRef.current, { y: self.progress * 90, opacity: 1 - self.progress * 0.6 });
          }
        },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <Hero ref={rootRef}>
      <div
        aria-hidden
        className="aq-grid-bg"
        style={{ position: 'absolute', inset: 0 }}
        ref={gridRef}
      />
      <div
        aria-hidden
        className="aq-orb"
        data-i="0"
        style={{ top: '-12%', left: '8%', width: 380, height: 380 }}
      />
      <div
        aria-hidden
        className="aq-orb"
        data-i="1"
        style={{ top: '4%', right: '4%', width: 320, height: 320 }}
      />
      <HeroInner>
        <Pill ref={pillRef}>
          <span className="aq-live-dot" aria-hidden />
          <b>New</b> Local AI reporting — your scan data never leaves your infrastructure
        </Pill>
        <Headline ref={headlineRef}>
          Raw scan logs in. <span className="aq-gradient">Board-ready risk reports</span> out.
        </Headline>
        <Sub ref={subRef}>
          Aegis parses Nessus and Nmap exports, sanitises every finding, drafts an executive report
          with a local LLM, and locks it behind Bangladesh National ID verification — per-tenant,
          zero-knowledge of your hosts.
        </Sub>
        <Actions ref={actionsRef}>
          <AnchorButton href="/signup" variant="primary" size="lg">
            Create your workspace
          </AnchorButton>
          <AnchorButton href="/signin" variant="outline" size="lg">
            Client sign in
          </AnchorButton>
        </Actions>
        <Stats ref={statsRef}>
          <Stat>
            <strong>100%</strong>
            <span>Findings sanitised pre-storage</span>
          </Stat>
          <Stat>
            <strong>NID</strong>
            <span>Porichoy-gated client access</span>
          </Stat>
          <Stat>
            <strong>RLS</strong>
            <span>Row-level tenant isolation</span>
          </Stat>
        </Stats>
      </HeroInner>
    </Hero>
  );
}
