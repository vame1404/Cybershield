import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import DeepfakeDetection from './pages/DeepfakeDetection'
import DeepfakeVideoDetection from './pages/DeepfakeVideoDetection'
import PhishingDetection from './pages/PhishingDetection'
import AMLDetection from './pages/AMLDetection'
import CreditCardFraud from './pages/CreditCardFraud'
import FakeDocumentDetection from './pages/FakeDocumentDetection'
import AIGeneratedDetection from './pages/AIGeneratedDetection'
import AIGeneratedVideoDetection from './pages/AIGeneratedVideoDetection'
import Alerts from './pages/Alerts'
import Login from './pages/Login'
import Signup from './pages/Signup'
import { useAuth } from './context/AuthContext'
import { Navigate } from 'react-router-dom'

import { Menu, X, Shield } from 'lucide-react'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate initial load
    const timer = setTimeout(() => setLoading(false), 1500)

    // Handle responsive sidebar behavior
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const { currentUser } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/login" replace />
    }
    return children
  }

  return (
    <Router>
      <div className="flex min-h-screen bg-cyber-bg grid-bg overflow-x-hidden">
        {/* Mobile Header */}
        {currentUser && (
          <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-cyber-card border-b border-cyber-border z-40 flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyber-primary to-cyber-secondary flex items-center justify-center">
                <Shield className="w-5 h-5 text-cyber-bg" />
              </div>
              <span className="font-display font-bold text-gradient">CYBERSHIELD</span>
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg bg-cyber-border/50 text-cyber-primary"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        )}

        {currentUser && <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />}

        {/* Sidebar Overlay for Mobile */}
        {currentUser && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className={`flex-1 transition-all duration-300 pt-16 lg:pt-0 ${currentUser ? (sidebarOpen ? 'lg:ml-64' : 'lg:ml-20') : ''}`}>
          <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/deepfake" element={<ProtectedRoute><DeepfakeDetection /></ProtectedRoute>} />
              <Route path="/deepfake-video" element={<ProtectedRoute><DeepfakeVideoDetection /></ProtectedRoute>} />
              <Route path="/phishing" element={<ProtectedRoute><PhishingDetection /></ProtectedRoute>} />
              <Route path="/aml" element={<ProtectedRoute><CreditCardFraud /></ProtectedRoute>} />
              <Route path="/ai-generated" element={<ProtectedRoute><AIGeneratedDetection /></ProtectedRoute>} />
              <Route path="/ai-generated-video" element={<ProtectedRoute><AIGeneratedVideoDetection /></ProtectedRoute>} />
              <Route path="/fake-document" element={<ProtectedRoute><FakeDocumentDetection /></ProtectedRoute>} />
              <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  )
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-cyber-bg flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="w-24 h-24 border-4 border-cyber-border rounded-full"></div>
          <div className="w-24 h-24 border-4 border-transparent border-t-cyber-primary rounded-full absolute top-0 left-0 animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <svg className="w-10 h-10 text-cyber-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>
        <h1 className="font-display text-3xl font-bold text-gradient mb-2">CYBERSHIELD AI</h1>
        <p className="text-cyber-muted font-mono text-sm">Initializing Security Modules...</p>
      </div>
    </div>
  )
}

export default App
