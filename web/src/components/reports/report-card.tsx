import Link from 'next/link';
import { styled } from '@yak/react';

import { Badge } from '@/components/ui/badge';
import { number, relativeTime } from '@/lib/format';
import { riskBand, totalFindings, type ReportRow } from '@/lib/types';
import { easeOut, radiusLg, textSm, textXl } from '@/styles/tokens';

const SOURCE_LABEL: Record<string, string> = {
  nessus: 'Nessus',
  nmap: 'Nmap',
  json: 'JSON',
};

const Tile = styled(Link)`
  display: block;
  background: var(--aq-card);
  color: var(--aq-card-fg);
  border: 1px solid var(--aq-border);
  border-radius: ${radiusLg};
  box-shadow:
    var(--aq-shadow-sm),
    inset 0 1px 0 var(--aq-highlight);
  padding: 18px 20px;
  min-width: 0;
  cursor: pointer;
  transition:
    border-color 180ms ${easeOut},
    box-shadow 180ms ${easeOut},
    transform 180ms ${easeOut};

  &:hover {
    border-color: color-mix(in oklab, var(--aq-primary) 35%, var(--aq-border-strong));
    box-shadow:
      var(--aq-shadow-lg),
      inset 0 1px 0 var(--aq-highlight);
    transform: translateY(-2px);
  }
`;

const Head = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

const Title = styled.h3`
  font-size: 0.95rem;
  font-weight: 620;
  letter-spacing: -0.02em;
  line-height: 1.3;
  overflow-wrap: anywhere;
`;

const Meta = styled.p`
  font-size: ${textSm};
  color: var(--aq-muted-fg);
  margin-top: 3px;
`;

const Metrics = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 14px;
  margin-top: 12px;
`;

const Score = styled.div`
  font-size: ${textXl};
  font-weight: 680;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
  line-height: 1;

  &[data-tone='critical'] {
    color: var(--aq-sev-critical);
  }

  &[data-tone='high'] {
    color: var(--aq-sev-high);
  }

  &[data-tone='medium'] {
    color: var(--aq-sev-medium);
  }

  &[data-tone='low'] {
    color: var(--aq-sev-low);
  }
`;

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
`;

export function ReportCard({ report }: { report: ReportRow }) {
  const band = riskBand(report.risk_score);
  const findings = totalFindings(report.severity_counts);

  return (
    <Tile href={`/reports/${report.id}`}>
      <Head>
        <div style={{ minWidth: 0 }}>
          <Title>{report.title}</Title>
          <Meta>
            {SOURCE_LABEL[report.source] ?? report.source} · {relativeTime(report.created_at)}
          </Meta>
        </div>
        {report.status === 'ready' ? (
          <Score data-tone={band.tone}>{report.risk_score ?? '—'}</Score>
        ) : (
          <Badge tone={report.status === 'processing' ? 'info' : 'destructive'}>
            {report.status === 'processing' ? 'Processing' : 'Failed'}
          </Badge>
        )}
      </Head>

      {report.status === 'ready' ? (
        <>
          <Metrics>
            <span style={{ fontSize: textSm, color: 'var(--aq-muted-fg)' }}>
              {number(findings)} findings · {number(report.asset_count)} assets
            </span>
            <Badge tone={band.tone === 'low' ? 'success' : band.tone}>{band.label}</Badge>
          </Metrics>
          <Chips>
            {report.severity_counts.critical > 0 && (
              <Badge tone="critical">{report.severity_counts.critical} critical</Badge>
            )}
            {report.severity_counts.high > 0 && (
              <Badge tone="high">{report.severity_counts.high} high</Badge>
            )}
            {report.severity_counts.medium > 0 && (
              <Badge tone="medium">{report.severity_counts.medium} medium</Badge>
            )}
            {report.severity_counts.low > 0 && (
              <Badge tone="low">{report.severity_counts.low} low</Badge>
            )}
            {report.severity_counts.info > 0 && (
              <Badge tone="neutral">{report.severity_counts.info} info</Badge>
            )}
          </Chips>
        </>
      ) : report.status === 'processing' ? (
        <Meta>The parser is sanitising findings and drafting the executive report.</Meta>
      ) : (
        <Meta>{report.error ?? 'Processing failed. An administrator has been notified.'}</Meta>
      )}
    </Tile>
  );
}
