import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute   from './components/auth/ProtectedRoute'
import AdminRedirect    from './components/auth/AdminRedirect'

import Home                from './pages/public/Home'
import Services            from './pages/public/Services'
import HowItWorksPage      from './pages/public/HowItWorks'
import Pricing             from './pages/public/Pricing'
import Calculator          from './pages/calculator/Calculator'
import ProfessionalDesign  from './pages/professional/ProfessionalDesign'
import SignUp              from './pages/auth/SignUp'
import Login               from './pages/auth/Login'
import VerifyEmail         from './pages/auth/VerifyEmail'
import ForgotPassword      from './pages/auth/ForgotPassword'
import ClientDashboard     from './pages/client/Dashboard'
import AdminDashboard      from './pages/admin/Dashboard'
import AdminVisits         from './pages/admin/SiteVisits'
import AdminPayments       from './pages/admin/Payments'
import AdminDesigns        from './pages/admin/DesignQueue'
import AdminCustomers      from './pages/admin/Customers'
import AdminReports        from './pages/admin/Reports'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public — admins are silently redirected to /admin */}
          <Route path="/"                        element={<AdminRedirect><Home /></AdminRedirect>} />
          <Route path="/services"                element={<AdminRedirect><Services /></AdminRedirect>} />
          <Route path="/how-it-works"            element={<AdminRedirect><HowItWorksPage /></AdminRedirect>} />
          <Route path="/pricing"                 element={<AdminRedirect><Pricing /></AdminRedirect>} />

          {/* These public pages are accessible to everyone regardless of role */}
          <Route path="/calculator"              element={<Calculator />} />
          <Route path="/get-professional-design" element={<ProfessionalDesign />} />
          <Route path="/signup"                  element={<SignUp />} />
          <Route path="/login"                   element={<Login />} />
          <Route path="/verify-email"            element={<VerifyEmail />} />
          <Route path="/forgot-password"         element={<ForgotPassword />} />

          {/* Protected — client only */}
          <Route path="/client" element={
            <ProtectedRoute requiredRole="client"><ClientDashboard /></ProtectedRoute>
          } />

          {/* Protected — admin only */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/visits" element={
            <ProtectedRoute requiredRole="admin"><AdminVisits /></ProtectedRoute>
          } />
          <Route path="/admin/payments" element={
            <ProtectedRoute requiredRole="admin"><AdminPayments /></ProtectedRoute>
          } />
          <Route path="/admin/designs" element={
            <ProtectedRoute requiredRole="admin"><AdminDesigns /></ProtectedRoute>
          } />
          <Route path="/admin/customers" element={
            <ProtectedRoute requiredRole="admin"><AdminCustomers /></ProtectedRoute>
          } />
          <Route path="/admin/reports" element={
            <ProtectedRoute requiredRole="admin"><AdminReports /></ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
