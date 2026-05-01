import { useAuth } from '../context/AuthContext'

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

export default function Profile() {
  const { user } = useAuth()

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.username?.slice(0, 2).toUpperCase() || 'U'

  return (
    <div className="max-w-lg">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your account information</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

        {/* Header banner */}
        <div className="bg-gradient-to-r from-orange-400 to-orange-500 h-20" />

        {/* Avatar + name */}
        <div className="px-6 pb-4">
          <div className="-mt-10 mb-3">
            <div className="w-20 h-20 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-orange-500 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{initials}</span>
              </div>
            </div>
          </div>

          <div className="flex items-start justify-between flex-wrap gap-2 mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {user?.fullName || user?.username}
              </h2>
              <p className="text-sm text-gray-500">@{user?.username}</p>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full border font-bold ${roleStyles[user?.role] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
              {roleIcons[user?.role]} {user?.role}
            </span>
          </div>

          {/* Info rows */}
          <div className="space-y-3 border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 flex items-center gap-2">
                🏪 Restaurant
              </span>
              <span className="font-semibold text-gray-800">
                {user?.restaurantName || '—'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 flex items-center gap-2">
                🆔 Tenant ID
              </span>
              <span className="font-semibold text-gray-800">
                {user?.tenantId}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 flex items-center gap-2">
                👤 Role
              </span>
              <span className="font-semibold text-gray-800">{user?.role}</span>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="bg-gray-50 border-t border-gray-100 px-6 py-3">
          <p className="text-xs text-gray-400">
            To change your password, contact your administrator.
          </p>
        </div>
      </div>
    </div>
  )
}