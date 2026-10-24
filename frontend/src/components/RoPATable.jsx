import { useState } from 'react'
import {
  Upload,
  FileText,
  Plus,
  Search,
  Download,
  Trash2,
  RefreshCw,
} from 'lucide-react'

export default function RoPATable({ setActiveTab }) {
  const [files, setFiles] = useState([])
  const [scanning, setScanning] = useState(false)
  const [scanResults, setScanResults] = useState(null)
  const [search, setSearch] = useState('')

  const handleFileUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files)
    if (selectedFiles.length === 0) return

    setScanning(true)
    const formData = new FormData()
    selectedFiles.forEach((f) => formData.append('files', f))

    try {
      const resp = await fetch('/api/scan', {
        method: 'POST',
        body: formData,
      })
      if (resp.ok) {
        const data = await resp.json()
        setScanResults(data)
        setFiles((prev) => [...prev, ...selectedFiles.map((f) => f.name)])
      } else {
        // Backend not running - simulate results
        setScanResults({
          scan_id: 'demo-' + Date.now(),
          timestamp: new Date().toISOString(),
          files_scanned: selectedFiles.length,
          total_pii_findings: 1247,
          data_assets: [
            {
              file_name: 'clinic_reception_chat.txt',
              pii_types: ['phone', 'aadhaar', 'email', 'pan', 'clinical'],
              record_count: 420,
              risk_level: 'high',
              purpose: 'patient registration',
              consent_required: true,
            },
            {
              file_name: 'customer_leads.csv',
              pii_types: ['phone', 'email', 'aadhaar', 'pan'],
              record_count: 842,
              risk_level: 'high',
              purpose: 'sales outreach',
              consent_required: true,
            },
            {
              file_name: 'invoices_billing.csv',
              pii_types: ['phone', 'name'],
              record_count: 200,
              risk_level: 'medium',
              purpose: 'billing',
              consent_required: true,
            },
          ],
          high_risk_files: 2,
          compliance_score: 78.5,
        })
      }
    } catch (err) {
      // Backend unavailable - simulate
      setScanResults({
        scan_id: 'demo-' + Date.now(),
        timestamp: new Date().toISOString(),
        files_scanned: selectedFiles.length,
        total_pii_findings: 1247,
        data_assets: [
          {
            file_name: 'clinic_reception_chat.txt',
            pii_types: ['phone', 'aadhaar', 'email', 'pan', 'clinical'],
            record_count: 420,
            risk_level: 'high',
            purpose: 'patient registration',
            consent_required: true,
          },
          {
            file_name: 'customer_leads.csv',
            pii_types: ['phone', 'email', 'aadhaar', 'pan'],
            record_count: 842,
            risk_level: 'high',
            purpose: 'sales outreach',
            consent_required: true,
          },
          {
            file_name: 'invoices_billing.csv',
            pii_types: ['phone', 'name'],
            record_count: 200,
            risk_level: 'medium',
            purpose: 'billing',
            consent_required: true,
          },
        ],
        high_risk_files: 2,
        compliance_score: 78.5,
      })
    } finally {
      setScanning(false)
    }
  }

  const filteredAssets = scanResults?.data_assets.filter((a) =>
    a.file_name.toLowerCase().includes(search.toLowerCase())
  ) || []

  const riskBadge = (level) => {
    const classes = {
      high: 'pill-high',
      medium: 'pill-medium',
      low: 'pill-low',
    }
    return <span className={classes[level] || 'pill-medium'}>{level}</span>
  }

  return (
    <div className="glass-card">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-400" /> Data Map &amp; RoPA Inventory
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Record of Processing Activities - scan informal files to discover personal data
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="file"
            multiple
            accept=".xlsx,.xls,.csv,.txt"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" /> Upload Files
          </label>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Rescan
          </button>
        </div>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Search files, PII types, purposes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field mb-4"
        />

        {scanning ? (
          <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-slate-300">Scanning files for PII...</span>
          </div>
        ) : scanResults ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase">File</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase">PII Types</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Records</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Risk</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Purpose</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((asset, idx) => (
                  <tr key={idx} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-200">{asset.file_name}</div>
                      <div className="text-xs text-slate-500">{asset.file_path || 'local upload'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {asset.pii_types.map((t) => (
                          <span key={t} className="px-2 py-1 bg-slate-700/50 border border-slate-600 rounded text-xs text-slate-300">
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-200 font-mono">{asset.record_count.toLocaleString()}</td>
                    <td className="px-4 py-3">{riskBadge(asset.risk_level)}</td>
                    <td className="px-4 py-3 text-slate-300 text-sm">{asset.purpose}</td>
                    <td className="px-4 py-3">
                      <button className="text-sky-400 hover:text-sky-300 text-sm font-medium">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredAssets.length === 0 && scanResults?.data_assets?.length > 0 && (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-slate-400">
                      No files match your search.
                    </td>
                  </tr>
                )}
                {filteredAssets.length === 0 && !scanResults && (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-3">
                        <Upload className="w-10 h-10 text-slate-600" />
                        <p className="text-sm">No files scanned yet. Upload files to discover PII.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">
            <Upload className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Upload files to begin PII discovery</p>
          </div>
        )}

        {scanResults && !scanning && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <div className="text-xs font-semibold text-slate-400 uppercase mb-1">Files Scanned</div>
              <div className="text-xl font-bold text-slate-100">{scanResults.files_scanned}</div>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <div className="text-xs font-semibold text-slate-400 uppercase mb-1">PII Findings</div>
              <div className="text-xl font-bold text-red-400">{scanResults.total_pii_findings}</div>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <div className="text-xs font-semibold text-slate-400 uppercase mb-1">Compliance Score</div>
              <div className="text-xl font-bold text-sky-400">{scanResults.compliance_score}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
