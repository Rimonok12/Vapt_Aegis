import * as Radix from 'radix-ui';
import { styled } from '@yak/react';

const { Progress } = Radix;

export const ProgressRoot = Progress.Root;

const Track = styled(Progress.Root)`
  position: relative;
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: var(--aq-muted);
  overflow: hidden;
`;

const FilledIndicator = styled(Progress.Indicator)`
  height: 100%;
  border-radius: 999px;
  background: var(--aq-primary);
  transition: transform 360ms cubic-bezier(0.16, 1, 0.3, 1);

  &[data-tone='critical'] {
    background: var(--aq-sev-critical);
  }

  &[data-tone='high'] {
    background: var(--aq-sev-high);
  }

  &[data-tone='medium'] {
    background: var(--aq-sev-medium);
  }

  &[data-tone='low'] {
    background: var(--aq-sev-low);
  }

  &[data-tone='success'] {
    background: var(--aq-success);
  }
`;

export function ProgressBar({
  value,
  tone,
  className,
}: {
  value: number;
  tone?: 'critical' | 'high' | 'medium' | 'low' | 'success';
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <Track className={className} value={clamped}>
      <FilledIndicator data-tone={tone} style={{ transform: `translateX(-${100 - clamped}%)` }} />
    </Track>
  );
}
