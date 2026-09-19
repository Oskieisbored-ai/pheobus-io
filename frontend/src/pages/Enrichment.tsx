import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  Search, Mail, Building2, User, Shield, CheckCircle,
  AlertCircle, Loader2, Globe, Cpu, Copy, Check, ArrowRight,
} from 'lucide-react'
import Header from '../components/layout/Header'
import { enrichmentAPI } from '../services/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="text-marble-400 hover:text-marble-600 transition-colors"
    >
      {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
    </button>
  )
}

export default function Enrichment() {
  const [activeTab, setActiveTab] = useState<'email' | 'company'>('email')

  // Email finder state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [domain, setDomain] = useState('')
  const [emailResults, setEmailResults] = useState<any>(null)

  // Company enrichment state
  const [companyDomain, setCompanyDomain] = useState('')
  const [companyResults, setCompanyResults] = useState<any>(null)

  const emailMutation = useMutation({
    mutationFn: () => enrichmentAPI.findEmail({ first_name: firstName, last_name: lastName, domain }),
    onSuccess: ({ data }) => setEmailResults(data),
    onError: () => toast.error('Email lookup failed'),
  })

  const companyMutation = useMutation({
    mutationFn: () => enrichmentAPI.enrichCompany({ domain: companyDomain }),
    onSuccess: ({ data }) => setCompanyResults(data),
    onError: () => toast.error('Company enrichment failed'),
  })

  return (
    <>
      <Header title="Enrichment" subtitle="Find emails and enrich company data" />

      <div className="flex-1 overflow-auto p-6">
        {/* Tab switcher */}
        <div className="flex gap-1 mb-6 bg-marble-100 rounded-lg p-1 w-fit">
          {[
            { key: 'email' as const, icon: Mail, label: 'Email Finder' },
            { key: 'company' as const, icon: Building2, label: 'Company Enrichment' },
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                activeTab === key ? 'bg-white shadow-sm text-roman-900' : 'text-marble-500 hover:text-roman-700'
              )}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        {/* Email Finder */}
        {activeTab === 'email' && (
          <div className="max-w-2xl">
            <div className="card p-6">
              <h3 className="font-semibold text-roman-900 mb-1">Find Professional Email</h3>
              <p className="text-sm text-marble-500 mb-6">
                Enter a person's name and their company domain. We'll find the most likely email address.
              </p>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-roman-700 mb-1">First Name</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-marble-400" />
                    <input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jane"
                      className="input pl-9"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-roman-700 mb-1">Last Name</label>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Smith"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-roman-700 mb-1">Company Domain</label>
                  <div className="relative">
                    <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-marble-400" />
                    <input
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      placeholder="stripe.com"
                      className="input pl-9"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => emailMutation.mutate()}
                disabled={!firstName || !lastName || !domain || emailMutation.isPending}
                className="btn-primary"
              >
                {emailMutation.isPending ? (
                  <><Loader2 size={16} className="animate-spin" /> Searching...</>
                ) : (
                  <><Search size={16} /> Find Email</>
                )}
              </button>
            </div>

            {/* Email results */}
            {emailResults && (
              <div className="card p-6 mt-4">
                <h4 className="font-semibold text-roman-900 mb-4">Results</h4>

                {emailResults.email ? (
                  <div className="space-y-3">
                    {/* Best result */}
                    <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="flex items-center gap-3">
                        <CheckCircle size={20} className="text-emerald-500" />
                        <div>
                          <p className="font-mono text-sm font-medium text-roman-900">{emailResults.email}</p>
                          <p className="text-xs text-marble-500">
                            {Math.round(emailResults.confidence * 100)}% confidence
                            {' '}&middot;{' '}Source: {emailResults.source}
                            {emailResults.verified && <span className="text-emerald-600 ml-1">&middot; Verified</span>}
                          </p>
                        </div>
                      </div>
                      <CopyButton text={emailResults.email} />
                    </div>

                    {/* All alternatives */}
                    {emailResults.all_results.length > 1 && (
                      <div>
                        <p className="text-xs font-medium text-marble-500 mb-2">Alternative matches</p>
                        <div className="space-y-1">
                          {emailResults.all_results.slice(1, 6).map((r: any, i: number) => (
                            <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-marble-50">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-marble-600">{r.email}</span>
                                <span className="text-xs text-marble-400">
                                  {Math.round(r.confidence * 100)}%
                                </span>
                              </div>
                              <CopyButton text={r.email} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-marble-50 rounded-lg">
                    <AlertCircle size={20} className="text-marble-400" />
                    <p className="text-sm text-marble-500">No email found. Try a different domain or check the spelling.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Company Enrichment */}
        {activeTab === 'company' && (
          <div className="max-w-2xl">
            <div className="card p-6">
              <h3 className="font-semibold text-roman-900 mb-1">Enrich Company Data</h3>
              <p className="text-sm text-marble-500 mb-6">
                Enter a company domain to discover tech stack, employee count, funding, and more.
              </p>

              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-marble-400" />
                  <input
                    value={companyDomain}
                    onChange={(e) => setCompanyDomain(e.target.value)}
                    placeholder="e.g. notion.so"
                    className="input pl-9"
                  />
                </div>
                <button
                  onClick={() => companyMutation.mutate()}
                  disabled={!companyDomain || companyMutation.isPending}
                  className="btn-primary"
                >
                  {companyMutation.isPending ? (
                    <><Loader2 size={16} className="animate-spin" /> Enriching...</>
                  ) : (
                    <><Cpu size={16} /> Enrich</>
                  )}
                </button>
              </div>
            </div>

            {/* Company results */}
            {companyResults && (
              <div className="card p-6 mt-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-violet-100 flex items-center justify-center">
                    <Building2 size={24} className="text-violet-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-roman-900 text-lg">
                      {companyResults.data?.name || companyDomain}
                    </h4>
                    <p className="text-sm text-marble-500">{companyResults.data?.domain}</p>
                  </div>
                  <span className={`badge ml-auto ${companyResults.status === 'created' ? 'badge-green' : 'badge-blue'}`}>
                    {companyResults.status === 'created' ? 'New' : 'Updated'}
                  </span>
                </div>

                {companyResults.data?.description && (
                  <p className="text-sm text-marble-600 mb-4">{companyResults.data.description}</p>
                )}

                <div className="grid grid-cols-2 gap-4 mb-4">
                  {[
                    { label: 'Industry', value: companyResults.data?.industry },
                    { label: 'Employees', value: companyResults.data?.employee_range || companyResults.data?.employee_count },
                    { label: 'Founded', value: companyResults.data?.founded_year },
                    { label: 'HQ', value: [companyResults.data?.headquarters_city, companyResults.data?.headquarters_country].filter(Boolean).join(', ') },
                  ].filter(({ value }) => value).map(({ label, value }) => (
                    <div key={label} className="p-3 bg-marble-50 rounded-lg">
                      <p className="text-xs text-marble-400 mb-0.5">{label}</p>
                      <p className="text-sm font-medium text-roman-900">{value}</p>
                    </div>
                  ))}
                </div>

                {companyResults.data?.tech_stack?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-marble-500 mb-2">Tech Stack</p>
                    <div className="flex flex-wrap gap-1.5">
                      {companyResults.data.tech_stack.map((tech: string) => (
                        <span key={tech} className="px-2.5 py-1 bg-violet-50 text-violet-700 rounded-md text-xs font-medium">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
