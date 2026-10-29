'use client';

import * as Radix from 'radix-ui';
import { X } from 'lucide-react';
import { styled } from '@yak/react';

import { easeOut, radiusLg, radiusMd, textLg, textSm, textXs } from '@/styles/tokens';

const { Dialog } = Radix;

export const DialogRoot = Dialog.Root;
export const DialogTrigger = Dialog.Trigger;
export const DialogClose = Dialog.Close;

const Overlay = styled(Dialog.Overlay)`
  position: fixed;
  inset: 0;
  z-index: 70;
  background: oklch(0.1 0.02 258 / 0.62);
  backdrop-filter: blur(3px);

  &[data-state='open'] {
    animation: aq-fade 160ms ${easeOut};
  }

  &[data-state='closed'] {
    animation: aq-fade 120ms ${easeOut} reverse;
  }

  @keyframes aq-fade {
    from {
      opacity: 0;
    }
  }
`;

const Content = styled(Dialog.Content)`
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 71;
  width: min(560px, calc(100vw - 32px));
  max-height: calc(100dvh - 64px);
  overflow: auto;
  transform: translate(-50%, -50%);
  background: var(--aq-card);
  border: 1px solid var(--aq-border);
  border-radius: ${radiusLg};
  box-shadow: var(--aq-shadow-lg);
  padding: 24px;

  &[data-state='open'] {
    animation: aq-dialog-in 200ms ${easeOut};
  }

  &[data-state='closed'] {
    animation: aq-dialog-in 140ms ${easeOut} reverse;
  }

  @keyframes aq-dialog-in {
    from {
      opacity: 0;
      transform: translate(-50%, -48%) scale(0.97);
    }
  }
`;

export const DialogHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 18px;
`;

export const DialogTitle = styled(Dialog.Title)`
  font-size: ${textLg};
  font-weight: 620;
  letter-spacing: -0.02em;
`;

export const DialogDescription = styled(Dialog.Description)`
  font-size: ${textSm};
  color: var(--aq-muted-fg);
  line-height: 1.5;
`;

export const DialogFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 22px;

  @media (max-width: 520px) {
    flex-direction: column-reverse;

    & > * {
      width: 100%;
    }
  }
`;

const CloseButton = styled(Dialog.Close)`
  position: absolute;
  top: 14px;
  right: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: ${radiusMd};
  color: var(--aq-muted-fg);
  transition: background-color 140ms ease;

  &:hover {
    background: var(--aq-muted);
    color: var(--aq-fg);
  }
`;

export function DialogX({ size = 16 }: { size?: number }) {
  return (
    <CloseButton aria-label="Close">
      <X size={size} />
    </CloseButton>
  );
}

export function DialogContent({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Content> & { children: React.ReactNode }) {
  return (
    <Dialog.Portal>
      <Overlay />
      <Content className={className} {...props}>
        {children}
      </Content>
    </Dialog.Portal>
  );
}

export const DialogVisuallyHiddenTitle = styled(Dialog.Title)`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  font-size: ${textXs};
`;
