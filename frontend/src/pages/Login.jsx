import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { loginUser } from '../services/authService'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
  setError('')
  setLoading(true)
  try {
    const res = await loginUser(data.tenantId, data.username, data.password)
    if (res.success) {
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data))
      login(res.data)

      // Redirect based on role
      const role = res.data.role
      if (role === 'ADMIN') {
        navigate('/dashboard')
      } else if (role === 'WAITER') {
        navigate('/pos')
      } else if (role === 'CHEF') {
        navigate('/kitchen')
      } else {
        navigate('/profile')
      }
    } else {
      setError('Login failed. Check your credentials.')
    }
  } catch (err) {
    setError(err.response?.data?.message || 'Server error. Try again.')
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8">

        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="bg-orange-500 text-white text-2xl font-bold w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
            P
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Restaurant POS</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Tenant ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tenant ID
            </label>
            <input
              type="number"
              placeholder="Enter tenant ID"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              {...register('tenantId', { required: 'Tenant ID is required' })}
            />
            {errors.tenantId && (
              <p className="text-red-500 text-xs mt-1">{errors.tenantId.message}</p>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter username"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              {...register('username', { required: 'Username is required' })}
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg transition-colors duration-200 disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

        </form>
      </div>
    </div>
  )
}