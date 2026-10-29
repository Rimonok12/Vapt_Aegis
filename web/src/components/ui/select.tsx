'use client';

import * as Radix from 'radix-ui';
import { Check, ChevronDown } from 'lucide-react';
import { styled } from '@yak/react';

import { durationBase, easeOut, radiusMd, radiusSm, textSm } from '@/styles/tokens';

const { Select } = Radix;

export const SelectRoot = Select.Root;
export const SelectValue = Select.Value;
export const SelectTrigger = styled(Select.Trigger)`
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border-radius: ${radiusMd};
  border: 1px solid var(--aq-border-strong);
  background: var(--aq-card);
  color: var(--aq-fg);
  font-size: ${textSm};
  box-shadow: var(--aq-shadow-sm);
  transition:
    border-color ${durationBase} ${easeOut},
    box-shadow ${durationBase} ${easeOut};

  &[data-state='open'] {
    border-color: var(--aq-ring);
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--aq-ring) 22%, transparent);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &[data-placeholder='true'] {
    color: var(--aq-muted-fg);
  }
`;

export const SelectIcon = styled(Select.Icon)`
  color: var(--aq-muted-fg);
  display: inline-flex;
`;

export const SelectContent = styled(Select.Portal)`
  /* portal wrapper carries no styles */
`;

const Content = styled(Select.Content)`
  z-index: 60;
  min-width: var(--radix-select-trigger-width);
  border-radius: ${radiusMd};
  border: 1px solid var(--aq-border);
  background: var(--aq-card);
  box-shadow: var(--aq-shadow-lg);
  overflow: hidden;

  &[data-state='open'] {
    animation: aq-select-in 140ms ${easeOut};
  }

  &[data-state='closed'] {
    animation: aq-select-out 100ms ${easeOut};
  }

  @keyframes aq-select-in {
    from {
      opacity: 0;
      transform: translateY(-4px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes aq-select-out {
    to {
      opacity: 0;
      transform: translateY(-2px) scale(0.98);
    }
  }
`;

const Viewport = styled(Select.Viewport)`
  padding: 4px;
`;

const Item = styled(Select.Item)`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 30px 7px 10px;
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
`;

const ItemIndicator = styled(Select.ItemIndicator)`
  position: absolute;
  right: 8px;
  display: inline-flex;
  color: var(--aq-primary);
`;

export function SelectControl({
  value,
  onValueChange,
  options,
  placeholder,
  disabled,
  name,
  className,
}: {
  value?: string;
  onValueChange?: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  name?: string;
  className?: string;
}) {
  return (
    <SelectRoot value={value} onValueChange={onValueChange} name={name} disabled={disabled}>
      <SelectTrigger className={className} aria-disabled={disabled}>
        <SelectValue placeholder={placeholder} />
        <SelectIcon>
          <ChevronDown size={15} />
        </SelectIcon>
      </SelectTrigger>
      <Select.Portal>
        <Content position="popper" sideOffset={6} align="start">
          <Viewport>
            {options.map((option) => (
              <Item key={option.value} value={option.value}>
                {option.label}
                <ItemIndicator>
                  <Check size={14} />
                </ItemIndicator>
              </Item>
            ))}
          </Viewport>
        </Content>
      </Select.Portal>
    </SelectRoot>
  );
}
