'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export type TrendPoint = { label: string; score: number; date: string };

export function RiskTrendChart({ trend }: { trend: TrendPoint[] }) {
  if (trend.length < 2) {
    return (
      <div
        style={{
          height: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--aq-muted-fg)',
          fontSize: '0.85rem',
          textAlign: 'center',
          padding: 20,
        }}
      >
        Need at least two completed reports to chart a trend.
      </div>
    );
  }

  return (
    <div style={{ height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={trend} margin={{ top: 8, right: 12, left: -4, bottom: 0 }}>
          <defs>
            <linearGradient id="aq-risk-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--aq-primary)" stopOpacity={0.32} />
              <stop offset="100%" stopColor="var(--aq-primary)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--aq-border)" strokeDasharray="3 4" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: 'var(--aq-muted-fg)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            dy={6}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tick={{ fill: 'var(--aq-muted-fg)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <Tooltip
            cursor={{ stroke: 'var(--aq-border-strong)' }}
            contentStyle={{
              background: 'var(--aq-card)',
              border: '1px solid var(--aq-border)',
              borderRadius: 10,
              fontSize: '0.8rem',
              color: 'var(--aq-fg)',
            }}
            formatter={(value) => [`${value} / 100`, 'Risk score']}
            labelFormatter={(label) => `Scan ${String(label ?? '')}`}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="var(--aq-primary)"
            strokeWidth={2}
            fill="url(#aq-risk-fill)"
            dot={{ r: 3, fill: 'var(--aq-primary)', strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
            isAnimationActive
            animationBegin={180}
            animationDuration={900}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
