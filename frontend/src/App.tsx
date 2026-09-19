import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import PeopleSearch from './pages/PeopleSearch'
import CompanySearch from './pages/CompanySearch'
import Lists from './pages/Lists'
import Sequences from './pages/Sequences'
import Enrichment from './pages/Enrichment'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore()
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    )
  }
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

export default function App() {
  const loadUser = useAuthStore((s) => s.loadUser)

  useEffect(() => {
    loadUser()
  }, [loadUser])

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="people" element={<PeopleSearch />} />
        <Route path="companies" element={<CompanySearch />} />
        <Route path="lists" element={<Lists />} />
        <Route path="sequences" element={<Sequences />} />
        <Route path="enrichment" element={<Enrichment />} />
      </Route>
    </Routes>
  )
}
