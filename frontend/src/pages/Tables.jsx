import { useState } from 'react'
import useTables from '../hooks/useTables'
import TableCard from '../components/TableCard'
import Modal from '../components/Modal'
import { createTable, updateTable, deleteTable } from '../services/tableService'

const EMPTY_FORM = { tableNumber: '', tableName: '', capacity: 4 }

export default function Tables() {
  const { tables, loading, error, refetch } = useTables()

  const [showFormModal, setShowFormModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [feedback, setFeedback] = useState({ type: '', message: '' })

  const showFeedback = (type, message) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback({ type: '', message: '' }), 4000)
  }

  const stats = {
    total: tables.length,
    available: tables.filter((t) => t.status === 'AVAILABLE').length,
    running: tables.filter((t) => t.status === 'RUNNING').length,
    paid: tables.filter((t) => t.status === 'PAID').length,
  }

  const handleOpenCreate = () => {
    setEditTarget(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setShowFormModal(true)
  }

  const handleOpenEdit = (table) => {
    setEditTarget(table)
    setForm({
      tableNumber: table.tableNumber,
      tableName: table.tableName || '',
      capacity: table.capacity || 4,
    })
    setFormError('')
    setShowFormModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!form.tableNumber || Number(form.tableNumber) < 1) {
      setFormError('Table number is required and must be at least 1')
      return
    }
    if (!form.capacity || Number(form.capacity) < 1) {
      setFormError('Capacity must be at least 1')
      return
    }

    setFormLoading(true)
    try {
      const payload = {
        tableNumber: Number(form.tableNumber),
        tableName: form.tableName.trim() || null,
        capacity: Number(form.capacity),
      }
      const res = editTarget
        ? await updateTable(editTarget.id, payload)
        : await createTable(payload)

      if (res.success) {
        setShowFormModal(false)
        showFeedback('success', editTarget ? 'Table updated' : `Table ${payload.tableNumber} created`)
        refetch()
      } else {
        setFormError(res.message || 'Save failed')
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Server error')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    const targetId = deleteTarget.id
    const targetNumber = deleteTarget.tableNumber
    try {
      const res = await deleteTable(targetId)
      if (res.success) {
        setShowDeleteModal(false)
        showFeedback('success', `Table ${targetNumber} deleted`)
        refetch()
      } else {
        showFeedback('error', res.message || 'Delete failed')
        setShowDeleteModal(false)
      }
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Server error')
      setShowDeleteModal(false)
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading && tables.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-gray-500">Loading tables...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="text-red-700 font-medium">Error: {error}</p>
        <button onClick={refetch} className="mt-3 bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-lg">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tables</h1>
          <p className="text-gray-500 text-sm">
            Manage and view status of all tables.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refetch}
            className="text-sm bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium"
          >
            Refresh
          </button>
          <button
            onClick={handleOpenCreate}
            className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold"
          >
            + Add Table
          </button>
        </div>
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

     {/* Stats Row */}
<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
  {[
    { label: 'Total Tables', value: stats.total, color: 'text-gray-800' },
    { label: 'Available', value: stats.available, color: 'text-green-600' },
    { label: 'Running', value: stats.running, color: 'text-red-600' },
    { label: 'Paid', value: stats.paid, color: 'text-yellow-600' },
  ].map((stat) => (
    <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4">
      <p className="text-xs text-gray-500">{stat.label}</p>
      <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
    </div>
  ))}
</div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs text-gray-600">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>Running
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>Paid
        </span>
      </div>

      {/* Tables Grid */}
      {tables.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">🪑</p>
          <p className="text-gray-500">No tables configured yet.</p>
          <button
            onClick={handleOpenCreate}
            className="mt-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg"
          >
            Add First Table
          </button>
        </div>
      ) : (<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
  {tables.map((table) => (
    <div key={table.id} className="relative group">
      <TableCard table={table} />
      <div className="absolute top-1 right-1 hidden group-hover:flex gap-1 z-10">
        <button
          type="button"
          onClick={() => handleOpenEdit(table)}
          className="w-6 h-6 bg-white border border-gray-300 rounded text-xs flex items-center justify-center hover:bg-orange-50 hover:border-orange-400 shadow-sm"
          title="Edit"
        >
          ✏️
        </button>
        <button
          type="button"
          onClick={() => { setDeleteTarget(table); setShowDeleteModal(true) }}
          className="w-6 h-6 bg-white border border-red-200 rounded text-xs flex items-center justify-center hover:bg-red-50 shadow-sm"
          title="Delete"
          disabled={table.status !== 'AVAILABLE'}
        >
          🗑️
        </button>
      </div>
    </div>
  ))}
</div>
        
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showFormModal}
        onClose={() => !formLoading && setShowFormModal(false)}
        title={editTarget ? `Edit Table ${editTarget.tableNumber}` : 'Add New Table'}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Table Number <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={form.tableNumber}
              onChange={(e) => setForm(f => ({ ...f, tableNumber: e.target.value }))}
              placeholder="e.g. 5"
              disabled={formLoading}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Table Name <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              value={form.tableName}
              onChange={(e) => setForm(f => ({ ...f, tableName: e.target.value }))}
              placeholder="e.g. Window Table, VIP"
              disabled={formLoading}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Capacity (Seats) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={form.capacity}
              onChange={(e) => setForm(f => ({ ...f, capacity: e.target.value }))}
              placeholder="e.g. 4"
              disabled={formLoading}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {formError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
              {formError}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowFormModal(false)}
              disabled={formLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg disabled:opacity-60"
            >
              {formLoading ? 'Saving...' : editTarget ? 'Update Table' : 'Create Table'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => !deleteLoading && setShowDeleteModal(false)}
        title="Delete Table"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Are you sure you want to delete{' '}
            <span className="font-bold">Table {deleteTarget?.tableNumber}</span>?
            This cannot be undone.
          </p>
          {deleteTarget?.status !== 'AVAILABLE' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-sm text-yellow-700">
              ⚠️ This table is currently {deleteTarget?.status}. Cannot delete active tables.
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleteLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteLoading || deleteTarget?.status !== 'AVAILABLE'}
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