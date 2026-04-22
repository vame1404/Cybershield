import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Banknote, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Loader2,
  TrendingUp,
  ArrowRightLeft,
  User,
  DollarSign,
  Clock,
  BarChart3,
  FileText,
  Search
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { amlAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { saveToHistory, getUserHistory } from '../services/history'

// Pattern data is now handled via state


export default function AMLDetection() {
  const { currentUser } = useAuth()
  const [transactionData, setTransactionData] = useState({
    amount: '',
    senderAccount: '',
    receiverAccount: '',
    transactionType: 'transfer',
    country: ''
  })
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [transactionHistory, setTransactionHistory] = useState([])
  const [patternData, setPatternData] = useState([
    { time: '00:00', normal: 120, suspicious: 5 },
    { time: '04:00', normal: 45, suspicious: 2 },
    { time: '08:00', normal: 180, suspicious: 8 },
    { time: '12:00', normal: 250, suspicious: 15 },
    { time: '16:00', normal: 220, suspicious: 12 },
    { time: '20:00', normal: 150, suspicious: 18 },
  ])

  useEffect(() => {
    const fetchHistory = async () => {
      if (currentUser) {
        const hist = await getUserHistory(currentUser.uid)
        const amlHist = hist
          .filter(item => item.scanType.includes('AML'))
          .map(item => ({
            id: item.data?.transaction_id || item.id.substring(0, 8),
            amount: item.data?.amount || 0,
            type: item.data?.transaction_type || 'Transfer',
            risk: item.data?.risk_level || (item.data?.risk_score > 50 ? 'high' : 'low'),
            time: item.timestamp?.toDate ? item.timestamp.toDate().toLocaleTimeString() : 'Recent'
          }))
        setTransactionHistory(amlHist)
      }
    }
    fetchHistory()
  }, [currentUser, result])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setTransactionData(prev => ({ ...prev, [name]: value }))
  }

  const analyzeTransaction = async (e) => {
    e.preventDefault()
    if (!transactionData.amount) return
    
    try {
      const { data } = await amlAPI.analyze({
        amount: parseFloat(transactionData.amount),
        sender_account: transactionData.senderAccount,
        receiver_account: transactionData.receiverAccount,
        transaction_type: transactionData.transactionType,
        country: transactionData.country
      })
      
      setResult({
        ...data,
        transactionId: data.transaction_id,
        riskLevel: data.risk_level,
        riskScore: data.risk_score.toFixed(0),
        anomalyFactors: {
          amountAnomaly: data.anomaly_factors.amount_anomaly,
          velocityCheck: data.anomaly_factors.velocity_check,
          geographicRisk: data.anomaly_factors.geographic_risk,
          behaviorPattern: data.anomaly_factors.behavior_pattern,
          networkAnalysis: data.anomaly_factors.network_analysis
        }
      })

      if (currentUser) {
        await saveToHistory(currentUser.uid, 'AML Transaction Scan', data)
      }
    } catch (err) {
      console.error(err)
    }
    
    setAnalyzing(false)
  }

  const resetAnalysis = () => {
    setTransactionData({
      amount: '',
      senderAccount: '',
      receiverAccount: '',
      transactionType: 'transfer',
      country: ''
    })
    setResult(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-gradient">AML Detection</h1>
          <p className="text-cyber-muted mt-1">AI-powered anti-money laundering transaction analysis</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
          <Banknote className="w-4 h-4 text-emerald-400" />
          <span className="text-sm text-emerald-400">Financial Crime Module</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Input Form */}
        <div className="lg:col-span-1 cyber-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-cyber-text mb-4">Analyze Transaction</h3>
          
          <form onSubmit={analyzeTransaction} className="space-y-4">
            <div>
              <label className="block text-sm text-cyber-muted mb-2">Transaction Amount ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyber-muted" />
                <input
                  type="number"
                  name="amount"
                  value={transactionData.amount}
                  onChange={handleInputChange}
                  placeholder="Enter amount"
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-cyber-bg border border-cyber-border focus:border-emerald-500 focus:outline-none text-cyber-text"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-cyber-muted mb-2">Sender Account</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyber-muted" />
                <input
                  type="text"
                  name="senderAccount"
                  value={transactionData.senderAccount}
                  onChange={handleInputChange}
                  placeholder="e.g., ACC-12345"
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-cyber-bg border border-cyber-border focus:border-emerald-500 focus:outline-none text-cyber-text"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-cyber-muted mb-2">Receiver Account</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyber-muted" />
                <input
                  type="text"
                  name="receiverAccount"
                  value={transactionData.receiverAccount}
                  onChange={handleInputChange}
                  placeholder="e.g., ACC-67890"
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-cyber-bg border border-cyber-border focus:border-emerald-500 focus:outline-none text-cyber-text"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-cyber-muted mb-2">Transaction Type</label>
              <select
                name="transactionType"
                value={transactionData.transactionType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-cyber-bg border border-cyber-border focus:border-emerald-500 focus:outline-none text-cyber-text"
              >
                <option value="transfer">Bank Transfer</option>
                <option value="wire">Wire Transfer</option>
                <option value="deposit">Deposit</option>
                <option value="withdrawal">Withdrawal</option>
                <option value="payment">Payment</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-cyber-muted mb-2">Country/Region</label>
              <input
                type="text"
                name="country"
                value={transactionData.country}
                onChange={handleInputChange}
                placeholder="e.g., United States"
                className="w-full px-4 py-3 rounded-lg bg-cyber-bg border border-cyber-border focus:border-emerald-500 focus:outline-none text-cyber-text"
              />
            </div>
            
            <button
              type="submit"
              disabled={analyzing || !transactionData.amount}
              className="w-full py-4 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Analyze Transaction
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2 cyber-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-cyber-text mb-4">Analysis Results</h3>
          
          <AnimatePresence mode="wait">
            {analyzing ? (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-cyber-border rounded-full"></div>
                  <div className="w-20 h-20 border-4 border-transparent border-t-emerald-500 rounded-full absolute top-0 left-0 animate-spin"></div>
                </div>
                <p className="text-cyber-text font-medium mt-6">Analyzing Transaction...</p>
                <div className="space-y-2 mt-4 text-sm text-cyber-muted">
                  <p className="animate-pulse">• Running anomaly detection...</p>
                  <p className="animate-pulse" style={{ animationDelay: '0.2s' }}>• Checking transaction patterns...</p>
                  <p className="animate-pulse" style={{ animationDelay: '0.4s' }}>• Analyzing network connections...</p>
                </div>
              </motion.div>
            ) : result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Main Result */}
                <div className={`p-6 rounded-xl ${
                  result.riskLevel === 'high' 
                    ? 'bg-red-500/10 border border-red-500/30' 
                    : result.riskLevel === 'medium'
                    ? 'bg-yellow-500/10 border border-yellow-500/30'
                    : 'bg-emerald-500/10 border border-emerald-500/30'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      {result.riskLevel === 'high' ? (
                        <XCircle className="w-12 h-12 text-red-500" />
                      ) : result.riskLevel === 'medium' ? (
                        <AlertTriangle className="w-12 h-12 text-yellow-500" />
                      ) : (
                        <CheckCircle className="w-12 h-12 text-emerald-500" />
                      )}
                      <div>
                        <h4 className={`text-xl font-bold ${
                          result.riskLevel === 'high' ? 'text-red-500' : 
                          result.riskLevel === 'medium' ? 'text-yellow-500' : 'text-emerald-500'
                        }`}>
                          {result.riskLevel === 'high' ? 'HIGH RISK - SUSPICIOUS' : 
                           result.riskLevel === 'medium' ? 'MEDIUM RISK - REVIEW NEEDED' : 'LOW RISK - LEGITIMATE'}
                        </h4>
                        <p className="text-cyber-muted text-sm mt-1">
                          Transaction ID: <span className="font-mono">{result.transactionId}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-cyber-muted">Risk Score</p>
                      <p className={`text-3xl font-display font-bold ${
                        result.riskLevel === 'high' ? 'text-red-500' : 
                        result.riskLevel === 'medium' ? 'text-yellow-500' : 'text-emerald-500'
                      }`}>
                        {result.riskScore}%
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-cyber-border/50">
                    <p className="text-2xl font-mono text-cyber-text">
                      ${result.amount.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Anomaly Factors */}
                <div>
                  <h5 className="text-sm font-semibold text-cyber-text mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-cyber-primary" />
                    Anomaly Analysis
                  </h5>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(result.anomalyFactors).map(([key, value]) => (
                      <div key={key} className="p-3 rounded-lg bg-cyber-bg/50 border border-cyber-border">
                        <p className="text-xs text-cyber-muted capitalize mb-1">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className={`text-sm font-medium ${
                          value.includes('Above') || value.includes('Unusual') || value.includes('Deviates') || value.includes('flagged') || value.includes('Cross-border')
                            ? 'text-red-400' 
                            : 'text-emerald-400'
                        }`}>
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div className={`p-4 rounded-lg ${
                  result.isSuspicious ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-emerald-500/10 border border-emerald-500/20'
                }`}>
                  <h5 className={`text-sm font-semibold flex items-center gap-2 mb-3 ${
                    result.isSuspicious ? 'text-yellow-400' : 'text-emerald-400'
                  }`}>
                    <FileText className="w-4 h-4" />
                    Recommendations
                  </h5>
                  <ul className="space-y-2">
                    {result.recommendations.map((rec, index) => (
                      <li key={index} className={`flex items-center gap-2 text-sm ${
                        result.isSuspicious ? 'text-yellow-300' : 'text-emerald-300'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          result.isSuspicious ? 'bg-yellow-500' : 'bg-emerald-500'
                        }`}></span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Model Info */}
                <div className="flex justify-between text-xs text-cyber-muted pt-4 border-t border-cyber-border">
                  <span>Model: {result.modelUsed}</span>
                  <span>Processing: {result.processingTime}</span>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={resetAnalysis}
                    className="py-3 rounded-lg border border-cyber-border hover:border-cyber-primary/50 text-cyber-text transition-colors"
                  >
                    Analyze Another
                  </button>
                  <button className="py-3 rounded-lg bg-cyber-primary/20 text-cyber-primary hover:bg-cyber-primary/30 transition-colors">
                    Generate SAR Report
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-cyber-border/50 flex items-center justify-center mb-4">
                  <Banknote className="w-8 h-8 text-cyber-muted" />
                </div>
                <p className="text-cyber-muted">Enter transaction details to begin analysis</p>
                <p className="text-sm text-cyber-muted mt-2">Our AI will detect suspicious patterns and anomalies</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Transaction Pattern Chart */}
      <div className="cyber-card rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-cyber-text">Transaction Pattern Analysis</h3>
            <p className="text-sm text-cyber-muted">24-hour transaction monitoring</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-sm text-cyber-muted">Normal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm text-cyber-muted">Suspicious</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={patternData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#111827', 
                border: '1px solid #1e293b',
                borderRadius: '8px',
                color: '#e2e8f0'
              }} 
            />
            <Line type="monotone" dataKey="normal" stroke="#10b981" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="suspicious" stroke="#ff6b6b" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Transactions */}
      <div className="cyber-card rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-cyber-text">Recent Transaction Alerts</h3>
          <button className="text-sm text-cyber-primary hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cyber-border">
                <th className="text-left py-3 px-4 text-sm text-cyber-muted font-medium">Transaction ID</th>
                <th className="text-left py-3 px-4 text-sm text-cyber-muted font-medium">Amount</th>
                <th className="text-left py-3 px-4 text-sm text-cyber-muted font-medium">Type</th>
                <th className="text-left py-3 px-4 text-sm text-cyber-muted font-medium">Risk Level</th>
                <th className="text-left py-3 px-4 text-sm text-cyber-muted font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {transactionHistory.map((txn) => (
                <tr key={txn.id} className="border-b border-cyber-border/50 hover:bg-cyber-bg/50">
                  <td className="py-3 px-4 font-mono text-sm text-cyber-text">{txn.id}</td>
                  <td className="py-3 px-4 text-sm text-cyber-text">${txn.amount.toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm text-cyber-muted">{txn.type}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      txn.risk === 'high' ? 'bg-red-500/20 text-red-400' :
                      txn.risk === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {txn.risk.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-cyber-muted">{txn.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}

