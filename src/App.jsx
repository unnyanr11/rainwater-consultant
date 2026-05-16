import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute   from './components/auth/ProtectedRoute'
import PublicOnlyRoute  from './components/auth/PublicOnlyRoute'

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
          {/* Public — redirect away if already logged in */}
          <Route path="/"                          element={<PublicOnlyRoute><Home /></PublicOnlyRoute>} />
          <Route path="/services"                  element={<PublicOnlyRoute><Services /></PublicOnlyRoute>} />
          <Route path="/how-it-works"              element={<PublicOnlyRoute><HowItWorksPage /></PublicOnlyRoute>} />
          <Route path="/pricing"                   element={<PublicOnlyRoute><Pricing /></PublicOnlyRoute>} />
          <Route path="/calculator"                element={<PublicOnlyRoute><Calculator /></PublicOnlyRoute>} />
          <Route path="/get-professional-design"   element={<PublicOnlyRoute><ProfessionalDesign /></PublicOnlyRoute>} />
          <Route path="/signup"                    element={<PublicOnlyRoute><SignUp /></PublicOnlyRoute>} />
          <Route path="/login"                     element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/verify-email"              element={<PublicOnlyRoute><VerifyEmail /></PublicOnlyRoute>} />
          <Route path="/forgot-password"           element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />

          {/* Protected — client */}
          <Route path="/client" element={<ProtectedRoute><ClientDashboard /></ProtectedRoute>} />

          {/* Protected — admin multi-page */}
          <Route path="/admin"              element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/visits"       element={<ProtectedRoute><AdminVisits /></ProtectedRoute>} />
          <Route path="/admin/payments"     element={<ProtectedRoute><AdminPayments /></ProtectedRoute>} />
          <Route path="/admin/designs"      element={<ProtectedRoute><AdminDesigns /></ProtectedRoute>} />
          <Route path="/admin/customers"    element={<ProtectedRoute><AdminCustomers /></ProtectedRoute>} />
          <Route path="/admin/reports"      element={<ProtectedRoute><AdminReports /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
