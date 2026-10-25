import React, { useState } from 'react';
import { submitBreachReport } from '../services/api';

export default function BreachWizard() {
  const [incidentType, setIncidentType] = useState('lost_device');
  const [affectedAsset, setAffectedAsset] = useState('Reception Xiaomi Phone (WhatsApp & Contacts)');
  const [estimatedAffected, setEstimatedAffected] = useState(450);
  const [categories, setCategories] = useState(['phone', 'customer_names', 'clinical_notes']);
  const [description, setDescription] = useState('Reception phone misplaced during evening shift; contained patient appointment chat history.');
  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedDossier, setCopiedDossier] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await submitBreachReport({
        incident_type: incidentType,
        date_discovered: today,
        time_discovered: '18:30 IST',
        affected_device_or_service: affectedAsset,
        estimated_principals_affected: Number(estimatedAffected),
        categories_compromised: categories,
        description: description,
        containment_actions_taken: [
          'Remote device wipe triggered via Google Find My Device',
          'WhatsApp Web session revoked from all desktop browsers',
          'Shared Wi-Fi password rotated immediately',
          'Clinic staff briefed on zero disclosure protocol'
        ]
      });
      setDossier(res);
    } catch (err) {
      alert('Failed to generate incident pack.');
    } finally {
      setLoading(false);
    }
  };

  const copyDossier = () => {
    if (!dossier) return;
    navigator.clipboard.writeText(dossier.dpbi_formal_notification);
    setCopiedDossier(true);
    setTimeout(() => setCopiedDossier(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Banner */}
      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
          Pillar 4: 5-Minute Breach Preparedness & DPBI Notification Pack
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Statutory incident triage under Section 8(6) of the DPDP Act to mitigate up to ₹200 Crore regulatory penalties.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Intake Wizard Card */}
        <div className="card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem' }}>
            Incident Intake Wizard
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Incident Category
              </label>
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#0f172a', border: '1px solid var(--border-color)', color: '#fff' }}
              >
                <option value="lost_device">📱 Lost or Stolen Reception Phone / Laptop</option>
                <option value="leaked_link">🔗 Publicly Exposed Google Drive / Sheet Link</option>
                <option value="accidental_email">✉ Accidental Email of Customer Leads Sheet</option>
                <option value="unauthorized_access">🔓 Unauthorized Access by Ex-Employee</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Affected Asset or Channel
              </label>
              <input
                type="text"
                value={affectedAsset}
                onChange={(e) => setAffectedAsset(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#0f172a', border: '1px solid var(--border-color)', color: '#fff' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Estimated Number of Customers Affected
              </label>
              <input
                type="number"
                value={estimatedAffected}
                onChange={(e) => setEstimatedAffected(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#0f172a', border: '1px solid var(--border-color)', color: '#fff' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Root Cause & Circumstances
              </label>
              <textarea
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#0f172a', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.85rem' }}
              />
            </div>

            <button type="submit" className="btn btn-danger" style={{ marginTop: '0.5rem' }} disabled={loading}>
              {loading ? 'Generating Statutory Filing...' : '🚨 Generate Section 8(6) DPBI Dossier'}
            </button>
          </form>
        </div>

        {/* Regulatory Output & Alerts */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>
            Statutory Output & Response Actions
          </h3>

          {dossier ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--accent-red)', borderRadius: '8px', padding: '0.85rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-red)' }}>
                  Statutory Incident Reference: {dossier.incident_id}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Liability Assessment: {dossier.max_statutory_penalty_risk}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-amber)', marginBottom: '0.35rem' }}>
                  Official Section 8(6) DPBI Regulatory Document:
                </div>
                <pre style={{ background: '#0b1120', padding: '0.75rem', borderRadius: '6px', fontSize: '0.7rem', color: '#cbd5e1', maxHeight: '180px', overflowY: 'auto' }}>
                  {dossier.dpbi_formal_notification}
                </pre>
                <button className="btn btn-outline" style={{ marginTop: '0.5rem', width: '100%', fontSize: '0.75rem' }} onClick={copyDossier}>
                  {copiedDossier ? '✔ Dossier Copied!' : '📄 Copy Full DPBI Notification Document'}
                </button>
              </div>

              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-green)', marginBottom: '0.35rem' }}>
                  Customer Plain-Language Alert Broadcast (SMS/WhatsApp):
                </div>
                <div style={{ background: 'rgba(52, 211, 153, 0.08)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.75rem', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
                  {dossier.customer_alert_sms}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Fill in the incident details on the left and click "Generate" to simulate a real-world breach response.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
