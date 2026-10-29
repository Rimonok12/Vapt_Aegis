import { styled } from '@yak/react';

import { textSm, textXs } from '@/styles/tokens';

/**
 * Shared data-table primitives. Tables always sit inside `TableScroll` so wide
 * content scrolls inside its card instead of pushing the page sideways on
 * narrow screens.
 */
export const TableScroll = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
`;

export const Table = styled.table`
  width: 100%;
  min-width: 560px;
  border-collapse: separate;
  border-spacing: 0;
  font-size: ${textSm};

  & tbody tr {
    transition: background-color 140ms ease;
  }

  & tbody tr:hover {
    background: color-mix(in oklab, var(--aq-muted) 55%, transparent);
  }

  & tbody tr:last-child td {
    border-bottom: none;
  }
`;

export const Th = styled.th`
  text-align: left;
  font-size: ${textXs};
  font-weight: 650;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--aq-muted-fg);
  padding: 0 12px 10px;
  border-bottom: 1px solid var(--aq-border);
  white-space: nowrap;
`;

export const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid var(--aq-border);
  vertical-align: top;
  line-height: 1.5;
`;
