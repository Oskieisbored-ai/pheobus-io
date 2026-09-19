import { Search, Bell, Plus } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

interface HeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export default function Header({ title, subtitle, actions }: HeaderProps) {
  const user = useAuthStore((s) => s.user)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/people?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="h-16 border-b border-marble-200 bg-white flex items-center justify-between px-6 flex-shrink-0">
      <div>
        <h1 className="text-lg font-display font-semibold text-roman-900 tracking-wide">{title}</h1>
        {subtitle && <p className="text-sm text-marble-600">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Global search */}
        <form onSubmit={handleSearch} className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-marble-400" />
          <input
            type="text"
            placeholder="Search people, companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 pl-9 pr-3 py-2 text-sm border border-marble-200 rounded-lg bg-marble-50 focus:bg-white focus:border-brand-500 focus:ring-1 focus:ring-brand-400/50 outline-none transition-colors"
          />
        </form>

        {actions}

        {/* User avatar */}
        {user && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-roman-950 font-display font-bold text-xs shadow-sm">
              {user.first_name[0]}{user.last_name[0]}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
