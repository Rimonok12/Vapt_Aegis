'use client';

import * as Radix from 'radix-ui';
import { styled } from '@yak/react';

import { easeOut, radiusMd, radiusSm, textSm } from '@/styles/tokens';

const { DropdownMenu } = Radix;

export const DropdownRoot = DropdownMenu.Root;
export const DropdownTrigger = DropdownMenu.Trigger;

const Content = styled(DropdownMenu.Content)`
  z-index: 65;
  min-width: 200px;
  border-radius: ${radiusMd};
  border: 1px solid var(--aq-border);
  background: var(--aq-card);
  box-shadow: var(--aq-shadow-lg);
  padding: 4px;

  &[data-state='open'] {
    animation: aq-dd-in 140ms ${easeOut};
  }

  @keyframes aq-dd-in {
    from {
      opacity: 0;
      transform: translateY(-4px) scale(0.97);
    }
  }
`;

const Item = styled(DropdownMenu.Item)`
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 7px 10px;
  border-radius: ${radiusSm};
  font-size: ${textSm};
  color: var(--aq-fg);
  cursor: pointer;
  outline: none;
  user-select: none;

  &[data-highlighted] {
    background: var(--aq-accent);
    color: var(--aq-accent-fg);
  }

  &[data-disabled] {
    opacity: 0.5;
    pointer-events: none;
  }

  &[data-destructive='true'] {
    color: var(--aq-destructive);

    &[data-highlighted] {
      background: color-mix(in oklab, var(--aq-destructive) 14%, transparent);
      color: var(--aq-destructive);
    }
  }
`;

export const DropdownSeparator = styled(DropdownMenu.Separator)`
  height: 1px;
  margin: 4px 6px;
  background: var(--aq-border);
`;

export const DropdownLabel = styled(DropdownMenu.Label)`
  padding: 6px 10px 4px;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--aq-muted-fg);
`;

export function DropdownContent({
  children,
  align = 'end',
  sideOffset = 6,
}: {
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
}) {
  return (
    <DropdownMenu.Portal>
      <Content align={align} sideOffset={sideOffset}>
        {children}
      </Content>
    </DropdownMenu.Portal>
  );
}

export function DropdownItem({
  children,
  onSelect,
  destructive,
  disabled,
  asChild,
}: {
  children: React.ReactNode;
  onSelect?: () => void;
  destructive?: boolean;
  disabled?: boolean;
  asChild?: boolean;
}) {
  return (
    <Item
      data-destructive={destructive ? 'true' : undefined}
      onSelect={onSelect}
      disabled={disabled}
      asChild={asChild}
    >
      {children}
    </Item>
  );
}
