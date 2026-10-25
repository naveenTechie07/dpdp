import React from 'react';

export default function Navbar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'inventory', label: '1. Data Map (RoPA)' },
    { id: 'consent', label: '2. Notices & Consent' },
    { id: 'dsr', label: '3. Rights & Erasure' },
    { id: 'breach', label: '4. Breach Response' },
  ];

  return (
    <header style={{ borderBottom: '1px solid var(--border-color)', background: '#0b1120', position: 'sticky', top: 0, zIndex: 40 }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #0284c7, #38bdf8)', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>
            DP
          </div>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              DPDPA for Small Business
              <span className="badge badge-low" style={{ fontSize: '0.65rem' }}>100% Offline-First</span>
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Srujana Tech Fest 2026 • Legal Services Track (LS-04)
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.03)', padding: '0.25rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                padding: '0.45rem 0.95rem',
                borderRadius: '8px',
                fontSize: '0.825rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                background: activeTab === item.id ? 'var(--accent-blue)' : 'transparent',
                color: activeTab === item.id ? '#0f172a' : 'var(--text-muted)'
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
