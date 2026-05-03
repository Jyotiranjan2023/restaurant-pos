import { useState, useEffect } from 'react'
import {
  fetchAllStaff,
  createStaff,
  updateStaffRole,
  updateStaffStatus,
  resetStaffPassword,
  deleteStaff,
} from '../services/staffService'
import Modal from '../components/Modal'
import { useAuth } from '../context/AuthContext'

const ROLES = ['ADMIN', 'WAITER', 'CHEF']

const roleStyles = {
  ADMIN: 'bg-purple-50 text-purple-700 border-purple-200',
  WAITER: 'bg-blue-50 text-blue-700 border-blue-200',
  CHEF: 'bg-green-50 text-green-700 border-green-200',
}

const roleIcons = {
  ADMIN: '👑',
  WAITER: '🛎️',
  CHEF: '👨‍🍳',
}

export default function Staff() {
  const { user: currentUser } = useAuth()
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState({ type: '', message: '' })

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState(null)

  // Create form
  const [createForm, setCreateForm] = useState({
    username: '', password: '', fullName: '', role: 'WAITER'
  })
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')

  // Role form
  const [newRole, setNewRole] = useState('')
  const [roleLoading, setRoleLoading] = useState(false)

  // Password form
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  // Delete
  const [deleteLoading, setDeleteLoading] = useState(false)

  const showFeedback = (type, message) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback({ type: '', message: '' }), 4000)
  }

  const loadStaff = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchAllStaff()
      if (res.success) {
        setStaff(res.data)
      } else {
        setError(res.message || 'Failed to load staff')
      }
    } catch {
      setError('Server error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadStaff() }, [])

  // --- Create Staff ---
  const handleCreate = async (e) => {
    e.preventDefault()
    setCreateError('')
    if (!createForm.username.trim()) { setCreateError('Username required'); return }
    if (createForm.password.length < 6) { setCreateError('Password min 6 characters'); return }
    if (!createForm.fullName.trim()) { setCreateError('Full name required'); return }

    setCreateLoading(true)
    try {
      const res = await createStaff({
        username: createForm.username.trim().toLowerCase(),
        password: createForm.password,
        fullName: createForm.fullName.trim(),
        role: createForm.role,
      })
      if (res.success) {
        setShowCreateModal(false)
        setCreateForm({ username: '', password: '', fullName: '', role: 'WAITER' })
        showFeedback('success', `Staff "${res.data.fullName}" created`)
        loadStaff()
      } else {
        setCreateError(res.message || 'Create failed')
      }
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Server error')
    } finally {
      setCreateLoading(false)
    }
  }

  // --- Update Role ---
  const handleRoleUpdate = async () => {
    if (!newRole || newRole === selectedStaff?.role) return
    setRoleLoading(true)
    try {
      const res = await updateStaffRole(selectedStaff.id, newRole)
      if (res.success) {
        setShowRoleModal(false)
        showFeedback('success', `Role updated to ${newRole}`)
        loadStaff()
      } else {
        showFeedback('error', res.message || 'Role update failed')
      }
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Server error')
    } finally {
      setRoleLoading(false)
    }
  }

  // --- Toggle Status ---
  const handleToggleStatus = async (member) => {
    try {
      const res = await updateStaffStatus(member.id, !member.active)
      if (res.success) {
        showFeedback('success', `${member.fullName} ${!member.active ? 'activated' : 'deactivated'}`)
        loadStaff()
      } else {
        showFeedback('error', res.message || 'Status update failed')
      }
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Server error')
    }
  }

  // --- Reset Password ---
  const handlePasswordReset = async (e) => {
    e.preventDefault()
    setPasswordError('')
    if (newPassword.length < 6) { setPasswordError('Password min 6 characters'); return }
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match'); return }

    setPasswordLoading(true)
    try {
      const res = await resetStaffPassword(selectedStaff.id, newPassword)
      if (res.success) {
        setShowPasswordModal(false)
        setNewPassword('')
        setConfirmPassword('')
        showFeedback('success', `Password reset for ${selectedStaff.fullName}`)
      } else {
        setPasswordError(res.message || 'Password reset failed')
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Server error')
    } finally {
      setPasswordLoading(false)
    }
  }

  // --- Delete ---
  const handleDelete = async () => {
    if (!selectedStaff) return
    setDeleteLoading(true)
    const targetId = selectedStaff.id
    const targetName = selectedStaff.fullName
    try {
      const res = await deleteStaff(targetId)
      if (res.success) {
        setShowDeleteModal(false)
        setStaff(prev => prev.filter(s => s.id !== targetId))
        showFeedback('success', `Staff "${targetName}" deleted`)
        loadStaff()
      } else {
        showFeedback('error', res.message || 'Delete failed')
      }
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Server error')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Staff</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your restaurant staff and roles
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setCreateError(''); setShowCreateModal(true) }}
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg"
        >
          + Add Staff
        </button>
      </div>

      {/* Feedback */}
      {feedback.message && (
        <div className={`mb-4 px-4 py-2 rounded-lg text-sm border ${
          feedback.type === 'success'
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {feedback.message}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">Loading staff...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error}
          <button onClick={loadStaff} className="ml-3 underline">Retry</button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && staff.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-4xl mb-3">👤</p>
          <p className="text-gray-500 text-sm">No staff members yet</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg"
          >
            Add First Staff Member
          </button>
        </div>
      )}

      {/* Staff Cards */}
      {!loading && !error && staff.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {staff.map((member) => (
            <div
              key={member.id}
              className={`bg-white border rounded-xl p-4 flex flex-col gap-3 ${
                member.active ? 'border-gray-200' : 'border-gray-200 opacity-60'
              }`}
            >
              {/* Top */}
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${
                  member.active ? 'bg-orange-100' : 'bg-gray-100'
                }`}>
                  {roleIcons[member.role] || '👤'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">
                    {member.fullName}
                  </p>
                  <p className="text-xs text-gray-500">@{member.username}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${roleStyles[member.role]}`}>
                      {member.role}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${
                      member.active
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-gray-100 text-gray-500 border-gray-300'
                    }`}>
                      {member.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

            {/* Actions */}
<div className="border-t border-gray-100 pt-3">
  {(() => {
    const isOwnAccount = currentUser?.userId === member.id

    return (
      <>
        {/* "This is you" hint on own card */}
        {isOwnAccount && (
          <p className="text-xs text-gray-500 italic mb-2">
            This is your account — destructive actions disabled
          </p>
        )}

        <div className="grid grid-cols-2 gap-1.5">
          {/* Change Role — hidden on own account */}
          {!isOwnAccount && (
            <button
              type="button"
              onClick={() => {
                setSelectedStaff(member)
                setNewRole(member.role)
                setShowRoleModal(true)
              }}
              className="text-xs font-semibold py-1.5 rounded-lg border border-orange-300 bg-orange-50 text-orange-600 hover:bg-orange-100"
            >
              Change Role
            </button>
          )}

          {/* Deactivate/Activate — hidden on own account */}
          {!isOwnAccount && (
            <button
              type="button"
              onClick={() => handleToggleStatus(member)}
              className={`text-xs font-semibold py-1.5 rounded-lg border transition-all ${
                member.active
                  ? 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                  : 'bg-green-500 border-green-500 text-white hover:bg-green-600'
              }`}
            >
              {member.active ? 'Deactivate' : 'Activate'}
            </button>
          )}

          {/* Reset Password — always visible */}
          <button
            type="button"
            onClick={() => {
              setSelectedStaff(member)
              setNewPassword('')
              setConfirmPassword('')
              setPasswordError('')
              setShowPasswordModal(true)
            }}
            className={`text-xs font-semibold py-1.5 rounded-lg border border-blue-300 bg-blue-50 text-blue-600 hover:bg-blue-100 ${
              isOwnAccount ? 'col-span-2' : ''
            }`}
          >
            Reset Password
          </button>

          {/* Delete — hidden on own account */}
          {!isOwnAccount && (
            <button
              type="button"
              onClick={() => { setSelectedStaff(member); setShowDeleteModal(true) }}
              className="text-xs font-semibold py-1.5 rounded-lg border border-red-300 bg-red-500 text-white hover:bg-red-600"
            >
              Delete
            </button>
          )}
        </div>
      </>
    )
  })()}
</div>
            </div>
          ))}
        </div>
      )}

      {/* Create Staff Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add Staff Member"
        size="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={createForm.fullName}
              onChange={(e) => setCreateForm(f => ({ ...f, fullName: e.target.value }))}
              placeholder="e.g. Rahul Kumar"
              disabled={createLoading}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={createForm.username}
              onChange={(e) => setCreateForm(f => ({ ...f, username: e.target.value.toLowerCase() }))}
              placeholder="e.g. rahul123"
              disabled={createLoading}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={createForm.password}
              onChange={(e) => setCreateForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Min 6 characters"
              disabled={createLoading}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Role <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setCreateForm(f => ({ ...f, role: r }))}
                  disabled={createLoading}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all
                    ${createForm.role === r
                      ? 'bg-orange-50 border-orange-500 text-orange-700 ring-1 ring-orange-400'
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  {roleIcons[r]} {r}
                </button>
              ))}
            </div>
          </div>

          {createError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
              {createError}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              disabled={createLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg disabled:opacity-60"
            >
              {createLoading ? 'Creating...' : 'Create Staff'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Change Role Modal */}
      <Modal
        isOpen={showRoleModal}
        onClose={() => !roleLoading && setShowRoleModal(false)}
        title={`Change Role — ${selectedStaff?.fullName}`}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-gray-500">
            Current role: <span className={`font-semibold px-2 py-0.5 rounded-full border text-xs ${roleStyles[selectedStaff?.role]}`}>
              {selectedStaff?.role}
            </span>
          </p>
          <div className="flex gap-2">
            {ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setNewRole(r)}
                disabled={roleLoading}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all
                  ${newRole === r
                    ? 'bg-orange-50 border-orange-500 text-orange-700 ring-1 ring-orange-400'
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
              >
                {roleIcons[r]} {r}
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowRoleModal(false)}
              disabled={roleLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRoleUpdate}
              disabled={roleLoading || newRole === selectedStaff?.role}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg disabled:opacity-50"
            >
              {roleLoading ? 'Updating...' : 'Update Role'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => !passwordLoading && setShowPasswordModal(false)}
        title={`Reset Password — ${selectedStaff?.fullName}`}
        size="sm"
      >
        <form onSubmit={handlePasswordReset} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              New Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 6 characters"
              disabled={passwordLoading}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              disabled={passwordLoading}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          {passwordError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
              {passwordError}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowPasswordModal(false)}
              disabled={passwordLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={passwordLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-60"
            >
              {passwordLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => !deleteLoading && setShowDeleteModal(false)}
        title="Delete Staff Member"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Are you sure you want to delete{' '}
            <span className="font-bold text-gray-900">{selectedStaff?.fullName}</span>?
            This cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleteLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50"
            >
              {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}