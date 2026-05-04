import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMenuForRole } from '../utils/menuConfig'

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth()
  const menuItems = getMenuForRole(user?.role)

  return (
    <>
      {/* Mobile backdrop — click to close */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col
          transform transition-transform duration-200
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:static lg:translate-x-0 lg:min-h-screen
        `}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 text-white text-lg font-bold w-10 h-10 rounded-lg flex items-center justify-center">
              P
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm">Restaurant POS</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-gray-600 text-xl leading-none p-1"
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.length === 0 ? (
            <p className="text-xs text-gray-400 px-3">No menu available for this role.</p>
          ) : (
            menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))
          )}
        </nav>
      </aside>
    </>
  )
}