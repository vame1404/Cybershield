import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { Upload, ImageIcon, Loader2, AlertTriangle, CheckCircle, Search, XCircle, BarChart3, Sparkles } from 'lucide-react'
import { aiGeneratedAPI, commonAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { saveToHistory } from '../services/history'

export default function AIGeneratedDetection() {
    const location = useLocation()
    const [files, setFiles] = useState([])
    const [previews, setPreviews] = useState([])
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [uploading, setUploading] = useState(false)
    const [uploadedUrls, setUploadedUrls] = useState([])
    const [batchResults, setBatchResults] = useState(null)
    const [error, setError] = useState(null)
    const [selectedImage, setSelectedImage] = useState(null)
    const { currentUser } = useAuth()

    useEffect(() => {
        if (location.state?.prefilledData) {
            const data = location.state.prefilledData
            setBatchResults(data.results || [])
            setUploadedUrls(data.results?.map(r => r.cloudinary_url) || [])
        }
    }, [location.state])

    const handleFileChange = async (e) => {
        const selectedFiles = Array.from(e.target.files)
        if (selectedFiles.length > 0) {
            setFiles(selectedFiles)
            setBatchResults(null)
            setError(null)
            setUploadedUrls([])

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
            
            // Auto-upload
            setUploading(true)
            setUploadProgress(0)
            try {
                const urls = []
                let completed = 0
                for (const f of selectedFiles) {
                    const { data } = await commonAPI.uploadFile(f, (p) => {
                        const filePercent = (p.loaded / p.total) * (100 / selectedFiles.length)
                        setUploadProgress(Math.round((completed * (100 / selectedFiles.length)) + filePercent))
                    })
                    urls.push(data.cloudinary_url)
                    completed++
                }
                setUploadedUrls(urls)
            } catch (err) {
                setError('Failed to upload files. Please try again.')
            } finally {
                setUploading(false)
                setUploadProgress(0)
            }
        }
    }

    const analyzeFiles = async () => {
        if (uploadedUrls.length === 0) return
        setIsAnalyzing(true); setError(null); setBatchResults(null);
        try {
            const { data } = await aiGeneratedAPI.analyzeImage(uploadedUrls)
            setBatchResults(data.results)

            if (currentUser && data.results) {
                await saveToHistory(currentUser.uid, 'AI Generated Image Batch', data)
            }
        } catch (err) {
            console.error(err)
            setError('Analysis failed. Make sure backend is running.')
        } finally {
            setIsAnalyzing(false)
            setUploadProgress(0)
        }
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-display font-bold text-gradient">AI Generation Audit</h1>
                    <p className="text-cyber-muted mt-1 text-sm md:text-base">Verify if an image was synthetic or real (Batch Mode)</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-pink-500/20 border border-pink-500/30">
                    <ImageIcon className="w-4 h-4 text-pink-400" />
                    <span className="text-xs md:text-sm text-pink-400">Content Audit Module</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="glass-card p-6 col-span-1">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Upload /> Batch Upload</h2>
                    <div className="border-2 border-dashed border-cyber-border rounded-lg p-6 text-center hover:border-pink-400 transition-colors cursor-pointer relative min-h-[200px] flex items-center justify-center">
                        <input type="file" multiple accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        {previews.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 text-cyber-muted">
                                <ImageIcon size={48} className="text-pink-400 opacity-50" />
                                <p>Drag & drop or click</p>
                                <p className="text-xs">Supports multiple JPG, PNG, WEBP</p>
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
                        disabled={uploadedUrls.length === 0 || isAnalyzing || uploading}
                        className="mt-6 w-full py-3 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20"
                    >
                        {uploading ? <><Loader2 className="animate-spin" /> Uploading {uploadProgress}%</> : isAnalyzing ? <><Loader2 className="animate-spin" /> Scanning...</> : <><Search /> Analyze {files.length > 1 ? `${files.length} Images` : 'Image'}</>}
                    </button>
                    {files.length > 0 && !isAnalyzing && (
                        <button onClick={() => { setFiles([]); setPreviews([]); setBatchResults(null) }} className="mt-2 w-full text-xs text-cyber-muted hover:text-pink-400">Clear all</button>
                    )}
                </div>

                <div className="glass-card p-6 col-span-2">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">Analysis Results</h2>
                    {error && <div className="text-red-400 p-4 bg-red-900/20 rounded-lg border border-red-500/30 mb-4">{error}</div>}

                    {isAnalyzing && (
                        <div className="flex flex-col items-center justify-center h-64 gap-4">
                            <Loader2 className="animate-spin w-12 h-12 text-pink-400" />
                            <div className="text-center">
                                <p className="text-lg font-bold">Inference in progress...</p>
                                <p className="text-cyber-muted text-sm">Validating authenticity via SimplifiedFIRE</p>
                            </div>
                        </div>
                    )}

                    {!isAnalyzing && batchResults && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                            <div className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {batchResults.map((res, i) => (
                                    <div key={i} className={`p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 border transition-all interactive-hover cursor-default ${res.is_ai_generated ? 'bg-red-900/20 border-red-500/40' : 'bg-emerald-900/20 border-emerald-500/40'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <img
                                                    src={previews[i] || res.cloudinary_url}
                                                    alt="Analyzed"
                                                    className="w-12 h-12 object-cover rounded border border-cyber-border cursor-zoom-in hover:scale-105 transition-transform"
                                                    onClick={() => setSelectedImage(previews[i] || res.cloudinary_url)}
                                                />
                                                <div className="absolute -top-1 -right-1">
                                                    {res.is_ai_generated ? (
                                                        <AlertTriangle className="w-4 h-4 text-red-400 bg-cyber-bg rounded-full" />
                                                    ) : (
                                                        <CheckCircle className="w-4 h-4 text-emerald-400 bg-cyber-bg rounded-full" />
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs text-white font-medium truncate max-w-[150px] mb-0.5">{res.filename}</p>
                                                <div className="w-32">
                                                    <div className="flex justify-between text-[9px] mb-0.5">
                                                        <span className="text-white/70">Confidence index</span>
                                                        <span className="text-white font-mono">{res.confidence.toFixed(2)}%</span>
                                                    </div>
                                                    <div className="h-1.5 bg-cyber-bg/50 rounded-full overflow-hidden border border-cyber-border">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${res.confidence}%` }}
                                                            className={`h-full rounded-full ${res.is_ai_generated ? 'bg-red-500' : 'bg-emerald-500'}`}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${res.is_ai_generated ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                            {res.result}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Batch Stats */}
                            {batchResults.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-cyber-border space-y-6">
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { label: 'Images Analyzed', value: batchResults.length, icon: BarChart3, color: 'text-blue-400' },
                                            { label: 'AI Generated', value: batchResults.filter(r => r.is_ai_generated).length, icon: Sparkles, color: 'text-pink-400' },
                                            { label: 'Real Images', value: batchResults.filter(r => !r.is_ai_generated).length, icon: CheckCircle, color: 'text-emerald-400' },
                                        ].map(({ label, value, icon: Icon, color }) => (
                                            <div key={label} className="p-3 rounded-xl bg-cyber-bg/50 border border-cyber-border text-center">
                                                <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
                                                <p className="text-lg font-bold text-white">{value}</p>
                                                <p className="text-[10px] text-cyber-muted mt-1 uppercase">{label}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Batch Vote Breakdown */}
                                    <div className="p-4 rounded-xl bg-cyber-bg/50 border border-cyber-border">
                                        <p className="text-cyber-muted text-[10px] font-mono mb-2">IMAGE VOTE BREAKDOWN</p>
                                        <div className="flex rounded-lg overflow-hidden h-3">
                                            <div style={{ width: `${(batchResults.filter(r => r.is_ai_generated).length / batchResults.length) * 100}%` }} className="bg-pink-500 transition-all" />
                                            <div style={{ width: `${(batchResults.filter(r => !r.is_ai_generated).length / batchResults.length) * 100}%` }} className="bg-emerald-500 transition-all" />
                                        </div>
                                        <div className="flex gap-4 mt-2">
                                            <span className="flex items-center gap-1 text-[10px] text-pink-400"><span className="w-1.5 h-1.5 rounded-full bg-pink-500 inline-block" />AI Generated</span>
                                            <span className="flex items-center gap-1 text-[10px] text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />Real</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {!isAnalyzing && !batchResults && !error && (
                        <div className="flex flex-col items-center justify-center h-64 text-cyber-muted opacity-50">
                            <ImageIcon size={64} className="mb-4" />
                            <p>Upload files to see detailed forensic reports.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
