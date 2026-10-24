import React, { useState } from 'react';
import { searchDSR, executeErasure } from '../services/api';

export default function DSRModal() {
  const [query, setQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [erasureResult, setErasureResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erasing, setErasing] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    setErasureResult(null);
    try {
      const data = await searchDSR(query);
      setSearchResult(data);
    } catch (err) {
      alert('Search failed. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleErasure = async () => {
    if (!window.confirm(`Are you sure you want to execute Section 12 atomic erasure for ${searchResult.principal_id}?`)) {
      return;
    }
    setErasing(true);
    try {
      const res = await executeErasure(searchResult.principal_id);
      setErasureResult(res);
    } catch (err) {
      alert('Erasure execution failed.');
    } finally {
      setErasing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Banner */}
      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
          Pillar 3: Data Principal Rights (DSR) & Atomic Redaction
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Fulfill Section 11 Access Summaries and execute Section 12 Atomic Spreadsheet Redactions with automated CGST 6-year tax retention resolution.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="card">
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <input
              type="text"
              placeholder="Search Customer Phone (e.g. 9845112233) or Email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: '#0f172a', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.95rem' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Searching Files...' : '🔍 Find Customer Records (Sec 11)'}
          </button>
        </form>
      </div>

      {/* Access Report Card */}
      {searchResult && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-blue)' }}>
                Section 11 Access Report: {searchResult.principal_id}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Lawful Basis: {searchResult.lawful_basis}
              </p>
            </div>
            <span className="badge badge-low">Records Found: {searchResult.identified_records_count}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
                Files Containing Customer Data:
              </div>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem' }}>
                {searchResult.matched_files.map((mf, idx) => (
                  <li key={idx} style={{ color: 'var(--text-main)', marginBottom: '0.25rem' }}>{mf}</li>
                ))}
              </ul>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
                Personal Data Categories Held:
              </div>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {searchResult.held_categories.map((cat, idx) => (
                  <span key={idx} className="badge badge-medium">{cat}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Trigger for Erasure */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Execute Right to Erasure (Section 12)</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Performs in-place atomic cell redaction across Excel & CSV files while preserving formulas.
              </p>
            </div>
            <button className="btn btn-danger" onClick={handleErasure} disabled={erasing}>
              {erasing ? 'Redacting & Generating Proof...' : '🗑 Execute Atomic Erasure & Redaction'}
            </button>
          </div>
        </div>
      )}

      {/* Erasure Result & Statutory Tax Certificate Card */}
      {erasureResult && (
        <div className="card" style={{ border: '1px solid var(--accent-green)', background: 'rgba(52, 211, 153, 0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-green)' }}>
              ✔ Section 12 Erasure Executed Successfully
            </h3>
            <span className="badge badge-low">{erasureResult.status}</span>
          </div>

          <p style={{ fontSize: '0.875rem' }}>
            Modified <strong>{erasureResult.modified_files.join(', ')}</strong> with <strong>{erasureResult.redacted_cells_count}</strong> cells atomically redacted without breaking Excel formulas.
          </p>

          {/* Statutory Tax Conflict Callout */}
          {erasureResult.statutory_tax_lock && (
            <div style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid var(--accent-amber)', borderRadius: '8px', padding: '1rem' }}>
              <div style={{ fontWeight: 700, color: 'var(--accent-amber)', fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                ⚖ Statutory Tax Retention Conflict Resolved (CGST Act Section 36)
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                {erasureResult.retained_invoices[0]?.reason}
              </p>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                <strong>Statutory Action:</strong> Customer phone and marketing tags have been wiped; financial amounts and invoice numbers remain preserved for tax audit protection.
              </div>
            </div>
          )}

          {/* Cryptographic Proof Certificate Box */}
          <div style={{ background: '#0b1120', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
            <div style={{ fontWeight: 600, color: 'var(--accent-blue)', marginBottom: '0.5rem' }}>
              Cryptographic Audit Proof (SHA-256 Proof of Erasure):
            </div>
            <code style={{ wordBreak: 'break-all', color: 'var(--text-muted)' }}>
              {erasureResult.certificate.sha256_proof}
            </code>
            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Certificate ID: <strong>{erasureResult.certificate.certificate_id}</strong> • Timestamp: {erasureResult.certificate.timestamp_utc}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
