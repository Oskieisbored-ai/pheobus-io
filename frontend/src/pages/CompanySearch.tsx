import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Search, Building2, Globe, Users, MapPin, ChevronLeft, ChevronRight,
  ExternalLink, Filter, Layers, Map, LayoutGrid, Navigation, X, ChevronDown,
} from 'lucide-react'
import Header from '../components/layout/Header'
import { companiesAPI } from '../services/api'
import type { Company } from '../types'
import { BUSINESS_TYPE_OPTIONS } from '../types'
import clsx from 'clsx'

// Google Maps Embed API key — free tier, embed-only
const MAPS_KEY = (import.meta as any).env?.VITE_GOOGLE_MAPS_KEY || 'AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8'

// ─── Hardcoded city coordinates for demo data (no API key needed) ─────────
const CITY_COORDS: Record<string, [number, number]> = {
  'san francisco': [37.7749, -122.4194],
  'new york': [40.7128, -74.0060],
  'london': [51.5074, -0.1278],
  'sydney': [-33.8688, 151.2093],
  'berlin': [52.5200, 13.4050],
  'tokyo': [35.6762, 139.6503],
  'paris': [48.8566, 2.3522],
  'toronto': [43.6532, -79.3832],
  'singapore': [1.3521, 103.8198],
  'amsterdam': [52.3676, 4.9041],
  'los angeles': [34.0522, -118.2437],
  'seattle': [47.6062, -122.3321],
  'austin': [30.2672, -97.7431],
  'chicago': [41.8781, -87.6298],
  'boston': [42.3601, -71.0589],
  'denver': [39.7392, -104.9903],
  'atlanta': [33.7490, -84.3880],
  'miami': [25.7617, -80.1918],
  'bangalore': [12.9716, 77.5946],
  'dublin': [53.3498, -6.2603],
  'tel aviv': [32.0853, 34.7818],
  'mumbai': [19.0760, 72.8777],
  'beijing': [39.9042, 116.4074],
  'shanghai': [31.2304, 121.4737],
  'são paulo': [-23.5505, -46.6333],
  'mexico city': [19.4326, -99.1332],
}

function getCoords(co: Company): [number, number] | null {
  if (co.latitude && co.longitude) return [co.latitude, co.longitude]
  const city = co.headquarters_city?.toLowerCase()
  if (city && CITY_COORDS[city]) return CITY_COORDS[city]
  return null
}

