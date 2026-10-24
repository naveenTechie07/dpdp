import { useState } from 'react'
import {
  LayoutDashboard,
  FileText,
  ShieldCheck,
  BarChart3,
  AlertCircle,
  Menu,
  X,
  Globe,
} from 'lucide-react'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'datamap', label: 'Data Map', icon: FileText },
  { id: 'notices', label: 'Notices & Consent', icon: ShieldCheck },
  { id: 'dsr', label: 'Rights (DSR)', icon: BarChart3 },
  { id: 'breach', label: 'Breach Response', icon: AlertCircle },
]

export default function Navbar({ activeTab, setActiveTab }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center shadow-lg shadow-sky-500/30">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-100 tracking-tight">DPDPA for Small Business</h1>
              <p className="text-xs text-sky-400 font-medium uppercase tracking-wider">Srujana Tech Fest 2026 • LS-04</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setMobileMenuOpen(false)
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? '' : 'opacity-70'}`} />
                  {tab.label}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-3">
            <button
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <button
              className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
            >
              <Globe className="w-3 h-3 mr-1" /> EN
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-2 pb-4 space-y-2 border-t border-slate-700/50 pt-4">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-sky-500/10 text-sky-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? '' : 'opacity-70'}`} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </nav>
  )
}
