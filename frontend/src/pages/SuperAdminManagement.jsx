import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import superAdminService from '../services/superAdminService';

export default function SuperAdminManagement() {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Create form state
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createError, setCreateError] = useState(null);
    const [createSuccess, setCreateSuccess] = useState(null);
    const [creating, setCreating] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    const loadAdmins = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await superAdminService.listSuperAdmins();
            setAdmins(res.data || []);
        } catch (err) {
            setError('Failed to load super admins');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAdmins();
    }, [loadAdmins]);

    const onSubmit = async (data) => {
        setCreateError(null);
        setCreateSuccess(null);
        setCreating(true);
        try {
            const res = await superAdminService.createSuperAdmin(data);
            if (res.success) {
                setCreateSuccess(`Super admin "${res.data.username}" created successfully`);
                reset();
                loadAdmins();
                setTimeout(() => {
                    setShowCreateForm(false);
                    setCreateSuccess(null);
                }, 2000);
            } else {
                setCreateError(res.message || 'Failed to create');
            }
        } catch (err) {
            setCreateError(err.response?.data?.message || 'Failed to create super admin');
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 max-w-5xl mx-auto">

            {/* Header */}
            <div className="mb-6 flex justify-between items-start gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Super Admins</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {admins.length} super admin{admins.length !== 1 ? 's' : ''}
                    </p>
                </div>
                {!showCreateForm && (
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="px-4 py-2 bg-slate-900 text-white text-sm rounded-md hover:bg-slate-800"
                    >
                        + Add Super Admin
                    </button>
                )}
            </div>

            {/* Create form */}
            {showCreateForm && (
                <div className="bg-white border border-slate-200 rounded-lg p-5 mb-4">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-lg font-semibold text-slate-900">New Super Admin</h2>
                        <button
                            onClick={() => {
                                setShowCreateForm(false);
                                setCreateError(null);
                                setCreateSuccess(null);
                                reset();
                            }}
                            className="text-slate-400 hover:text-slate-600 text-xl leading-none"
                        >
                            ×
                        </button>
                    </div>

                    {createError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3 mb-3">
                            {createError}
                        </div>
                    )}
                    {createSuccess && (
                        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-md p-3 mb-3">
                            {createSuccess}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                                    {...register('fullName', { required: 'Full name is required' })}
                                />
                                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                                <input
                                    type="email"
                                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                                    {...register('email', {
                                        required: 'Email is required',
                                        pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' }
                                    })}
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Username *</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm font-mono"
                                    {...register('username', {
                                        required: 'Username is required',
                                        minLength: { value: 3, message: 'Min 3 characters' },
                                        maxLength: { value: 30, message: 'Max 30 characters' }
                                    })}
                                />
                                {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
                                <input
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="At least 8 characters"
                                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                                    {...register('password', {
                                        required: 'Password is required',
                                        minLength: { value: 8, message: 'Min 8 characters' }
                                    })}
                                />
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                            </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs rounded-md p-3 mt-2">
                            ⚠ Share credentials with the new super admin via a secure channel. They cannot be retrieved later — only reset.
                        </div>

                        <div className="flex gap-2 justify-end pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCreateForm(false);
                                    reset();
                                }}
                                disabled={creating}
                                className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={creating}
                                className="px-4 py-2 bg-slate-900 text-white text-sm rounded-md hover:bg-slate-800 disabled:opacity-50"
                            >
                                {creating ? 'Creating...' : 'Create Super Admin'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4 text-sm text-red-800">
                    {error}
                </div>
            )}

            {/* List */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading super admins...</div>
                ) : admins.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No super admins yet.</div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="text-left px-4 py-3 font-semibold text-slate-700">Name</th>
                                        <th className="text-left px-4 py-3 font-semibold text-slate-700">Username</th>
                                        <th className="text-left px-4 py-3 font-semibold text-slate-700">Email</th>
                                        <th className="text-left px-4 py-3 font-semibold text-slate-700">Last Login</th>
                                        <th className="text-left px-4 py-3 font-semibold text-slate-700">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {admins.map((a) => (
                                        <tr key={a.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                            <td className="px-4 py-3 font-medium text-slate-900">{a.fullName}</td>
                                            <td className="px-4 py-3 font-mono text-xs text-slate-700">{a.username}</td>
                                            <td className="px-4 py-3 text-slate-700">{a.email}</td>
                                            <td className="px-4 py-3 text-slate-500 text-xs">
                                                {a.lastLoginAt ? formatDateTime(a.lastLoginAt) : 'Never'}
                                            </td>
                                            <td className="px-4 py-3">
                                                {a.isActive ? (
                                                    <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium">Active</span>
                                                ) : (
                                                    <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs font-medium">Inactive</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="md:hidden divide-y divide-slate-200">
                            {admins.map((a) => (
                                <div key={a.id} className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-slate-900">{a.fullName}</p>
                                            <p className="text-xs text-slate-500 font-mono">{a.username}</p>
                                        </div>
                                        {a.isActive ? (
                                            <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium">Active</span>
                                        ) : (
                                            <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs font-medium">Inactive</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-600">{a.email}</p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Last login: {a.lastLoginAt ? formatDateTime(a.lastLoginAt) : 'Never'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function formatDateTime(isoString) {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}