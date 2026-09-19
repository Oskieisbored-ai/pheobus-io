import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Search, Building2, Globe, Users, MapPin, ChevronLeft, ChevronRight,
  ExternalLink, Filter, Layers, DollarSign,
} from 'lucide-react'
import Header from '../components/layout/Header'
import { companiesAPI } from '../services/api'
import type { Company } from '../types'
import { EMPLOYEE_RANGE_OPTIONS } from '../types'
import clsx from 'clsx'

export default function CompanySearch() {
  const [q, setQ] = useState('')
  const [industry, setIndustry] = useState('')
  const [country, setCountry] = useState('')
  const [employeeRange, setEmployeeRange] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(true)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)

  const queryParams: Record<string, any> = { page, per_page: 25 }
  if (q) queryParams.q = q
  if (industry) queryParams.industry = industry
  if (country) queryParams.country = country
  if (employeeRange.length) queryParams.employee_range = employeeRange.join(',')

  const { data, isLoading } = useQuery({
    queryKey: ['companies', queryParams],
    queryFn: async () => {
      const { data } = await companiesAPI.search(queryParams)
      return data
    },
  })

  const companies: Company[] = data?.companies || []
  const total = data?.total || 0
  const totalPages = data?.total_pages || 0

  return (
    <>
      <Header title="Companies" subtitle={`${total.toLocaleString()} companies found`} />

      <div className="flex flex-1 overflow-hidden">
        {/* Filters */}
        {showFilters && (
          <div className="w-64 border-r border-marble-200 bg-white overflow-y-auto p-4 space-y-5 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-roman-700">Filters</h3>
              <button
                onClick={() => { setQ(''); setIndustry(''); setCountry(''); setEmployeeRange([]); setPage(1) }}
                className="text-xs text-marble-400 hover:text-marble-600"
              >
                Clear all
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-marble-500 mb-1.5">Search</label>
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-marble-400" />
                <input
                  value={q}
                  onChange={(e) => { setQ(e.target.value); setPage(1) }}
                  placeholder="Name or domain..."
                  className="input pl-8 text-xs py-1.5"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-marble-500 mb-1.5">Industry</label>
              <input
                value={industry}
                onChange={(e) => { setIndustry(e.target.value); setPage(1) }}
                placeholder="e.g. SaaS, FinTech"
                className="input text-xs py-1.5"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-marble-500 mb-1.5">Country</label>
              <input
                value={country}
                onChange={(e) => { setCountry(e.target.value); setPage(1) }}
                placeholder="e.g. United States"
                className="input text-xs py-1.5"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-marble-500 mb-2">Company Size</label>
              <div className="space-y-1">
                {EMPLOYEE_RANGE_OPTIONS.map((range) => (
                  <label key={range} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={employeeRange.includes(range)}
                      onChange={() => {
                        if (employeeRange.includes(range)) {
                          setEmployeeRange(employeeRange.filter((r) => r !== range))
                        } else {
                          setEmployeeRange([...employeeRange, range])
                        }
                        setPage(1)
                      }}
                      className="rounded border-marble-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-xs text-roman-700">{range} employees</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-marble-200 bg-marble-50">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={clsx('btn-ghost text-xs', showFilters && 'bg-marble-100')}
            >
              <Filter size={14} /> Filters
            </button>
            <div className="flex items-center gap-2 text-xs text-marble-500">
              Page {page} of {totalPages}
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}
                className="p-1 rounded hover:bg-marble-200 disabled:opacity-30">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}
                className="p-1 rounded hover:bg-marble-200 disabled:opacity-30">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
              {isLoading
                ? Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="card p-5 animate-pulse">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-marble-200 rounded-lg" />
                        <div className="h-5 bg-marble-200 rounded w-28" />
                      </div>
                      <div className="h-4 bg-marble-200 rounded w-full mb-2" />
                      <div className="h-4 bg-marble-200 rounded w-3/4" />
                    </div>
                  ))
                : companies.map((co) => (
                    <div
                      key={co.id}
                      className="card p-5 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedCompany(co)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {co.logo_url ? (
                            <img src={co.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                              <Building2 size={20} className="text-violet-600" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-roman-900">{co.name}</h3>
                            {co.domain && (
                              <p className="text-xs text-marble-400">{co.domain}</p>
                            )}
                          </div>
                        </div>
                        {co.website_url && (
                          <a
                            href={co.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-marble-400 hover:text-marble-600"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>

                      {co.short_description && (
                        <p className="text-xs text-marble-500 mb-3 line-clamp-2">{co.short_description}</p>
                      )}

                      <div className="flex flex-wrap gap-2 text-xs text-marble-500">
                        {co.industry && (
                          <span className="badge-blue">
                            <Layers size={10} className="mr-1" /> {co.industry}
                          </span>
                        )}
                        {co.employee_range && (
                          <span className="badge-gray">
                            <Users size={10} className="mr-1" /> {co.employee_range}
                          </span>
                        )}
                        {co.headquarters_country && (
                          <span className="badge-gray">
                            <MapPin size={10} className="mr-1" /> {co.headquarters_city || co.headquarters_country}
                          </span>
                        )}
                        {co.contact_count > 0 && (
                          <span className="badge-green">{co.contact_count} contacts</span>
                        )}
                      </div>

                      {co.tech_stack && co.tech_stack.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {co.tech_stack.slice(0, 5).map((tech) => (
                            <span key={tech} className="px-2 py-0.5 bg-marble-100 text-marble-600 rounded text-[10px]">
                              {tech}
                            </span>
                          ))}
                          {co.tech_stack.length > 5 && (
                            <span className="px-2 py-0.5 bg-marble-100 text-marble-400 rounded text-[10px]">
                              +{co.tech_stack.length - 5}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
            </div>

            {!isLoading && companies.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-marble-400">
                <Building2 size={48} className="mb-4 opacity-30" />
                <p className="text-lg font-medium text-marble-500">No companies found</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
