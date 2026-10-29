/** Circular 0–100 compliance score. Pure SVG, works on server and client. */
export function ScoreRing({ score, size = 112 }: { score: number | null; size?: number }) {
  const stroke = 9;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const value = score ?? 0;
  const color =
    score === null
      ? 'var(--aq-border-strong)'
      : value >= 80
        ? 'var(--aq-success)'
        : value >= 50
          ? 'var(--aq-sev-medium)'
          : 'var(--aq-sev-critical)';

  return (
    <div style={{ position: 'relative', width: size, height: size, flex: 'none' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--aq-muted)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - value / 100)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 500ms cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeContent: 'center',
          textAlign: 'center',
        }}
      >
        <strong style={{ fontSize: size / 4.2, fontWeight: 740, letterSpacing: '-0.04em', lineHeight: 1 }}>
          {score === null ? '—' : `${score}%`}
        </strong>
        {size >= 90 ? (
          <span style={{ fontSize: '0.68rem', color: 'var(--aq-muted-fg)', marginTop: 3 }}>
            compliance
          </span>
        ) : null}
      </div>
    </div>
  );
}
