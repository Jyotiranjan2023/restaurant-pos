import { useAuth } from '../context/AuthContext'

export default function Topbar() {
  const { user, logout } = useAuth()

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      
      {/* Restaurant Name */}
      <div>
        <h2 className="font-semibold text-gray-800">{user?.restaurantName}</h2>
        <p className="text-xs text-gray-500">Tenant ID: {user?.tenantId}</p>
      </div>

      {/* User Info + Logout */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-800">{user?.fullName}</p>
          <p className="text-xs text-gray-500">{user?.role}</p>
        </div>
        <div className="bg-orange-500 text-white w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm">
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