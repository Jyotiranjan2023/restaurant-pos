
import OrderDetail from './pages/OrderDetail'
import { Routes, Route, Navigate } from 'react-router-dom'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import POS from './pages/POS'
import Tables from './pages/Tables'
import RunningOrders from './pages/RunningOrders'
import Menu from './pages/Menu'
import Inventory from './pages/Inventory'
import Customers from './pages/Customers'
import Coupons from './pages/Coupons'
import Reports from './pages/Reports'
import Staff from './pages/Staff'
import Settings from './pages/Settings'
import Kitchen from './pages/Kitchen'
import MenuAvailability from './pages/MenuAvailability'
import Profile from './pages/Profile'
import Unauthorized from './pages/Unauthorized'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import BillDetail from './pages/BillDetail'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Admin only */}
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><Dashboard /></ProtectedRoute>} />
        <Route path="/menu" element={<ProtectedRoute allowedRoles={['ADMIN']}><Menu /></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute allowedRoles={['ADMIN']}><Inventory /></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute allowedRoles={['ADMIN']}><Customers /></ProtectedRoute>} />
        <Route path="/coupons" element={<ProtectedRoute allowedRoles={['ADMIN']}><Coupons /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute allowedRoles={['ADMIN']}><Reports /></ProtectedRoute>} />
        <Route path="/staff" element={<ProtectedRoute allowedRoles={['ADMIN']}><Staff /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute allowedRoles={['ADMIN']}><Settings /></ProtectedRoute>} />

        {/* Admin + Waiter */}
        <Route path="/pos" element={<ProtectedRoute allowedRoles={['ADMIN', 'WAITER']}><POS /></ProtectedRoute>} />
<Route path="/tables" element={<ProtectedRoute allowedRoles={['ADMIN', 'WAITER']}><Tables /></ProtectedRoute>} />
<Route path="/orders" element={<ProtectedRoute allowedRoles={['ADMIN', 'WAITER']}><RunningOrders /></ProtectedRoute>} />
<Route path="/orders/:id" element={<ProtectedRoute allowedRoles={['ADMIN', 'WAITER']}><OrderDetail /></ProtectedRoute>} />
<Route path="/bills/:id" element={<ProtectedRoute allowedRoles={['ADMIN', 'WAITER']}><BillDetail /></ProtectedRoute>} />
        {/* Chef + Admin */}
        <Route path="/kitchen" element={<ProtectedRoute allowedRoles={['CHEF', 'ADMIN']}><Kitchen /></ProtectedRoute>} />
        <Route path="/menu-availability" element={<ProtectedRoute allowedRoles={['CHEF', 'ADMIN']}><MenuAvailability /></ProtectedRoute>} />

        {/* All roles */}
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}