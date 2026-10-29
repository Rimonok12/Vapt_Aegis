import type { HTMLAttributes, ReactNode } from 'react';
import { styled } from '@yak/react';

import { cn } from '@/lib/utils';
import { radiusLg, radiusSm, space4, space5, textLg, textSm, textXs } from '@/styles/tokens';

const Root = styled.div`
  background: var(--aq-card);
  color: var(--aq-card-fg);
  border: 1px solid var(--aq-border);
  border-radius: ${radiusLg};
  box-shadow: var(--aq-shadow-sm);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &[data-interactive='true'] {
    transition:
      box-shadow 180ms cubic-bezier(0.16, 1, 0.3, 1),
      border-color 180ms cubic-bezier(0.16, 1, 0.3, 1),
      transform 180ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  &[data-interactive='true']:hover {
    box-shadow: var(--aq-shadow-md);
    border-color: var(--aq-border-strong);
  }
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: ${space5};
  padding-bottom: 0;
`;

const Title = styled.h3`
  font-size: ${textLg};
  font-weight: 600;
  letter-spacing: -0.02em;
`;

const Description = styled.p`
  font-size: ${textSm};
  color: var(--aq-muted-fg);
`;

const Content = styled.div`
  padding: ${space5};
  flex: 1;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  gap: ${space4};
  padding: ${space4} ${space5};
  border-top: 1px solid var(--aq-border);
  background: color-mix(in oklab, var(--aq-muted) 40%, transparent);
`;

export function Card({
  className,
  interactive,
  ...props
}: HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <Root data-interactive={String(Boolean(interactive))} className={cn(className)} {...props} />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <Header className={cn(className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <Title className={cn(className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <Description className={cn(className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <Content className={cn(className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <Footer className={cn(className)} {...props} />;
}

/** Compact stat block used across dashboard KPI tiles. */
const Stat = styled(Root)`
  padding: 18px 20px;
  gap: 2px;

  &[data-tone='critical'] {
    border-color: color-mix(in oklab, var(--aq-sev-critical) 45%, transparent);
  }

  &[data-tone='success'] {
    border-color: color-mix(in oklab, var(--aq-success) 40%, transparent);
  }
`;

const StatIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: ${radiusSm};
  background: var(--aq-muted);
  color: var(--aq-muted-fg);
`;

const StatTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const StatLabel = styled.span`
  font-size: ${textSm};
  color: var(--aq-muted-fg);
  font-weight: 500;
`;

const StatValue = styled.div`
  font-size: 1.75rem;
  font-weight: 650;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
  line-height: 1.25;
`;

const StatHint = styled.div`
  font-size: ${textXs};
  color: var(--aq-muted-fg);
  display: flex;
  align-items: center;
  gap: 6px;
`;

export function StatCard({
  label,
  value,
  hint,
  tone = 'default',
  icon,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: 'default' | 'critical' | 'high' | 'medium' | 'low' | 'success';
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <Stat data-tone={tone} className={cn('aq-stat', className)}>
      <StatTop>
        <StatLabel>{label}</StatLabel>
        {icon ? <StatIcon>{icon}</StatIcon> : null}
      </StatTop>
      <StatValue>{value}</StatValue>
      {hint ? <StatHint>{hint}</StatHint> : null}
    </Stat>
  );
}
