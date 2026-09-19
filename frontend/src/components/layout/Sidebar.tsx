import { NavLink } from 'react-router-dom'
import {
  Search, Building2, Users, List, Zap, LayoutDashboard,
  Mail, Settings, LogOut, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import clsx from 'clsx'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/people', icon: Users, label: 'People' },
  { to: '/companies', icon: Building2, label: 'Companies' },
  { to: '/lists', icon: List, label: 'Lists' },
  { to: '/sequences', icon: Zap, label: 'Sequences' },
  { to: '/enrichment', icon: Search, label: 'Enrichment' },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const logout = useAuthStore((s) => s.logout)

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 h-screen bg-roman-900 flex flex-col z-30 transition-all duration-200',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-roman-700/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-brand-500/20">
            <span className="text-roman-950 font-display font-bold text-sm">P</span>
          </div>
          {!collapsed && (
            <span className="font-display font-semibold text-brand-400 text-lg tracking-wider">PHEOBUS</span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
                  : 'text-marble-400 hover:bg-roman-800 hover:text-marble-200 border border-transparent'
              )
            }
          >
            <Icon size={20} className="flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Decorative laurel divider */}
      <div className="px-4 py-1">
        <div className="h-px bg-gradient-to-r from-transparent via-brand-600/40 to-transparent" />
      </div>

      {/* Bottom */}
      <div className="p-2 space-y-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-marble-500 hover:bg-roman-800 hover:text-marble-300 w-full transition-colors"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          {!collapsed && <span>Collapse</span>}
        </button>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-marble-500 hover:bg-imperial-900/50 hover:text-imperial-400 w-full transition-colors"
        >
          <LogOut size={20} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  )
}
