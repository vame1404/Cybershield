import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  Image as ImageIcon,
  Video,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Info,
  BarChart3,
  Eye,
  Search
} from 'lucide-react'
import { deepfakeAPI } from '../services/api'

export default function DeepfakeDetection() {
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [analyzing, setAnalyzing] = useState(false)
  const [batchResults, setBatchResults] = useState(null)
  const [error, setError] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    if (selectedFiles.length > 0) {
      setFiles(selectedFiles)
      setBatchResults(null)
      setError(null)

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
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files)
    if (droppedFiles.length > 0) {
      setFiles(droppedFiles)
      setBatchResults(null)
      setError(null)

      const newPreviews = []
      droppedFiles.forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          newPreviews.push(reader.result)
          if (newPreviews.length === droppedFiles.length) {
            setPreviews(newPreviews)
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const analyzeFiles = async () => {
    if (files.length === 0) return
    setAnalyzing(true)
    setError(null)
    setBatchResults(null)

    try {
      const { data } = await deepfakeAPI.analyzeImage(files)
      setBatchResults(data.results)
    } catch (err) {
      console.error(err)
      setError('Deepfake analysis failed. Ensure backend is running.')
    } finally {
      setAnalyzing(false)
    }
  }

  const resetAnalysis = () => {
    setFiles([])
    setPreviews([])
    setBatchResults(null)
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
          <h1 className="text-2xl md:text-3xl font-display font-bold text-gradient">Deepfake Detection</h1>
          <p className="text-cyber-muted mt-1 text-sm md:text-base">AI-powered media authenticity verification (Batch Mode)</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
          <Eye className="w-4 h-4 text-purple-400" />
          <span className="text-xs md:text-sm text-purple-400">Media Authenticity</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="cyber-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-cyber-text mb-4">Upload Media</h3>

          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${previews.length > 0
              ? 'border-cyber-primary/50 bg-cyber-primary/5'
              : 'border-cyber-border hover:border-cyber-primary/50 hover:bg-cyber-primary/5'
              }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {previews.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {previews.slice(0, 6).map((p, i) => (
                    <img key={i} src={p} alt="Preview" className="h-20 w-full object-cover rounded-lg" />
                  ))}
                  {previews.length > 6 && <div className="h-20 flex items-center justify-center bg-cyber-bg rounded text-xs">+{previews.length - 6} more</div>}
                </div>
                <p className="text-sm text-cyber-muted">{files.length} files selected</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    resetAnalysis()
                  }}
                  className="text-sm text-cyber-accent hover:underline"
                >
                  Clear and upload different files
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 mx-auto text-cyber-muted mb-4" />
                <p className="text-cyber-text font-medium mb-2">Drop your files here or click to upload</p>
                <p className="text-sm text-cyber-muted">Supports multiple images (JPG, PNG, WebP)</p>
              </>
            )}
          </div>

          {/* Analyze Button */}
          {files.length > 0 && !batchResults && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={analyzeFiles}
              disabled={analyzing}
              className="w-full mt-6 py-4 rounded-lg bg-gradient-to-r from-purple-600 to-cyber-secondary text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Deep Analysis...
                </>
              ) : (
                <>
                  <BarChart3 className="w-5 h-5" />
                  Run Deepfake Scan
                </>
              )}
            </motion.button>
          )}
        </div>

        {/* Results Section */}
        <div className="cyber-card rounded-xl p-6">
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
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
                <p className="text-cyber-text font-medium">Scanning Media...</p>
              </motion.div>
            ) : batchResults ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar"
              >
                {batchResults.map((res, i) => (
                  <div key={i} className={`p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 border transition-all interactive-hover cursor-default ${res.is_deepfake ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={previews[i]}
                          alt="Analyzed"
                          className="w-12 h-12 object-cover rounded border border-cyber-border cursor-zoom-in hover:scale-105 transition-transform"
                          onClick={() => setSelectedImage(previews[i])}
                        />
                        <div className="absolute -top-1 -right-1">
                          {res.is_deepfake ? (
                            <XCircle className="w-4 h-4 text-red-500 bg-cyber-bg rounded-full" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-emerald-500 bg-cyber-bg rounded-full" />
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-white font-medium truncate max-w-[150px] mb-0.5">{res.filename}</p>
                        <div className="w-32">
                          <div className="flex justify-between text-[9px] mb-0.5">
                            <span className="text-cyber-muted">Confidence</span>
                            <span className="text-cyber-text font-mono">{res.confidence.toFixed(1)}%</span>
                          </div>
                          <div className="h-1.5 bg-cyber-bg/50 rounded-full overflow-hidden border border-cyber-border">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${res.confidence}%` }}
                              className={`h-full rounded-full ${res.is_deepfake ? 'bg-red-500' : 'bg-emerald-500'}`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${res.is_deepfake ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                      {res.is_deepfake ? 'DEEPFAKE' : 'AUTHENTIC'}
                    </div>
                  </div>
                ))}
                <button onClick={resetAnalysis} className="w-full py-2 text-sm text-cyber-accent hover:underline">Reset</button>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <Eye className="w-8 h-8 text-cyber-muted mb-4" />
                <p className="text-cyber-muted">Upload media to begin analysis</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InfoCard
          title="ICV3 Model"
          description="Powered by specialized Inception-v3 architecture for facial forgery detection"
          icon={BarChart3}
        />
        <InfoCard
          title="Batch Processing"
          description="Analyze multiple images simultaneously for faster threat assessment"
          icon={ImageIcon}
        />
        <InfoCard
          title="Authenticity Verification"
          description="Detects GAN-generated faces and deepfade manipulations with high precision"
          icon={CheckCircle}
        />
      </div>
      <PreviewModal image={selectedImage} onClose={() => setSelectedImage(null)} />
    </motion.div>
  )
}

function PreviewModal({ image, onClose }) {
  return (
    <AnimatePresence>
      {image && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-cyber-bg/90 backdrop-blur-xl cursor-zoom-out"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden border border-cyber-primary/20 shadow-2xl glow-primary"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={image}
              alt="Preview"
              className="w-full h-full object-contain"
            />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-cyber-bg/50 border border-cyber-border text-white hover:bg-red-500 transition-colors"
            >
              <XCircle size={24} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function InfoCard({ title, description, icon: Icon }) {
  return (
    <div className="cyber-card rounded-xl p-6">
      <Icon className="w-8 h-8 text-purple-400 mb-4" />
      <h4 className="font-semibold text-cyber-text mb-2">{title}</h4>
      <p className="text-sm text-cyber-muted">{description}</p>
    </div>
  )
}
