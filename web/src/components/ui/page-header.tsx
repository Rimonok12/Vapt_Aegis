import type { ReactNode } from 'react';
import { styled } from '@yak/react';

import { textSm } from '@/styles/tokens';

const Root = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 22px;
`;

const Text = styled.div`
  min-width: 0;
  display: grid;
  gap: 6px;
`;

const Eyebrow = styled.p`
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--aq-primary);
`;

const Title = styled.h1`
  font-size: clamp(1.4rem, 2.6vw, 1.75rem);
  font-weight: 700;
  letter-spacing: -0.035em;
  line-height: 1.15;
  overflow-wrap: anywhere;
`;

const Description = styled.p`
  font-size: ${textSm};
  color: var(--aq-muted-fg);
  max-width: 68ch;
  overflow-wrap: anywhere;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

/** Consistent page title block for every signed-in page. */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <Root>
      <Text>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <Title>{title}</Title>
        {description ? <Description>{description}</Description> : null}
      </Text>
      {actions ? <Actions>{actions}</Actions> : null}
    </Root>
  );
}
