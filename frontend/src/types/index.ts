export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  avatar_url?: string
  role: string
  workspace_id?: number
  created_at: string
}

export interface Contact {
  id: number
  first_name: string
  last_name: string
  full_name?: string
  headline?: string
  avatar_url?: string
  email?: string
  email_status: string
  email_confidence: number
  personal_email?: string
  phone?: string
  mobile_phone?: string
  work_phone?: string
  title?: string
  seniority?: string
  department?: string
  company_id?: number
  company_name?: string
  city?: string
  state?: string
  country?: string
  linkedin_url?: string
  twitter_url?: string
  github_url?: string
  skills: string[]
  education: any[]
  work_history: any[]
  lead_score: number
  source?: string
  is_verified: boolean
  data_quality_score: number
  last_enriched_at?: string
  created_at: string
  updated_at?: string
}

export interface Company {
  id: number
  name: string
  domain?: string
  logo_url?: string
  industry?: string
  sub_industry?: string
  description?: string
  short_description?: string
  employee_count?: number
  employee_range?: string
  revenue_range?: string
  annual_revenue?: number
  founded_year?: number
  headquarters_city?: string
  headquarters_state?: string
  headquarters_country?: string
  full_address?: string
  website_url?: string
  linkedin_url?: string
  twitter_url?: string
  facebook_url?: string
  crunchbase_url?: string
  tech_stack: string[]
  tags: string[]
  keywords: string[]
  total_funding?: number
  latest_funding_round?: string
  source?: string
  data_quality_score: number
  created_at: string
  contact_count: number
  latitude?: number
  longitude?: number
  google_search_url?: string
  google_maps_url?: string
}

export interface ContactList {
  id: number
  name: string
  description?: string
  list_type: string
  color: string
  icon: string
  contact_count: number
  owner_id: number
  created_at: string
  updated_at?: string
}

export interface Sequence {
  id: number
  name: string
  description?: string
  status: string
  owner_id: number
  total_enrolled: number
  total_replied: number
  total_bounced: number
  total_opened: number
  total_clicked: number
  steps: SequenceStep[]
  send_window_start: string
  send_window_end: string
  send_days: string[]
  track_opens: boolean
  track_clicks: boolean
  stop_on_reply: boolean
  created_at: string
  updated_at?: string
}

export interface SequenceStep {
  id: number
  order: number
  step_type: string
  delay_days: number
  delay_hours: number
  subject?: string
  body?: string
  task_note?: string
  task_type?: string
  created_at: string
}

export interface PaginatedResponse<T> {
  total: number
  page: number
  per_page: number
  total_pages: number
  [key: string]: any
}

export interface DashboardStats {
  total_contacts: number
  total_companies: number
  contacts_with_email: number
  contacts_with_phone: number
  verified_emails: number
  total_lists: number
  total_sequences: number
}

export type SeniorityLevel = 'c_suite' | 'vp' | 'director' | 'manager' | 'senior' | 'entry'
export type Department = 'engineering' | 'sales' | 'marketing' | 'hr' | 'finance' | 'operations' | 'product' | 'design' | 'executive' | 'legal' | 'support'

export const SENIORITY_OPTIONS: { value: SeniorityLevel; label: string }[] = [
  { value: 'c_suite', label: 'C-Suite' },
  { value: 'vp', label: 'VP' },
  { value: 'director', label: 'Director' },
  { value: 'manager', label: 'Manager' },
  { value: 'senior', label: 'Senior' },
  { value: 'entry', label: 'Entry Level' },
]

export const DEPARTMENT_OPTIONS: { value: Department; label: string }[] = [
  { value: 'engineering', label: 'Engineering' },
  { value: 'sales', label: 'Sales' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'product', label: 'Product' },
  { value: 'design', label: 'Design' },
  { value: 'operations', label: 'Operations' },
  { value: 'finance', label: 'Finance' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'executive', label: 'Executive' },
  { value: 'legal', label: 'Legal' },
  { value: 'support', label: 'Customer Support' },
]

export const EMPLOYEE_RANGE_OPTIONS = [
  '1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5001-10000', '10001+',
]

export const BUSINESS_TYPE_OPTIONS: { value: string; label: string; category: string }[] = [
  // Tech & Software
  { value: 'Software', category: 'Tech', label: 'Software / SaaS' },
  { value: 'Cloud Platform', category: 'Tech', label: 'Cloud Platform' },
  { value: 'AI/Machine Learning', category: 'Tech', label: 'AI / Machine Learning' },
  { value: 'Cybersecurity', category: 'Tech', label: 'Cybersecurity' },
  { value: 'Data Analytics', category: 'Tech', label: 'Data & Analytics' },
  { value: 'Cloud Monitoring', category: 'Tech', label: 'DevOps / Monitoring' },
  { value: 'Design Software', category: 'Tech', label: 'Design Software' },
  { value: 'Project Management', category: 'Tech', label: 'Project Management' },
  { value: 'Collaboration Software', category: 'Tech', label: 'Collaboration' },
  // Finance & Commerce
  { value: 'Financial Technology', category: 'Finance', label: 'FinTech' },
  { value: 'Banking', category: 'Finance', label: 'Banking' },
  { value: 'Insurance', category: 'Finance', label: 'InsurTech' },
  { value: 'E-Commerce', category: 'Finance', label: 'E-Commerce' },
  { value: 'Payments', category: 'Finance', label: 'Payments' },
  // Industry
  { value: 'Healthcare', category: 'Industry', label: 'HealthTech' },
  { value: 'Education', category: 'Industry', label: 'EdTech' },
  { value: 'Real Estate', category: 'Industry', label: 'PropTech' },
  { value: 'Logistics', category: 'Industry', label: 'Logistics / Supply Chain' },
  { value: 'Manufacturing', category: 'Industry', label: 'Manufacturing' },
  { value: 'Energy', category: 'Industry', label: 'Energy / CleanTech' },
  // Services
  { value: 'Marketing', category: 'Services', label: 'Marketing / AdTech' },
  { value: 'HR Tech', category: 'Services', label: 'HR Tech' },
  { value: 'Legal Tech', category: 'Services', label: 'Legal Tech' },
  { value: 'Consulting', category: 'Services', label: 'Consulting' },
  { value: 'Recruiting', category: 'Services', label: 'Recruiting / Staffing' },
  { value: 'Construction', category: 'Services', label: 'Construction' },
  // Media & Consumer
  { value: 'Media', category: 'Media', label: 'Media / Entertainment' },
  { value: 'Gaming', category: 'Media', label: 'Gaming' },
  { value: 'Food & Beverage', category: 'Media', label: 'Food & Beverage' },
  { value: 'Travel', category: 'Media', label: 'Travel / Hospitality' },
]
