import { useState } from 'react'
import {
  LayoutDashboard,
  FileText,
  ShieldCheck,
  BarChart3,
  AlertCircle,
  Mail,
  CheckCircle2,
} from 'lucide-react'
import Navbar from './components/Navbar'
import StatsCard from './components/StatsCard'
import RoPATable from './components/RoPATable'
import NoticeBuilder from './components/NoticeBuilder'
import DSRModal from './components/DSRModal'
import BreachWizard from './components/BreachWizard'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'datamap', label: 'Data Map', icon: FileText },
  { id: 'notices', label: 'Notices & Consent', icon: ShieldCheck },
  { id: 'dsr', label: 'Rights (DSR)', icon: BarChart3 },
  { id: 'breach', label: 'Breach Response', icon: AlertCircle },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [metrics, setMetrics] = useState({
    piiFound: 1247,
    filesScanned: 23,
    consentsLogged: 89,
    rightsFulfilled: 12,
    breachesLogged: 0,
    complianceScore: 78,
  })

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatsCard
            title="PII Records Found"
            value={metrics.piiFound}
            icon={Mail}
            color="text-red-400"
            change="+12% vs last scan"
            changeColor="text-emerald-400"
          />
          <StatsCard
            title="Files Scanned"
            value={metrics.filesScanned}
            icon={FileText}
            color="text-sky-400"
            change="+5 today"
            changeColor="text-emerald-400"
          />
          <StatsCard
            title="Consents Logged"
            value={metrics.consentsLogged}
            icon={CheckCircle2}
            color="text-emerald-400"
            change="+3 this week"
            changeColor="text-emerald-400"
          />
          <StatsCard
            title="Rights Fulfilled"
            value={metrics.rightsFulfilled}
            icon={BarChart3}
            color="text-amber-400"
            change="+2 today"
            changeColor="text-emerald-400"
          />
          <StatsCard
            title="Breach Incidents"
            value={metrics.breachesLogged}
            icon={AlertCircle}
            color={metrics.breachesLogged > 0 ? "text-red-400" : "text-emerald-400"}
            change={metrics.breachesLogged > 0 ? "needs attention" : "none reported"}
            changeColor={metrics.breachesLogged > 0 ? "text-red-400" : "text-emerald-400"}
          />
          <StatsCard
            title="Compliance Score"
            value={metrics.complianceScore}
            icon={ShieldCheck}
            color="text-sky-400"
            change="DPDP Act aligned"
            changeColor="text-emerald-400"
          />
        </div>

        <div className="space-y-6">
          {activeTab === 'dashboard' && (
            <div className="glass-card">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-sky-400" /> Welcome to DPDPA for Small Business
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-200">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setActiveTab('datamap')}
                      className="w-full text-left px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-200 font-medium transition-colors"
                    >
                      <FileText className="w-4 h-4 mr-3" /> Scan Files for PII
                    </button>
                    <button
                      onClick={() => setActiveTab('notices')}
                      className="w-full text-left px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-200 font-medium transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4 mr-3" /> Generate Section 5 Notice
                    </button>
                    <button
                      onClick={() => setActiveTab('dsr')}
                      className="w-full text-left px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-200 font-medium transition-colors"
                    >
                      <BarChart3 className="w-4 h-4 mr-3" /> Handle Data Rights Request
                    </button>
                    <button
                      onClick={() => setActiveTab('breach')}
                      className="w-full text-left px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-200 font-medium transition-colors"
                    >
                      <AlertCircle className="w-4 h-4 mr-3" /> Report Data Breach
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-200">About This Solution</h3>
                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                    <p className="text-sm text-slate-300 leading-relaxed mb-3">
                      <strong className="text-slate-100">Problem Statement LS-04:</strong> Personal Data in Informal Systems
                    </p>
                    <p className="text-sm text-slate-300 leading-relaxed mb-3">
                      Helps Indian SMEs comply with the Digital Personal Data Protection Act, 2023
                      without a dedicated privacy team.
                    </p>
                    <ul className="text-sm text-slate-300 space-y-2 list-disc pl-5">
                      <li>Scan WhatsApp, Excel, CSV files for PII</li>
                      <li>Generate multilingual Section 5 notices</li>
                      <li>Handle right to access &amp; erasure requests</li>
                      <li>Prepare Section 8(6) breach dossiers</li>
                      <li>100% offline-first - zero cloud leakage</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'datamap' && <RoPATable setActiveTab={setActiveTab} />}
          {activeTab === 'notices' && <NoticeBuilder setActiveTab={setActiveTab} />}
          {activeTab === 'dsr' && <DSRModal setActiveTab={setActiveTab} />}
          {activeTab === 'breach' && <BreachWizard setActiveTab={setActiveTab} />}
        </div>
      </div>
    </div>
  )
}
