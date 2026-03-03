import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Download, 
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  TrendingUp,
  Clock,
  FileDown,
  Printer,
  Mail
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RechartsPie, Pie, Cell } from 'recharts'

const monthlyData = [
  { month: 'Jul', deepfake: 45, phishing: 120, aml: 32 },
  { month: 'Aug', deepfake: 52, phishing: 98, aml: 45 },
  { month: 'Sep', deepfake: 38, phishing: 145, aml: 28 },
  { month: 'Oct', deepfake: 65, phishing: 132, aml: 56 },
  { month: 'Nov', deepfake: 48, phishing: 156, aml: 41 },
  { month: 'Dec', deepfake: 72, phishing: 178, aml: 63 },
]

const riskTrendData = [
  { week: 'W1', score: 35 },
  { week: 'W2', score: 42 },
  { week: 'W3', score: 28 },
  { week: 'W4', score: 45 },
  { week: 'W5', score: 38 },
  { week: 'W6', score: 32 },
  { week: 'W7', score: 25 },
  { week: 'W8', score: 23 },
]

const moduleBreakdown = [
  { name: 'Phishing', value: 45, color: '#ff6b6b' },
  { name: 'Deepfake', value: 30, color: '#7b61ff' },
  { name: 'AML', value: 25, color: '#10b981' },
]

const recentReports = [
  { id: 1, name: 'Weekly Threat Summary', date: 'Jan 5, 2026', type: 'PDF', size: '2.4 MB' },
  { id: 2, name: 'Monthly Compliance Report', date: 'Jan 1, 2026', type: 'PDF', size: '5.1 MB' },
  { id: 3, name: 'Q4 2025 Security Analysis', date: 'Dec 31, 2025', type: 'PDF', size: '12.8 MB' },
  { id: 4, name: 'AML Transaction Audit', date: 'Dec 28, 2025', type: 'XLSX', size: '8.3 MB' },
  { id: 5, name: 'Deepfake Detection Metrics', date: 'Dec 25, 2025', type: 'PDF', size: '1.9 MB' },
]

