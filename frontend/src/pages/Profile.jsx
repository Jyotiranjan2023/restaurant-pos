import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user } = useAuth()

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-md">
      <h1 className="text-xl font-bold text-gray-800 mb-4">My Profile</h1>
      <div className="space-y-2 text-sm">
        <p><span className="text-gray-500">Name:</span> <span className="font-medium">{user?.fullName}</span></p>
        <p><span className="text-gray-500">Username:</span> <span className="font-medium">{user?.username}</span></p>
        <p><span className="text-gray-500">Role:</span> <span className="font-medium">{user?.role}</span></p>
        <p><span className="text-gray-500">Restaurant:</span> <span className="font-medium">{user?.restaurantName}</span></p>
        <p><span className="text-gray-500">Tenant ID:</span> <span className="font-medium">{user?.tenantId}</span></p>
      </div>
    </div>
  )
}
