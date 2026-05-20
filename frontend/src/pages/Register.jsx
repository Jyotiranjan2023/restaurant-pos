import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { registerRestaurant } from '../services/authService'
import { useAuth } from '../context/AuthContext'

export default function Register() {
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
      const res = await registerRestaurant(data)
      if (res.success) {
        // Auto-login using returned token
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('user', JSON.stringify(res.data))
        login(res.data)
        navigate('/dashboard')
      } else {
        setError(res.message || 'Registration failed. Please try again.')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 sm:p-8">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="bg-orange-500 text-white text-2xl font-bold w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
            P
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Register Your Restaurant</h1>
          <p className="text-gray-500 text-sm mt-1">Start with a 7-day free trial. No credit card required.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Section: Restaurant Info */}
          <div className="pb-2">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Restaurant Information</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Restaurant Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Spice Garden"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  {...register('restaurantName', { required: 'Restaurant name is required' })}
                />
                {errors.restaurantName && (
                  <p className="text-red-500 text-xs mt-1">{errors.restaurantName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Restaurant Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="restaurant@example.com"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: 'Enter a valid email'
                    }
                  })}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">You'll use this email to login.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    {...register('phone')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    placeholder="City, State"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    {...register('address')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Admin Account */}
          <div className="pt-3 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Admin Account</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jhon Doe"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  {...register('adminFullName', { required: 'Your name is required' })}
                />
                {errors.adminFullName && (
                  <p className="text-red-500 text-xs mt-1">{errors.adminFullName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. admin"
                  autoComplete="username"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  {...register('adminUsername', {
                    required: 'Username is required',
                    minLength: { value: 3, message: 'Min 3 characters' },
                    maxLength: { value: 30, message: 'Max 30 characters' }
                  })}
                />
                {errors.adminUsername && (
                  <p className="text-red-500 text-xs mt-1">{errors.adminUsername.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  {...register('adminPassword', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Min 6 characters' }
                  })}
                />
                {errors.adminPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.adminPassword.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg transition-colors duration-200 disabled:opacity-60 mt-4"
          >
            {loading ? 'Creating account...' : 'Create Account & Start Trial'}
          </button>
        </form>

        {/* Login link */}
        <div className="text-center mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-600 hover:text-orange-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}