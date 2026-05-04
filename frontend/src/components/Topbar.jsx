import { useAuth } from '../context/AuthContext'

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth()

  return (
    <header className="bg-white border-b border-gray-200 px-3 md:px-6 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-600 hover:text-gray-800 p-1 -ml-1"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="min-w-0">
          <h2 className="font-semibold text-gray-800 truncate">{user?.restaurantName}</h2>
          <p className="text-xs text-gray-500 truncate">Tenant ID: {user?.tenantId}</p>
        </div>
      </div>

      {/* User Info + Logout */}
      <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-gray-800">{user?.fullName}</p>
          <p className="text-xs text-gray-500">{user?.role}</p>
        </div>
        <div className="bg-orange-500 text-white w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
          {user?.fullName?.charAt(0).toUpperCase()}
        </div>
        <button
          onClick={logout}
          className="text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Logout
        </button>
      </div>
    </header>
  )
}