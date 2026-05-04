import React, { useState } from 'react';
import { useInventory } from '../hooks/useInventory';

const UNIT_LABELS = {
  GRAM: 'g', KILOGRAM: 'kg',
  MILLILITER: 'ml', LITER: 'L',
  PIECE: 'pcs', PACKET: 'pkt'
};

const UNIT_OPTIONS = ['GRAM', 'KILOGRAM', 'MILLILITER', 'LITER', 'PIECE', 'PACKET'];

const LOG_TYPE_COLORS = {
  CONSUMPTION: 'bg-red-100 text-red-700',
  RESTOCK:     'bg-green-100 text-green-700',
  ADJUSTMENT:  'bg-blue-100 text-blue-700',
  WASTAGE:     'bg-yellow-100 text-yellow-700',
};

const EMPTY_FORM = {
  name: '', description: '', unit: 'GRAM',
  initialStock: '', lowStockThreshold: '', costPerUnit: ''
};

export default function Inventory() {
  const { ingredients, logs, loading, error, refresh,
          addIngredient, editIngredient, removeIngredient, restock } = useInventory();

  const [tab, setTab] = useState('ingredients'); // 'ingredients' | 'logs'
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Restock modal
  const [restockModal, setRestockModal] = useState(null); // ingredient object
  const [restockForm, setRestockForm] = useState({ quantity: '', notes: '' });
  const [restockError, setRestockError] = useState('');
// Compute stock state per ingredient
const getStockState = (ing) => {
  if (ing.currentStock <= 0) return 'OUT';
  if (ing.currentStock < ing.lowStockThreshold) return 'LOW';
  return 'OK';
};

const outOfStockItems = ingredients.filter(i => getStockState(i) === 'OUT');
const lowStockItems = ingredients.filter(i => getStockState(i) === 'LOW');

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (ing) => {
    setEditingId(ing.id);
    setForm({
      name: ing.name,
      description: ing.description || '',
      unit: ing.unit,
      initialStock: ing.currentStock,
      lowStockThreshold: ing.lowStockThreshold,
      costPerUnit: ing.costPerUnit,
    });
    setFormError('');
    setShowForm(true);
  };

  const handleFormSubmit = async () => {
    if (!form.name.trim()) { setFormError('Name is required'); return; }
    if (!form.unit) { setFormError('Unit is required'); return; }
    try {
      setSubmitting(true);
      setFormError('');
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        unit: form.unit,
        initialStock: parseFloat(form.initialStock) || 0,
        lowStockThreshold: parseFloat(form.lowStockThreshold) || 0,
        costPerUnit: parseFloat(form.costPerUnit) || 0,
      };
      if (editingId) {
        await editIngredient(editingId, payload);
      } else {
        await addIngredient(payload);
      }
      setShowForm(false);
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this ingredient?')) return;
    try { await removeIngredient(id); }
    catch (err) { alert(err?.response?.data?.message || 'Delete failed'); }
  };

  const openRestock = (ing) => {
    setRestockModal(ing);
    setRestockForm({ quantity: '', notes: '' });
    setRestockError('');
  };

  const handleRestock = async () => {
    if (!restockForm.quantity || parseFloat(restockForm.quantity) <= 0) {
      setRestockError('Enter valid quantity'); return;
    }
    try {
      setSubmitting(true);
      await restock(restockModal.id, {
        quantity: parseFloat(restockForm.quantity),
        notes: restockForm.notes || null,
      });
      setRestockModal(null);
    } catch (err) {
      setRestockError(err?.response?.data?.message || 'Restock failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">Loading inventory...</div>
  );
  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-red-500">
      <p>{error}</p>
      <button onClick={refresh} className="px-4 py-2 bg-red-100 rounded-lg text-sm">Retry</button>
    </div>
  );

  return (
    <div className="p-3 md:p-6 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Inventory</h1>
        <p className="text-xs md:text-sm text-gray-500 mt-0.5">
  {ingredients.length} ingredients
  {outOfStockItems.length > 0 && (
    <span className="ml-2 text-red-600 font-medium">
      ⚠ {outOfStockItems.length} out of stock
    </span>
  )}
  {lowStockItems.length > 0 && (
    <span className="ml-2 text-amber-600 font-medium">
      ⚠ {lowStockItems.length} low stock
    </span>
  )}
</p>
        </div>
        <div className="flex gap-2">
          <button onClick={refresh} className="px-3 py-2 text-xs md:text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
            ↻ Refresh
          </button>
          <button onClick={openAdd} className="px-3 py-2 text-xs md:text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium">
            + Add
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[['ingredients', 'Ingredients'], ['logs', 'Usage Logs']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === key ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Ingredients Tab */}
      {tab === 'ingredients' && (
        <div className="space-y-3">
         {ingredients.map(ing => {
  const stockState = getStockState(ing);
  const borderClass =
    stockState === 'OUT' ? 'border-red-300' :
    stockState === 'LOW' ? 'border-amber-200' :
    'border-gray-200';
  return (
  <div
    key={ing.id}
    className={`bg-white rounded-xl border p-4 ${borderClass}`}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-gray-800">{ing.name}</p>
          {stockState === 'OUT' && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
              Out of Stock
            </span>
          )}
          {stockState === 'LOW' && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
              Low Stock
            </span>
          )}
        </div>
                  {ing.description && (
                    <p className="text-xs text-gray-400 mt-0.5">{ing.description}</p>
                  )}
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                    <span>
                      Stock: <strong className={ing.currentStock <= 0 ? 'text-red-600' : 'text-gray-800'}>
                        {Number(ing.currentStock).toFixed(1)} {UNIT_LABELS[ing.unit]}
                      </strong>
                    </span>
                    <span>Threshold: {Number(ing.lowStockThreshold).toFixed(1)} {UNIT_LABELS[ing.unit]}</span>
                    <span>Cost: ₹{Number(ing.costPerUnit).toFixed(2)}/{UNIT_LABELS[ing.unit]}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => openRestock(ing)}
                    className="px-3 py-1.5 text-xs bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium"
                  >
                    Restock
                  </button>
                  <button
                    onClick={() => openEdit(ing)}
                    className="px-3 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(ing.id)}
                    className="px-3 py-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium"
                  >
                    Delete
                  </button>
               </div>
              </div>
            </div>
  );
})}
        </div>
      )}

      {/* Usage Logs Tab */}
      {tab === 'logs' && (
        <div className="space-y-2">
          {logs.length === 0 && (
            <div className="text-center text-gray-400 py-12">No usage logs found</div>
          )}
          {logs.map(log => (
            <div key={log.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-800">{log.ingredientName}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LOG_TYPE_COLORS[log.type]}`}>
                      {log.type}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                    {log.orderNumber && <span>Order: {log.orderNumber}</span>}
                    {log.performedByUsername && <span>By: {log.performedByUsername}</span>}
                    {log.notes && <span>{log.notes}</span>}
                    <span>{new Date(log.createdAt).toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`font-bold text-sm ${log.quantityChange < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {log.quantityChange > 0 ? '+' : ''}{Number(log.quantityChange).toFixed(1)} {UNIT_LABELS[log.unit]}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    After: {Number(log.stockAfter).toFixed(1)} {UNIT_LABELS[log.unit]}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-800">
              {editingId ? 'Edit Ingredient' : 'Add Ingredient'}
            </h2>

            {formError && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{formError}</p>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Name *</label>
                <input
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Tomato"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Description</label>
                <input
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Unit *</label>
                <select
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  value={form.unit}
                  onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                >
                  {UNIT_OPTIONS.map(u => (
                    <option key={u} value={u}>{u} ({UNIT_LABELS[u]})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    {editingId ? 'Current Stock' : 'Initial Stock'}
                  </label>
                  <input
                    type="number" min="0" step="0.001"
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    value={form.initialStock}
                    onChange={e => setForm(f => ({ ...f, initialStock: e.target.value }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Low Stock Threshold</label>
                  <input
                    type="number" min="0" step="0.001"
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    value={form.lowStockThreshold}
                    onChange={e => setForm(f => ({ ...f, lowStockThreshold: e.target.value }))}
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Cost per Unit (₹)</label>
                <input
                  type="number" min="0" step="0.01"
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  value={form.costPerUnit}
                  onChange={e => setForm(f => ({ ...f, costPerUnit: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleFormSubmit}
                disabled={submitting}
                className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {submitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {restockModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Restock — {restockModal.name}</h2>
            <p className="text-sm text-gray-500">
              Current stock: <strong>{Number(restockModal.currentStock).toFixed(1)} {UNIT_LABELS[restockModal.unit]}</strong>
            </p>

            {restockError && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{restockError}</p>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600">
                  Add Quantity ({UNIT_LABELS[restockModal.unit]}) *
                </label>
                <input
                  type="number" min="0.001" step="0.001"
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  value={restockForm.quantity}
                  onChange={e => setRestockForm(f => ({ ...f, quantity: e.target.value }))}
                  placeholder="e.g. 500"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Notes (optional)</label>
                <input
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  value={restockForm.notes}
                  onChange={e => setRestockForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="e.g. Bought from supplier"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setRestockModal(null)}
                className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRestock}
                disabled={submitting}
                className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Add Stock'}
              </button>
         </div>
          </div>
        </div>
      )}

    </div>
  );
}