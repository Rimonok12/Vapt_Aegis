import * as Radix from 'radix-ui';
import { styled } from '@yak/react';

import { easeOut, radiusMd, textSm } from '@/styles/tokens';

const { Tabs } = Radix;

export const TabsRoot = Tabs.Root;
export const TabsContent = styled(Tabs.Content)`
  flex: 1;
  outline: none;

  &[data-state='inactive'] {
    display: none;
  }
`;

export const TabsList = styled(Tabs.List)`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border-radius: ${radiusMd};
  background: var(--aq-muted);
  border: 1px solid var(--aq-border);

  &[data-orientation='vertical'] {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const TabsTrigger = styled(Tabs.Trigger)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  height: 32px;
  padding: 0 14px;
  border-radius: calc(${radiusMd} - 2px);
  font-size: ${textSm};
  font-weight: 520;
  color: var(--aq-muted-fg);
  transition:
    color 160ms ${easeOut},
    background-color 160ms ${easeOut},
    box-shadow 160ms ${easeOut};
  white-space: nowrap;

  &:hover {
    color: var(--aq-fg);
  }

  &[data-state='active'] {
    background: var(--aq-card);
    color: var(--aq-fg);
    box-shadow: var(--aq-shadow-sm);
  }

  &:focus-visible {
    outline: 2px solid var(--aq-ring);
    outline-offset: 2px;
  }
`;
