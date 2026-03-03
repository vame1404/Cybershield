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
  FileSearch
} from 'lucide-react'
import { motion } from 'framer-motion'

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', color: 'text-cyber-primary' },
  { path: '/deepfake', icon: ScanFace, label: 'Deepfake Detection', color: 'text-purple-400' },
  { path: '/phishing', icon: Link2, label: 'Phishing Detection', color: 'text-orange-400' },
  { path: '/aml', icon: Banknote, label: 'Credit Card Fraud', color: 'text-emerald-400' },
  { path: '/ai-generated', icon: ImageIcon, label: 'AI Image Detect', color: 'text-pink-400' },
  { path: '/fake-document', icon: FileSearch, label: 'Forged Document', color: 'text-indigo-400' },
  { path: '/alerts', icon: Bell, label: 'Alerts', color: 'text-red-400' },
]

export default function Sidebar({ isOpen, setIsOpen }) {
  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-cyber-card border-r border-cyber-border z-50 transition-all duration-300 overflow-hidden
        ${isOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20 w-64'}
      `}
    >
      {/* Logo */}
      <div className={`h-20 flex items-center border-b border-cyber-border ${isOpen ? 'justify-between px-4' : 'justify-center'}`}>
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
      <nav className="p-4 space-y-2">
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
            <item.icon className={`w-5 h-5 ${item.color} group-hover:scale-110 transition-transform`} />
            {isOpen && (
              <span className="font-medium text-sm transition-opacity duration-300">
                {item.label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-cyber-border">
        {isOpen && (
          <div className="p-4 rounded-lg bg-gradient-to-br from-cyber-secondary/20 to-cyber-primary/10 border border-cyber-border">
            <p className="text-xs text-cyber-muted mb-2">System Status</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyber-success animate-pulse"></span>
              <span className="text-sm text-cyber-success font-mono">All Systems Operational</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}

