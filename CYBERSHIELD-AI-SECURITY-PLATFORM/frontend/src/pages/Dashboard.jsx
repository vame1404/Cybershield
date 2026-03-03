import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
  FileSearch
} from 'lucide-react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { statsAPI } from '../services/api'

// Mock data for charts
const threatTrendData = [
  { name: 'Mon', deepfake: 12, phishing: 24, aml: 8 },
  { name: 'Tue', deepfake: 19, phishing: 18, aml: 12 },
  { name: 'Wed', deepfake: 8, phishing: 29, aml: 6 },
  { name: 'Thu', deepfake: 15, phishing: 22, aml: 14 },
  { name: 'Fri', deepfake: 22, phishing: 31, aml: 9 },
  { name: 'Sat', deepfake: 6, phishing: 12, aml: 4 },
  { name: 'Sun', deepfake: 9, phishing: 16, aml: 7 },
]

const riskDistribution = [
  { name: 'Low Risk', value: 65, color: '#10b981' },
  { name: 'Medium Risk', value: 25, color: '#fbbf24' },
  { name: 'High Risk', value: 10, color: '#ff6b6b' },
]

const recentDetections = [
  { id: 1, type: 'Deepfake', item: 'image_2024_001.jpg', risk: 'high', time: '2 min ago', module: 'Media AI' },
  { id: 2, type: 'Phishing', item: 'secure-bank-login.net', risk: 'high', time: '5 min ago', module: 'URL Scanner' },
  { id: 3, type: 'AML', item: 'TXN-789456123', risk: 'medium', time: '12 min ago', module: 'Financial' },
  { id: 4, type: 'Phishing', item: 'paypa1-verify.com', risk: 'high', time: '18 min ago', module: 'URL Scanner' },
  { id: 5, type: 'Deepfake', item: 'video_call_rec.mp4', risk: 'medium', time: '25 min ago', module: 'Media AI' },
]

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
  const [stats, setStats] = useState({
    totalScans: 0,
    threatsDetected: 0,
    riskScore: 0,
    activeModules: 0
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await statsAPI.get()
        setStats({
          totalScans: data.total_scans,
          threatsDetected: data.threats_detected,
          riskScore: data.total_scans > 0 ? Math.max(0, 100 - (data.threats_detected / data.total_scans * 100)) : 100,
          activeModules: data.active_modules
        })
      } catch (err) {
        console.error("Failed to fetch stats:", err)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 5000)
    return () => clearInterval(interval)
  }, [])

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
              name="Media Authenticity"
              description="Deepfake & AI content detection"
              status="active"
              scans={4521}
              color="purple"
            />
            <ModuleCard
              icon={Link2}
              name="Phishing Intelligence"
              description="URL & email threat detection"
              status="active"
              scans={8934}
              color="orange"
            />
            <ModuleCard
              icon={Banknote}
              name="Financial Crime (AML)"
              description="Transaction anomaly detection"
              status="active"
              scans={2392}
              color="emerald"
            />
            <ModuleCard
              icon={ImageIcon}
              name="AI Generation Audit"
              description="Synthetic content identification"
              status="active"
              scans={1528}
              color="pink"
            />
            <ModuleCard
              icon={FileSearch}
              name="Document Verification"
              description="Metadata & ELA forensic analysis"
              status="active"
              scans={942}
              color="indigo"
            />
          </div>
        </motion.div>

        {/* Recent Detections */}
        <motion.div variants={itemVariants} className="cyber-card rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-cyber-text">Recent Detections</h3>
            <button className="text-sm text-cyber-primary hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {recentDetections.map((detection) => (
              <div
                key={detection.id}
                className="flex items-center justify-between p-3 rounded-lg bg-cyber-bg/50 border border-cyber-border hover:border-cyber-primary/30 transition-colors interactive-hover cursor-default"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${detection.risk === 'high' ? 'bg-red-500' :
                    detection.risk === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                  <div>
                    <p className="text-sm font-medium text-white">{detection.item}</p>
                    <p className="text-xs text-white/60">{detection.module}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full ${detection.risk === 'high' ? 'bg-red-500/20 text-red-400' :
                    detection.risk === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                    }`}>
                    {detection.risk.toUpperCase()}
                  </span>
                  <p className="text-xs text-cyber-muted mt-1">{detection.time}</p>
                </div>
              </div>
            ))}
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

