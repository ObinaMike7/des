import { useState } from 'react'
import { signIn } from '../lib/authApi'

function SignIn({ setIsLoggedIn, isAdmin, setIsAdmin, setCurrentPage }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignIn = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email')
      return
    }

    setLoading(true)

    try {
      const data = await signIn({ email, password })

      // Check if user is admin
      const isUserAdmin = data.user.role === 'admin'
      
      if (isAdmin && !isUserAdmin) {
        setError('This account is not an admin account')
        setLoading(false)
        return
      }

      if (!isAdmin && isUserAdmin) {
        setError('Please use the Admin Login for admin accounts')
        setLoading(false)
        return
      }

      // Store token and user info in localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      setIsLoggedIn(true)
      setEmail('')
      setPassword('')
      setError('')
    } catch (error) {
      console.error('Sign in error:', error)
      setError(error.message || 'Failed to connect to server. Make sure the backend is running.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 via-blue-900 to-slate-950 flex items-center justify-center">
      <div className="bg-stone-100 rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="bg-blue-900 text-white rounded-full w-16 h-16 flex items-center justify-center text-3xl font-bold">✓</div>
        </div>

        <h1 className="text-4xl font-bold text-center text-slate-900 mb-2">Inventory System</h1>
        <p className="text-center text-slate-500 mb-8">Sign in to your account</p>

        <div className="flex gap-2 mb-8">
          <button
            type="button"
            onClick={() => {
              setIsAdmin(false)
              setError('')
            }}
            className={`flex-1 py-3 rounded-xl font-semibold transition ${
              !isAdmin
                ? 'bg-blue-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            User 
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAdmin(true)
              setError('')
            }}
            className={`flex-1 py-3 rounded-xl font-semibold transition ${
              isAdmin
                ? 'bg-blue-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Admin
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-6">
          <div>
            <label className="block text-slate-700 font-semibold mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError('')
              }}
              placeholder="Enter your email"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-700"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              placeholder="Enter your password"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-700"
            />
          </div>

          <div className="flex items-center">
            <input type="checkbox" id="remember" className="w-4 h-4 text-blue-900" />
            <label htmlFor="remember" className="ml-2 text-slate-600">Remember me</label>
          </div>

          <button
  type="submit"
  disabled={loading}
  className="w-full bg-blue-900 text-white py-3 rounded-xl font-bold hover:bg-blue-950 transition disabled:bg-slate-400"
>
  {loading ? 'Logging in...' : 'Log in'}
</button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-600">
            Don't have an account? 
            {isAdmin ? (
              <button type="button" onClick={() => setCurrentPage('adminsignup')} className="text-blue-800 font-semibold cursor-pointer hover:underline"> Admin Sign up</button>
            ) : (
              <button type="button" onClick={() => setCurrentPage('signup')} className="text-blue-800 font-semibold cursor-pointer hover:underline"> Sign up</button>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignIn

