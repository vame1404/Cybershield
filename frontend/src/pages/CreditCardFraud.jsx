import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { Upload, Banknote, Loader2, AlertTriangle, ShieldCheck, DownloadCloud } from 'lucide-react'
import { creditCardAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { saveToHistory } from '../services/history'

export default function CreditCardFraud() {
    const location = useLocation()
    const [file, setFile] = useState(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)
    const { currentUser } = useAuth()

    useEffect(() => {
        if (location.state?.prefilledData) {
            setResult(location.state.prefilledData)
        }
    }, [location.state])

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        if (selectedFile) {
            setFile(selectedFile)
            setResult(null)
            setError(null)
        }
    }

    const analyzeFile = async () => {
        if (!file) return
        setIsAnalyzing(true); setError(null); setResult(null);
        try {
            const { data } = await creditCardAPI.analyzeCSV(file)
            setResult(data)
            
            if (currentUser) {
              await saveToHistory(currentUser.uid, 'Credit Card Fraud Batch', data)
            }
        } catch (err) {
            console.error(err)
            setError('Analysis failed. Make sure it is a valid CSV and the backend is running.')
        } finally {
            setIsAnalyzing(false)
        }
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-display font-bold text-gradient">Credit Card Fraud Detection</h1>
                    <p className="text-cyber-muted mt-1 text-sm md:text-base">Transaction anomaly detection and risk scoring</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                    <Banknote className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs md:text-sm text-emerald-400">Financial Module</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 col-span-1 interactive-hover transition-all">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white"><Upload /> Upload CSV</h2>
                    <div className="border-2 border-dashed border-cyber-border rounded-lg p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer relative">
                        <input type="file" accept=".csv" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <div className="flex flex-col items-center gap-2 text-cyber-muted">
                            <Banknote size={48} className="text-emerald-400 opacity-50" />
                            <p>Drag & drop or active click to upload CSV</p>
                            <p className="text-xs text-cyber-primary">{file ? file.name : 'Required Features: Time, V1-V28, Amount'}</p>
                        </div>
                    </div>

                    <button
                        onClick={analyzeFile}
                        disabled={!file || isAnalyzing}
                        className="mt-6 w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                    >
                        {isAnalyzing ? <><Loader2 className="animate-spin" /> Processing Transactions...</> : <>Run Batch Analysis</>}
                    </button>
                    {file && !isAnalyzing && (
                        <button onClick={() => { setFile(null); setResult(null) }} className="mt-2 w-full text-xs text-cyber-muted hover:text-emerald-400">Clear</button>
                    )}
                </div>

                <div className="glass-card p-6 col-span-2 min-h-64 flex flex-col interactive-hover transition-all">
                    <h2 className="text-xl font-bold mb-4 flex items-center justify-between text-white">
                        <span>Analytics Summary</span>
                        {result && result.download_url && (
                            <a href={`http://localhost:8000${result.download_url}`} download className="flex items-center gap-2 text-sm bg-cyber-primary/20 text-cyber-primary px-3 py-1 rounded-full hover:bg-cyber-primary/40 transition border border-cyber-primary/30">
                                <DownloadCloud size={16} /> Export CSV
                            </a>
                        )}
                    </h2>

                    {error && <div className="text-red-400 p-4 bg-red-900/20 rounded border border-red-500/30">{error}</div>}

                    {isAnalyzing && (
                        <div className="flex flex-col items-center justify-center flex-1 gap-4"><Loader2 className="animate-spin w-12 h-12 text-emerald-400" /><p className="font-bold">RF Model Inference in progress...</p></div>
                    )}

                    {!isAnalyzing && result && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-red-900/20 border border-red-500/40 p-4 rounded-lg flex flex-col items-center interactive-hover transition-all">
                                    <AlertTriangle className="text-red-400 mb-1 w-6 h-6" />
                                    <span className="text-2xl font-bold text-red-500">{result.summary.high_risk}</span>
                                    <span className="text-[10px] text-white/70 uppercase tracking-wider">High Risk</span>
                                </div>
                                <div className="bg-yellow-900/20 border border-yellow-500/40 p-4 rounded-lg flex flex-col items-center interactive-hover transition-all">
                                    <AlertTriangle className="text-yellow-400 mb-1 w-6 h-6" />
                                    <span className="text-2xl font-bold text-yellow-500">{result.summary.medium_risk}</span>
                                    <span className="text-[10px] text-white/70 uppercase tracking-wider">Medium Risk</span>
                                </div>
                                <div className="bg-emerald-900/20 border border-emerald-500/40 p-4 rounded-lg flex flex-col items-center interactive-hover transition-all">
                                    <ShieldCheck className="text-emerald-400 mb-1 w-6 h-6" />
                                    <span className="text-2xl font-bold text-emerald-500">{result.summary.low_risk}</span>
                                    <span className="text-[10px] text-white/70 uppercase tracking-wider">Low Risk</span>
                                </div>
                            </div>

                            <div className="bg-cyber-bg p-3 rounded-lg border border-cyber-border text-sm">
                                <div className="flex justify-between py-1">
                                    <span className="text-white/70">Latency</span>
                                    <span className="font-mono text-white">{result.processing_time}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-white/70">Throughput</span>
                                    <span className="font-mono text-white">{result.summary.total_transactions} tx</span>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {!isAnalyzing && !result && !error && (
                        <div className="flex flex-col items-center justify-center flex-1 text-cyber-muted opacity-50">
                            <Banknote size={64} className="mb-4" />
                            <p>Upload a transaction dataset to run inference</p>
                        </div>
                    )}
                </div>
            </div>

            {result && result.results && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 overflow-hidden interactive-hover transition-all">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">Transaction Detail View <span className="text-xs font-normal text-cyber-muted text-cyber-muted">(Showing top 100 records)</span></h3>
                    <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left text-sm">
                            <thead className="sticky top-0 bg-cyber-bg border-b border-cyber-border">
                                <tr>
                                    <th className="p-3 text-white font-medium">Time (s)</th>
                                    <th className="p-3 text-white font-medium">Amount</th>
                                    <th className="p-3 text-white font-medium">Risk Tier</th>
                                    <th className="p-3 text-white font-medium">Fraud Prob</th>
                                    <th className="p-3 text-white font-medium text-right">Raw Data (V1-V2)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {result.results.map((row, idx) => (
                                    <tr key={idx} className="border-b border-cyber-border/50 hover:bg-white/5 transition-colors">
                                        <td className="p-3 font-mono text-xs">{row.Time?.toFixed(0) || 'N/A'}</td>
                                        <td className="p-3 font-bold">${row.Amount?.toFixed(2) || '0.00'}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${row.Risk === 'High Risk' ? 'bg-red-500/20 text-red-400' :
                                                row.Risk === 'Medium Risk' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-emerald-500/20 text-emerald-400'
                                                }`}>
                                                {row.Risk}
                                            </span>
                                        </td>
                                        <td className="p-3 font-mono text-xs">{(row.Fraud_Probability * 100).toFixed(2)}%</td>
                                        <td className="p-3 text-right text-[10px] text-cyber-muted font-mono">
                                            V1: {row.V1?.toFixed(2)} | V2: {row.V2?.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}
        </div>
    )
}
