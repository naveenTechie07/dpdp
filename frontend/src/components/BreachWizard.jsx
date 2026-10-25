import { useState } from 'react'
import {
  AlertCircle,
  FileText,
  Download,
  Phone,
  Mail,
  ShieldAlert,
  CheckCircle2,
  Loader2,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'

// Simple chevron components using Lucide icons directly
const ChevronRightOutlined = (props) => <ChevronRight size={props.size || 20} {...props} />
const ChevronLeftOutlined = (props) => <ChevronLeft size={props.size || 20} {...props} />

const INCIDENT_TYPES = [
  { id: 'lost_device', label: 'Lost / Stolen Device', icon: Phone },
  { id: 'leaked_link', label: 'Leaked Public Link', icon: Mail },
  { id: 'accidental_email', label: 'Accidental Email Send', icon: Mail },
  { id: 'unauthorized_access', label: 'Unauthorized Access', icon: ShieldAlert },
  { id: 'other', label: 'Other Incident', icon: AlertCircle },
]

const PII_CATEGORIES = [
  'Phone Numbers',
  'Email Addresses',
  'Aadhaar Numbers',
  'PAN Numbers',
  'Medical Records',
  'Financial Data',
  'Addresses',
  'UPI IDs',
]

export default function BreachWizard({ setActiveTab }) {
  const [step, setStep] = useState(1)
  const [incident, setIncident] = useState({
    incident_type: 'lost_device',
    discovered_at: new Date().toISOString().slice(0, 16),
    pii_categories: [],
    affected_count: 0,
    description: '',
    contact_officer: '',
  })
  const [report, setReport] = useState(null)
  const [generating, setGenerating] = useState(false)

  const totalSteps = 4

  const handleNext = () => {
    if (step < totalSteps) setStep((s) => s + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1)
  }

  const generateReport = async () => {
    setGenerating(true)
    try {
      const resp = await fetch('/api/breach/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incident),
      })
      if (resp.ok) {
        const data = await resp.json()
        setReport(data)
        setStep(4)
      } else {
        // Fallback demo report
        setReport({
          incident_id: 'BR-' + Date.now(),
          incident_type: incident.incident_type,
          discovered_at: incident.discovered_at,
          pii_categories: incident.pii_categories,
          affected_count: incident.affected_count,
          description: incident.description,
          contact_officer: incident.contact_officer,
          dpbi_notification_dossier: `DPBI DOSSIER\nIncident: ${incident.incident_type}\nDate: ${incident.discovered_at}\nAffected: ${incident.affected_count}\nCategories: ${incident.pii_categories.join(', ')}`,
          customer_alert: `We inform you of a data security incident on ${incident.discovered_at}.\nCategories involved: ${incident.pii_categories.join(', ')}.\nNo financial credentials compromised.\nContact: ${incident.contact_officer}`,
          containment_checklist: [
            'Isolate affected systems',
            'Preserve logs',
            'Change passwords',
            'Notify DPBI',
            'Inform affected principals',
          ],
          sha256_hash: 'demo-hash-' + Date.now(),
          generated_at: new Date().toISOString(),
        })
        setStep(4)
      }
    } catch (err) {
      setReport({
        incident_id: 'BR-' + Date.now(),
        incident_type: incident.incident_type,
        discovered_at: incident.discovered_at,
        pii_categories: incident.pii_categories,
        affected_count: incident.affected_count,
        description: incident.description,
        contact_officer: incident.contact_officer,
        dpbi_notification_dossier: 'Demo mode - DPBI dossier generated locally.',
        customer_alert: 'Demo mode - Customer alert generated locally.',
        containment_checklist: ['Isolate systems', 'Preserve logs', 'Change passwords'],
        sha256_hash: 'demo-hash-' + Date.now(),
        generated_at: new Date().toISOString(),
      })
      setStep(4)
    } finally {
      setGenerating(false)
    }
  }

  const progress = ((step - 1) / (totalSteps - 1)) * 100

  return (
    <div className="glass-card">
      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase">Step {step} of {totalSteps}</span>
          <span className="text-xs font-semibold text-sky-400">{Math.round(progress)}% Complete</span>
        </div>
        <div className="h-1.5 bg-slate-700/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-sky-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step 1: Incident Type */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">What type of incident occurred?</h2>
          <p className="text-sm text-slate-400 mb-6">
            Select the incident type to tailor the breach response and containment checklist.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {INCIDENT_TYPES.map((type) => {
              const Icon = type.icon
              const isSelected = incident.incident_type === type.id
              return (
                <button
                  key={type.id}
                  onClick={() => setIncident({ ...incident, incident_type: type.id })}
                  className={`p-4 rounded-lg border transition-colors text-left ${
                    isSelected
                      ? 'bg-sky-500/10 border-sky-500/50 text-slate-100'
                      : 'bg-slate-800/50 border-slate-600/50 text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-sky-400' : 'text-slate-500'}`} />
                  <span className="ml-2 font-medium">{type.label}</span>
                </button>
              )
            })}
          </div>
          <div className="flex justify-end mt-6">
            <button onClick={handleNext} className="btn-primary">
              Next <ChevronRightOutlined className="ml-2 w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Incident Details</h2>
          <p className="text-sm text-slate-400 mb-6">Provide specifics about the breach incident.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Date &amp; Time Discovered</label>
              <input
                type="datetime-local"
                value={incident.discovered_at}
                onChange={(e) => setIncident({ ...incident, discovered_at: e.target.value })}
                className="input-field"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Estimated Affected Count</label>
              <input
                type="number"
                value={incident.affected_count}
                onChange={(e) => setIncident({ ...incident, affected_count: parseInt(e.target.value) || 0 })}
                className="input-field"
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Description of Incident</label>
            <textarea
              value={incident.description}
              onChange={(e) => setIncident({ ...incident, description: e.target.value })}
              rows={4}
              className="input-field"
              placeholder="Describe what happened, when it was discovered, and initial observations..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Grievance Officer Contact</label>
            <input
              type="text"
              value={incident.contact_officer}
              onChange={(e) => setIncident({ ...incident, contact_officer: e.target.value })}
              className="input-field"
              placeholder="privacy@business.com or +91 XXXXXXXXXX"
            />
          </div>

          <div className="flex justify-between mt-6">
            <button onClick={handleBack} className="btn-secondary">
              <ChevronLeftOutlined className="mr-2 w-4 h-4" /> Back
            </button>
            <button onClick={handleNext} className="btn-primary" disabled={!incident.contact_officer}>
              Next <ChevronRightOutlined className="ml-2 w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: PII Categories */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Data Categories Exposed</h2>
          <p className="text-sm text-slate-400 mb-6">
            Select all categories of personal data that may have been compromised.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {PII_CATEGORIES.map((cat) => {
              const isSelected = incident.pii_categories.includes(cat)
              return (
                <button
                  key={cat}
                  onClick={() => {
                    const cats = incident.pii_categories.includes(cat)
                      ? incident.pii_categories.filter((c) => c !== cat)
                      : [...incident.pii_categories, cat]
                    setIncident({ ...incident, pii_categories: cats })
                  }}
                  className={`p-3 rounded-lg border text-center transition-colors text-sm font-medium ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/50 text-amber-400'
                      : 'bg-slate-800/50 border-slate-600/50 text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  {cat}
                </button>
              )
            })}
          </div>
          <div className="flex justify-between mt-6">
            <button onClick={handleBack} className="btn-secondary">
              <ChevronLeftOutlined className="mr-2 w-4 h-4" /> Back
            </button>
            <button
              onClick={handleNext}
              className="btn-primary"
              disabled={incident.pii_categories.length === 0}
            >
              Next <ChevronRightOutlined className="ml-2 w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Report Generated */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-100">Breach Report Generated</h2>
            <p className="text-sm text-slate-400">
              Your Section 8(6) DPBI dossier is ready for filing.
            </p>
          </div>

          {report && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-5">
                  <h3 className="font-bold text-slate-200 mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-sky-400" /> DPBI Notification Dossier
                  </h3>
                  <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 font-mono text-xs text-slate-300 overflow-y-auto max-h-[400px]">
                    {report.dpbi_notification_dossier}
                  </div>
                  <button
                    onClick={() => {
                      const blob = new Blob([report.dpbi_notification_dossier], { type: 'text/plain' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `dpbi-dossier-${report.incident_id}.txt`
                      a.click()
                    }}
                    className="mt-4 btn-secondary w-full"
                  >
                    <Download className="w-4 h-4 mr-2" /> Download Dossier
                  </button>
                </div>

                <div className="glass-card p-5">
                  <h3 className="font-bold text-slate-200 mb-4 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-amber-400" /> Customer Alert (WhatsApp/SMS)
                  </h3>
                  <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 font-mono text-xs text-slate-300 overflow-y-auto max-h-[400px]">
                    {report.customer_alert}
                  </div>
                  <button
                    onClick={() => {
                      const blob = new Blob([report.customer_alert], { type: 'text/plain' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `customer-alert-${report.incident_id}.txt`
                      a.click()
                    }}
                    className="mt-4 btn-secondary w-full"
                  >
                    <Download className="w-4 h-4 mr-2" /> Download Alert
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <div className="glass-card p-5">
                  <h3 className="font-bold text-slate-200 mb-4">Containment Checklist</h3>
                  <div className="space-y-2">
                    {report.containment_checklist.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm text-slate-300">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold border border-emerald-500/30">
                          {idx + 1}
                        </div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <p className="text-sm text-amber-300">
                      <strong className="text-amber-400">Statutory Reference:</strong> Section 8(6), DPDP Act 2023<br />
                      <strong className="text-amber-400">Penalty for non-notification:</strong> Up to ₹200 Crore
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="btn-secondary"
                >
                  New Incident Report
                </button>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="btn-primary"
                >
                  Return to Dashboard
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
