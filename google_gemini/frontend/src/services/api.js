const API_BASE = 'http://localhost:8000/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function triggerScan() {
  const res = await fetch(`${API_BASE}/scan`, { method: 'POST' });
  return res.json();
}

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData
  });
  return res.json();
}

export async function fetchNotices() {
  const res = await fetch(`${API_BASE}/notices`);
  return res.json();
}

export async function fetchConsents() {
  const res = await fetch(`${API_BASE}/consents`);
  return res.json();
}

export async function createConsent(data) {
  const res = await fetch(`${API_BASE}/consents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function searchDSR(query) {
  const res = await fetch(`${API_BASE}/dsr/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  return res.json();
}

export async function executeErasure(principalId) {
  const res = await fetch(`${API_BASE}/dsr/erasure`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ principal_id: principalId })
  });
  return res.json();
}

export async function submitBreachReport(incidentData) {
  const res = await fetch(`${API_BASE}/breach/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(incidentData)
  });
  return res.json();
}
