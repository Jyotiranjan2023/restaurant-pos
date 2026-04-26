// Master menu list with role permissions
// Add new pages here, no need to touch Sidebar.jsx

export const menuConfig = [
  // ADMIN-focused pages
  { path: '/dashboard',      label: 'Dashboard',         icon: '📊', roles: ['ADMIN'] },
  { path: '/pos',            label: 'Take Order',        icon: '🛒', roles: ['ADMIN', 'WAITER'] },
  { path: '/tables',         label: 'Tables',            icon: '🪑', roles: ['ADMIN', 'WAITER'] },
  { path: '/orders',         label: 'Running Orders',    icon: '📋', roles: ['ADMIN', 'WAITER'] },
  { path: '/menu',           label: 'Menu',              icon: '🍽️', roles: ['ADMIN'] },
  { path: '/inventory',      label: 'Inventory',         icon: '📦', roles: ['ADMIN'] },
  { path: '/customers',      label: 'Customers',         icon: '👥', roles: ['ADMIN'] },
  { path: '/coupons',        label: 'Coupons',           icon: '🎟️', roles: ['ADMIN'] },
  { path: '/reports',        label: 'Reports',           icon: '📈', roles: ['ADMIN'] },
  { path: '/staff',          label: 'Staff',             icon: '👤', roles: ['ADMIN'] },

  // KITCHEN
  { path: '/kitchen',        label: 'Kitchen Display',   icon: '👨‍🍳', roles: ['CHEF', 'ADMIN'] },
  { path: '/menu-availability', label: 'Menu Availability', icon: '✅', roles: ['CHEF', 'ADMIN'] },

  // SHARED
  { path: '/settings',       label: 'Settings',          icon: '⚙️', roles: ['ADMIN'] },
  { path: '/profile',        label: 'My Profile',        icon: '👤', roles: ['ADMIN', 'WAITER', 'CHEF'] },
]

// Helper: filter menu by role
export const getMenuForRole = (role) => {
  if (!role) return []
  return menuConfig.filter((item) => item.roles.includes(role))
}