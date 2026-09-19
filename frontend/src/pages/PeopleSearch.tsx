import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import {
  Search, Filter, Mail, Phone, Linkedin, MapPin, Building2,
  ChevronLeft, ChevronRight, Check, Copy, ExternalLink,
  Download, ListPlus, MoreHorizontal, X, Shield, AlertCircle,
  Eye, Trash2, UserPlus, Globe, Briefcase, Calendar, Star,
} from 'lucide-react'
import Header from '../components/layout/Header'
import { contactsAPI, listsAPI, exportAPI } from '../services/api'
import type { Contact, ContactList } from '../types'
import { SENIORITY_OPTIONS, DEPARTMENT_OPTIONS, EMPLOYEE_RANGE_OPTIONS } from '../types'
import clsx from 'clsx'
import toast from 'react-hot-toast'

function EmailBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    verified: 'badge-green',
    unverified: 'badge-yellow',
    invalid: 'badge-red',
    unknown: 'badge-gray',
  }
  return <span className={styles[status] || 'badge-gray'}>{status}</span>
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={handleCopy} className="text-marble-400 hover:text-roman-600 transition-colors" title="Copy">
      {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
    </button>
  )
}

/* ── Contact Detail Slide-out ───────────────────────────────────── */
function ContactDetail({ contact, onClose }: { contact: Contact; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-[480px] bg-white shadow-2xl overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-br from-roman-800 to-roman-900 text-white p-6 z-10">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/60 hover:text-white">
            <X size={20} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-roman-950 font-display font-bold text-xl flex-shrink-0">
              {contact.first_name[0]}{contact.last_name[0]}
            </div>
            <div>
              <h2 className="text-xl font-display font-bold tracking-wide">
                {contact.first_name} {contact.last_name}
              </h2>
              {contact.title && <p className="text-white/70 text-sm mt-0.5">{contact.title}</p>}
              {contact.company_name && (
                <p className="text-brand-300 text-sm flex items-center gap-1 mt-0.5">
                  <Building2 size={12} /> {contact.company_name}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Contact info */}
          <div>
            <h3 className="text-xs font-semibold text-marble-400 uppercase tracking-wider mb-3">Contact Information</h3>
            <div className="space-y-3">
              {contact.email && (
                <div className="flex items-center gap-3 p-3 bg-marble-50 rounded-lg">
                  <Mail size={16} className="text-brand-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-marble-400">Email</p>
                    <p className="text-sm font-mono text-roman-800 truncate">{contact.email}</p>
                  </div>
                  <CopyButton text={contact.email} />
                  <EmailBadge status={contact.email_status} />
                </div>
              )}
              {contact.personal_email && (
                <div className="flex items-center gap-3 p-3 bg-marble-50 rounded-lg">
                  <Mail size={16} className="text-marble-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-marble-400">Personal Email</p>
                    <p className="text-sm font-mono text-roman-800 truncate">{contact.personal_email}</p>
                  </div>
                  <CopyButton text={contact.personal_email} />
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-3 p-3 bg-marble-50 rounded-lg">
                  <Phone size={16} className="text-emerald-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-marble-400">Phone</p>
                    <p className="text-sm font-mono text-roman-800">{contact.phone}</p>
                  </div>
                  <CopyButton text={contact.phone} />
                </div>
              )}
              {contact.mobile_phone && (
                <div className="flex items-center gap-3 p-3 bg-marble-50 rounded-lg">
                  <Phone size={16} className="text-amber-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-marble-400">Mobile</p>
                    <p className="text-sm font-mono text-roman-800">{contact.mobile_phone}</p>
                  </div>
                  <CopyButton text={contact.mobile_phone} />
                </div>
              )}
            </div>
          </div>

          {/* Professional details */}
          <div>
            <h3 className="text-xs font-semibold text-marble-400 uppercase tracking-wider mb-3">Professional Details</h3>
            <div className="grid grid-cols-2 gap-3">
              {contact.seniority && (
                <div className="p-3 bg-marble-50 rounded-lg">
                  <p className="text-xs text-marble-400">Seniority</p>
                  <p className="text-sm text-roman-800 capitalize font-medium">{contact.seniority.replace('_', ' ')}</p>
                </div>
              )}
              {contact.department && (
                <div className="p-3 bg-marble-50 rounded-lg">
                  <p className="text-xs text-marble-400">Department</p>
                  <p className="text-sm text-roman-800 capitalize font-medium">{contact.department}</p>
                </div>
              )}
              {contact.headline && (
                <div className="p-3 bg-marble-50 rounded-lg col-span-2">
                  <p className="text-xs text-marble-400">Headline</p>
                  <p className="text-sm text-roman-800">{contact.headline}</p>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          {(contact.city || contact.state || contact.country) && (
            <div>
              <h3 className="text-xs font-semibold text-marble-400 uppercase tracking-wider mb-3">Location</h3>
              <div className="flex items-center gap-2 p-3 bg-marble-50 rounded-lg">
                <MapPin size={16} className="text-roman-500 flex-shrink-0" />
                <p className="text-sm text-roman-800">
                  {[contact.city, contact.state, contact.country].filter(Boolean).join(', ')}
                </p>
              </div>
            </div>
          )}

          {/* Social links */}
          {(contact.linkedin_url || contact.twitter_url || contact.github_url) && (
            <div>
              <h3 className="text-xs font-semibold text-marble-400 uppercase tracking-wider mb-3">Social Profiles</h3>
              <div className="flex gap-2">
                {contact.linkedin_url && (
                  <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100 transition-colors">
                    <Linkedin size={14} /> LinkedIn
                  </a>
                )}
                {contact.twitter_url && (
                  <a href={contact.twitter_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-sky-50 text-sky-600 rounded-lg text-sm hover:bg-sky-100 transition-colors">
                    <Globe size={14} /> Twitter
                  </a>
                )}
                {contact.github_url && (
                  <a href={contact.github_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-marble-100 text-roman-700 rounded-lg text-sm hover:bg-marble-200 transition-colors">
                    <ExternalLink size={14} /> GitHub
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Skills */}
          {contact.skills && contact.skills.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-marble-400 uppercase tracking-wider mb-3">Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {contact.skills.map((skill) => (
                  <span key={skill} className="px-2.5 py-1 bg-brand-50 text-brand-700 text-xs rounded-full font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Data quality */}
          <div>
            <h3 className="text-xs font-semibold text-marble-400 uppercase tracking-wider mb-3">Data Quality</h3>
            <div className="flex items-center gap-3 p-3 bg-marble-50 rounded-lg">
              <Star size={16} className="text-brand-500" />
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-marble-500">Quality Score</span>
                  <span className="font-medium text-roman-800">{contact.data_quality_score}%</span>
                </div>
                <div className="h-2 bg-marble-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all"
                    style={{ width: `${contact.data_quality_score}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="text-xs text-marble-400 flex items-center gap-4 pt-2 border-t border-marble-100">
            <span className="flex items-center gap-1"><Calendar size={12} /> Added {new Date(contact.created_at).toLocaleDateString()}</span>
            {contact.source && <span>Source: {contact.source}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Row Dropdown Menu ───────────────────────────────────── */
function RowDropdown({
  contact,
  onViewDetails,
  onAddToList,
  onDelete,
}: {
  contact: Contact
  onViewDetails: () => void
  onAddToList: () => void
  onDelete: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
        className="text-marble-400 hover:text-marble-600 p-1 rounded hover:bg-marble-100 transition-colors"
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-xl border border-marble-200 py-1 z-40">
          <button
            onClick={() => { setOpen(false); onViewDetails() }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-roman-700 hover:bg-marble-50 transition-colors"
          >
            <Eye size={14} className="text-marble-400" /> View Details
          </button>
          <button
            onClick={() => { setOpen(false); onAddToList() }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-roman-700 hover:bg-marble-50 transition-colors"
          >
            <ListPlus size={14} className="text-marble-400" /> Add to List
          </button>
          <div className="h-px bg-marble-100 my-1" />
          <button
            onClick={() => { setOpen(false); onDelete() }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} /> Delete Contact
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Main Component ───────────────────────────────────── */
export default function PeopleSearch() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [showAddToList, setShowAddToList] = useState(false)
  const [addToListContactId, setAddToListContactId] = useState<number | null>(null)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)

  // Filter state
  const [q, setQ] = useState(searchParams.get('q') || '')
  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')
  const [location, setLocation] = useState('')
  const [seniority, setSeniority] = useState<string[]>([])
  const [department, setDepartment] = useState<string[]>([])
  const [hasEmail, setHasEmail] = useState<boolean | undefined>(
    searchParams.get('has_email') === 'true' ? true : undefined
  )
  const [hasPhone, setHasPhone] = useState<boolean | undefined>(
    searchParams.get('has_phone') === 'true' ? true : undefined
  )
  const [page, setPage] = useState(1)

  // Build query params
  const queryParams: Record<string, any> = { page, per_page: 25 }
  if (q) queryParams.q = q
  if (title) queryParams.title = title
  if (company) queryParams.company = company
  if (location) queryParams.location = location
  if (seniority.length) queryParams.seniority = seniority.join(',')
  if (department.length) queryParams.department = department.join(',')
  if (hasEmail) queryParams.has_email = true
  if (hasPhone) queryParams.has_phone = true

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['contacts', queryParams],
    queryFn: async () => {
      const { data } = await contactsAPI.search(queryParams)
      return data
    },
  })

  const { data: lists } = useQuery<ContactList[]>({
    queryKey: ['lists'],
    queryFn: async () => {
      const { data } = await listsAPI.getAll()
      return data
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => contactsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      toast.success('Contact deleted')
    },
    onError: () => toast.error('Failed to delete contact'),
  })

  const contacts: Contact[] = data?.contacts || []
  const total = data?.total || 0
  const totalPages = data?.total_pages || 0

  const toggleSelect = (id: number) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const selectAll = () => {
    if (selectedIds.size === contacts.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(contacts.map((c) => c.id)))
    }
  }

  const handleAddToList = async (listId: number) => {
    try {
      const ids = addToListContactId ? [addToListContactId] : Array.from(selectedIds)
      await listsAPI.addContacts(listId, ids)
      toast.success(`Added ${ids.length} contact${ids.length > 1 ? 's' : ''} to list`)
      setShowAddToList(false)
      setAddToListContactId(null)
      setSelectedIds(new Set())
    } catch {
      toast.error('Failed to add contacts')
    }
  }

  const handleExport = async () => {
    try {
      const { data } = await exportAPI.contacts({
        contact_ids: Array.from(selectedIds),
      })
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = 'pheobus_contacts.csv'
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Contacts exported!')
    } catch {
      toast.error('Export failed')
    }
  }

  const toggleFilter = (arr: string[], val: string, setter: (v: string[]) => void) => {
    if (arr.includes(val)) setter(arr.filter((v) => v !== val))
    else setter([...arr, val])
    setPage(1)
  }

  const openAddToListForContact = (contactId: number) => {
    setAddToListContactId(contactId)
    setShowAddToList(true)
  }

  return (
    <>
      <Header
        title="People"
        subtitle={`${total.toLocaleString()} contacts found`}
        actions={
          selectedIds.size > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-marble-600">{selectedIds.size} selected</span>
              <button onClick={() => { setAddToListContactId(null); setShowAddToList(!showAddToList) }} className="btn-secondary text-xs py-1.5">
                <ListPlus size={14} /> Add to List
              </button>
              <button onClick={handleExport} className="btn-secondary text-xs py-1.5">
                <Download size={14} /> Export
              </button>
            </div>
          ) : undefined
        }
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Filters sidebar */}
        {showFilters && (
          <div className="w-64 border-r border-marble-200 bg-white overflow-y-auto p-4 space-y-5 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-roman-700">Filters</h3>
              <button
                onClick={() => {
                  setQ(''); setTitle(''); setCompany(''); setLocation('')
                  setSeniority([]); setDepartment([]); setHasEmail(undefined); setHasPhone(undefined)
                  setPage(1)
                }}
                className="text-xs text-marble-400 hover:text-marble-600"
              >
                Clear all
              </button>
            </div>

            {/* Quick search */}
            <div>
              <label className="block text-xs font-medium text-marble-500 mb-1.5">Search</label>
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-marble-400" />
                <input
                  value={q}
                  onChange={(e) => { setQ(e.target.value); setPage(1) }}
                  placeholder="Name, email, or title..."
                  className="input pl-8 text-xs py-1.5"
                />
              </div>
            </div>

            {/* Job title */}
            <div>
              <label className="block text-xs font-medium text-marble-500 mb-1.5">Job Title</label>
              <input
                value={title}
                onChange={(e) => { setTitle(e.target.value); setPage(1) }}
                placeholder="e.g. VP Engineering"
                className="input text-xs py-1.5"
              />
            </div>

            {/* Company */}
            <div>
              <label className="block text-xs font-medium text-marble-500 mb-1.5">Company</label>
              <input
                value={company}
                onChange={(e) => { setCompany(e.target.value); setPage(1) }}
                placeholder="e.g. Stripe"
                className="input text-xs py-1.5"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-medium text-marble-500 mb-1.5">Location</label>
              <input
                value={location}
                onChange={(e) => { setLocation(e.target.value); setPage(1) }}
                placeholder="City, state, or country"
                className="input text-xs py-1.5"
              />
            </div>

            {/* Seniority */}
            <div>
              <label className="block text-xs font-medium text-marble-500 mb-2">Seniority</label>
              <div className="space-y-1">
                {SENIORITY_OPTIONS.map(({ value, label }) => (
                  <label key={value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={seniority.includes(value)}
                      onChange={() => toggleFilter(seniority, value, setSeniority)}
                      className="rounded border-marble-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-xs text-roman-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-medium text-marble-500 mb-2">Department</label>
              <div className="space-y-1">
                {DEPARTMENT_OPTIONS.slice(0, 6).map(({ value, label }) => (
                  <label key={value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={department.includes(value)}
                      onChange={() => toggleFilter(department, value, setDepartment)}
                      className="rounded border-marble-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-xs text-roman-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Contact info toggles */}
            <div>
              <label className="block text-xs font-medium text-marble-500 mb-2">Contact Info</label>
              <div className="space-y-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasEmail === true}
                    onChange={() => { setHasEmail(hasEmail ? undefined : true); setPage(1) }}
                    className="rounded border-marble-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-xs text-roman-700">Has email</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasPhone === true}
                    onChange={() => { setHasPhone(hasPhone ? undefined : true); setPage(1) }}
                    className="rounded border-marble-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-xs text-roman-700">Has phone</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Results table */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-marble-200 bg-marble-50">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={clsx('btn-ghost text-xs', showFilters && 'bg-marble-100')}
              >
                <Filter size={14} /> Filters
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-marble-500">
              Page {page} of {totalPages}
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="p-1 rounded hover:bg-marble-200 disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="p-1 rounded hover:bg-marble-200 disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-marble-50 border-b border-marble-200">
                <tr>
                  <th className="w-10 px-3 py-3">
                    <input
                      type="checkbox"
                      checked={contacts.length > 0 && selectedIds.size === contacts.length}
                      onChange={selectAll}
                      className="rounded border-marble-300 text-brand-600"
                    />
                  </th>
                  <th className="text-left px-3 py-3 font-medium text-marble-500">Name</th>
                  <th className="text-left px-3 py-3 font-medium text-marble-500">Title</th>
                  <th className="text-left px-3 py-3 font-medium text-marble-500">Company</th>
                  <th className="text-left px-3 py-3 font-medium text-marble-500">Email</th>
                  <th className="text-left px-3 py-3 font-medium text-marble-500">Phone</th>
                  <th className="text-left px-3 py-3 font-medium text-marble-500">Location</th>
                  <th className="w-10 px-3 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-marble-100">
                {isLoading
                  ? Array.from({ length: 10 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-3 py-3"><div className="w-4 h-4 bg-marble-200 rounded" /></td>
                        <td className="px-3 py-3"><div className="h-4 bg-marble-200 rounded w-32" /></td>
                        <td className="px-3 py-3"><div className="h-4 bg-marble-200 rounded w-40" /></td>
                        <td className="px-3 py-3"><div className="h-4 bg-marble-200 rounded w-24" /></td>
                        <td className="px-3 py-3"><div className="h-4 bg-marble-200 rounded w-36" /></td>
                        <td className="px-3 py-3"><div className="h-4 bg-marble-200 rounded w-24" /></td>
                        <td className="px-3 py-3"><div className="h-4 bg-marble-200 rounded w-28" /></td>
                        <td className="px-3 py-3" />
                      </tr>
                    ))
                  : contacts.map((contact) => (
                      <tr
                        key={contact.id}
                        onClick={() => setSelectedContact(contact)}
                        className={clsx(
                          'hover:bg-marble-50 transition-colors cursor-pointer',
                          selectedIds.has(contact.id) && 'bg-brand-100/50'
                        )}
                      >
                        <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(contact.id)}
                            onChange={() => toggleSelect(contact.id)}
                            className="rounded border-marble-300 text-brand-600"
                          />
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-roman-950 font-display font-bold text-xs flex-shrink-0">
                              {contact.first_name[0]}{contact.last_name[0]}
                            </div>
                            <div>
                              <div className="font-medium text-roman-900 flex items-center gap-1.5">
                                {contact.first_name} {contact.last_name}
                                {contact.linkedin_url && (
                                  <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer"
                                    className="text-blue-500 hover:text-blue-600"
                                    onClick={(e) => e.stopPropagation()}>
                                    <Linkedin size={12} />
                                  </a>
                                )}
                              </div>
                              {contact.seniority && (
                                <span className="text-xs text-marble-400 capitalize">{contact.seniority.replace('_', '-')}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-marble-600 max-w-[200px] truncate">{contact.title || '—'}</td>
                        <td className="px-3 py-3">
                          {contact.company_name ? (
                            <div className="flex items-center gap-1.5">
                              <Building2 size={13} className="text-marble-400" />
                              <span className="text-roman-700">{contact.company_name}</span>
                            </div>
                          ) : '—'}
                        </td>
                        <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                          {contact.email ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-roman-700 font-mono text-xs">{contact.email}</span>
                              <CopyButton text={contact.email} />
                              <EmailBadge status={contact.email_status} />
                            </div>
                          ) : (
                            <span className="text-marble-400 text-xs">No email</span>
                          )}
                        </td>
                        <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                          {contact.phone ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-roman-700 font-mono text-xs">{contact.phone}</span>
                              <CopyButton text={contact.phone} />
                            </div>
                          ) : (
                            <span className="text-marble-400 text-xs">No phone</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          {contact.city || contact.country ? (
                            <div className="flex items-center gap-1 text-xs text-marble-500">
                              <MapPin size={12} />
                              {[contact.city, contact.state, contact.country].filter(Boolean).join(', ')}
                            </div>
                          ) : '—'}
                        </td>
                        <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                          <RowDropdown
                            contact={contact}
                            onViewDetails={() => setSelectedContact(contact)}
                            onAddToList={() => openAddToListForContact(contact.id)}
                            onDelete={() => {
                              if (confirm(`Delete ${contact.first_name} ${contact.last_name}?`)) {
                                deleteMutation.mutate(contact.id)
                              }
                            }}
                          />
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>

            {!isLoading && contacts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-marble-400">
                <Search size={48} className="mb-4 opacity-30" />
                <p className="text-lg font-medium text-marble-500">No contacts found</p>
                <p className="text-sm">Try adjusting your filters or search query</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact detail slide-out */}
      {selectedContact && (
        <ContactDetail contact={selectedContact} onClose={() => setSelectedContact(null)} />
      )}

      {/* Add to list modal */}
      {showAddToList && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => { setShowAddToList(false); setAddToListContactId(null) }}>
          <div className="bg-white rounded-xl p-6 w-96 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-roman-900">Add to List</h3>
              <button onClick={() => { setShowAddToList(false); setAddToListContactId(null) }} className="text-marble-400 hover:text-marble-600">
                <X size={20} />
              </button>
            </div>
            <p className="text-xs text-marble-500 mb-3">
              {addToListContactId ? 'Adding 1 contact' : `Adding ${selectedIds.size} contact${selectedIds.size > 1 ? 's' : ''}`}
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {lists?.map((list) => (
                <button
                  key={list.id}
                  onClick={() => handleAddToList(list.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-marble-50 transition-colors text-left"
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: list.color }} />
                  <div>
                    <div className="font-medium text-sm text-roman-900">{list.name}</div>
                    <div className="text-xs text-marble-500">{list.contact_count} contacts</div>
                  </div>
                </button>
              ))}
              {(!lists || lists.length === 0) && (
                <p className="text-sm text-marble-400 text-center py-4">No lists yet — create one from the Lists page</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
