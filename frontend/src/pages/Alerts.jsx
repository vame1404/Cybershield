import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
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
  Trash2,
  Shield,
  FileSearch,
  ImageIcon,
  Sparkles,
  Film
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getUserHistory } from '../services/history'

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

const moduleMapping = {
  'Deepfake Detection': { path: '/deepfake', icon: ScanFace, color: 'text-purple-400' },
  'Deepfake Video': { path: '/deepfake-video', icon: Film, color: 'text-purple-300' },
  'Deepfake Image Batch': { path: '/deepfake', icon: ScanFace, color: 'text-purple-400' },
  'Phishing URL Scan': { path: '/phishing', icon: Link2, color: 'text-orange-400' },
  'AML Transaction Scan': { path: '/aml', icon: Banknote, color: 'text-emerald-400' },
  'Credit Card Fraud Batch': { path: '/aml', icon: Banknote, color: 'text-emerald-400' },
  'AI Generated Image Batch': { path: '/ai-generated', icon: ImageIcon, color: 'text-pink-400' },
  'AI Generated Video': { path: '/ai-generated-video', icon: Sparkles, color: 'text-violet-400' },
  'Forensic Document Analysis': { path: '/fake-document', icon: FileSearch, color: 'text-indigo-400' },
}

export default function Alerts() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAlerts = async () => {
      if (!currentUser) return
      setLoading(true)
      try {
        const history = await getUserHistory(currentUser.uid)
        const mappedAlerts = history.map(item => {
          const data = item.data || {}
          
          // Determine if it's a threat
          const isThreat = data.is_phishing || 
                           data.is_ai_generated || 
                           data.is_deepfake || 
                           data.is_fraud ||
                           data.is_tampered ||
                           (data.results?.some(r => r.is_ai_generated || r.is_deepfake || r.is_tampered))

          // Assign severity
          let severity = 'low'
          if (isThreat) severity = 'critical'
          else if (data.risk_score > 70 || data.confidence < 60) severity = 'high'
          else if (data.risk_score > 30 || data.confidence < 85) severity = 'medium'

          // Description
          let description = data.url || data.filename || (data.results ? `${data.results.length} files scanned` : 'System scan analysis')
          if (item.scanType.includes('AML')) description = `Transaction of $${data.amount?.toLocaleString()} from ${data.sender_account}`

          return {
            id: item.id,
            type: item.scanType,
            title: `${item.scanType} Result`,
            description: description,
            severity: severity,
            status: isThreat ? 'active' : 'resolved',
            time: item.timestamp?.toDate ? item.timestamp.toDate().toLocaleString() : 'Recent',
            module: item.scanType,
            rawData: data
          }
        })
        setAlerts(mappedAlerts)
      } catch (err) {
        console.error("Failed to fetch alerts:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchAlerts()
  }, [currentUser])

  const filteredAlerts = alerts.filter(alert => {
    const matchesType = filter === 'all' || alert.type.toLowerCase().includes(filter.toLowerCase())
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

  const handleViewDetails = (alert) => {
    const mapping = moduleMapping[alert.type]
    if (mapping) {
      navigate(mapping.path, { state: { prefilledData: alert.rawData } })
    }
  }

  const deleteAlert = (id) => {
    setAlerts(alerts.filter(alert => alert.id !== id))
    // Note: In real app, we would delete from Firestore too
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
          <p className="text-cyber-muted mt-1 text-sm md:text-base">Real-time scan history and threat tracking</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30">
          <Bell className="w-4 h-4 text-red-400" />
          <span className="text-xs md:text-sm text-red-400">{stats.active} Active Threats</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Scans" value={stats.total} icon={Shield} color="primary" />
        <StatCard label="Critical Threats" value={stats.critical} icon={XCircle} color="danger" />
        <StatCard label="Active" value={stats.active} icon={AlertTriangle} color="warning" />
        <StatCard label="Resolved" value={stats.resolved} icon={CheckCircle} color="success" />
      </div>

      {/* Filters */}
      <div className="cyber-card rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-cyber-bg border border-cyber-border focus:border-cyber-primary focus:outline-none text-cyber-text text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-cyber-muted" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 rounded-lg bg-cyber-bg border border-cyber-border focus:border-cyber-primary focus:outline-none text-cyber-text text-sm"
            >
              <option value="all">All Modules</option>
              <option value="deepfake">Deepfake</option>
              <option value="phishing">Phishing</option>
              <option value="aml">AML / Fraud</option>
              <option value="ai">AI Detect</option>
              <option value="document">Document</option>
            </select>
          </div>

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
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-cyber-border border-t-cyber-primary rounded-full animate-spin"></div>
            <p className="mt-4 text-cyber-muted">Accessing secure archives...</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="cyber-card rounded-xl p-12 text-center">
            <CheckCircle className="w-12 h-12 mx-auto text-emerald-500 mb-4" />
            <p className="text-cyber-text font-medium">No activity records found</p>
            <p className="text-cyber-muted text-sm mt-2">Your security history will appear here once you run scans</p>
          </div>
        ) : (
          filteredAlerts.map((alert, index) => {
            const mapping = moduleMapping[alert.type] || { icon: Shield, color: 'text-cyber-muted' }
            const Icon = mapping.icon
            const severity = severityConfig[alert.severity]
            const status = statusConfig[alert.status]

            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`cyber-card rounded-xl p-4 border-l-4 ${severity.border} hover:bg-cyber-card/80 cursor-pointer transition-all`}
                onClick={() => handleViewDetails(alert)}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${severity.bg}`}>
                    <Icon className={`w-5 h-5 ${mapping.color}`} />
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="font-semibold text-cyber-text">{alert.title}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase ${severity.bg} ${severity.text}`}>
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-sm text-cyber-muted mb-3 line-clamp-1">{alert.description}</p>
                        
                        {/* Thumbnail and Small Result */}
                        <div className="flex items-center gap-3">
                          {alert.rawData?.cloudinary_url || alert.rawData?.results?.[0]?.cloudinary_url ? (
                            <div className="w-12 h-12 rounded border border-cyber-border overflow-hidden shrink-0">
                              <img 
                                src={alert.rawData?.cloudinary_url || alert.rawData?.results?.[0]?.cloudinary_url} 
                                alt="preview" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : alert.rawData?.url ? (
                            <div className="px-2 py-1 bg-cyber-bg border border-cyber-border rounded text-[10px] text-cyber-muted max-w-[200px] truncate">
                              {alert.rawData.url}
                            </div>
                          ) : null}
                          
                          <div className="flex items-center gap-2">
                             <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                               alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                               alert.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                               alert.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                               'bg-emerald-500/20 text-emerald-400'
                             }`}>
                               {alert.rawData?.verdict || alert.rawData?.risk_level || (alert.rawData?.results && `${alert.rawData.results.length} Files`) || 'Processed'}
                             </span>
                          </div>
                        </div>
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

                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleViewDetails(alert)}
                          className="p-2 rounded-lg hover:bg-cyber-border text-cyber-muted hover:text-cyber-primary transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteAlert(alert.id)}
                          className="p-2 rounded-lg hover:bg-red-500/20 text-cyber-muted hover:text-red-400 transition-colors"
                          title="Archive"
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


