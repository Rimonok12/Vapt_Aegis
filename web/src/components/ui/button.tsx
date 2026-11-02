import { forwardRef, type ButtonHTMLAttributes, type ComponentProps, type ReactNode } from 'react';
import Link from 'next/link';
import { styled, css } from '@yak/react';

import { cn } from '@/lib/utils';
import { durationBase, easeOut, radiusMd, textSm } from '@/styles/tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const buttonCss = css`
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: ${radiusMd};
  font-size: ${textSm};
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1;
  white-space: nowrap;
  border: 1px solid transparent;
  cursor: pointer;
  user-select: none;
  transition:
    background-color ${durationBase} ${easeOut},
    color ${durationBase} ${easeOut},
    border-color ${durationBase} ${easeOut},
    box-shadow 260ms ${easeOut},
    transform 260ms ${easeOut},
    filter ${durationBase} ${easeOut};

  &:not(:disabled):active {
    transform: translateY(0) scale(0.985);
  }

  &:disabled {
    opacity: 0.55;
    pointer-events: none;
  }

  &[data-size='sm'] {
    height: 34px;
    padding-inline: 14px;
    font-size: 0.78rem;
  }

  &[data-size='md'] {
    height: 40px;
    padding-inline: 18px;
  }

  &[data-size='lg'] {
    height: 48px;
    padding-inline: 24px;
    font-size: 0.95rem;
  }

  &[data-size='icon'] {
    height: 34px;
    width: 34px;
    padding: 0;
  }

  /* Glass-finish blue gradient: soft top sheen + inner edge light + glow.
     Longhands only — a background shorthand would reset background-clip. */
  &[data-variant='primary'] {
    color: var(--aq-grad-fg);
    background-color: var(--aq-grad-from);
    background-image:
      linear-gradient(180deg, oklch(1 0 0 / 0.16), oklch(1 0 0 / 0) 48%),
      linear-gradient(135deg, var(--aq-grad-from), var(--aq-grad-to));
    border-color: color-mix(in oklab, var(--aq-grad-from) 70%, oklch(0.2 0.05 260));
    box-shadow:
      inset 0 1px 0 oklch(1 0 0 / 0.32),
      inset 0 -1px 0 oklch(0 0 0 / 0.12),
      0 1px 2px oklch(0.2 0.05 260 / 0.2),
      0 8px 22px -10px var(--aq-grad-glow);
    text-shadow: 0 1px 0 oklch(0 0 0 / 0.12);
  }

  /* Light sweep across the glass on hover. */
  &[data-variant='primary']::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background-image: linear-gradient(
      115deg,
      transparent 30%,
      oklch(1 0 0 / 0.28) 48%,
      transparent 66%
    );
    transform: translateX(-120%);
    transition: transform 700ms ${easeOut};
    pointer-events: none;
  }

  &[data-variant='primary']:not(:disabled):hover {
    transform: translateY(-1px);
    filter: brightness(1.06) saturate(1.05);
    box-shadow:
      inset 0 1px 0 oklch(1 0 0 / 0.38),
      inset 0 -1px 0 oklch(0 0 0 / 0.12),
      0 2px 4px oklch(0.2 0.05 260 / 0.18),
      0 14px 30px -10px var(--aq-grad-glow);
  }

  &[data-variant='primary']:not(:disabled):hover::after {
    transform: translateX(120%);
  }

  &[data-variant='secondary'] {
    background-color: var(--aq-glass);
    color: var(--aq-fg);
    border-color: var(--aq-glass-border);
    backdrop-filter: blur(10px) saturate(1.4);
  }

  &[data-variant='secondary']:not(:disabled):hover {
    background-color: var(--aq-glass-strong);
  }

  /* Frosted glass with a faint blue edge. */
  &[data-variant='outline'] {
    background-color: var(--aq-glass);
    background-image: linear-gradient(180deg, var(--aq-glass-shine), transparent 70%);
    background-size: 100% 1px;
    background-repeat: no-repeat;
    color: var(--aq-fg);
    border-color: color-mix(in oklab, var(--aq-primary) 22%, var(--aq-border-strong));
    backdrop-filter: blur(12px) saturate(1.4);
    box-shadow:
      0 1px 2px oklch(0.2 0.05 260 / 0.06),
      0 6px 18px -12px oklch(0.3 0.12 258 / 0.3);
  }

  &[data-variant='outline']:not(:disabled):hover {
    background-color: var(--aq-glass-strong);
    border-color: color-mix(in oklab, var(--aq-primary) 55%, transparent);
    color: var(--aq-primary);
    transform: translateY(-1px);
    box-shadow:
      0 2px 4px oklch(0.2 0.05 260 / 0.06),
      0 10px 24px -12px var(--aq-grad-glow);
  }

  &[data-variant='ghost'] {
    background-color: transparent;
    color: var(--aq-muted-fg);
  }

  &[data-variant='ghost']:not(:disabled):hover {
    background-color: var(--aq-primary-soft);
    color: var(--aq-primary);
  }

  &[data-variant='destructive'] {
    color: var(--aq-destructive-fg);
    background-color: var(--aq-destructive);
    background-image: linear-gradient(180deg, oklch(1 0 0 / 0.16), oklch(1 0 0 / 0) 50%);
    box-shadow:
      inset 0 1px 0 oklch(1 0 0 / 0.25),
      0 8px 20px -10px color-mix(in oklab, var(--aq-destructive) 60%, transparent);
  }

  &[data-variant='destructive']:not(:disabled):hover {
    filter: brightness(1.06);
  }
`;

const StyledButton = styled.button`
  ${buttonCss};
`;

const StyledAnchor = styled(Link)`
  ${buttonCss};
`;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className, type = 'button', ...props },
  ref
) {
  return (
    <StyledButton
      ref={ref}
      type={type}
      data-variant={variant}
      data-size={size}
      className={cn(className)}
      {...props}
    />
  );
});

/**
 * Button-styled Next.js link. Use this instead of wrapping a Button in a Link:
 * `<a><button>` / `<a><a>` is invalid HTML and breaks hydration.
 */
export function AnchorButton({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
} & Omit<ComponentProps<typeof Link>, 'className' | 'children'>) {
  return (
    <StyledAnchor data-variant={variant} data-size={size} className={cn(className)} {...props}>
      {children}
    </StyledAnchor>
  );
}
