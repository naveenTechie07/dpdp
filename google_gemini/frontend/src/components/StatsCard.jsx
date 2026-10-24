import React from 'react';

export default function StatsCard({ title, value, subtitle, badgeText, badgeType = 'medium' }) {
  return (
    <div className="card" style={{ flex: 1, minWidth: '220px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          {title}
        </span>
        {badgeText && <span className={`badge badge-${badgeType}`}>{badgeText}</span>}
      </div>
      <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
        {value}
      </div>
      {subtitle && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{subtitle}</p>}
    </div>
  );
}
