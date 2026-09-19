import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pheobus_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401s globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('pheobus_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth
export const authAPI = {
  register: (data: { email: string; password: string; first_name: string; last_name: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
}

// Contacts
export const contactsAPI = {
  search: (params: Record<string, any>) => api.get('/contacts', { params }),
  get: (id: number) => api.get(`/contacts/${id}`),
  create: (data: any) => api.post('/contacts', data),
  update: (id: number, data: any) => api.put(`/contacts/${id}`, data),
  delete: (id: number) => api.delete(`/contacts/${id}`),
  bulk: (data: { contact_ids: number[]; action: string; target_id?: number }) =>
    api.post('/contacts/bulk', data),
}

// Companies
export const companiesAPI = {
  search: (params: Record<string, any>) => api.get('/companies', { params }),
  get: (id: number) => api.get(`/companies/${id}`),
  create: (data: any) => api.post('/companies', data),
  contacts: (id: number, params?: Record<string, any>) =>
    api.get(`/companies/${id}/contacts`, { params }),
}

// Lists
export const listsAPI = {
  getAll: () => api.get('/lists'),
  get: (id: number) => api.get(`/lists/${id}`),
  create: (data: { name: string; description?: string; color?: string }) =>
    api.post('/lists', data),
  update: (id: number, data: any) => api.put(`/lists/${id}`, data),
  delete: (id: number) => api.delete(`/lists/${id}`),
  getContacts: (id: number) => api.get(`/lists/${id}/contacts`),
  addContacts: (id: number, contact_ids: number[]) =>
    api.post(`/lists/${id}/contacts`, { contact_ids }),
  removeContacts: (id: number, contact_ids: number[]) =>
    api.delete(`/lists/${id}/contacts`, { data: { contact_ids } }),
}

// Sequences
export const sequencesAPI = {
  getAll: () => api.get('/sequences'),
  get: (id: number) => api.get(`/sequences/${id}`),
  create: (data: any) => api.post('/sequences', data),
  update: (id: number, data: any) => api.put(`/sequences/${id}`, data),
  delete: (id: number) => api.delete(`/sequences/${id}`),
  addStep: (id: number, data: any) => api.post(`/sequences/${id}/steps`, data),
  enroll: (id: number, contact_ids: number[]) =>
    api.post(`/sequences/${id}/enroll`, { contact_ids }),
}

// Enrichment
export const enrichmentAPI = {
  findEmail: (data: { first_name: string; last_name: string; domain: string; verify?: boolean }) =>
    api.post('/enrichment/find-email', data),
  enrichCompany: (data: { domain: string }) =>
    api.post('/enrichment/enrich-company', data),
  enrichContact: (data: { contact_id: number }) =>
    api.post('/enrichment/enrich-contact', data),
}

// Export
export const exportAPI = {
  contacts: (data: { contact_ids?: number[]; list_id?: number; format?: string }) =>
    api.post('/export/contacts', data, { responseType: 'blob' }),
}

// Dashboard
export const dashboardAPI = {
  stats: () => api.get('/stats'),
  health: () => api.get('/health'),
}

export default api
