import React, { useState } from 'react';
import { triggerScan, uploadFile } from '../services/api';

export default function RoPATable({ scanData, setScanData, onSelectFileForDSR }) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFileDetail, setSelectedFileDetail] = useState(null);

  const handleScan = async () => {
    setLoading(true);
    try {
      const data = await triggerScan();
      setScanData(data);
    } catch (err) {
      alert('Scanning failed. Ensure backend server is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadFile(file);
      // Re-trigger scan after upload
      const data = await triggerScan();
      setScanData(data);
    } catch (err) {
      alert('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner & Action Controls */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Pillar 1: Local PII Scanner & RoPA Mapper
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Automated discovery of personal data across informal Excel sheets, CSV files, and WhatsApp chat exports.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
            {uploading ? 'Uploading...' : '📁 Upload File to Scan'}
            <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} accept=".xlsx,.xls,.csv,.txt" />
          </label>
          <button className="btn btn-primary" onClick={handleScan} disabled={loading}>
            {loading ? 'Scanning Files Locally...' : '⚡ Run Local Privacy Scan'}
          </button>
        </div>
      </div>

      {/* Main RoPA Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>
            Record of Processing Activities (RoPA) — Informal Stores
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Last scan: {scanData?.scan_timestamp ? new Date(scanData.scan_timestamp).toLocaleTimeString() : 'Not yet scanned'}
          </span>
        </div>

        {scanData?.files && scanData.files.length > 0 ? (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Type</th>
                  <th>Risk Level</th>
                  <th>Total Records</th>
                  <th>PII Detections</th>
                  <th>Categories Identified</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {scanData.files.map((file, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{file.filename}</td>
                    <td>
                      <span className="badge badge-medium" style={{ textTransform: 'capitalize' }}>
                        {file.file_type}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${file.risk_level.toLowerCase()}`}>
                        {file.risk_level}
                      </span>
                    </td>
                    <td>{file.total_records}</td>
                    <td style={{ fontWeight: 700 }}>{file.pii_count} items</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        {file.detected_categories.map((cat, cIdx) => (
                          <span key={cIdx} style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}>
                            {cat}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        onClick={() => setSelectedFileDetail(file)}
                      >
                        Inspect PII
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No data scanned yet.</p>
            <p style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>Click "Run Local Privacy Scan" above to discover unencrypted PII across sample files.</p>
            <button className="btn btn-primary" onClick={handleScan} disabled={loading}>
              Run Sample Scan Now
            </button>
          </div>
        )}
      </div>

      {/* Inspect Modal */}
      {selectedFileDetail && (
        <div className="modal-overlay" onClick={() => setSelectedFileDetail(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                PII Breakdown: {selectedFileDetail.filename}
              </h3>
              <button className="btn btn-outline" onClick={() => setSelectedFileDetail(null)}>✕</button>
            </div>

            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Full Path: <code>{selectedFileDetail.file_path}</code>
            </p>

            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Sample Detected Entities (Masked for Safety):</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '250px', overflowY: 'auto', marginBottom: '1.5rem' }}>
              {selectedFileDetail.sample_entities.map((ent, eIdx) => (
                <div key={eIdx} style={{ background: 'rgba(255,255,255,0.03)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--accent-amber)', fontSize: '0.8rem', marginRight: '0.5rem', textTransform: 'uppercase' }}>
                      {ent.category}
                    </span>
                    <code style={{ fontSize: '0.85rem' }}>{ent.value}</code>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ent.context}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button className="btn btn-primary" onClick={() => setSelectedFileDetail(null)}>Close Inspection</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
