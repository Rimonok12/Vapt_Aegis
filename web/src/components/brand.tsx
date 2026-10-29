import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { styled } from '@yak/react';

import { radiusLg, textSm, textXl } from '@/styles/tokens';

const Mark = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: ${textXl};
  font-weight: 680;
  letter-spacing: -0.03em;
`;

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: ${radiusLg};
  background: var(--aq-primary);
  color: var(--aq-primary-fg);
  box-shadow: var(--aq-shadow-md);
`;

const Tagline = styled.p`
  font-size: ${textSm};
  color: var(--aq-muted-fg);
`;

export function Brand({ size = 22 }: { size?: number }) {
  return (
    <Mark>
      <Badge>
        <ShieldCheck size={size} />
      </Badge>
      Aegis
    </Mark>
  );
}

export function BrandHeader() {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      <Link href="/">
        <Brand />
      </Link>
      <Tagline>Vulnerability intelligence, verified.</Tagline>
    </header>
  );
}
