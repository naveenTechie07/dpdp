import { useState } from 'react'
import {
  Mail,
  Phone,
  Home,
  Copy,
  CheckCircle2,
  Globe,
  FileText,
} from 'lucide-react'

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
]

export default function NoticeBuilder({ setActiveTab }) {
  const [language, setLanguage] = useState('en')
  const [principalName, setPrincipalName] = useState('')
  const [purpose, setPurpose] = useState('')
  const [dataItems, setDataItems] = useState('')
  const [grievanceContact, setGrievanceContact] = useState('')
  const [businessName, setBusinessName] = useState('Aarogya Diagnostic Center')
  const [noticeGenerated, setNoticeGenerated] = useState(false)
  const [noticeText, setNoticeText] = useState('')

  const generateNotice = async () => {
    try {
      const resp = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          principal_name: principalName || 'Data Principal',
          purpose: purpose || 'Service delivery',
          data_items: dataItems.split(',').map((s) => s.trim()).filter(Boolean),
          language: language,
          grievance_contact: grievanceContact || 'privacy@business.com',
          business_name: businessName || 'Small Business',
        }),
      })
      if (resp.ok) {
        const data = await resp.json()
        setNoticeText(data.notice_text)
        setNoticeGenerated(true)
      } else {
        setNoticeText(generateClientSideNotice())
        setNoticeGenerated(true)
      }
    } catch (err) {
      setNoticeText(generateClientSideNotice())
      setNoticeGenerated(true)
    }
  }

  const generateClientSideNotice = () => {
    const lang = LANGUAGES.find((l) => l.code === language)
    return `SECTION 5 NOTICE - DPDP Act, 2023\n\nTo: ${principalName || 'Data Principal'}\nFrom: ${businessName}\n\nWe collect: ${dataItems || 'personal data'}\nPurpose: ${purpose || 'service delivery'}\nLanguage: ${lang?.name || 'English'}\nGrievance: ${grievanceContact}\n\nYour rights: access, correction, erasure, grievance redressal.\nWithdraw consent anytime with equal ease.\n`
  }

  const copyToClipboard = () => {
    if (!noticeText) return
    navigator.clipboard.writeText(noticeText)
  }

  const whatsAppOptIn = `*${businessName}* - Data Collection Notice\n\nWe collect your ${dataItems || 'personal data'} for ${purpose || 'service delivery'}.\n\nReply YES to consent.\nReply STOP to withdraw.\nGrievance: ${grievanceContact}\n\nUnder DPDP Act, 2023 Section 5`

  return (
    <div className="glass-card">
      <div className="mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" /> Section 5 Notice &amp; Consent Builder
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Generate multilingual notices under Section 5(1) &amp; 5(3) of the DPDP Act, 2023. Available in English, Hindi, and Kannada.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Business Name</label>
            <input
              className="input-field"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g., Aarogya Diagnostic Center"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Data Principal Name</label>
            <input
              className="input-field"
              value={principalName}
              onChange={(e) => setPrincipalName(e.target.value)}
              placeholder="e.g., Ramesh Sharma"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Purpose of Collection</label>
            <input
              className="input-field"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g., Patient registration and diagnostic testing"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Data Items Collected (comma-separated)</label>
            <input
              className="input-field"
              value={dataItems}
              onChange={(e) => setDataItems(e.target.value)}
              placeholder="Name, Phone, Address, Aadhaar, Medical history"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Grievance Contact</label>
            <input
              className="input-field"
              value={grievanceContact}
              onChange={(e) => setGrievanceContact(e.target.value)}
              placeholder="privacy@business.com or +91 XXXXXXXXXX"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Notice Language</label>
            <div className="flex gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    language === lang.code
                      ? 'bg-sky-500 text-white border border-sky-500'
                      : 'bg-slate-800 border border-slate-600 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Globe className="w-3 h-3 mr-1" />
                  {lang.native}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generateNotice}
            className="btn-primary w-full"
            disabled={!principalName || !purpose || !dataItems}
          >
            Generate Section 5 Notice
          </button>
        </div>

        <div className="lg:col-span-7">
          <div className="glass-card p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-200">Notice Preview</h3>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  disabled={!noticeGenerated}
                  className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-sm disabled:opacity-50 transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4" /> Copy
                </button>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-sm transition-colors"
                >
                  <FileText className="w-4 h-4 mr-1" /> Download PDF
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-800/30 border border-slate-700 rounded-lg p-4 font-mono text-sm text-slate-300 overflow-y-auto max-h-[500px]">
              {noticeGenerated ? noticeText : generateClientSideNotice()}
            </div>
            {noticeGenerated && (
              <div className="mt-3 flex items-center gap-2 text-emerald-400 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Notice generated under <span className="text-slate-200">Section 5(1) &amp; 5(3), DPDP Act 2023</span>
              </div>
            )}
          </div>

          <div>
            <div className="mt-6 glass-card p-4">
              <h3 className="font-semibold text-slate-200 mb-3 flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400" /> WhatsApp Opt-in Message
              </h3>
              <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 font-mono text-xs text-slate-300">
                {whatsAppOptIn}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Reply <span className="text-emerald-400 font-bold">YES</span> to consent • Reply <span className="text-red-400 font-bold">STOP</span> to withdraw
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
