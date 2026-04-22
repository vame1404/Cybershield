import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  Clock,
  ChevronRight,
  ScanFace,
  Link2,
  Banknote,
  Eye,
  Trash2
} from 'lucide-react'

const allAlerts = [
  {
    id: 1,
    type: 'deepfake',
    title: 'High-confidence deepfake detected',
    description: 'Image file "exec_photo.jpg" flagged with 94.2% confidence',
    severity: 'critical',
    status: 'active',
    time: '2 minutes ago',
    module: 'Media Authenticity'
  },
  {
    id: 2,
    type: 'phishing',
    title: 'Phishing URL blocked',
    description: 'URL "secure-bank-verify.net" blocked - mimics banking portal',
    severity: 'high',
    status: 'active',
    time: '5 minutes ago',
    module: 'Phishing Detection'
  },
  {
    id: 3,
    type: 'aml',
    title: 'Suspicious transaction flagged',
    description: 'Wire transfer of $75,000 to high-risk jurisdiction',
    severity: 'high',
    status: 'investigating',
    time: '12 minutes ago',
    module: 'AML Detection'
  },
  {
    id: 4,
    type: 'phishing',
    title: 'Email phishing attempt',
    description: 'Email from "support@paypa1.com" flagged as impersonation',
    severity: 'medium',
    status: 'resolved',
    time: '25 minutes ago',
    module: 'Phishing Detection'
  },
  {
    id: 5,
    type: 'deepfake',
    title: 'AI-generated content detected',
    description: 'Video call recording shows synthetic artifacts',
    severity: 'medium',
    status: 'active',
    time: '1 hour ago',
    module: 'Media Authenticity'
  },
  {
    id: 6,
    type: 'aml',
    title: 'Transaction pattern anomaly',
    description: 'Multiple small transactions detected - potential structuring',
    severity: 'medium',
    status: 'investigating',
    time: '2 hours ago',
    module: 'AML Detection'
  },
  {
    id: 7,
    type: 'phishing',
    title: 'Malicious redirect detected',
    description: 'URL redirect chain leads to credential harvesting page',
    severity: 'critical',
    status: 'resolved',
    time: '3 hours ago',
    module: 'Phishing Detection'
  },
  {
    id: 8,
    type: 'deepfake',
    title: 'Face swap detected in document',
    description: 'ID document photo shows manipulation artifacts',
    severity: 'high',
    status: 'resolved',
    time: '4 hours ago',
    module: 'Media Authenticity'
  },
]

