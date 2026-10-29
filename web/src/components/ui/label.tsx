import * as Radix from 'radix-ui';
import { styled } from '@yak/react';

import { textSm, textXs } from '@/styles/tokens';

/**
 * Form field building blocks. Label / Description / Error are plain styled
 * elements so they can be used from Server Components too.
 */
export const Label = styled(Radix.Label.Root)`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: ${textSm};
  font-weight: 550;
  color: var(--aq-fg);
  letter-spacing: -0.01em;
  line-height: 1.2;
  cursor: pointer;

  &[data-disabled='true'] {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const FieldDescription = styled.p`
  font-size: ${textXs};
  color: var(--aq-muted-fg);
  line-height: 1.45;
`;

export const FieldError = styled.p`
  font-size: ${textXs};
  color: var(--aq-destructive);
  display: flex;
  align-items: center;
  gap: 6px;
  line-height: 1.4;
`;
