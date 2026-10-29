import { styled } from '@yak/react';

import { radiusLg } from '@/styles/tokens';

/**
 * Shared surface styling. Variants are driven by `data-*` attributes so the CSS
 * stays completely static — no runtime classes or CSS variables per instance.
 */
export const Surface = styled.div`
  background: var(--aq-card);
  color: var(--aq-card-fg);
  border: 1px solid var(--aq-border);
  border-radius: ${radiusLg};
  box-shadow: var(--aq-shadow-sm);
`;
