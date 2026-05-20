import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useSuperAdminAuth } from '../context/SuperAdminAuthContext';

export default function SuperAdminLayout() {
    const { superAdmin, logout } = useSuperAdminAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        if (window.confirm('Sign out of super admin?')) {
            logout();
            navigate('/super-admin/login', { replace: true });
        }
    };

    const navItems = [
        { to: '/super-admin/dashboard', label: 'Dashboard', icon: '📊' },
        { to: '/super-admin/tenants', label: 'Tenants', icon: '🏢' },
        { to: '/super-admin/plans', label: 'Plans', icon: '💳' },
    ];

    return (
        <div className="flex min-h-screen bg-slate-50">

            {/* Sidebar — desktop always visible, mobile slide-in */}
            <aside className={`
                fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white transform transition-transform
                md:static md:translate-x-0
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-4 border-b border-slate-700">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🔐</span>
                        <div>
                            <h2 className="font-bold text-sm">Super Admin</h2>
                            <p className="text-xs text-slate-400">Restaurant POS</p>
                        </div>
                    </div>
                </div>

                <nav className="p-3 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-3 py-2 rounded-md text-sm
                                ${isActive
                                    ? 'bg-slate-700 text-white'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                            `}
                        >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </aside>

            {/* Backdrop for mobile sidebar */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main content area */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Top bar */}
                <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Mobile menu button */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="md:hidden p-1 text-slate-700"
                        >
                            ☰
                        </button>
                        <div>
                            <p className="text-xs text-slate-500">Signed in as</p>
                            <p className="font-medium text-sm text-slate-900">
                                {superAdmin?.fullName || superAdmin?.username || 'Super Admin'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1.5 rounded-md hover:bg-red-50"
                    >
                        Logout
                    </button>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}