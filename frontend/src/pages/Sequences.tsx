import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Zap, Plus, Play, Pause, Archive, Mail, Clock, Phone,
  MessageSquare, Trash2, X, ChevronRight, Users,
} from 'lucide-react'
import Header from '../components/layout/Header'
import { sequencesAPI } from '../services/api'
import type { Sequence } from '../types'
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

export default function Sequences() {
  const queryClient = useQueryClient()
  const [selectedSeq, setSelectedSeq] = useState<Sequence | null>(null)
  const [showCreate, setShowCreate] = useState(false)
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
