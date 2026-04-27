import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import {
  Link2,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Shield,
  Globe,
  Lock,
  FileWarning,
  ExternalLink,
  Clock,
  BarChart3
} from 'lucide-react'
import { phishingAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { saveToHistory, getUserHistory } from '../services/history'

// Real history is now fetched dynamically


export default function PhishingDetection() {
  const location = useLocation()
  const [url, setUrl] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [recentScans, setRecentScans] = useState([])
  const { currentUser } = useAuth()

  useEffect(() => {
    // Check for prefilled data from Alerts page
    if (location.state?.prefilledData) {
      const data = location.state.prefilledData
      setUrl(data.url || '')
      setResult({
        ...data,
        riskLevel: data.risk_level,
        riskScore: data.risk_score?.toFixed(0) || 0,
        indicators: {
          domainAge: data.indicators?.domain_age,
          sslCertificate: data.indicators?.ssl_certificate,
          domainReputation: data.indicators?.domain_reputation,
          urlFeatures: data.indicators?.url_features,
          contentAnalysis: data.indicators?.content_analysis,
          redirectChain: data.indicators?.redirect_chain
        },
        modelUsed: data.model_used,
        processingTime: data.processing_time
      })
    }
  }, [location.state])

  useEffect(() => {
    const fetchHistory = async () => {
      if (currentUser) {
        const hist = await getUserHistory(currentUser.uid)
        const phishingHist = hist
          .filter(item => item.scanType.includes('Phishing'))
          .map(item => ({
            url: item.data?.url || 'URL Scan',
            risk: item.data?.is_phishing ? 'high' : (item.data?.risk_score > 50 ? 'medium' : 'safe'),
            time: item.timestamp?.toDate ? item.timestamp.toDate().toLocaleTimeString() : 'Recent'
          }))
        setRecentScans(phishingHist.slice(0, 5))
      }
    }
    fetchHistory()
  }, [currentUser, result])

  const analyzeUrl = async (e) => {
    e.preventDefault()
    if (!url.trim()) return

    setAnalyzing(true)
    setResult(null)   // Clear old result immediately
    setError(null)    // Clear old error

    try {
      const { data } = await phishingAPI.analyze(url)
      setResult({
        ...data,
        riskLevel: data.risk_level,
        riskScore: Number(data.risk_score).toFixed(0),
        indicators: {
          domainAge: data.indicators.domain_age,
          sslCertificate: data.indicators.ssl_certificate,
          domainReputation: data.indicators.domain_reputation,
          urlFeatures: data.indicators.url_features,
          contentAnalysis: data.indicators.content_analysis,
          redirectChain: data.indicators.redirect_chain
        },
        modelUsed: data.model_used,
        processingTime: data.processing_time
      })

      if (currentUser) {
        await saveToHistory(currentUser.uid, 'Phishing URL Scan', data)
      }
    } catch (err) {
      console.error(err)
      setError('Analysis failed. The backend returned an error. Please try again.')
    }

    setAnalyzing(false)
  }

  const resetAnalysis = () => {
    setUrl('')
    setResult(null)
    setError(null)
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
          <h1 className="text-2xl md:text-3xl font-display font-bold text-gradient">Phishing Detection</h1>
          <p className="text-cyber-muted mt-1 text-sm md:text-base">Real-time URL analysis and threat intelligence</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500/20 border border-orange-500/30">
          <Link2 className="w-4 h-4 text-orange-400" />
          <span className="text-xs md:text-sm text-orange-400">URL Scanner Module</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="cyber-card rounded-xl p-6">
        <form onSubmit={analyzeUrl} className="flex gap-4">
          <div className="flex-1 relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyber-muted" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter URL to analyze (e.g., https://example.com)"
              className="w-full pl-12 pr-4 py-4 rounded-lg bg-cyber-bg border border-cyber-border focus:border-cyber-primary focus:outline-none text-cyber-text placeholder:text-cyber-muted"
            />
          </div>
          <button
            type="submit"
            disabled={analyzing || !url.trim()}
            className="px-8 py-4 rounded-lg bg-gradient-to-r from-orange-600 to-orange-500 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Analyze URL
              </>
            )}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                  <div className="w-20 h-20 border-4 border-transparent border-t-orange-500 rounded-full absolute top-0 left-0 animate-spin"></div>
                </div>
                <p className="text-cyber-text font-medium mt-6">Analyzing URL...</p>
                <div className="space-y-2 mt-4 text-sm text-cyber-muted">
                  <p className="animate-pulse">• Checking domain reputation...</p>
                  <p className="animate-pulse" style={{ animationDelay: '0.2s' }}>• Extracting URL features...</p>
                  <p className="animate-pulse" style={{ animationDelay: '0.4s' }}>• Running ML classification...</p>
                </div>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <XCircle className="w-12 h-12 text-red-500 mb-4" />
                <p className="text-red-400 font-medium">Analysis Failed</p>
                <p className="text-sm text-cyber-muted mt-2 max-w-xs">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-4 px-4 py-2 rounded-lg border border-cyber-border hover:border-red-500/50 text-cyber-muted hover:text-red-400 text-sm transition-colors"
                >
                  Try Again
                </button>
              </motion.div>
            ) : result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Main Result */}
                <div className={`p-6 rounded-xl ${result.riskLevel === 'high'
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
                        <h4 className={`text-xl font-bold ${result.riskLevel === 'high' ? 'text-red-500' :
                          result.riskLevel === 'medium' ? 'text-yellow-500' : 'text-emerald-500'
                          }`}>
                          {result.riskLevel === 'high' ? 'PHISHING DETECTED' :
                            result.riskLevel === 'medium' ? 'SUSPICIOUS URL' : 'SAFE URL'}
                        </h4>
                        <p className="text-white font-medium text-sm mt-1 font-mono break-all">{result.url}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-cyber-muted">Risk Score</p>
                      <p className={`text-3xl font-display font-bold ${result.riskLevel === 'high' ? 'text-red-500' :
                        result.riskLevel === 'medium' ? 'text-yellow-500' : 'text-emerald-500'
                        }`}>
                        {result.riskScore}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Risk Meter */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-cyber-muted">Threat Level</span>
                    <span className={`font-medium ${result.riskLevel === 'high' ? 'text-red-500' :
                      result.riskLevel === 'medium' ? 'text-yellow-500' : 'text-emerald-500'
                      }`}>
                      {result.riskLevel.toUpperCase()}
                    </span>
                  </div>
                  <div className="h-3 bg-cyber-border rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.riskScore}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-full rounded-full ${result.riskLevel === 'high'
                        ? 'bg-gradient-to-r from-red-600 to-red-400'
                        : result.riskLevel === 'medium'
                          ? 'bg-gradient-to-r from-yellow-600 to-yellow-400'
                          : 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                        }`}
                    />
                  </div>
                </div>

                {/* Indicators */}
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(result.indicators).map(([key, value]) => (
                    <div key={key} className="p-4 rounded-lg bg-cyber-bg/50 border border-cyber-border interactive-hover cursor-default transition-all">
                      <p className="text-xs text-white/70 capitalize mb-1">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className={`text-sm font-medium ${value.includes('Invalid') || value.includes('Suspicious') || value.includes('Not in') || value.includes('Mimics') || value.includes('redirects') || value.includes('days')
                        ? 'text-red-400'
                        : 'text-emerald-400'
                        }`}>
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Warnings */}
                {result.warnings.length > 0 && (
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                    <h5 className="text-sm font-semibold text-red-400 flex items-center gap-2 mb-3">
                      <FileWarning className="w-4 h-4" />
                      Security Warnings
                    </h5>
                    <ul className="space-y-2">
                      {result.warnings.map((warning, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-red-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

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
                    Scan Another URL
                  </button>
                  <button className="py-3 rounded-lg bg-cyber-primary/20 text-cyber-primary hover:bg-cyber-primary/30 transition-colors">
                    Export Report
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
                  <Link2 className="w-8 h-8 text-cyber-muted" />
                </div>
                <p className="text-cyber-muted">Enter a URL to begin analysis</p>
                <p className="text-sm text-cyber-muted mt-2">Our AI will detect phishing attempts and malicious URLs</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Recent Scans */}
        <div className="cyber-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-cyber-text mb-4">Recent Scans</h3>
          <div className="space-y-3">
            {recentScans.map((scan, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-cyber-bg/50 border border-cyber-border hover:border-cyber-primary/30 transition-colors cursor-pointer interactive-hover"
                onClick={() => setUrl(scan.url)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${scan.risk === 'high' ? 'bg-red-500/20 text-red-400' :
                    scan.risk === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                    {scan.risk.toUpperCase()}
                  </span>
                  <span className="text-xs text-white/60 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {scan.time}
                  </span>
                </div>
                <p className="text-sm text-white font-medium font-mono truncate">{scan.url}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InfoCard
          title="NLP-Based Analysis"
          description="Extracts linguistic features from URLs to identify impersonation attempts"
          icon={BarChart3}
        />
        <InfoCard
          title="Real-time Scanning"
          description="Checks against threat intelligence databases and reputation services"
          icon={Shield}
        />
        <InfoCard
          title="97.1% Accuracy"
          description="Trained on PhishTank and OpenPhish datasets with cross-validation"
          icon={CheckCircle}
        />
      </div>
    </motion.div>
  )
}

function InfoCard({ title, description, icon: Icon }) {
  return (
    <div className="cyber-card rounded-xl p-6 interactive-hover transition-all">
      <Icon className="w-8 h-8 text-orange-400 mb-4" />
      <h4 className="font-semibold text-white mb-2">{title}</h4>
      <p className="text-sm text-white/70">{description}</p>
    </div>
  )
}

