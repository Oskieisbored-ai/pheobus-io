import { useQuery } from '@tanstack/react-query'
import {
  Users, Building2, Mail, Phone, CheckCircle, List, Zap,
  TrendingUp, ArrowRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Header from '../components/layout/Header'
import { dashboardAPI } from '../services/api'
import type { DashboardStats } from '../types'

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  href,
}: {
  icon: any
  label: string
  value: number | string
  color: string
  href?: string
}) {
  const Wrapper = href ? Link : 'div'
  return (
    <Wrapper to={href || '#'} className="card p-5 hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-marble-600">{label}</p>
          <p className="text-3xl font-display font-bold text-roman-900 mt-1 tracking-wide">{value.toLocaleString()}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center shadow-sm`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </Wrapper>
  )
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await dashboardAPI.stats()
      return data
    },
  })

  return (
    <>
      <Header title="Dashboard" subtitle="Overview of your Pheobus command center" />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Roman decorative header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1 h-px bg-gradient-to-r from-brand-400/40 to-transparent" />
          <span className="text-brand-500 text-xs font-display tracking-[0.2em]">IMPERIUM STATUS</span>
          <div className="flex-1 h-px bg-gradient-to-l from-brand-400/40 to-transparent" />
        </div>

        {/* Stats grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-4 bg-marble-200 rounded w-24 mb-3" />
                <div className="h-8 bg-marble-200 rounded w-16" />
              </div>
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Total Contacts" value={stats.total_contacts}
              color="bg-gradient-to-br from-brand-500 to-brand-700" href="/people" />
            <StatCard icon={Building2} label="Companies" value={stats.total_companies}
              color="bg-gradient-to-br from-roman-600 to-roman-800" href="/companies" />
            <StatCard icon={Mail} label="Emails Found" value={stats.contacts_with_email}
              color="bg-gradient-to-br from-emerald-500 to-emerald-700" href="/people?has_email=true" />
            <StatCard icon={Phone} label="Phone Numbers" value={stats.contacts_with_phone}
              color="bg-gradient-to-br from-amber-500 to-amber-700" href="/people?has_phone=true" />
            <StatCard icon={CheckCircle} label="Verified Emails" value={stats.verified_emails}
              color="bg-gradient-to-br from-teal-500 to-teal-700" href="/people" />
            <StatCard icon={List} label="Contact Lists" value={stats.total_lists}
              color="bg-gradient-to-br from-imperial-500 to-imperial-700" href="/lists" />
            <StatCard icon={Zap} label="Sequences" value={stats.total_sequences}
              color="bg-gradient-to-br from-orange-500 to-orange-700" href="/sequences" />
          </div>
        ) : null}

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gradient-to-r from-brand-400/30 to-transparent" />
          <span className="text-brand-500 text-lg">&#x2766;</span>
          <div className="flex-1 h-px bg-gradient-to-l from-brand-400/30 to-transparent" />
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Link to="/people" className="card-imperial p-6 hover:shadow-md transition-all hover:-translate-y-0.5 group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
                <Users size={20} className="text-brand-700" />
              </div>
              <h3 className="font-display font-semibold text-roman-900 tracking-wide">Search People</h3>
            </div>
            <p className="text-sm text-marble-600 mb-3 font-serif">
              Find contacts by name, title, company, location, and more. Discover emails and phone numbers across the empire.
            </p>
            <span className="text-sm font-medium text-brand-600 flex items-center gap-1 group-hover:gap-2 transition-all">
              Begin search <ArrowRight size={16} />
            </span>
          </Link>

          <Link to="/enrichment" className="card-imperial p-6 hover:shadow-md transition-all hover:-translate-y-0.5 group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Mail size={20} className="text-emerald-600" />
              </div>
              <h3 className="font-display font-semibold text-roman-900 tracking-wide">Find Email</h3>
            </div>
            <p className="text-sm text-marble-600 mb-3 font-serif">
              Enter a name and company domain to discover their professional email address with divine precision.
            </p>
            <span className="text-sm font-medium text-emerald-600 flex items-center gap-1 group-hover:gap-2 transition-all">
              Find an email <ArrowRight size={16} />
            </span>
          </Link>

          <Link to="/companies" className="card-imperial p-6 hover:shadow-md transition-all hover:-translate-y-0.5 group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-roman-100 flex items-center justify-center">
                <Building2 size={20} className="text-roman-600" />
              </div>
              <h3 className="font-display font-semibold text-roman-900 tracking-wide">Explore Companies</h3>
            </div>
            <p className="text-sm text-marble-600 mb-3 font-serif">
              Research company profiles, tech stacks, employee counts, and discover the decision makers of every domain.
            </p>
            <span className="text-sm font-medium text-roman-600 flex items-center gap-1 group-hover:gap-2 transition-all">
              Browse companies <ArrowRight size={16} />
            </span>
          </Link>
        </div>
      </div>
    </>
  )
}
