import { useState } from 'react'
import { signUp } from '../lib/authApi'

function SignUp({ setIsLoggedIn, setCurrentPage }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError('')
  }

  const handleSignUp = async (e) => {
    e.preventDefault()

    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long')
      return
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const data = await signUp({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: 'user',
      })

      // Store token in localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      setSuccess('Account created successfully! Redirecting...')
      
      setTimeout(() => {
        setIsLoggedIn(true)
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
        })
        setSuccess('')
      }, 1500)
    } catch (error) {
      console.error('Signup error:', error)
      setError(error.message || 'Failed to connect to server. Make sure the backend is running.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="bg-blue-700 text-white rounded-full w-16 h-16 flex items-center justify-center text-3xl font-bold">✓</div>
        </div>

        <h1 className="text-4xl font-bold text-center text-slate-900 mb-2">Inventory System</h1>
        <p className="text-center text-slate-500 mb-8">Create your account</p>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-6">
          <div>
            <label className="block text-slate-700 font-semibold mb-2">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-2">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 text-white font-semibold py-3 rounded-xl hover:bg-blue-800 transition disabled:bg-slate-400"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => setCurrentPage('signin')}
              className="text-blue-700 font-semibold hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignUp
