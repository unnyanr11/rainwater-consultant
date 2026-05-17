import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'

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
import ClientDashboard     from './pages/client/ClientDashboard'
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
          {/* Public */}
          <Route path="/"                          element={<Home />} />
          <Route path="/services"                  element={<Services />} />
          <Route path="/how-it-works"              element={<HowItWorksPage />} />
          <Route path="/pricing"                   element={<Pricing />} />
          <Route path="/calculator"                element={<Calculator />} />
          <Route path="/get-professional-design"   element={<ProfessionalDesign />} />
          <Route path="/signup"                    element={<SignUp />} />
          <Route path="/login"                     element={<Login />} />
          <Route path="/verify-email"              element={<VerifyEmail />} />
          <Route path="/forgot-password"           element={<ForgotPassword />} />

          {/* Protected — client */}
<Route path="/client" element={<ProtectedRoute role="client"><ClientDashboard /></ProtectedRoute>} />

{/* Protected — admin */}
<Route path="/admin"           element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
<Route path="/admin/visits"    element={<ProtectedRoute role="admin"><AdminVisits /></ProtectedRoute>} />
<Route path="/admin/payments"  element={<ProtectedRoute role="admin"><AdminPayments /></ProtectedRoute>} />
<Route path="/admin/designs"   element={<ProtectedRoute role="admin"><AdminDesigns /></ProtectedRoute>} />
<Route path="/admin/customers" element={<ProtectedRoute role="admin"><AdminCustomers /></ProtectedRoute>} />
<Route path="/admin/reports"   element={<ProtectedRoute role="admin"><AdminReports /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
