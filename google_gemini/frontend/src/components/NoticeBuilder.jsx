import React, { useState, useEffect } from 'react';
import { fetchNotices, fetchConsents, createConsent } from '../services/api';

export default function NoticeBuilder() {
  const [notices, setNotices] = useState([]);
  const [selectedLang, setSelectedLang] = useState('en');
  const [consents, setConsents] = useState([]);
  const [copied, setCopied] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);

  // New consent form state
  const [principalId, setPrincipalId] = useState('');
  const [principalName, setPrincipalName] = useState('');
  const [purpose, setPurpose] = useState('Diagnostic Test Appointment & Delivery');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [nData, cData] = await Promise.all([fetchNotices(), fetchConsents()]);
      setNotices(nData);
      setConsents(cData);
    } catch (err) {
      console.error(err);
    }
  };

  const activeNotice = notices.find((n) => n.language === selectedLang) || notices[0];

  const handleCopyWhatsApp = () => {
    if (!activeNotice) return;
    const text = `*${activeNotice.title}*\n\n${activeNotice.body_text}\n\n*Purpose:* ${activeNotice.purpose}\n\nTo confirm your appointment, please reply *YES*.\n${activeNotice.statutory_citation}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateConsent = async (e) => {
    e.preventDefault();
    if (!principalId) return;
    await createConsent({
      principal_id: principalId,
      principal_name: principalName,
      purpose: purpose,
      language: selectedLang,
      channel: 'whatsapp_keyword'
    });
    setShowConsentModal(false);
    setPrincipalId('');
    setPrincipalName('');
    loadData();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner */}
      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
          Pillar 2: Multilingual Notice & Consent Governance
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Statutory collection notices generated pursuant to Section 5 of the DPDP Act across 8th Schedule constitutional languages.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Notice Preview Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Section 5 Statutory Notice</h3>
            {/* Language Selector */}
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {notices.map((n) => (
                <button
                  key={n.language}
                  className={`btn ${selectedLang === n.language ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                  onClick={() => setSelectedLang(n.language)}
                >
                  {n.language_display}
                </button>
              ))}
            </div>
          </div>

          {activeNotice && (
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--accent-amber)' }}>
                {activeNotice.title}
              </div>
              <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: 'var(--text-main)' }}>
                {activeNotice.body_text}
              </p>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <strong>Data Points Collected:</strong> {activeNotice.data_points_collected.join(', ')}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <strong>Retention Period:</strong> {activeNotice.retention_period}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-blue)' }}>
                {activeNotice.statutory_citation}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
            <button className="btn btn-success" onClick={handleCopyWhatsApp} style={{ flex: 1 }}>
              {copied ? '✔ Copied to Clipboard!' : '📋 Copy WhatsApp Opt-In Template'}
            </button>
            <button className="btn btn-outline" onClick={() => setShowConsentModal(true)}>
              + Log Consent
            </button>
          </div>
        </div>

        {/* Consent Ledger Table */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Active Consent Ledger (Section 6)</h3>
            <span className="badge badge-low">{consents.length} Active Records</span>
          </div>

          <div className="data-table-container" style={{ maxHeight: '350px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Principal ID</th>
                  <th>Name</th>
                  <th>Channel</th>
                  <th>Status</th>
                  <th>Expiry Date</th>
                </tr>
              </thead>
              <tbody>
                {consents.map((c, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{c.principal_id}</td>
                    <td>{c.principal_name || 'Customer'}</td>
                    <td><span className="badge badge-medium">{c.channel}</span></td>
                    <td>
                      <span className={`badge badge-${c.status === 'ACTIVE' ? 'low' : 'critical'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.expiry_date || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Log Consent Modal */}
      {showConsentModal && (
        <div className="modal-overlay" onClick={() => setShowConsentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>
              Log Affirmative Consent (Section 6)
            </h3>
            <form onSubmit={handleCreateConsent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                  Mobile Number / Email (Principal ID)
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 9845012345"
                  value={principalId}
                  onChange={(e) => setPrincipalId(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#0f172a', border: '1px solid var(--border-color)', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                  Customer Name
                </label>
                <input
                  type="text"
                  placeholder="Ramesh Sharma"
                  value={principalName}
                  onChange={(e) => setPrincipalName(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#0f172a', border: '1px solid var(--border-color)', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                  Purpose
                </label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#0f172a', border: '1px solid var(--border-color)', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowConsentModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save to SQLite Ledger</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