export default function Reports() {
  const [dateRange, setDateRange] = useState('30d')
  const [reportType, setReportType] = useState('all')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-gradient">Reports & Analytics</h1>
          <p className="text-cyber-muted mt-1">Comprehensive threat analysis and compliance reports</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-lg border border-cyber-border hover:border-cyber-primary text-cyber-text flex items-center gap-2 transition-colors">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Custom Range</span>
          </button>
          <button className="px-6 py-2 rounded-lg bg-gradient-to-r from-cyber-primary to-cyber-secondary text-cyber-bg font-semibold hover:opacity-90 transition-opacity flex items-center gap-2">
            <FileDown className="w-4 h-4" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickStat label="Total Scans (30d)" value="15,847" change="+12.5%" positive />
        <QuickStat label="Threats Blocked" value="342" change="-8.2%" positive />
        <QuickStat label="Avg. Risk Score" value="23%" change="-15.3%" positive />
        <QuickStat label="Reports Generated" value="28" change="+4" positive />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Detection Trends */}
        <div className="lg:col-span-2 cyber-card rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-cyber-text">Detection Trends</h3>
              <p className="text-sm text-cyber-muted">6-month overview by module</p>
            </div>
            <div className="flex gap-4">
              <LegendItem color="#7b61ff" label="Deepfake" />
              <LegendItem color="#ff6b6b" label="Phishing" />
              <LegendItem color="#10b981" label="AML" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#111827', 
                  border: '1px solid #1e293b',
                  borderRadius: '8px',
                  color: '#e2e8f0'
                }} 
              />
              <Bar dataKey="deepfake" fill="#7b61ff" radius={[4, 4, 0, 0]} />
              <Bar dataKey="phishing" fill="#ff6b6b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="aml" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Module Breakdown */}
        <div className="cyber-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-cyber-text mb-2">Threat Distribution</h3>
          <p className="text-sm text-cyber-muted mb-4">By detection module</p>
          <ResponsiveContainer width="100%" height={200}>
            <RechartsPie>
              <Pie
                data={moduleBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {moduleBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#111827', 
                  border: '1px solid #1e293b',
                  borderRadius: '8px',
                  color: '#e2e8f0'
                }} 
              />
            </RechartsPie>
          </ResponsiveContainer>
          <div className="space-y-3 mt-4">
            {moduleBreakdown.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-cyber-muted">{item.name}</span>
                </div>
                <span className="text-sm font-mono text-cyber-text">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risk Trend */}
      <div className="cyber-card rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-cyber-text">Risk Score Trend</h3>
            <p className="text-sm text-cyber-muted">Weekly aggregate risk level</p>
          </div>
          <div className="flex items-center gap-2 text-emerald-500">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Improving</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={riskTrendData}>
            <defs>
              <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f5d4" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#00f5d4" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="week" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#111827', 
                border: '1px solid #1e293b',
                borderRadius: '8px',
                color: '#e2e8f0'
              }} 
            />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#00f5d4" 
              strokeWidth={3}
              dot={{ fill: '#00f5d4', strokeWidth: 2 }}
              fill="url(#riskGradient)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Report Generation & Recent Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generate Report Card */}
        <div className="cyber-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-cyber-text mb-6">Generate Custom Report</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-cyber-muted mb-2">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-cyber-bg border border-cyber-border focus:border-cyber-primary focus:outline-none text-cyber-text"
              >
                <option value="all">Comprehensive Report</option>
                <option value="deepfake">Deepfake Analysis</option>
                <option value="phishing">Phishing Intelligence</option>
                <option value="aml">AML Compliance</option>
                <option value="executive">Executive Summary</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-cyber-muted mb-2">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-cyber-bg border border-cyber-border focus:border-cyber-primary focus:outline-none text-cyber-text"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            <div className="pt-4 border-t border-cyber-border">
              <p className="text-sm text-cyber-muted mb-4">Export Format</p>
              <div className="grid grid-cols-3 gap-3">
                <button className="p-3 rounded-lg border border-cyber-primary bg-cyber-primary/10 text-cyber-primary flex flex-col items-center gap-1">
                  <FileText className="w-5 h-5" />
                  <span className="text-xs">PDF</span>
                </button>
                <button className="p-3 rounded-lg border border-cyber-border hover:border-cyber-primary text-cyber-muted hover:text-cyber-primary flex flex-col items-center gap-1 transition-colors">
                  <BarChart3 className="w-5 h-5" />
                  <span className="text-xs">CSV</span>
                </button>
                <button className="p-3 rounded-lg border border-cyber-border hover:border-cyber-primary text-cyber-muted hover:text-cyber-primary flex flex-col items-center gap-1 transition-colors">
                  <PieChart className="w-5 h-5" />
                  <span className="text-xs">XLSX</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4">
              <button className="py-3 rounded-lg bg-gradient-to-r from-cyber-primary to-cyber-secondary text-cyber-bg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Download
              </button>
              <button className="py-3 rounded-lg border border-cyber-border hover:border-cyber-primary text-cyber-text transition-colors flex items-center justify-center gap-2">
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button className="py-3 rounded-lg border border-cyber-border hover:border-cyber-primary text-cyber-text transition-colors flex items-center justify-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </button>
            </div>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="cyber-card rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-cyber-text">Recent Reports</h3>
            <button className="text-sm text-cyber-primary hover:underline">View All</button>
          </div>
          
          <div className="space-y-3">
            {recentReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 rounded-lg bg-cyber-bg/50 border border-cyber-border hover:border-cyber-primary/30 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyber-primary/20">
                    <FileText className="w-5 h-5 text-cyber-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-cyber-text">{report.name}</p>
                    <div className="flex items-center gap-2 text-xs text-cyber-muted mt-1">
                      <Clock className="w-3 h-3" />
                      {report.date}
                      <span>•</span>
                      <span>{report.type}</span>
                      <span>•</span>
                      <span>{report.size}</span>
                    </div>
                  </div>
                </div>
                <button className="p-2 rounded-lg opacity-0 group-hover:opacity-100 bg-cyber-primary/20 text-cyber-primary transition-all">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function QuickStat({ label, value, change, positive }) {
  return (
    <div className="cyber-card rounded-xl p-4">
      <p className="text-xs text-cyber-muted mb-1">{label}</p>
      <p className="text-2xl font-display font-bold text-cyber-text">{value}</p>
      <p className={`text-sm mt-1 ${positive ? 'text-emerald-500' : 'text-red-500'}`}>{change}</p>
    </div>
  )
}

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
      <span className="text-sm text-cyber-muted">{label}</span>
    </div>
  )
}

