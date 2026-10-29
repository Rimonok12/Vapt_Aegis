import Link from 'next/link';

export default function AppNotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '72px 20px', color: 'var(--aq-muted-fg)' }}>
      <p
        style={{
          fontSize: '2.2rem',
          fontWeight: 700,
          color: 'var(--aq-fg)',
          letterSpacing: '-0.03em',
        }}
      >
        Not found
      </p>
      <p style={{ fontSize: '0.9rem', margin: '8px 0 20px' }}>
        This report doesn&apos;t exist, or it belongs to another organisation.
      </p>
      <Link
        href="/reports"
        style={{
          color: 'var(--aq-primary)',
          fontSize: '0.85rem',
          fontWeight: 550,
          textDecoration: 'underline',
          textUnderlineOffset: 3,
        }}
      >
        Back to all reports
      </Link>
    </div>
  );
}
