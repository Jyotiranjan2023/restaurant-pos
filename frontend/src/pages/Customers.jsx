import React, { useState } from 'react';
import { useCustomers } from '../hooks/useCustomers';
import {
  fetchCustomerOrders, fetchTopSpenders,
  createCustomer, updateCustomer, deleteCustomer
} from '../services/customerService';

const EMPTY_FORM = { name: '', phone: '', email: '', address: '', notes: '', vip: false };

const ORDER_STATUS_COLORS = {
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  PENDING:   'bg-yellow-100 text-yellow-700',
  RUNNING:   'bg-blue-100 text-blue-700',
};

export default function Customers() {
  const {
    customers, totalPages, currentPage, totalElements,
    loading, error, search, goToPage, refresh
  } = useCustomers();

  const [searchInput, setSearchInput] = useState('');
  const [tab, setTab] = useState('all');
  const [topSpenders, setTopSpenders] = useState(null);
  const [topLoading, setTopLoading] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    search(val);
  };

  const clearSearch = () => {
    setSearchInput('');
    search('');
  };

  const loadTopSpenders = async () => {
    if (topSpenders) return;
    try {
      setTopLoading(true);
      const data = await fetchTopSpenders();
      setTopSpenders(data);
    } catch {
      setTopSpenders([]);
    } finally {
      setTopLoading(false);
    }
  };

  const switchTab = (t) => {
    setTab(t);
    if (t === 'top') loadTopSpenders();
  };

  const openDetail = async (customer) => {
    setSelectedCustomer(customer);
    setOrders([]);
    setOrdersLoading(true);
    try {
      const data = await fetchCustomerOrders(customer.id);
      setOrders(data);
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (c) => {
    setEditingId(c.id);
    setForm({
      name: c.name,
      phone: c.phone,
      email: c.email || '',
      address: c.address || '',
      notes: c.notes || '',
      vip: c.vip || false,
    });
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { setFormError('Name is required'); return; }
    if (!form.phone.trim()) { setFormError('Phone is required'); return; }
    try {
      setSubmitting(true);
      setFormError('');
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        address: form.address.trim() || null,
        notes: form.notes.trim() || null,
        vip: form.vip,
      };
      if (editingId) await updateCustomer(editingId, payload);
      else await createCustomer(payload);
      setShowForm(false);
      setTopSpenders(null);
      clearSearch();
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer?')) return;
    try {
      await deleteCustomer(id);
      // close drawer if deleted customer was open
      if (selectedCustomer?.id === id) setSelectedCustomer(null);
      // reset top spenders cache
      setTopSpenders(null);
      // clear search and reload page 0 — pass 0 directly, no hook state involved
      setSearchInput('');
      refresh(0);
    } catch (err) {
      alert(err?.response?.data?.message || 'Delete failed');
    }
  };

  const displayList = tab === 'top' ? (topSpenders || []) : customers;

  if (loading && customers.length === 0) return (
    <div className="flex items-center justify-center h-64 text-gray-400">Loading customers...</div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-red-500">
      <p>{error}</p>
      <button onClick={() => refresh(0)} className="px-4 py-2 bg-red-100 rounded-lg text-sm">Retry</button>
    </div>
  );

  return (
    <div className="p-3 md:p-6 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Customers</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">{totalElements} total</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { clearSearch(); }}
            className="px-3 py-2 text-xs md:text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
          >
            ↻
          </button>
          <button
            onClick={openAdd}
            className="px-3 py-2 text-xs md:text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Search */}
      <input
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        placeholder="Search by name or phone..."
        value={searchInput}
        onChange={handleSearch}
      />

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[['all', 'All Customers'], ['top', 'Top Spenders']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => switchTab(key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === key ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {tab === 'top' && topLoading && (
          <div className="text-center text-gray-400 py-8">Loading...</div>
        )}
        {!loading && !topLoading && displayList.length === 0 && (
          <div className="text-center text-gray-400 py-12">No customers found</div>
        )}
        {displayList.map((c, idx) => (
          <div
            key={c.id}
            onClick={() => openDetail(c)}
            className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:border-orange-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {tab === 'top' && (
                  <span className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-800">{c.name}</p>
                    {c.vip && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                        ⭐ VIP
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{c.phone}</p>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-400">
                    <span>{c.visitCount} visits</span>
                    <span>Spent: <strong className="text-gray-600">₹{Number(c.totalSpent).toLocaleString('en-IN')}</strong></span>
                    {c.lastVisitAt && (
                      <span>Last: {new Date(c.lastVisitAt).toLocaleDateString('en-IN')}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => openEdit(c)}
                  className="px-3 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="px-3 py-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-600 rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {tab === 'all' && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 0}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            Next →
          </button>
        </div>
      )}

      {/* Customer Detail Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" onClick={() => setSelectedCustomer(null)}>
          <div
            className="bg-white w-full max-w-md h-full overflow-y-auto p-6 space-y-5"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-800">{selectedCustomer.name}</h2>
                  {selectedCustomer.vip && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">⭐ VIP</span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{selectedCustomer.phone}</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-orange-50 rounded-xl p-3 text-center">
                <p className="text-xs text-orange-600 font-medium">Total Spent</p>
                <p className="text-lg font-bold text-orange-700">₹{Number(selectedCustomer.totalSpent).toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-xs text-blue-600 font-medium">Visits</p>
                <p className="text-lg font-bold text-blue-700">{selectedCustomer.visitCount}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {selectedCustomer.email && (
                <div className="flex gap-2"><span className="text-gray-400 w-16">Email</span><span className="text-gray-700">{selectedCustomer.email}</span></div>
              )}
              {selectedCustomer.address && (
                <div className="flex gap-2"><span className="text-gray-400 w-16">Address</span><span className="text-gray-700">{selectedCustomer.address}</span></div>
              )}
              {selectedCustomer.notes && (
                <div className="flex gap-2"><span className="text-gray-400 w-16">Notes</span><span className="text-gray-700">{selectedCustomer.notes}</span></div>
              )}
              {selectedCustomer.lastVisitAt && (
                <div className="flex gap-2"><span className="text-gray-400 w-16">Last Visit</span><span className="text-gray-700">{new Date(selectedCustomer.lastVisitAt).toLocaleString('en-IN')}</span></div>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Order History</h3>
              {ordersLoading && <p className="text-sm text-gray-400">Loading...</p>}
              {!ordersLoading && orders.length === 0 && (
                <p className="text-sm text-gray-400">No orders yet</p>
              )}
              <div className="space-y-2">
                {orders.map(o => (
                  <div key={o.orderId} className="border border-gray-100 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-800">{o.orderNumber}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ORDER_STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}`}>
                        {o.status}
                      </span>
                    </div>
                    <div className="flex gap-3 mt-1 text-xs text-gray-400">
                      <span>{o.orderType.replace('_', ' ')}</span>
                      <span>{o.itemCount} items</span>
                      <span className="text-gray-600 font-medium">₹{Number(o.totalAmount).toLocaleString('en-IN')}</span>
                      <span>{new Date(o.orderDate).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-800">
              {editingId ? 'Edit Customer' : 'Add Customer'}
            </h2>

            {formError && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{formError}</p>
            )}

            <div className="space-y-3">
              {[
                { key: 'name',    label: 'Name *',  placeholder: 'Full name' },
                { key: 'phone',   label: 'Phone *', placeholder: '9876543210' },
                { key: 'email',   label: 'Email',   placeholder: 'optional' },
                { key: 'address', label: 'Address', placeholder: 'optional' },
                { key: 'notes',   label: 'Notes',   placeholder: 'optional' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-medium text-gray-600">{label}</label>
                  <input
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                  />
                </div>
              ))}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.vip}
                  onChange={e => setForm(f => ({ ...f, vip: e.target.checked }))}
                  className="w-4 h-4 accent-orange-500"
                />
                <span className="text-sm text-gray-700">Mark as VIP</span>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {submitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}