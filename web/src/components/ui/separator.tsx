import { styled } from '@yak/react';

export const Separator = styled.div`
  height: 1px;
  width: 100%;
  background: var(--aq-border);

  &[data-orientation='vertical'] {
    width: 1px;
    height: auto;
    align-self: stretch;
  }
`;
