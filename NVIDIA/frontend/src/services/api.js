export const api = {
  baseURL: '/api',

  async scan(files) {
    const formData = new FormData()
    files.forEach((f) => formData.append('files', f))
    const resp = await fetch(`${this.baseURL}/scan`, {
      method: 'POST',
      body: formData,
    })
    return resp.json()
  },

  async getLanguages() {
    const resp = await fetch(`${this.baseURL}/notices/languages`)
    return resp.json()
  },

  async generateNotice(data) {
    const resp = await fetch(`${this.baseURL}/notices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return resp.json()
  },

  async logConsent(data) {
    const resp = await fetch(`${this.baseURL}/consent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return resp.json()
  },

  async getConsents() {
    const resp = await fetch(`${this.baseURL}/consent`)
    return resp.json()
  },

  async dsrAccess(data) {
    const resp = await fetch(`${this.baseURL}/dsr/access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return resp.json()
  },

  async dsrErasure(data) {
    const resp = await fetch(`${this.baseURL}/dsr/erasure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return resp.json()
  },

  async breachReport(data) {
    const resp = await fetch(`${this.baseURL}/breach/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return resp.json()
  },

  async health() {
    const resp = await fetch(`${this.baseURL}/health`)
    return resp.json()
  },
}
