import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileSearch, Loader2, AlertTriangle, CheckCircle, Search, XCircle } from 'lucide-react'
import { documentAPI } from '../services/api'

export default function FakeDocumentDetection() {
    const [files, setFiles] = useState([])
    const [previews, setPreviews] = useState([])
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [batchResults, setBatchResults] = useState(null)
    const [error, setError] = useState(null)
    const [selectedImage, setSelectedImage] = useState(null)

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files)
        if (selectedFiles.length > 0) {
            setFiles(selectedFiles)
            const newPreviews = []
            selectedFiles.forEach(file => {
                const reader = new FileReader()
                reader.onloadend = () => {
                    newPreviews.push(reader.result)
                    if (newPreviews.length === selectedFiles.length) {
                        setPreviews(newPreviews)
                    }
                }
                reader.readAsDataURL(file)
            })
            setBatchResults(null)
            setError(null)
        }
    }

    const analyzeFiles = async () => {
        if (files.length === 0) return
        setIsAnalyzing(true); setError(null); setBatchResults(null);
        try {
            const { data } = await documentAPI.analyzeImage(files)
            setBatchResults(data.results)
        } catch (err) {
            console.error(err)
            setError('Analysis failed. Be sure to upload JPEG files and that backend is running.')
        } finally {
            setIsAnalyzing(false)
        }
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-display font-bold text-gradient">Document Verification</h1>
                    <p className="text-cyber-muted mt-1 text-sm md:text-base">Factual and forensic document analysis (Batch Mode)</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
                    <FileSearch className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs md:text-sm text-indigo-400">Forensic Module</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="glass-card p-6 col-span-1">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Upload /> Batch Upload</h2>
                    <div className="border-2 border-dashed border-cyber-border rounded-lg p-6 text-center hover:border-indigo-400 transition-colors cursor-pointer relative min-h-[200px] flex items-center justify-center">
                        <input type="file" multiple accept="image/jpeg, image/jpg" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        {previews.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 text-cyber-muted">
                                <FileSearch size={48} className="text-indigo-400 opacity-50" />
                                <p>Drag & drop or click</p>
                                <p className="text-xs text-red-400">JPEG/JPG only</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-2 w-full">
                                {previews.slice(0, 4).map((p, i) => (
                                    <img key={i} src={p} alt="Preview" className="h-20 w-full rounded object-cover" />
                                ))}
                                {previews.length > 4 && <div className="h-20 flex items-center justify-center bg-cyber-bg rounded text-xs">+{previews.length - 4} more</div>}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={analyzeFiles}
                        disabled={files.length === 0 || isAnalyzing}
                        className="mt-6 w-full py-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                    >
                        {isAnalyzing ? <><Loader2 className="animate-spin" /> Error Level Analysis...</> : <><Search /> Scan {files.length > 1 ? `${files.length} Docs` : 'Document'}</>}
                    </button>
                    {files.length > 0 && !isAnalyzing && (
                        <button onClick={() => { setFiles([]); setPreviews([]); setBatchResults(null) }} className="mt-2 w-full text-xs text-cyber-muted hover:text-indigo-400">Clear all</button>
                    )}
                </div>

                <div className="glass-card p-6 col-span-2">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-400">Forensic Results</h2>
                    {error && <div className="text-red-400 p-4 bg-red-900/20 rounded-lg border border-red-500/30 mb-4">{error}</div>}

                    {isAnalyzing && (
                        <div className="flex flex-col items-center justify-center h-64 gap-4">
                            <Loader2 className="animate-spin w-12 h-12 text-indigo-400" />
                            <div className="text-center">
                                <p className="text-lg font-bold">Resaving and Differencing...</p>
                                <p className="text-cyber-muted text-sm">Identifying double-quantization artifacts</p>
                            </div>
                        </div>
                    )}

                    {!isAnalyzing && batchResults && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                            <div className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {batchResults.map((res, i) => (
                                    <div key={i} className={`p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 border transition-all interactive-hover cursor-default ${res.is_tampered ? 'bg-red-900/20 border-red-500/40' : 'bg-emerald-900/20 border-emerald-500/40'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <img
                                                    src={previews[i]}
                                                    alt="Analyzed"
                                                    className="w-12 h-12 object-cover rounded border border-cyber-border cursor-zoom-in hover:scale-105 transition-transform"
                                                    onClick={() => setSelectedImage(previews[i])}
                                                />
                                                <div className="absolute -top-1 -right-1">
                                                    {res.is_tampered ? (
                                                        <AlertTriangle className="w-4 h-4 text-red-400 bg-cyber-bg rounded-full" />
                                                    ) : (
                                                        <CheckCircle className="w-4 h-4 text-emerald-400 bg-cyber-bg rounded-full" />
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs text-white font-medium truncate max-w-[150px] mb-0.5">{res.filename}</p>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex gap-2">
                                                        <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded border ${res.risk_level === 'high' ? 'border-red-500/50 text-red-400' : 'border-emerald-500/50 text-emerald-400'}`}>
                                                            {res.risk_level} risk
                                                        </span>
                                                    </div>
                                                    <div className="w-32">
                                                        <div className="h-1.5 bg-cyber-bg/50 rounded-full overflow-hidden border border-cyber-border">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: res.risk_level === 'high' ? '85%' : '15%' }}
                                                                className={`h-full rounded-full ${res.risk_level === 'high' ? 'bg-red-500' : 'bg-emerald-500'}`}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${res.is_tampered ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                            {res.result}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {!isAnalyzing && !batchResults && !error && (
                        <div className="flex flex-col items-center justify-center h-64 text-cyber-muted opacity-50">
                            <FileSearch size={64} className="mb-4" />
                            <p>Upload documents for forensic metadata and tampering analysis.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
