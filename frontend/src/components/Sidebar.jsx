import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ScanFace,
  Link2,
  Banknote,
  Bell,
  FileText,
  ChevronLeft,
  ChevronRight,
  Shield,
  Settings,
  Image as ImageIcon,
  FileSearch,
  Film,
  Sparkles,
  LogOut,
  User
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', color: 'text-cyber-primary' },
  { path: '/deepfake', icon: ScanFace, label: 'Deepfake Detection', color: 'text-purple-400' },
  { path: '/deepfake-video', icon: Film, label: 'Deepfake Video', color: 'text-purple-300' },
  { path: '/phishing', icon: Link2, label: 'Phishing Detection', color: 'text-orange-400' },
  { path: '/aml', icon: Banknote, label: 'Credit Card Fraud', color: 'text-emerald-400' },
  { path: '/ai-generated', icon: ImageIcon, label: 'AI Image Detect', color: 'text-pink-400' },
  { path: '/ai-generated-video', icon: Sparkles, label: 'AI Video Detect', color: 'text-violet-400' },
  { path: '/fake-document', icon: FileSearch, label: 'Forged Document', color: 'text-indigo-400' },
  { path: '/alerts', icon: Bell, label: 'Alerts', color: 'text-red-400' },
]

export default function Sidebar({ isOpen, setIsOpen }) {
  const { currentUser, logout } = useAuth()

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-cyber-card border-r border-cyber-border z-50 transition-all duration-300 overflow-hidden flex flex-col
        ${isOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20 w-64'}
      `}
    >
      {/* Logo */}
      <div className={`h-20 shrink-0 flex items-center border-b border-cyber-border ${isOpen ? 'justify-between px-4' : 'justify-center'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyber-primary to-cyber-secondary flex items-center justify-center glow-primary shrink-0">
            <Shield className="w-6 h-6 text-cyber-bg" />
          </div>
          {isOpen && (
            <div className="transition-opacity duration-300">
              <h1 className="font-display font-bold text-lg text-gradient">CYBERSHIELD</h1>
              <p className="text-[10px] text-cyber-muted font-mono">AI SECURITY PLATFORM</p>
            </div>
          )}
        </div>
        {isOpen && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-cyber-border transition-colors text-cyber-muted hover:text-cyber-primary"
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {!isOpen && (
        <div className="flex justify-center py-4 border-b border-cyber-border lg:flex hidden">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 rounded-lg bg-cyber-primary/10 text-cyber-primary hover:bg-cyber-primary/20 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="p-4 space-y-2 flex-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => {
              if (window.innerWidth < 1024) setIsOpen(false)
            }}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isOpen ? '' : 'justify-center'} ${isActive
                ? 'bg-gradient-to-r from-cyber-primary/10 to-transparent border-l-2 border-cyber-primary text-cyber-text'
                : 'text-cyber-muted hover:text-cyber-text hover:bg-cyber-border/50'
              }`
            }
          >
            <item.icon className={`w-5 h-5 ${item.color} group-hover:scale-110 shrink-0 transition-transform`} />
            {isOpen && (
              <span className="font-medium text-sm transition-opacity duration-300 whitespace-nowrap">
                {item.label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section - User Profile */}
      {currentUser && (
        <div className="p-4 border-t border-cyber-border shrink-0">
          <div className={`flex items-center gap-3 ${!isOpen && 'justify-center'} mb-3`}>
            <div className="w-10 h-10 rounded-full bg-cyber-border flex items-center justify-center overflow-hidden shrink-0">
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-cyber-muted" />
              )}
            </div>
            {isOpen && (
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-cyber-text truncate">{currentUser.displayName || 'Operative'}</p>
                <p className="text-xs text-cyber-muted truncate">{currentUser.email}</p>
              </div>
            )}
          </div>
          
          {isOpen && (
            <button 
              onClick={logout}
              className="w-full py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Disconnect
            </button>
          )}
        </div>
      )}
    </aside>
  )
}