// ─── Map Component (Google Maps Embed — no API key needed) ──────────────
function CompanyMapView({ companies, onSelectCompany, mapQuery }: {
  companies: Company[]
  onSelectCompany: (co: Company) => void
  mapQuery: string
}) {
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const companiesWithCoords = useMemo(
    () => companies.map(co => ({ co, coords: getCoords(co) })).filter(c => c.coords),
    [companies]
  )

  // Calculate center from all companies
  const center = useMemo(() => {
    if (companiesWithCoords.length === 0) return { lat: 37.7749, lng: -122.4194 }
    const avgLat = companiesWithCoords.reduce((s, c) => s + c.coords![0], 0) / companiesWithCoords.length
    const avgLng = companiesWithCoords.reduce((s, c) => s + c.coords![1], 0) / companiesWithCoords.length
    return { lat: avgLat, lng: avgLng }
  }, [companiesWithCoords])

  const noLocation = companies.filter(co => !getCoords(co))

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Map area */}
      <div className="flex-1 relative bg-marble-100">
        {/* Google Maps embed — shows all companies region */}
        <iframe
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps/embed/v1/search?key=${MAPS_KEY}&q=${encodeURIComponent(mapQuery || 'companies')}&center=${center.lat},${center.lng}&zoom=${companiesWithCoords.length <= 1 ? 10 : 4}`}
          allowFullScreen
        />

        {/* Company pins overlay */}
        <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-2 z-10">
          {companiesWithCoords.map(({ co }) => (
            <button
              key={co.id}
              onClick={() => onSelectCompany(co)}
              onMouseEnter={() => setHoveredId(co.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={clsx(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium shadow-lg transition-all',
                hoveredId === co.id
                  ? 'bg-brand-500 text-white scale-105'
                  : 'bg-white text-roman-800 hover:bg-brand-50'
              )}
            >
              <MapPin size={12} className={hoveredId === co.id ? 'text-white' : 'text-brand-500'} />
              {co.name}
              {co.headquarters_city && (
                <span className={clsx('text-[10px]', hoveredId === co.id ? 'text-brand-100' : 'text-marble-400')}>
                  {co.headquarters_city}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Companies without locations */}
        {noLocation.length > 0 && (
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur rounded-lg shadow-lg p-3 max-w-xs">
            <p className="text-xs font-medium text-marble-500 mb-2">
              {noLocation.length} {noLocation.length === 1 ? 'company' : 'companies'} without location data
            </p>
            <div className="flex flex-wrap gap-1">
              {noLocation.map(co => (
                <button
                  key={co.id}
                  onClick={() => onSelectCompany(co)}
                  className="text-xs px-2 py-1 bg-marble-100 hover:bg-brand-50 text-roman-700 rounded transition-colors"
                >
                  {co.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Company Detail Slide-out ───────────────────────────────────────────
function CompanyDetail({ company, onClose }: { company: Company; onClose: () => void }) {
  const location = [company.headquarters_city, company.headquarters_state, company.headquarters_country].filter(Boolean).join(', ')

  return (
    <div className="w-96 border-l border-marble-200 bg-white overflow-y-auto flex-shrink-0">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {company.logo_url ? (
              <img src={company.logo_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                <Building2 size={22} className="text-white" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-roman-900 text-lg">{company.name}</h3>
              {company.domain && <p className="text-xs text-marble-400">{company.domain}</p>}
            </div>
          </div>
          <button onClick={onClose} className="text-marble-400 hover:text-marble-600">
            <X size={18} />
          </button>
        </div>

        {company.short_description && (
          <p className="text-sm text-marble-600 mb-4">{company.short_description}</p>
        )}

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          {company.industry && (
            <div className="p-2.5 bg-marble-50 rounded-lg">
              <p className="text-[10px] text-marble-400 uppercase tracking-wider">Industry</p>
              <p className="text-sm font-medium text-roman-800">{company.industry}</p>
            </div>
          )}
          {company.employee_range && (
            <div className="p-2.5 bg-marble-50 rounded-lg">
              <p className="text-[10px] text-marble-400 uppercase tracking-wider">Employees</p>
              <p className="text-sm font-medium text-roman-800">{company.employee_range}</p>
            </div>
          )}
          {company.founded_year && (
            <div className="p-2.5 bg-marble-50 rounded-lg">
              <p className="text-[10px] text-marble-400 uppercase tracking-wider">Founded</p>
              <p className="text-sm font-medium text-roman-800">{company.founded_year}</p>
            </div>
          )}
          {location && (
            <div className="p-2.5 bg-marble-50 rounded-lg">
              <p className="text-[10px] text-marble-400 uppercase tracking-wider">Location</p>
              <p className="text-sm font-medium text-roman-800">{company.headquarters_city || company.headquarters_country}</p>
            </div>
          )}
        </div>

        {/* Google Maps embed for this company */}
        {location && (
          <div className="mb-5">
            <p className="text-xs font-medium text-marble-500 mb-2 flex items-center gap-1">
              <MapPin size={12} /> Location
            </p>
            <div className="rounded-lg overflow-hidden border border-marble-200">
              <iframe
                className="w-full h-48 border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed/v1/place?key=${MAPS_KEY}&q=${encodeURIComponent(company.name + ', ' + location)}`}
                allowFullScreen
              />
            </div>
            <a
              href={company.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 mt-2"
            >
              <Navigation size={12} /> Open in Google Maps
            </a>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-2 mb-5">
          {company.website_url ? (
            <a
              href={company.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-xs justify-center"
            >
              <Globe size={14} /> Visit Website
            </a>
          ) : (
            <a
              href={company.google_search_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-xs justify-center"
            >
              <Search size={14} /> Search on Google
            </a>
          )}

          {company.google_maps_url && (
            <a
              href={company.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-xs justify-center"
            >
              <MapPin size={14} /> View on Google Maps
            </a>
          )}

          {company.linkedin_url && (
            <a
              href={company.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-xs justify-center"
            >
              <ExternalLink size={14} /> LinkedIn
            </a>
          )}
        </div>

        {/* Tech stack */}
        {company.tech_stack && company.tech_stack.length > 0 && (
          <div>
            <p className="text-xs font-medium text-marble-500 mb-2">Tech Stack</p>
            <div className="flex flex-wrap gap-1.5">
              {company.tech_stack.map((tech) => (
                <span key={tech} className="px-2.5 py-1 bg-brand-50 text-brand-700 rounded-md text-xs font-medium">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────
export default function CompanySearch() {
  const [q, setQ] = useState('')
  const [industries, setIndustries] = useState<string[]>([])
  const [customIndustry, setCustomIndustry] = useState('')
  const [country, setCountry] = useState('')
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(true)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Tech'])

  const allSelectedIndustries = customIndustry
    ? [...industries, ...customIndustry.split(',').map(s => s.trim()).filter(Boolean)]
    : industries

  const queryParams: Record<string, any> = { page, per_page: 25 }
  if (q) queryParams.q = q
  if (allSelectedIndustries.length) queryParams.industry = allSelectedIndustries.join(',')
  if (country) queryParams.country = country

  const toggleIndustry = (value: string) => {
    setIndustries(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    )
    setPage(1)
  }

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  const categories = useMemo(() => {
    const cats: Record<string, typeof BUSINESS_TYPE_OPTIONS> = {}
    BUSINESS_TYPE_OPTIONS.forEach(opt => {
      if (!cats[opt.category]) cats[opt.category] = []
      cats[opt.category].push(opt)
    })
    return cats
  }, [])

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
                onClick={() => { setQ(''); setIndustries([]); setCustomIndustry(''); setCountry(''); setPage(1) }}
                className="text-xs text-marble-400 hover:text-marble-600"
              >
                Clear all
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-marble-500">Business Type</label>
                {industries.length > 0 && (
                  <button
                    onClick={() => { setIndustries([]); setPage(1) }}
                    className="text-[10px] text-brand-500 hover:text-brand-600"
                  >
                    Clear ({industries.length})
                  </button>
                )}
              </div>

              {/* Selected chips */}
              {industries.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {industries.map(ind => {
                    const opt = BUSINESS_TYPE_OPTIONS.find(o => o.value === ind)
                    return (
                      <span
                        key={ind}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-50 text-brand-700 rounded-full text-[10px] font-medium"
                      >
                        {opt?.label || ind}
                        <button
                          onClick={() => toggleIndustry(ind)}
                          className="text-brand-400 hover:text-brand-600"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    )
                  })}
                </div>
              )}

              {/* Category groups */}
              <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                {Object.entries(categories).map(([cat, options]) => (
                  <div key={cat}>
                    <button
                      onClick={() => toggleCategory(cat)}
                      className="flex items-center justify-between w-full py-1 text-xs font-medium text-roman-700 hover:text-roman-900"
                    >
                      <span>{cat}</span>
                      <ChevronDown
                        size={12}
                        className={clsx(
                          'transition-transform text-marble-400',
                          expandedCategories.includes(cat) && 'rotate-180'
                        )}
                      />
                    </button>
                    {expandedCategories.includes(cat) && (
                      <div className="pl-1 space-y-0.5 pb-1">
                        {options.map(opt => (
                          <label key={opt.value} className="flex items-center gap-2 cursor-pointer py-0.5">
                            <input
                              type="checkbox"
                              checked={industries.includes(opt.value)}
                              onChange={() => toggleIndustry(opt.value)}
                              className="rounded border-marble-300 text-brand-600 focus:ring-brand-500 h-3.5 w-3.5"
                            />
                            <span className="text-xs text-roman-700">{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Custom industry input */}
              <input
                value={customIndustry}
                onChange={(e) => { setCustomIndustry(e.target.value); setPage(1) }}
                placeholder="Or type custom..."
                className="input text-xs py-1.5 mt-2"
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

          </div>
        )}

        {/* Results */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-3 px-4 py-2.5 border-b border-marble-200 bg-marble-50">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={clsx('btn-ghost text-xs flex-shrink-0', showFilters && 'bg-marble-100')}
            >
              <Filter size={14} /> Filters
            </button>

            {/* Search bar */}
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-marble-400" />
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1) }}
                placeholder="Search companies by name, domain, industry..."
                className="w-full pl-9 pr-3 py-1.5 text-sm border border-marble-300 rounded-lg bg-white placeholder-marble-400 focus:outline-none focus:ring-2 focus:ring-brand-400/50 focus:border-brand-500 transition-colors"
              />
              {q && (
                <button
                  onClick={() => { setQ(''); setPage(1) }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-marble-400 hover:text-marble-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* View toggle */}
            <div className="flex items-center bg-marble-100 rounded-lg p-0.5 flex-shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={clsx(
                  'p-1.5 rounded-md transition-colors',
                  viewMode === 'grid' ? 'bg-white shadow-sm text-roman-900' : 'text-marble-400 hover:text-marble-600'
                )}
                title="Grid view"
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={clsx(
                  'p-1.5 rounded-md transition-colors',
                  viewMode === 'map' ? 'bg-white shadow-sm text-roman-900' : 'text-marble-400 hover:text-marble-600'
                )}
                title="Map view"
              >
                <Map size={14} />
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-marble-500 flex-shrink-0">
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

          {/* Content area */}
          <div className="flex flex-1 overflow-hidden">
            {viewMode === 'map' ? (
              companies.length === 0 && !isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center text-marble-400">
                  <Building2 size={48} className="mb-4 opacity-30" />
                  <p className="text-lg font-medium text-marble-500">No companies match this filter</p>
                  <p className="text-sm">Try selecting a different business type or clearing filters</p>
                </div>
              ) : (
                <CompanyMapView
                  companies={companies}
                  onSelectCompany={setSelectedCompany}
                  mapQuery={
                    allSelectedIndustries.length
                      ? allSelectedIndustries.join(' ') + ' companies'
                      : q
                        ? q + ' companies'
                        : 'companies'
                  }
                />
              )
            ) : (
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
                            {co.website_url ? (
                              <a
                                href={co.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-marble-400 hover:text-marble-600"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink size={14} />
                              </a>
                            ) : co.google_search_url ? (
                              <a
                                href={co.google_search_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-brand-500 hover:text-brand-600"
                                onClick={(e) => e.stopPropagation()}
                                title="Search on Google"
                              >
                                <Search size={14} />
                              </a>
                            ) : null}
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
                              <a
                                href={co.google_maps_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="badge-gray hover:bg-brand-50 hover:text-brand-700 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                                title="View on Google Maps"
                              >
                                <MapPin size={10} className="mr-1" /> {co.headquarters_city || co.headquarters_country}
                              </a>
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
            )}

            {/* Detail slide-out */}
            {selectedCompany && (
              <CompanyDetail
                company={selectedCompany}
                onClose={() => setSelectedCompany(null)}
              />
            )}
          </div>
        </div>
      </div>
    </>
  )
}
