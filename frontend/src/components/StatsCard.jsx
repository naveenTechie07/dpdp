export default function StatsCard({ title, value, icon: Icon, color, change, changeColor }) {
  return (
    <div className="glass-card">
      <div className="flex items-between justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5" style={{ color: color.replace('text-', '').replace('-400', '-400') }} />
        </div>
        <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center">
          <Icon className="w-4 h-4" style={{ color: color.replace('text-', '').replace('-400', '-400') }} />
        </div>
      </div>
      <p className="text-xs font-medium text-slate-400 mb-1">{title}</p>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-2xl font-bold text-slate-100">{value}</span>
      </div>
      <p className={`text-xs font-medium ${changeColor}`}>{change}</p>
    </div>
  )
}
