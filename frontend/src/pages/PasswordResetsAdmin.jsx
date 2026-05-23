import { useEffect, useState } from 'react'
import passwordResetService from '../services/passwordResetService'

export default function PasswordResetsAdmin() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('')
  const [showCodeModal, setShowCodeModal] = useState(null)

  const loadRequests = async () => {
    setLoading(true)
    try {
      const res = await passwordResetService.list(filter || null)
      setRequests(res.data || [])
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [filter])

  const handleApprove = async (id) => {
    if (!confirm('Approve this reset request? An email will be sent to the user with the code.')) return
    try {
      const res = await passwordResetService.approve(id)
      setShowCodeModal({
        code: res.data?.resetCode,
        username: res.data?.username,
      })
      loadRequests()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve')
    }
  }

  const handleDeny = async (id) => {
    const reason = prompt('Reason for denial (optional):')
    if (reason === null) return
    try {
      await passwordResetService.deny(id, reason)
      loadRequests()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to deny')
    }
  }

  const statusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      DENIED: 'bg-red-100 text-red-800',
      USED: 'bg-blue-100 text-blue-800',
      EXPIRED: 'bg-gray-100 text-gray-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Requests</h1>
      <p className="text-gray-600 mb-6">Approve or deny user password reset requests.</p>

      {/* Filter */}
      <div className="mb-4 flex gap-2">
        <label className="text-sm font-medium text-gray-700 self-center">Filter:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
        >
          <option value="">All</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="DENIED">Denied</option>
          <option value="USED">Used</option>
          <option value="EXPIRED">Expired</option>
        </select>
        <button
          onClick={loadRequests}
          className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800 mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-gray-500 text-center py-8">Loading...</div>
      ) : requests.length === 0 ? (
        <div className="text-gray-500 text-center py-8 bg-gray-50 rounded-md">
          No reset requests found.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Requested</th>
                <th className="px-4 py-3 text-left">Expires</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {requests.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{r.fullName}</div>
                    <div className="text-gray-500 text-xs">@{r.username}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor(r.status)}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {r.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {r.expiresAt ? new Date(r.expiresAt).toLocaleString() : '-'}
                  </td>
                  <td className="px-4 py-3">
                    {r.status === 'PENDING' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(r.id)}
                          className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleDeny(r.id)}
                          className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded"
                        >
                          Deny
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Code modal after approval */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-bold text-gray-900 mb-2">✓ Request Approved</h2>
            <p className="text-gray-700 mb-4">
              An email with the reset code has been sent to <strong>{showCodeModal.username}</strong>.
            </p>
            <p className="text-gray-700 mb-2">Backup code (in case email is delayed):</p>
            <div className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-md p-4 text-center text-2xl font-bold tracking-widest text-blue-700 mb-4">
              {showCodeModal.code}
            </div>
            <button
              onClick={() => setShowCodeModal(null)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}