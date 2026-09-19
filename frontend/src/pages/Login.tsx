import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function Login() {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isRegister) {
        await register({ email, password, first_name: firstName, last_name: lastName })
      } else {
        await login(email, password)
      }
      navigate('/')
      toast.success(isRegister ? 'Account created!' : 'Ave, welcome back!')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — Roman imperial branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-roman-900 flex-col justify-between p-12 text-white relative overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4a017'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        {/* Gold corner accent lines */}
        <div className="absolute top-0 left-0 w-32 h-32">
          <div className="absolute top-6 left-6 w-20 h-px bg-gradient-to-r from-brand-500 to-transparent" />
          <div className="absolute top-6 left-6 h-20 w-px bg-gradient-to-b from-brand-500 to-transparent" />
        </div>
        <div className="absolute bottom-0 right-0 w-32 h-32">
          <div className="absolute bottom-6 right-6 w-20 h-px bg-gradient-to-l from-brand-500 to-transparent" />
          <div className="absolute bottom-6 right-6 h-20 w-px bg-gradient-to-t from-brand-500 to-transparent" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <span className="text-roman-950 font-display font-bold text-lg">P</span>
            </div>
            <span className="font-display font-bold text-2xl tracking-widest text-brand-400">PHEOBUS</span>
          </div>
        </div>

        <div className="relative z-10">
          <div className="text-brand-500 text-xs tracking-[0.3em] uppercase mb-4 font-medium">Sol Invictus</div>
          <h2 className="text-4xl font-display font-bold leading-tight mb-4 tracking-wide">
            Find Anyone's Email<br />& Phone Number.<br />
            <span className="text-brand-400">For Free.</span>
          </h2>
          <p className="text-marble-400 text-lg max-w-md font-serif italic">
            The open-source B2B contact finder. Search millions of professionals,
            verify emails, enrich company data, and build targeted outreach sequences.
          </p>
        </div>

        <div className="relative z-10">
          {/* Laurel divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-brand-600/30" />
            <span className="text-brand-500 text-lg">&#x2766;</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-brand-600/30" />
          </div>
          <div className="flex gap-8 text-marble-400 text-sm">
            <div>
              <div className="text-3xl font-display font-bold text-brand-400">240M+</div>
              Contacts
            </div>
            <div>
              <div className="text-3xl font-display font-bold text-brand-400">30M+</div>
              Companies
            </div>
            <div>
              <div className="text-3xl font-display font-bold text-brand-400">95%</div>
              Email Accuracy
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-marble-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
              <span className="text-roman-950 font-display font-bold text-lg">P</span>
            </div>
            <span className="font-display font-bold text-2xl text-roman-900 tracking-widest">PHEOBUS</span>
          </div>

          <h2 className="text-2xl font-display font-bold text-roman-900 mb-1 tracking-wide">
            {isRegister ? 'Create Your Account' : 'Ave, Welcome Back'}
          </h2>
          <p className="text-marble-600 mb-8 font-serif italic">
            {isRegister
              ? 'Join the empire of contact discovery'
              : 'Sign in to your Pheobus command center'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-roman-700 mb-1">First name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="input"
                    placeholder="Marcus"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-roman-700 mb-1">Last name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="input"
                    placeholder="Aurelius"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-roman-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-roman-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 font-display tracking-wider text-sm">
              {loading ? (
                <div className="w-5 h-5 border-2 border-roman-900/30 border-t-roman-900 rounded-full animate-spin" />
              ) : isRegister ? (
                'CREATE ACCOUNT'
              ) : (
                'ENTER THE FORUM'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-sm text-brand-600 hover:text-brand-700 font-medium"
            >
              {isRegister
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up free"}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
