import { Routes, Route, Navigate } from 'react-router-dom'

import Landing from './pages/public/Landing'
import Features from './pages/public/Features'
import Pricing from './pages/public/Pricing'
import FAQs from './pages/public/FAQs'

import SuperAdminManagement from './pages/SuperAdminManagement'
import SuperAdminAuditLog from './pages/SuperAdminAuditLog'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import SuperAdminPlans from './pages/SuperAdminPlans'
import SuperAdminTenantDetail from './pages/SuperAdminTenantDetail'
import SuperAdminTenants from './pages/SuperAdminTenants'
import Register from './pages/Register'
import SuperAdminLayout from './components/SuperAdminLayout'
import SuperAdminDashboard from './pages/SuperAdminDashboard'
import SuperAdminLogin from './pages/SuperAdminLogin'
import Upgrade from './pages/Upgrade'
import Subscription from './pages/Subscription'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import POS from './pages/POS'
import Tables from './pages/Tables'
import RunningOrders from './pages/RunningOrders'
import OrderDetail from './pages/OrderDetail'
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
import Bills from './pages/Bills'
import BillDetail from './pages/BillDetail'
import PasswordResetsAdmin from './pages/PasswordResetsAdmin'

import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import SuperAdminProtectedRoute from './components/SuperAdminProtectedRoute'

export default function App() {
  return (
    <Routes>
      {/* Public marketing pages */}
      <Route path="/" element={<Landing />} />
      <Route path="/features" element={<Features />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/faqs" element={<FAQs />} />

      {/* Public auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/super-admin/login" element={<SuperAdminLogin />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Super admin protected routes */}
      <Route element={
        <SuperAdminProtectedRoute>
          <SuperAdminLayout />
        </SuperAdminProtectedRoute>
      }>
        <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
        <Route path="/super-admin/tenants" element={<SuperAdminTenants />} />
        <Route path="/super-admin/tenants/:tenantId" element={<SuperAdminTenantDetail />} />
        <Route path="/super-admin/plans" element={<SuperAdminPlans />} />
        <Route path="/super-admin/audit-log" element={<SuperAdminAuditLog />} />
        <Route path="/super-admin/super-admins" element={<SuperAdminManagement />} />
      </Route>

      {/* Tenant protected routes */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><Dashboard /></ProtectedRoute>} />
        <Route path="/menu" element={<ProtectedRoute allowedRoles={['ADMIN']}><Menu /></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute allowedRoles={['ADMIN']}><Inventory /></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute allowedRoles={['ADMIN']}><Customers /></ProtectedRoute>} />
        <Route path="/coupons" element={<ProtectedRoute allowedRoles={['ADMIN']}><Coupons /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute allowedRoles={['ADMIN']}><Reports /></ProtectedRoute>} />
        <Route path="/staff" element={<ProtectedRoute allowedRoles={['ADMIN']}><Staff /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute allowedRoles={['ADMIN']}><Settings /></ProtectedRoute>} />
        <Route path="/bills" element={<ProtectedRoute allowedRoles={['ADMIN']}><Bills /></ProtectedRoute>} />
        <Route path="/subscription" element={<ProtectedRoute allowedRoles={['ADMIN']}><Subscription /></ProtectedRoute>} />
        <Route path="/upgrade" element={<ProtectedRoute allowedRoles={['ADMIN']}><Upgrade /></ProtectedRoute>} />
        <Route path="/admin/password-resets" element={<ProtectedRoute allowedRoles={['ADMIN']}><PasswordResetsAdmin /></ProtectedRoute>} />

        <Route path="/pos" element={<ProtectedRoute allowedRoles={['ADMIN', 'WAITER']}><POS /></ProtectedRoute>} />
        <Route path="/tables" element={<ProtectedRoute allowedRoles={['ADMIN', 'WAITER']}><Tables /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute allowedRoles={['ADMIN', 'WAITER']}><RunningOrders /></ProtectedRoute>} />
        <Route path="/orders/:id" element={<ProtectedRoute allowedRoles={['ADMIN', 'WAITER']}><OrderDetail /></ProtectedRoute>} />
        <Route path="/bills/:id" element={<ProtectedRoute allowedRoles={['ADMIN', 'WAITER']}><BillDetail /></ProtectedRoute>} />

        <Route path="/kitchen" element={<ProtectedRoute allowedRoles={['CHEF', 'ADMIN']}><Kitchen /></ProtectedRoute>} />
        <Route path="/menu-availability" element={<ProtectedRoute allowedRoles={['CHEF', 'ADMIN']}><MenuAvailability /></ProtectedRoute>} />

        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="/super-admin/*" element={<Navigate to="/super-admin/login" />} />

      {/* Catch-all — unknown URLs go to landing page */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}