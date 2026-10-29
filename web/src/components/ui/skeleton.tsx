import { keyframes, styled } from '@yak/react';

const shimmer = keyframes`
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
`;

export const Skeleton = styled.div`
  border-radius: 8px;
  background: linear-gradient(
    90deg,
    var(--aq-muted) 25%,
    color-mix(in oklab, var(--aq-muted) 55%, var(--aq-border)) 50%,
    var(--aq-muted) 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.4s ease-in-out infinite;
  pointer-events: none;
`;
