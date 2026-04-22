import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { Video, Upload, AlertTriangle, CheckCircle, Film, BarChart2, Clock } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { saveToHistory } from '../services/history'
import { deepfakeAPI, commonAPI } from '../services/api'

const API_BASE = 'http://localhost:8000'

export default function DeepfakeVideoDetection() {
  const location = useLocation()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState(null)
  const [error, setError] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef()
  const { currentUser } = useAuth()

  useEffect(() => {
    if (location.state?.prefilledData) {
      const data = location.state.prefilledData
      setResult(data)
      setUploadedUrl(data.video_url || data.url)
    }
  }, [location.state])

  const handleFile = async (f) => {
    if (!f) return
    setFile(f)
    setResult(null)
    setError(null)
    setUploadedUrl(null)
    setPreview(URL.createObjectURL(f))
    
    // Auto-upload
    setUploading(true)
    setUploadProgress(0)
    try {
      const { data } = await commonAPI.uploadFile(f, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        setUploadProgress(percentCompleted)
      })
      setUploadedUrl(data.cloudinary_url)
    } catch (e) {
      setError('Failed to upload file. Please try again.')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f && (f.type.startsWith('video/') || f.name.endsWith('.gif'))) handleFile(f)
  }

  const analyze = async () => {
    if (!uploadedUrl) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const { data } = await deepfakeAPI.analyzeVideo(uploadedUrl)
      setResult(data)
      
      // Save to Firebase History
      if (currentUser) {
        await saveToHistory(currentUser.uid, 'Deepfake Video', data)
      }
    } catch (e) {
      setError(e.response?.data?.detail || 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isDeepfake = result?.is_deepfake

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-cyber-text">Deepfake Video Detection</h1>
            <p className="text-cyber-muted text-sm">Upload a video or GIF to detect AI-manipulated faces using frame-by-frame analysis</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Zone */}
        <div className="space-y-4">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => inputRef.current.click()}
            className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200
              ${dragOver ? 'border-purple-400 bg-purple-500/10' : 'border-cyber-border hover:border-purple-500/50 hover:bg-purple-500/5'}`}
          >
            <input ref={inputRef} type="file" accept="video/*,.gif" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
            <Video className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <p className="text-cyber-text font-medium mb-1">Drop a video or GIF here</p>
            <p className="text-cyber-muted text-sm">MP4, MOV, AVI, GIF supported</p>
          </div>

          {(preview || uploadedUrl) && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl overflow-hidden border border-cyber-border">
              <video src={preview || uploadedUrl} controls className="w-full max-h-64 object-contain bg-black" />
              <div className="p-3 bg-cyber-card border-t border-cyber-border">
                <p className="text-cyber-muted text-xs truncate">{file?.name || 'Historical Scan'} — {file ? (file.size / 1024 / 1024).toFixed(2) + ' MB' : 'Remote Source'}</p>
              </div>
            </motion.div>
          )}

          <button
            onClick={analyze}
            disabled={!uploadedUrl || loading || uploading}
            className="w-full py-3 rounded-xl font-semibold text-cyber-bg bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 disabled:opacity-40 transition-all duration-200 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-cyber-bg border-t-transparent rounded-full animate-spin" />
                Uploading to Cloudinary... {uploadProgress}%
              </>
            ) : loading ? (
              <>
                <div className="w-4 h-4 border-2 border-cyber-bg border-t-transparent rounded-full animate-spin" />
                Scanning frames...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Analyze Video
              </>
            )}
          </button>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}
        </div>

        {/* Result Panel */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* Verdict */}
              <div className={`p-6 rounded-2xl border-2 ${isDeepfake ? 'border-red-500/50 bg-red-500/10' : 'border-emerald-500/50 bg-emerald-500/10'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDeepfake ? 'bg-red-500/20' : 'bg-emerald-500/20'}`}>
                    {isDeepfake ? <AlertTriangle className="w-8 h-8 text-red-400" /> : <CheckCircle className="w-8 h-8 text-emerald-400" />}
                  </div>
                  <div>
                    <p className="text-cyber-muted text-xs font-mono uppercase tracking-wider mb-1">Verdict</p>
                    <h2 className={`text-2xl font-bold font-display ${isDeepfake ? 'text-red-400' : 'text-emerald-400'}`}>{result.verdict}</h2>
                    <p className="text-cyber-muted text-sm mt-1">{result.confidence}% confidence</p>
                  </div>
                </div>
              </div>

              {/* Confidence Bar */}
              <div className="p-5 rounded-xl bg-cyber-card border border-cyber-border">
                <p className="text-cyber-muted text-xs font-mono mb-3">CONFIDENCE SCORE</p>
                <div className="w-full h-3 bg-cyber-border rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${result.confidence}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full ${isDeepfake ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-emerald-500 to-cyan-500'}`}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-cyber-muted">0%</span>
                  <span className={`text-xs font-bold ${isDeepfake ? 'text-red-400' : 'text-emerald-400'}`}>{result.confidence}%</span>
                  <span className="text-xs text-cyber-muted">100%</span>
                </div>
              </div>

              {/* Frame Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Frames Analyzed', value: result.frames_analyzed, icon: BarChart2, color: 'text-blue-400' },
                  { label: 'Fake Frames', value: result.fake_frames, icon: AlertTriangle, color: 'text-red-400' },
                  { label: 'Real Frames', value: result.real_frames, icon: CheckCircle, color: 'text-emerald-400' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="p-4 rounded-xl bg-cyber-card border border-cyber-border text-center">
                    <Icon className={`w-5 h-5 ${color} mx-auto mb-2`} />
                    <p className="text-xl font-bold text-cyber-text">{value}</p>
                    <p className="text-xs text-cyber-muted mt-1">{label}</p>
                  </div>
                ))}
              </div>

              {/* Frame Vote Breakdown */}
              <div className="p-5 rounded-xl bg-cyber-card border border-cyber-border">
                <p className="text-cyber-muted text-xs font-mono mb-3">FRAME VOTE BREAKDOWN</p>
                <div className="flex rounded-lg overflow-hidden h-4">
                  <div style={{ width: `${(result.fake_frames / result.frames_analyzed) * 100}%` }} className="bg-red-500 transition-all" />
                  <div style={{ width: `${(result.real_frames / result.frames_analyzed) * 100}%` }} className="bg-emerald-500 transition-all" />
                </div>
                <div className="flex gap-4 mt-2">
                  <span className="flex items-center gap-1 text-xs text-red-400"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Fake</span>
                  <span className="flex items-center gap-1 text-xs text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Real</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-cyber-muted text-xs">
                <Clock className="w-3 h-3" />
                Processed in {result.processing_time}
              </div>
            </motion.div>
          )}

          {!result && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-center py-20 text-cyber-muted">
              <Film className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-medium">Upload a video to begin analysis</p>
              <p className="text-sm mt-1 opacity-60">Results will appear here</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
