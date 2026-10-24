import { useState } from 'react'
import {
  Search,
  Mail,
  Phone,
  Download,
  FileText,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react'

const MOCK_PRINCIPALS = [
  {
    id: '+91 9845012345',
    name: 'Ramesh Sharma',
    phone: '+91 9845012345',
    email: 'ramesh.sharma@example.com',
    address: '#42, 3rd Cross, Indiranagar, Bengaluru',
    aadhaar: '****-****-2345',
    pan: 'ABCDE****',
    dataPoints: [
      { file: 'clinic_reception_chat.txt', field: 'Phone Number', value: '***2345', type: 'phone' },
      { file: 'clinic_reception_chat.txt', field: 'Aadhaar Number', value: '****-****-2345', type: 'aadhaar' },
      { file: 'clinic_reception_chat.txt', field: 'Email Address', value: 'r***@example.com', type: 'email' },
      { file: 'invoices_billing.csv', field: 'Invoice Amount', value: '₹14,500', type: 'financial' },
      { file: 'customer_leads.csv', field: 'Status', value: 'Active', type: 'status' },
    ],
    processors: ['Billing Software', 'WhatsApp'],
    consentId: 'CN-8812',
    consentDate: '14-Aug-2024',
  },
  {
    id: '9876543210',
    name: 'Priya Patel',
    phone: '9876543210',
    email: 'priya.patel@workmail.in',
    address: 'Mysuru, Karnataka',
    aadhaar: null,
    pan: 'ABCDE1234F',
    dataPoints: [
      { file: 'clinic_reception_chat.txt', field: 'Patient ID', value: 'PAT-9921', type: 'id' },
      { file: 'clinic_reception_chat.txt', field: 'PAN Number', value: 'ABCDE****', type: 'pan' },
    ],
    processors: ['Laboratory Partner'],
    consentId: 'CN-9921',
    consentDate: '12-Oct-2024',
  },
]

export default function DSRModal({ setActiveTab }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPrincipal, setSelectedPrincipal] = useState(null)
  const [showResults, setShowResults] = useState(false)
  [useState('')] // erasureResult
  const [erasureResult, setErasureResult] = useState(null)

  const filteredPrincipals = MOCK_PRINCIPALS.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone.includes(searchQuery)
  )

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery) return

    try {
      const resp = await fetch('/api/dsr/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          principal_id: searchQuery,
          request_type: 'access',
          contact_method: 'whatsapp',
        }),
      })
      if (resp.ok) {
        const data = await resp.json()
        setSelectedPrincipal({
          id: data.principal_id,
          name: searchQuery,
          dataPoints: data.data_points,
          processors: data.processors,
          consentId: data.consent_id,
        })
        setShowResults(true)
      } else {
        // Fallback to mock
        const found = MOCK_PRINCIPALS.find(
          (p) => p.id === searchQuery || p.name.toLowerCase() === searchQuery.toLowerCase()
        )
        if (found) {
          setSelectedPrincipal(found)
          setShowResults(true)
        }
      }
    } catch (err) {
      // Fallback to mock
      const found = MOCK_PRINCIPALS.find(
        (p) => p.id === searchQuery || p.name.toLowerCase() === searchQuery.toLowerCase()
      )
      if (found) {
        setSelectedPrincipal(found)
        setShowResults(true)
      }
    }
  }

  const handleErasure = async () => {
    if (!selectedPrincipal) return

    try {
      const resp = await fetch('/api/dsr/erasure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          principal_id: selectedPrincipal.id,
          invoice_dates: ['2024-09-15', '2023-11-05'], // Mixed ages to test both branches
        }),
      })
      if (resp.ok) {
        const data = await resp.json()
        setErasureResult(data)
      } else {
        setErasureResult({
          status: 'STATUTORY_RETENTION_LOCK',
          statute: 'CGST Act Sec 36 read with DPDP Act Sec 8(7)',
          message: 'Demo mode: Invoice under 6 years - financial data retained, marketing tags erased.',
          retention_until: '2029-12-31',
          files_modified: ['invoices_billing.csv'],
          financial_records_retained: true,
        })
      }
    } catch (err) {
      setErasureResult({
        status: 'STATUTORY_RETENTION_LOCK',
        statute: 'CGST Act Sec 36 read with DPDP Act Sec 8(7)',
        message: 'Demo mode: Invoice under 6 years - financial data retained, marketing tags erased.',
        retention_until: '2029-12-31',
        files_modified: ['invoices_billing.csv'],
        financial_records_retained: true,
      })
    }
  }

  const statusColor = (status) => {
    if (status === 'APPROVED_FULL_ERASURE') return 'text-emerald-400'
    if (status === 'STATUTORY_RETENTION_LOCK') return 'text-amber-400'
    return 'text-slate-400'
  }

  return (
    <div className="glass-card">
      <div className="mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-amber-400" /> Data Principal Rights (DSR)
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Sections 11 &amp; 12: Right to Access, Correction &amp; Erasure with statutory tax retention conflict resolution.
        </p>
      </div>

      {/* Search Section */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by phone number or name (e.g., +91 9845012345)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <button type="submit" className="btn-secondary">
            Search Data Principal
          </button>
        </form>
        <div className="mt-3 flex gap-2 text-xs text-slate-500">
          {MOCK_PRINCIPALS.map((p) => (
            <span
              key={p.id}
              onClick={() => {
                setSearchQuery(p.id)
                setSelectedPrincipal(p)
                setShowResults(true)
              }}
              className="px-3 py-1 bg-slate-800/50 border border-slate-600 rounded-full text-slate-300 hover:bg-slate-700 cursor-pointer transition-colors"
            >
              {p.name}
            </span>
          ))}
        </div>
      </div>

      {/* Results Section */}
      {showResults && selectedPrincipal && (
        <div className="space-y-6">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-100">{selectedPrincipal.name}</h3>
                <p className="text-sm text-slate-400">{selectedPrincipal.id}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleErasure}
                  disabled={!!erasureResult}
                  className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg font-medium hover:bg-red-500/20 transition-colors"
                >
                  {erasureResult ? 'Erasure Complete' : 'Execute Erasure (Section 12)'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="text-xs font-semibold text-slate-400 uppercase">Data Points</div>
                <div className="text-lg font-bold text-slate-100">{selectedPrincipal.dataPoints.length}</div>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="text-xs font-semibold text-slate-400 uppercase">Processors</div>
                <div className="text-lg font-bold text-slate-100">{selectedPrincipal.processors.length}</div>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="text-xs font-semibold text-slate-400 uppercase">Consent ID</div>
                <div className="text-lg font-bold text-emerald-400">{selectedPrincipal.consentId}</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400">Source File</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400">Field</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400">Value</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400">PII Type</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPrincipal.dataPoints.map((dp, idx) => (
                    <tr key={idx} className="border-b border-slate-700/30">
                      <td className="px-4 py-2 text-slate-300 text-sm">{dp.file}</td>
                      <td className="px-4 py-2 text-slate-200 text-sm">{dp.field}</td>
                      <td className="px-4 py-2 text-slate-200 text-sm font-mono">{dp.value}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          dp.type === 'aadhaar' || dp.type === 'pan'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : dp.type === 'phone' || dp.type === 'email'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-slate-700/10 text-slate-400 border border-slate-600'
                        }`}>
                          {dp.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3 bg-slate-800/30 border border-slate-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-200">Third-Party Processors</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedPrincipal.processors.map((proc, idx) => (
                  <span key={idx} className="px-2 py-1 bg-slate-700/50 border border-slate-600 rounded text-xs text-slate-300">
                    {proc}
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Consent recorded on {selectedPrincipal.consentDate} under Consent ID {selectedPrincipal.consentId}
              </p>
            </div>
          </div>

          {/* Erasure Result */}
          {erasureResult && (
            <div className="glass-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-slate-100">Erasure Certificate</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-slate-800/50 rounded border border-slate-700/50">
                  <div className="text-xs font-semibold text-slate-400 uppercase">Status</div>
                  <div className={`font-bold text-sm capitalize ${statusColor(erasureResult.status)}`}>
                    {erasureResult.status.replace(/_/g, ' ')}
                  </div>
                </div>
                <div className="p-3 bg-slate-800/50 rounded border border-slate-700/50">
                  <div className="text-xs font-semibold text-slate-400 uppercase">Statute</div>
                  <div className="text-xs text-slate-300">{erasureResult.statute}</div>
                </div>
                {erasureResult.retention_until && (
                  <div className="p-3 bg-amber-500/10 rounded border border-amber-500/20">
                    <div className="text-xs font-semibold text-amber-400 uppercase">Retention Until</div>
                    <div className="text-sm text-amber-300">{erasureResult.retention_until}</div>
                  </div>
                )}
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-4">
                <div className="text-xs font-semibold text-slate-400 uppercase mb-2">Details</div>
                <div className="text-sm text-slate-300 whitespace-pre-line">{erasureResult.message}</div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const blob = new Blob([erasureResult.sha256_certificate || 'Certificate content'], { type: 'text/plain' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `erasure-certificate-${selectedPrincipal.id.replace(/\s+/g, '_')}.txt`
                    a.click()
                  }}
                  className="btn-secondary"
                >
                  <Download className="w-4 h-4 mr-2" /> Download Certificate
                </button>
                <button
                  onClick={() => setErasureResult(null)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-medium transition-colors"
                >
                  New Request
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!showResults && (
        <div className="h-64 flex items-center justify-center text-slate-500">
          <div className="text-center">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Search for a data principal to view their data</p>
          </div>
        </div>
      )}
    </div>
  )
}
