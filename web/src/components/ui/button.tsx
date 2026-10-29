import { forwardRef, type ButtonHTMLAttributes, type ComponentProps, type ReactNode } from 'react';
import Link from 'next/link';
import { styled, css } from '@yak/react';

import { cn } from '@/lib/utils';
import { durationBase, easeOut, radiusMd, textSm } from '@/styles/tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const buttonCss = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: ${radiusMd};
  font-size: ${textSm};
  font-weight: 550;
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
    box-shadow ${durationBase} ${easeOut},
    transform ${durationBase} ${easeOut};

  &:not(:disabled):active {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.55;
    pointer-events: none;
  }

  &[data-size='sm'] {
    height: 32px;
    padding-inline: 12px;
    font-size: 0.78rem;
  }

  &[data-size='md'] {
    height: 38px;
    padding-inline: 16px;
  }

  &[data-size='lg'] {
    height: 46px;
    padding-inline: 22px;
    font-size: 0.95rem;
  }

  &[data-size='icon'] {
    height: 34px;
    width: 34px;
    padding: 0;
  }

  &[data-variant='primary'] {
    background: var(--aq-primary);
    color: var(--aq-primary-fg);
    box-shadow: var(--aq-shadow-sm);
  }

  &[data-variant='primary']:not(:disabled):hover {
    background: var(--aq-primary-hover);
    box-shadow: var(--aq-shadow-md);
  }

  &[data-variant='secondary'] {
    background: var(--aq-muted);
    color: var(--aq-fg);
  }

  &[data-variant='secondary']:not(:disabled):hover {
    background: color-mix(in oklab, var(--aq-muted) 75%, var(--aq-fg));
  }

  &[data-variant='outline'] {
    background: var(--aq-card);
    color: var(--aq-fg);
    border-color: var(--aq-border-strong);
  }

  &[data-variant='outline']:not(:disabled):hover {
    background: var(--aq-accent);
    border-color: var(--aq-ring);
  }

  &[data-variant='ghost'] {
    background: transparent;
    color: var(--aq-muted-fg);
  }

  &[data-variant='ghost']:not(:disabled):hover {
    background: var(--aq-accent);
    color: var(--aq-accent-fg);
  }

  &[data-variant='destructive'] {
    background: var(--aq-destructive);
    color: var(--aq-destructive-fg);
  }

  &[data-variant='destructive']:not(:disabled):hover {
    background: color-mix(in oklab, var(--aq-destructive) 85%, #000);
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
