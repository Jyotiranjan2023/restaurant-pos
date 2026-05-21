import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { forgotPassword } from '../services/authService'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const res = await forgotPassword(Number(data.tenantId), data.username)
      if (res.success) {
        setSuccess(res.message || 'Reset request submitted. Please contact your administrator for the reset code.')
      } else {
        setError(res.message || 'Could not submit reset request')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 sm:p-8">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="bg-orange-500 text-white text-2xl font-bold w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
            P
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Forgot Password</h1>
          <p className="text-gray-500 text-sm mt-1">Request a password reset code</p>
        </div>

        {/* Info banner — honest about the flow */}
        <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-lg px-3 py-2 mb-5">
          After submitting this form, please contact your restaurant administrator
          to receive your 8-character reset code.
        </div>

        {/* Error / Success */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tenant ID <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              placeholder="Enter your tenant ID"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              {...register('tenantId', { required: 'Tenant ID is required' })}
            />
            {errors.tenantId && (
              <p className="text-red-500 text-xs mt-1">{errors.tenantId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Your username"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              {...register('username', { required: 'Username is required' })}
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg disabled:opacity-60"
          >
            {loading ? 'Submitting...' : 'Request Reset'}
          </button>
        </form>

        {/* Navigation links */}
        <div className="text-center mt-6 pt-6 border-t border-gray-200 space-y-2">
          <p className="text-sm text-gray-600">
            Already have your reset code?{' '}
            <Link to="/reset-password" className="text-orange-600 hover:text-orange-700 font-medium">
              Reset password
            </Link>
          </p>
          <p className="text-sm text-gray-600">
            Remember your password?{' '}
            <Link to="/login" className="text-orange-600 hover:text-orange-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}