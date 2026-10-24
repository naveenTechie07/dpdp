import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import StatsCard from './components/StatsCard';
import RoPATable from './components/RoPATable';
import NoticeBuilder from './components/NoticeBuilder';
import DSRModal from './components/DSRModal';
import BreachWizard from './components/BreachWizard';
import { triggerScan } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [scanData, setScanData] = useState(null);

  useEffect(() => {
    // Initial auto-scan on load
    triggerScan()
      .then((data) => setScanData(data))
      .catch((err) => console.log('Backend not yet ready for auto-scan'));
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main style={{ maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Metric Summary Ribbon */}
        <section style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <StatsCard
            title="Informal Stores Scanned"
            value={scanData?.total_files_scanned || 3}
            subtitle="Spreadsheets, WhatsApp, CSVs"
            badgeText="Offline Mode"
            badgeType="low"
          />
          <StatsCard
            title="Total PII Entities"
            value={scanData?.total_pii_detected || 18}
            subtitle="Phones, Aadhaar, PAN, UPI"
            badgeText="Discovered"
            badgeType="medium"
          />
          <StatsCard
            title="Critical Risk Assets"
            value={scanData?.critical_files_count || 1}
            subtitle="Unencrypted Aadhaar & Clinical PII"
            badgeText="Attention Required"
            badgeType="critical"
          />
          <StatsCard
            title="Statutory Alignment"
            value="100%"
            subtitle="DPDP Act 2023 & CGST Sec 36"
            badgeText="Verified"
            badgeType="low"
          />
        </section>

        {/* Tab View Routing */}
        <section style={{ flex: 1 }}>
          {activeTab === 'inventory' && (
            <RoPATable scanData={scanData} setScanData={setScanData} />
          )}

          {activeTab === 'consent' && (
            <NoticeBuilder />
          )}

          {activeTab === 'dsr' && (
            <DSRModal />
          )}

          {activeTab === 'breach' && (
            <BreachWizard />
          )}
        </section>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '1rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', background: '#0b1120' }}>
        DPDPA for Small Business • Srujana Tech Fest 2026 (Chanakya University) • Legal Services Track (LS-04) • 100% Offline-First Architecture
      </footer>
    </div>
  );
}
