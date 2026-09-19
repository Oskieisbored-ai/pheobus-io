import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { List, Plus, Users, Trash2, Edit2, X, UserMinus } from 'lucide-react'
import Header from '../components/layout/Header'
import { listsAPI } from '../services/api'
import type { ContactList, Contact } from '../types'
import toast from 'react-hot-toast'

const LIST_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899']

export default function Lists() {
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newColor, setNewColor] = useState('#6366f1')
  const [selectedList, setSelectedList] = useState<ContactList | null>(null)

  const { data: lists = [], isLoading } = useQuery<ContactList[]>({
    queryKey: ['lists'],
    queryFn: async () => {
      const { data } = await listsAPI.getAll()
      return data
    },
  })

  const { data: listContacts } = useQuery({
    queryKey: ['list-contacts', selectedList?.id],
    queryFn: async () => {
      if (!selectedList) return { contacts: [], total: 0 }
      const { data } = await listsAPI.getContacts(selectedList.id)
      return data
    },
    enabled: !!selectedList,
  })

  const createMutation = useMutation({
    mutationFn: () => listsAPI.create({ name: newName, description: newDesc, color: newColor }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] })
      setShowCreate(false)
      setNewName('')
      setNewDesc('')
      toast.success('List created!')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => listsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] })
      setSelectedList(null)
      toast.success('List deleted')
    },
  })

  const removeContactMutation = useMutation({
    mutationFn: (contactId: number) => {
      if (!selectedList) throw new Error('No list selected')
      return listsAPI.removeContacts(selectedList.id, [contactId])
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['list-contacts', selectedList?.id] })
      queryClient.invalidateQueries({ queryKey: ['lists'] })
      toast.success('Contact removed from list')
    },
    onError: () => toast.error('Failed to remove contact'),
  })

  const contacts: Contact[] = listContacts?.contacts || []

  return (
    <>
      <Header
        title="Lists"
        subtitle={`${lists.length} lists`}
        actions={
          <button onClick={() => setShowCreate(true)} className="btn-primary text-xs">
            <Plus size={16} /> New List
          </button>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        {/* List sidebar */}
        <div className="w-72 border-r border-marble-200 bg-white overflow-y-auto flex-shrink-0">
          <div className="p-3 space-y-1">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-3 animate-pulse">
                    <div className="h-4 bg-marble-200 rounded w-32 mb-1" />
                    <div className="h-3 bg-marble-200 rounded w-20" />
                  </div>
                ))
              : lists.map((list) => (
                  <button
                    key={list.id}
                    onClick={() => setSelectedList(list)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                      selectedList?.id === list.id
                        ? 'bg-brand-50 text-brand-700'
                        : 'hover:bg-marble-50 text-roman-700'
                    }`}
                  >
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: list.color }} />
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">{list.name}</div>
                      <div className="text-xs text-marble-400">{list.contact_count} contacts</div>
                    </div>
                  </button>
                ))}

            {!isLoading && lists.length === 0 && (
              <div className="text-center py-8 text-marble-400">
                <List size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No lists yet</p>
              </div>
            )}
          </div>
        </div>

        {/* List detail */}
        <div className="flex-1 overflow-auto">
          {selectedList ? (
            <div>
              <div className="flex items-center justify-between p-4 border-b border-marble-200">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: selectedList.color }} />
                  <div>
                    <h2 className="font-semibold text-roman-900">{selectedList.name}</h2>
                    {selectedList.description && (
                      <p className="text-sm text-marble-500">{selectedList.description}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteMutation.mutate(selectedList.id)}
                  className="btn-ghost text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <table className="w-full text-sm">
                <thead className="bg-marble-50 border-b border-marble-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-marble-500">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-marble-500">Title</th>
                    <th className="text-left px-4 py-3 font-medium text-marble-500">Company</th>
                    <th className="text-left px-4 py-3 font-medium text-marble-500">Email</th>
                    <th className="w-10 px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-marble-100">
                  {contacts.map((c) => (
                    <tr key={c.id} className="hover:bg-marble-50">
                      <td className="px-4 py-3 font-medium text-roman-900">
                        {c.first_name} {c.last_name}
                      </td>
                      <td className="px-4 py-3 text-marble-600">{c.title || '—'}</td>
                      <td className="px-4 py-3 text-marble-600">{c.company_name || '—'}</td>
                      <td className="px-4 py-3 text-marble-600 font-mono text-xs">{c.email || '—'}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => removeContactMutation.mutate(c.id)}
                          className="text-marble-300 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
                          title="Remove from list"
                        >
                          <UserMinus size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {contacts.length === 0 && (
                <div className="text-center py-16 text-marble-400">
                  <Users size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No contacts in this list</p>
                  <p className="text-xs mt-1">Add contacts from the People search page</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-marble-400">
              <List size={48} className="mb-3 opacity-20" />
              <p className="text-marble-500 font-medium">Select a list</p>
              <p className="text-sm">or create a new one to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-xl p-6 w-[420px] shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-roman-900">Create New List</h3>
              <button onClick={() => setShowCreate(false)} className="text-marble-400 hover:text-marble-600"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-roman-700 mb-1">Name</label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Enterprise Leads"
                  className="input"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-roman-700 mb-1">Description</label>
                <input
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Optional description"
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-roman-700 mb-2">Color</label>
                <div className="flex gap-2">
                  {LIST_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setNewColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${newColor === c ? 'ring-2 ring-offset-2 ring-brand-400 scale-110' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
              <button
                onClick={() => createMutation.mutate()}
                disabled={!newName.trim()}
                className="btn-primary"
              >
                Create List
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
