import * as Radix from 'radix-ui';
import { styled } from '@yak/react';

const { Avatar } = Radix;

export const AvatarRoot = styled(Avatar.Root)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  overflow: hidden;
  background: var(--aq-primary-soft);
  color: var(--aq-primary);
  font-size: 0.8125rem;
  font-weight: 650;
  vertical-align: middle;

  &[data-size='lg'] {
    width: 44px;
    height: 44px;
    font-size: 1rem;
  }
`;

export const AvatarImage = styled(Avatar.Image)`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
`;

export const AvatarFallback = styled(Avatar.Fallback)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;
