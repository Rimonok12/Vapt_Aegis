'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { SEVERITIES, SEVERITY_LABEL, type SeverityCounts } from '@/lib/types';

const COLORS: Record<string, string> = {
  critical: 'var(--aq-sev-critical)',
  high: 'var(--aq-sev-high)',
  medium: 'var(--aq-sev-medium)',
  low: 'var(--aq-sev-low)',
  info: 'var(--aq-sev-info)',
};

export function SeverityDonut({ counts }: { counts: SeverityCounts }) {
  const data = SEVERITIES.map((severity) => ({
    name: SEVERITY_LABEL[severity],
    key: severity,
    value: counts[severity],
  })).filter((entry) => entry.value > 0);

  const total = data.reduce((sum, entry) => sum + entry.value, 0);

  if (total === 0) {
    return (
      <div
        style={{
          height: 220,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--aq-muted-fg)',
          fontSize: '0.85rem',
        }}
      >
        No findings recorded yet.
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={62}
            outerRadius={92}
            paddingAngle={2}
            strokeWidth={0}
            isAnimationActive
            animationBegin={120}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {data.map((entry) => (
              <Cell key={entry.key} fill={COLORS[entry.key]} />
            ))}
          </Pie>
          <Tooltip
            cursor={false}
            contentStyle={{
              background: 'var(--aq-card)',
              border: '1px solid var(--aq-border)',
              borderRadius: 10,
              fontSize: '0.8rem',
              color: 'var(--aq-fg)',
            }}
            formatter={(value) => [`${value}`, 'Findings']}
          />
        </PieChart>
      </ResponsiveContainer>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 680, letterSpacing: '-0.03em' }}>
            {total.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--aq-muted-fg)' }}>findings</div>
        </div>
      </div>
    </div>
  );
}

export function SeverityLegend({ counts }: { counts: SeverityCounts }) {
  const total = SEVERITIES.reduce((sum, key) => sum + counts[key], 0) || 1;
  return (
    <ul style={{ display: 'grid', gap: 8, marginTop: 12 }}>
      {SEVERITIES.map((severity) => {
        const value = counts[severity];
        const pct = Math.round((value / total) * 100);
        return (
          <li
            key={severity}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              fontSize: '0.8rem',
              color: 'var(--aq-muted-fg)',
            }}
          >
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: 3,
                background: COLORS[severity],
                flex: 'none',
              }}
            />
            <span style={{ flex: 1 }}>{SEVERITY_LABEL[severity]}</span>
            <strong style={{ color: 'var(--aq-fg)', fontVariantNumeric: 'tabular-nums' }}>
              {value.toLocaleString()}
            </strong>
            <span style={{ width: 42, textAlign: 'right' }}>{pct}%</span>
          </li>
        );
      })}
    </ul>
  );
}
