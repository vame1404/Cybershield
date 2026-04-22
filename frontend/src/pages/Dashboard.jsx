import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  ScanFace,
  Link2,
  Banknote,
  Activity,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Image as ImageIcon,
  FileSearch,
  Film,
  Sparkles
} from 'lucide-react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { statsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { getUserHistory } from '../services/history'

// Data is now calculated dynamically from history


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export default function Dashboard() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  
  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return 'Just now'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diff = Math.floor((now - date) / 1000)

    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return date.toLocaleDateString()
  }
  
  const [stats, setStats] = useState({
    totalScans: 0,
    threatsDetected: 0,
    riskScore: 0,
    activeModules: 7
  })

  // Dynamic Data States
  const [threatTrendData, setThreatTrendData] = useState([])
  const [riskDistribution, setRiskDistribution] = useState([])
  const [moduleScans, setModuleScans] = useState({})

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await statsAPI.get()
        setStats(prev => ({
          ...prev,
          totalScans: data.total_scans,
          threatsDetected: data.threats_detected,
          riskScore: data.total_scans > 0 ? Math.max(0, 100 - (data.threats_detected / data.total_scans * 100)) : 100,
        }))
      } catch (err) {
        console.error("Failed to fetch stats:", err)
      }
    }

    const fetchHistory = async () => {
      if (currentUser) {
        const hist = await getUserHistory(currentUser.uid)
        setHistory(hist)
        processHistoryData(hist)
      }
    }

    const processHistoryData = (hist) => {
      // 1. Risk Distribution & Module Scans
      let low = 0, medium = 0, high = 0
      const scansByType = {}

      hist.forEach(item => {
        // Count by type
        scansByType[item.scanType] = (scansByType[item.scanType] || 0) + 1

        // Count risk levels
        const isThreat = item.data?.is_phishing || 
                         item.data?.is_ai_generated || 
                         item.data?.is_deepfake || 
                         item.data?.is_fraud ||
                         item.data?.is_tampered ||
                         (item.data?.results?.some(r => r.is_ai_generated || r.is_deepfake || r.is_tampered))

        if (isThreat) high++
        else if (item.data?.risk_score > 50 || (item.data?.confidence < 70 && item.data?.confidence > 0)) medium++
        else low++
      })

      const total = hist.length || 1
      setRiskDistribution([
        { name: 'Low Risk', value: Math.round((low / total) * 100), color: '#10b981' },
        { name: 'Medium Risk', value: Math.round((medium / total) * 100), color: '#fbbf24' },
        { name: 'High Risk', value: Math.round((high / total) * 100), color: '#ff6b6b' },
      ])

      setModuleScans(scansByType)

      // 2. Threat Trends (Last 7 days)
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const today = new Date().getDay()
      const trend = []

      for (let i = 6; i >= 0; i--) {
        const dayIndex = (today - i + 7) % 7
        trend.push({ name: days[dayIndex], deepfake: 0, phishing: 0, aml: 0 })
      }

      hist.forEach(item => {
        const date = item.timestamp?.toDate ? item.timestamp.toDate() : new Date(item.timestamp)
        const dayName = days[date.getDay()]
        const dayData = trend.find(d => d.name === dayName)
        
        if (dayData) {
          if (item.scanType.includes('Deepfake') || item.scanType.includes('AI')) dayData.deepfake++
          if (item.scanType.includes('Phishing')) dayData.phishing++
          if (item.scanType.includes('AML')) dayData.aml++
        }
      })
      setThreatTrendData(trend)
    }

    fetchStats()
    fetchHistory()
    const statsInterval = setInterval(fetchStats, 5000)
    const historyInterval = setInterval(fetchHistory, 10000)
    return () => {
      clearInterval(statsInterval)
      clearInterval(historyInterval)
    }
  }, [currentUser])


  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-gradient">Security Dashboard</h1>
          <p className="text-cyber-muted mt-1">Real-time threat monitoring and risk analysis</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyber-card border border-cyber-border">
            <Clock className="w-4 h-4 text-cyber-primary" />
            <span className="text-sm text-cyber-muted">Last updated: Just now</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Scans"
          value={stats.totalScans.toLocaleString()}
          change="Real-time count"
          trend="up"
          icon={Activity}
          color="primary"
          className="interactive-hover"
        />
        <StatCard
          title="Threats Detected"
          value={stats.threatsDetected.toLocaleString()}
          change="Active interceptions"
          trend="alert"
          icon={AlertTriangle}
          color="danger"
          className="interactive-hover"
        />
        <StatCard
          title="Safety Index"
          value={`${stats.riskScore.toFixed(0)}%`}
          change="System integrity"
          trend="stable"
          icon={Shield}
          color="success"
          className="interactive-hover"
        />
        <StatCard
          title="Active Modules"
          value={stats.activeModules}
          change="All Systems Online"
          trend="stable"
          icon={CheckCircle}
          color="secondary"
          className="interactive-hover"
        />
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threat Trends Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 cyber-card rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-cyber-text">Threat Trends</h3>
              <p className="text-sm text-cyber-muted">Weekly detection overview</p>
            </div>
            <div className="flex gap-4">
              <LegendItem color="#7b61ff" label="Deepfake" />
              <LegendItem color="#ff6b6b" label="Phishing" />
              <LegendItem color="#10b981" label="AML" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={threatTrendData}>
              <defs>
                <linearGradient id="colorDeepfake" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7b61ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7b61ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPhishing" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff6b6b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ff6b6b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorAml" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#ffffff" fontSize={12} />
              <YAxis stroke="#ffffff" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  border: '1px solid #1e293b',
                  borderRadius: '8px',
                }}
                itemStyle={{ color: '#fff' }}
                labelStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="deepfake" stroke="#7b61ff" fillOpacity={1} fill="url(#colorDeepfake)" strokeWidth={2} />
              <Area type="monotone" dataKey="phishing" stroke="#ff6b6b" fillOpacity={1} fill="url(#colorPhishing)" strokeWidth={2} />
              <Area type="monotone" dataKey="aml" stroke="#10b981" fillOpacity={1} fill="url(#colorAml)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Risk Distribution */}
        <motion.div variants={itemVariants} className="cyber-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Risk Distribution</h3>
          <p className="text-sm text-white/50 mb-4">Current threat landscape</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={riskDistribution}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {riskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  border: '1px solid #1e293b',
                  borderRadius: '8px',
                }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-3 mt-4">
            {riskDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-white font-medium">{item.name}</span>
                </div>
                <span className="text-sm font-mono text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Module Status and Recent Detections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module Status */}
        <motion.div variants={itemVariants} className="cyber-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-cyber-text mb-6">Detection Modules</h3>
          <div className="space-y-4">
            <ModuleCard
              icon={ScanFace}
              name="Deepfake Detection"
              description="Face swap & manipulation identification"
              status="active"
              scans={moduleScans['Deepfake Image Batch'] || moduleScans['Deepfake Detection'] || 0}
              color="purple"
            />
            <ModuleCard
              icon={Film}
              name="Deepfake Video"
              description="Video temporal authenticity analysis"
              status="active"
              scans={moduleScans['Deepfake Video'] || 0}
              color="purple"
            />
            <ModuleCard
              icon={Link2}
              name="Phishing Intelligence"
              description="URL & email threat detection"
              status="active"
              scans={moduleScans['Phishing URL Scan'] || moduleScans['Phishing Detection'] || 0}
              color="orange"
            />
            <ModuleCard
              icon={Banknote}
              name="Credit Card Fraud"
              description="Financial transaction anomaly detection"
              status="active"
              scans={moduleScans['Credit Card Fraud Batch'] || moduleScans['AML Transaction Scan'] || 0}
              color="emerald"
            />
            <ModuleCard
              icon={ImageIcon}
              name="AI Image Detect"
              description="Synthetic image identification"
              status="active"
              scans={moduleScans['AI Generated Image Batch'] || 0}
              color="pink"
            />
            <ModuleCard
              icon={Sparkles}
              name="AI Video Detect"
              description="AI-generated video content audit"
              status="active"
              scans={moduleScans['AI Generated Video'] || 0}
              color="violet"
            />
            <ModuleCard
              icon={FileSearch}
              name="Forged Document"
              description="Metadata & ELA forensic analysis"
              status="active"
              scans={moduleScans['Forensic Document Analysis'] || 0}
              color="indigo"
            />
          </div>
        </motion.div>

        {/* Recent Detections */}
        <motion.div variants={itemVariants} className="cyber-card rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-cyber-text">Recent Detections</h3>
            <button 
              onClick={() => navigate('/alerts')}
              className="text-sm text-cyber-primary hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="p-4 text-center text-cyber-muted bg-cyber-bg/50 border border-cyber-border rounded-lg">
                No recent activity found. Run a scan to see it here!
              </div>
            ) : (
              history.map((doc) => {
                const isVideo = doc.scanType.includes('Video');
                const isAI = doc.scanType.includes('AI');
                
                // Determine risk based on result
                let risk = 'low';
                let isThreat = false;
                
                const d = doc.data || {};
                if (d.is_ai_generated || d.is_deepfake || d.is_phishing || d.is_suspicious || d.is_fake || d.is_tampered) {
                  risk = 'high';
                  isThreat = true;
                } else if (d.results && Array.isArray(d.results)) {
                  // batch image or document results
                  const threats = d.results.filter(r => 
                    r.is_ai_generated || r.is_deepfake || r.is_fake || r.is_tampered || (r.Risk && r.Risk === 'High Risk')
                  ).length;
                  if (threats > 0) risk = threats > d.results.length / 2 ? 'high' : 'medium';
                  isThreat = threats > 0;
                } else if (d.summary && d.summary.high_risk > 0) {
                  // Credit Card batch summary
                  risk = d.summary.high_risk > 5 ? 'high' : 'medium';
                  isThreat = true;
                }
                
                // Try to get thumbnail
                let thumb = null;
                if (doc.data?.cloudinary_url) thumb = doc.data.cloudinary_url;
                else if (doc.data?.results?.[0]?.cloudinary_url) thumb = doc.data.results[0].cloudinary_url;
                
                return (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-cyber-bg/50 border border-cyber-border hover:border-cyber-primary/30 transition-colors interactive-hover cursor-default"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {thumb && !isVideo && (
                        <div className="w-10 h-10 rounded overflow-hidden shrink-0">
                          <img src={thumb} alt="thumbnail" className="w-full h-full object-cover" />
                        </div>
                      )}
                      {thumb && isVideo && (
                        <div className="w-10 h-10 rounded overflow-hidden shrink-0 bg-black flex items-center justify-center">
                          <Film className="w-5 h-5 text-cyber-muted" />
                        </div>
                      )}
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium text-white truncate">{doc.scanType}</p>
                        <p className="text-xs text-white/60 truncate">
                          {doc.data?.verdict || (doc.data?.results && `${doc.data.results.length} Files Scanned`)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        risk === 'high' ? 'bg-red-500/20 text-red-400' :
                        risk === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                        }`}>
                        {risk === 'high' ? 'THREAT' : risk === 'medium' ? 'WARNING' : 'SAFE'}
                      </span>
                      {doc.timestamp && (
                        <p className="text-[10px] text-cyber-muted mt-1">
                          {formatRelativeTime(doc.timestamp)}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

function StatCard({ title, value, change, trend, icon: Icon, color }) {
  const colorClasses = {
    primary: 'from-cyber-primary/20 to-cyber-primary/5 border-cyber-primary/30',
    secondary: 'from-cyber-secondary/20 to-cyber-secondary/5 border-cyber-secondary/30',
    danger: 'from-red-500/20 to-red-500/5 border-red-500/30',
    success: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
  }

  const iconColors = {
    primary: 'text-cyber-primary',
    secondary: 'text-cyber-secondary',
    danger: 'text-red-500',
    success: 'text-emerald-500',
  }

  return (
    <div className={`cyber-card rounded-xl p-6 bg-gradient-to-br ${colorClasses[color]}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-white/70 mb-1">{title}</p>
          <p className="text-3xl font-display font-bold text-white">{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-cyber-bg/50 ${iconColors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="flex items-center gap-1 mt-4">
        {trend === 'up' && <ArrowUpRight className="w-4 h-4 text-emerald-500" />}
        {trend === 'down' && <ArrowDownRight className="w-4 h-4 text-red-500" />}
        <span className={`text-sm ${trend === 'up' ? 'text-emerald-500' :
          trend === 'down' ? 'text-red-500' : 'text-cyber-muted'
          }`}>
          {change}
        </span>
      </div>
    </div>
  )
}

function ModuleCard({ icon: Icon, name, description, status, scans, color }) {
  const colorClasses = {
    purple: 'bg-purple-500/20 text-purple-400',
    orange: 'bg-orange-500/20 text-orange-400',
    emerald: 'bg-emerald-500/20 text-emerald-400',
    pink: 'bg-pink-500/20 text-pink-400',
    violet: 'bg-violet-500/20 text-violet-400',
    indigo: 'bg-indigo-500/20 text-indigo-400',
  }

  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-cyber-bg/50 border border-cyber-border hover:border-cyber-primary/30 transition-all interactive-hover cursor-default">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="font-medium text-white">{name}</p>
          <p className="text-sm text-white/70">{description}</p>
        </div>
      </div>
      <div className="text-right">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-sm text-emerald-500">Active</span>
        </div>
        <p className="text-xs text-cyber-muted mt-1">{scans.toLocaleString()} scans</p>
      </div>
    </div>
  )
}

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
      <span className="text-sm text-white font-medium">{label}</span>
    </div>
  )
}