const severityConfig = {
  critical: { color: 'red', bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  high: { color: 'orange', bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  medium: { color: 'yellow', bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  low: { color: 'emerald', bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
}

const statusConfig = {
  active: { bg: 'bg-red-500', text: 'Active' },
  investigating: { bg: 'bg-yellow-500', text: 'Investigating' },
  resolved: { bg: 'bg-emerald-500', text: 'Resolved' },
}

const moduleIcons = {
  deepfake: ScanFace,
  phishing: Link2,
  aml: Banknote,
}

const moduleColors = {
  deepfake: 'text-purple-400',
  phishing: 'text-orange-400',
  aml: 'text-emerald-400',
}

export default function Alerts() {
  const [filter, setFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [alerts, setAlerts] = useState(allAlerts)

  const filteredAlerts = alerts.filter(alert => {
    const matchesType = filter === 'all' || alert.type === filter
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter
    const matchesSearch = alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSeverity && matchesSearch
  })

  const stats = {
    total: alerts.length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    active: alerts.filter(a => a.status === 'active').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
  }

  const markAsResolved = (id) => {
    setAlerts(alerts.map(alert =>
      alert.id === id ? { ...alert, status: 'resolved' } : alert
    ))
  }

  const deleteAlert = (id) => {
    setAlerts(alerts.filter(alert => alert.id !== id))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-gradient">Security Alerts</h1>
          <p className="text-cyber-muted mt-1 text-sm md:text-base">Centralized threat alert management</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30">
          <Bell className="w-4 h-4 text-red-400" />
          <span className="text-xs md:text-sm text-red-400">{stats.active} Active Alerts</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Alerts" value={stats.total} icon={Bell} color="primary" />
        <StatCard label="Critical" value={stats.critical} icon={XCircle} color="danger" />
        <StatCard label="Active" value={stats.active} icon={AlertTriangle} color="warning" />
        <StatCard label="Resolved" value={stats.resolved} icon={CheckCircle} color="success" />
      </div>

      {/* Filters */}
      <div className="cyber-card rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search alerts..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-cyber-bg border border-cyber-border focus:border-cyber-primary focus:outline-none text-cyber-text text-sm"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-cyber-muted" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 rounded-lg bg-cyber-bg border border-cyber-border focus:border-cyber-primary focus:outline-none text-cyber-text text-sm"
            >
              <option value="all">All Types</option>
              <option value="deepfake">Deepfake</option>
              <option value="phishing">Phishing</option>
              <option value="aml">AML</option>
            </select>
          </div>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-4 py-2 rounded-lg bg-cyber-bg border border-cyber-border focus:border-cyber-primary focus:outline-none text-cyber-text text-sm"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="cyber-card rounded-xl p-12 text-center">
            <CheckCircle className="w-12 h-12 mx-auto text-emerald-500 mb-4" />
            <p className="text-cyber-text font-medium">No alerts matching your filters</p>
            <p className="text-cyber-muted text-sm mt-2">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          filteredAlerts.map((alert, index) => {
            const Icon = moduleIcons[alert.type]
            const severity = severityConfig[alert.severity]
            const status = statusConfig[alert.status]

            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`cyber-card rounded-xl p-4 border-l-4 ${severity.border}`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`p-3 rounded-lg ${severity.bg}`}>
                    <Icon className={`w-5 h-5 ${moduleColors[alert.type]}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="font-semibold text-cyber-text">{alert.title}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase ${severity.bg} ${severity.text}`}>
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-sm text-cyber-muted mb-3">{alert.description}</p>
                        <div className="flex flex-wrap items-center gap-3 md:gap-4">
                          <span className="text-[10px] md:text-xs text-cyber-muted flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {alert.time}
                          </span>
                          <span className="text-[10px] md:text-xs text-cyber-muted">{alert.module}</span>
                          <span className="flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${status.bg}`}></span>
                            <span className="text-[10px] md:text-xs text-cyber-muted">{status.text}</span>
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {alert.status !== 'resolved' && (
                          <button
                            onClick={() => markAsResolved(alert.id)}
                            className="p-2 rounded-lg hover:bg-emerald-500/20 text-cyber-muted hover:text-emerald-400 transition-colors"
                            title="Mark as resolved"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          className="p-2 rounded-lg hover:bg-cyber-border text-cyber-muted hover:text-cyber-primary transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteAlert(alert.id)}
                          className="p-2 rounded-lg hover:bg-red-500/20 text-cyber-muted hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <ChevronRight className="w-4 h-4 text-cyber-muted" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </motion.div>
  )
}

function StatCard({ label, value, icon: Icon, color }) {
  const colorClasses = {
    primary: 'from-cyber-primary/20 to-cyber-primary/5 border-cyber-primary/30 text-cyber-primary',
    danger: 'from-red-500/20 to-red-500/5 border-red-500/30 text-red-500',
    warning: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30 text-yellow-500',
    success: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-500',
  }

  return (
    <div className={`cyber-card rounded-xl p-4 bg-gradient-to-br ${colorClasses[color].split(' ').slice(0, 3).join(' ')}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-cyber-muted mb-1">{label}</p>
          <p className="text-2xl font-display font-bold text-cyber-text">{value}</p>
        </div>
        <Icon className={`w-8 h-8 ${colorClasses[color].split(' ').pop()}`} />
      </div>
    </div>
  )
}

