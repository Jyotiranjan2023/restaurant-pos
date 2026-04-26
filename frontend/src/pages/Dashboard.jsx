import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()

  const stats = [
    { label: "Today's Sales", value: '₹0', color: 'bg-blue-50 text-blue-600' },
    { label: "Today's Orders", value: '0', color: 'bg-green-50 text-green-600' },
    { label: 'Active Tables', value: '0', color: 'bg-orange-50 text-orange-600' },
    { label: 'Pending Orders', value: '0', color: 'bg-red-50 text-red-600' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome back, {user?.fullName}
        </h1>
        <p className="text-gray-500 text-sm">
          Here's what's happening at {user?.restaurantName} today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-200 p-5"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={`text-2xl font-bold mt-2 ${stat.color.split(' ')[1]}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Placeholder Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-800 mb-2">Recent Activity</h2>
        <p className="text-gray-500 text-sm">
          Connect to backend APIs to display real data here.
        </p>
      </div>
    </div>
  )
}