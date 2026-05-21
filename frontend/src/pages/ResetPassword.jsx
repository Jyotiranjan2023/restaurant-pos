import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { resetPassword } from '../services/authService'

export default function ResetPassword() {
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
      const res = await resetPassword(
        Number(data.tenantId),
        data.username,
        data.resetCode.toUpperCase(),
        data.newPassword
      )
      if (res.success) {
        setSuccess('Password reset successfully. Redirecting to login...')
        setTimeout(() => navigate('/login'), 2000)
      } else {
        setError(res.message || 'Could not reset password')
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

        <div className="text-center mb-6">
          <div className="bg-orange-500 text-white text-2xl font-bold w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
            P
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Reset Password</h1>
          <p className="text-gray-500 text-sm mt-1">Enter your reset code and new password</p>
        </div>

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
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              {...register('username', { required: 'Username is required' })}
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reset Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              maxLength={8}
              placeholder="8-character code"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-mono uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-orange-400"
              {...register('resetCode', {
                required: 'Reset code is required',
                minLength: { value: 8, message: 'Must be 8 characters' },
                maxLength: { value: 8, message: 'Must be 8 characters' }
              })}
            />
            {errors.resetCode && (
              <p className="text-red-500 text-xs mt-1">{errors.resetCode.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              placeholder="At least 6 characters"
              autoComplete="new-password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              {...register('newPassword', {
                required: 'New password is required',
                minLength: { value: 6, message: 'Min 6 characters' }
              })}
            />
            {errors.newPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg disabled:opacity-60"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Need a reset code?{' '}
            <Link to="/forgot-password" className="text-orange-600 hover:text-orange-700 font-medium">
              Request one
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}