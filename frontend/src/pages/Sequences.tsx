import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Zap, Plus, Play, Pause, Archive, Mail, Clock, Phone,
  MessageSquare, Trash2, X, ChevronRight, Users, UserPlus,
  Search, Check,
} from 'lucide-react'
import Header from '../components/layout/Header'
import { sequencesAPI, contactsAPI } from '../services/api'
import type { Sequence, Contact } from '../types'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: 'bg-marble-100', text: 'text-marble-600', label: 'Draft' },
  active: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Active' },
  paused: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Paused' },
  archived: { bg: 'bg-red-100', text: 'text-red-600', label: 'Archived' },
}

const STEP_ICONS: Record<string, any> = {
  email: Mail,
  wait: Clock,
  task: Phone,
  linkedin_connect: MessageSquare,
  linkedin_message: MessageSquare,
}

/* ── Enroll Contacts Modal ─────────────────────────── */
function EnrollModal({
  sequenceId,
  onClose,
  onSuccess,
}: {
  sequenceId: number
  onClose: () => void
  onSuccess: () => void
}) {
  const [searchQ, setSearchQ] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  const { data } = useQuery({
    queryKey: ['enroll-contacts', searchQ],
    queryFn: async () => {
      const params: Record<string, any> = { per_page: 50 }
      if (searchQ) params.q = searchQ
      const { data } = await contactsAPI.search(params)
      return data
    },
  })

  const enrollMutation = useMutation({
    mutationFn: () => sequencesAPI.enroll(sequenceId, Array.from(selectedIds)),
    onSuccess: () => {
      toast.success(`Enrolled ${selectedIds.size} contact${selectedIds.size > 1 ? 's' : ''} in sequence`)
      onSuccess()
      onClose()
    },
    onError: () => toast.error('Failed to enroll contacts'),
  })

  const contacts: Contact[] = data?.contacts || []

  const toggleContact = (id: number) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl w-[520px] shadow-xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-marble-200">
          <div>
            <h3 className="font-semibold text-roman-900">Enroll Contacts</h3>
            <p className="text-xs text-marble-500 mt-0.5">Select contacts to add to this sequence</p>
          </div>
          <button onClick={onClose} className="text-marble-400 hover:text-marble-600"><X size={20} /></button>
        </div>

        <div className="px-5 pt-4 pb-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-marble-400" />
            <input
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Search contacts by name, email, company..."
              className="input pl-9 text-sm"
              autoFocus
            />
          </div>
          {selectedIds.size > 0 && (
            <p className="text-xs text-brand-600 font-medium mt-2">{selectedIds.size} contact{selectedIds.size > 1 ? 's' : ''} selected</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-2 min-h-0">
          <div className="space-y-1 py-2">
            {contacts.map((c) => (
              <button
                key={c.id}
                onClick={() => toggleContact(c.id)}
                className={clsx(
                  'w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left',
                  selectedIds.has(c.id)
                    ? 'bg-brand-50 ring-1 ring-brand-300'
                    : 'hover:bg-marble-50'
                )}
              >
                <div className={clsx(
                  'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                  selectedIds.has(c.id)
                    ? 'bg-brand-500 border-brand-500'
                    : 'border-marble-300'
                )}>
                  {selectedIds.has(c.id) && <Check size={12} className="text-white" />}
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-roman-950 font-display font-bold text-xs flex-shrink-0">
                  {c.first_name[0]}{c.last_name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm text-roman-900 truncate">{c.first_name} {c.last_name}</div>
                  <div className="text-xs text-marble-500 truncate">
                    {c.title && <span>{c.title}</span>}
                    {c.title && c.company_name && <span> · </span>}
                    {c.company_name && <span>{c.company_name}</span>}
                  </div>
                </div>
                {c.email && (
                  <span className="text-xs text-marble-400 font-mono truncate max-w-[140px]">{c.email}</span>
                )}
              </button>
            ))}
            {contacts.length === 0 && (
              <p className="text-center text-marble-400 text-sm py-8">No contacts found</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between p-5 border-t border-marble-200 bg-marble-50 rounded-b-xl">
          <button onClick={onClose} className="btn-secondary text-sm">Cancel</button>
          <button
            onClick={() => enrollMutation.mutate()}
            disabled={selectedIds.size === 0 || enrollMutation.isPending}
            className="btn-primary text-sm"
          >
            <UserPlus size={14} />
            {enrollMutation.isPending ? 'Enrolling...' : `Enroll ${selectedIds.size || ''} Contact${selectedIds.size !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Main Sequences Page ─────────────────────────── */
export default function Sequences() {
  const queryClient = useQueryClient()
  const [selectedSeq, setSelectedSeq] = useState<Sequence | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showEnroll, setShowEnroll] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')

  const { data: sequences = [], isLoading } = useQuery<Sequence[]>({
    queryKey: ['sequences'],
    queryFn: async () => {
      const { data } = await sequencesAPI.getAll()
      return data
    },
  })

  const createMutation = useMutation({
    mutationFn: () =>
      sequencesAPI.create({
        name: newName,
        description: newDesc,
        steps: [
          { step_type: 'email', delay_days: 0, subject: 'Hi {{first_name}}', body: 'Your email body here...' },
          { step_type: 'wait', delay_days: 3 },
          { step_type: 'email', delay_days: 0, subject: 'Following up', body: 'Follow-up body...' },
        ],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sequences'] })
      setShowCreate(false)
      setNewName('')
      setNewDesc('')
      toast.success('Sequence created!')
    },
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      sequencesAPI.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sequences'] })
      toast.success('Status updated')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => sequencesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sequences'] })
      setSelectedSeq(null)
      toast.success('Sequence deleted')
    },
  })

  return (
    <>
      <Header
        title="Sequences"
        subtitle={`${sequences.length} sequences`}
        actions={
          <button onClick={() => setShowCreate(true)} className="btn-primary text-xs">
            <Plus size={16} /> New Sequence
          </button>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sequence list */}
        <div className="w-80 border-r border-marble-200 bg-white overflow-y-auto flex-shrink-0">
          <div className="p-3 space-y-2">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="card p-4 animate-pulse">
                    <div className="h-4 bg-marble-200 rounded w-40 mb-2" />
                    <div className="h-3 bg-marble-200 rounded w-24" />
                  </div>
                ))
              : sequences.map((seq) => {
                  const style = STATUS_STYLES[seq.status] || STATUS_STYLES.draft
                  return (
                    <button
                      key={seq.id}
                      onClick={() => setSelectedSeq(seq)}
                      className={clsx(
                        'w-full card p-4 text-left transition-all',
                        selectedSeq?.id === seq.id
                          ? 'ring-2 ring-brand-500 shadow-md'
                          : 'hover:shadow-md'
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-roman-900 text-sm">{seq.name}</h3>
                        <span className={`badge ${style.bg} ${style.text}`}>{style.label}</span>
                      </div>
                      {seq.description && (
                        <p className="text-xs text-marble-500 mb-2 line-clamp-1">{seq.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-marble-400">
                        <span>{seq.steps.length} steps</span>
                        <span>{seq.total_enrolled} enrolled</span>
                        {seq.total_replied > 0 && <span className="text-emerald-500">{seq.total_replied} replied</span>}
                      </div>
                    </button>
                  )
                })}

            {!isLoading && sequences.length === 0 && (
              <div className="text-center py-12 text-marble-400">
                <Zap size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No sequences yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Sequence detail */}
        <div className="flex-1 overflow-auto">
          {selectedSeq ? (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-roman-900">{selectedSeq.name}</h2>
                  {selectedSeq.description && (
                    <p className="text-sm text-marble-500 mt-1">{selectedSeq.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowEnroll(true)}
                    className="btn-secondary text-xs"
                  >
                    <UserPlus size={14} /> Enroll Contacts
                  </button>
                  {selectedSeq.status === 'draft' || selectedSeq.status === 'paused' ? (
                    <button
                      onClick={() => updateStatus.mutate({ id: selectedSeq.id, status: 'active' })}
                      className="btn-primary text-xs"
                    >
                      <Play size={14} /> Activate
                    </button>
                  ) : selectedSeq.status === 'active' ? (
                    <button
                      onClick={() => updateStatus.mutate({ id: selectedSeq.id, status: 'paused' })}
                      className="btn-secondary text-xs"
                    >
                      <Pause size={14} /> Pause
                    </button>
                  ) : null}
                  <button
                    onClick={() => deleteMutation.mutate(selectedSeq.id)}
                    className="btn-ghost text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Enrolled', value: selectedSeq.total_enrolled, color: 'text-brand-600' },
                  { label: 'Opened', value: selectedSeq.total_opened, color: 'text-blue-600' },
                  { label: 'Replied', value: selectedSeq.total_replied, color: 'text-emerald-600' },
                  { label: 'Bounced', value: selectedSeq.total_bounced, color: 'text-red-500' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="card p-4 text-center">
                    <p className={`text-2xl font-bold ${color}`}>{value}</p>
                    <p className="text-xs text-marble-500 mt-1">{label}</p>
                  </div>
                ))}
              </div>

              {/* Steps timeline */}
              <h3 className="font-semibold text-roman-700 mb-4">Sequence Steps</h3>
              <div className="space-y-3">
                {selectedSeq.steps.map((step, i) => {
                  const Icon = STEP_ICONS[step.step_type] || Mail
                  return (
                    <div key={step.id} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className={clsx(
                          'w-9 h-9 rounded-full flex items-center justify-center',
                          step.step_type === 'email' ? 'bg-brand-100 text-brand-600' :
                          step.step_type === 'wait' ? 'bg-amber-100 text-amber-600' :
                          'bg-marble-100 text-marble-500'
                        )}>
                          <Icon size={16} />
                        </div>
                        {i < selectedSeq.steps.length - 1 && (
                          <div className="w-px h-8 bg-marble-200 my-1" />
                        )}
                      </div>
                      <div className="card p-4 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-roman-900 capitalize">
                            {step.step_type === 'wait'
                              ? `Wait ${step.delay_days} day${step.delay_days !== 1 ? 's' : ''}`
                              : step.step_type.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-marble-400">Step {i + 1}</span>
                        </div>
                        {step.subject && (
                          <p className="text-sm text-marble-600">Subject: {step.subject}</p>
                        )}
                        {step.body && (
                          <p className="text-xs text-marble-400 mt-1 line-clamp-2">{step.body}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-marble-400">
              <Zap size={48} className="mb-3 opacity-20" />
              <p className="text-marble-500 font-medium">Select a sequence</p>
              <p className="text-sm">or create a new one to automate outreach</p>
            </div>
          )}
        </div>
      </div>

      {/* Enroll contacts modal */}
      {showEnroll && selectedSeq && (
        <EnrollModal
          sequenceId={selectedSeq.id}
          onClose={() => setShowEnroll(false)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['sequences'] })}
        />
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-xl p-6 w-[420px] shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-roman-900">New Sequence</h3>
              <button onClick={() => setShowCreate(false)} className="text-marble-400 hover:text-marble-600"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-roman-700 mb-1">Name</label>
                <input value={newName} onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Cold Outreach — Series A" className="input" autoFocus />
              </div>
              <div>
                <label className="block text-sm font-medium text-roman-700 mb-1">Description</label>
                <input value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="What's this sequence for?" className="input" />
              </div>
            </div>
            <p className="text-xs text-marble-400 mt-3">
              A 3-step email sequence will be created. You can customize steps after creating.
            </p>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
              <button onClick={() => createMutation.mutate()} disabled={!newName.trim()} className="btn-primary">
                Create Sequence
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
