import { useAuth } from '../context/AuthContext'

export default function Unauthorized() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-md p-8 max-w-md text-center">
        <div className="text-5xl mb-3">🚫</div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h1>
        <p className="text-gray-500 text-sm mb-5">
          Your role <span className="font-semibold text-orange-600">{user?.role}</span> does not have permission to view this page.
        </p>
        <button
          onClick={logout}
          className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-5 py-2 rounded-lg text-sm"
        >
          Logout
        </button>
      </div>
    </div>
  )
}