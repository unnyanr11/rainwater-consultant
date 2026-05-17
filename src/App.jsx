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
import ClientOverview      from './pages/client/ClientOverview'
import ClientOrders        from './pages/client/ClientOrders'
import ClientOrderDetail   from './pages/client/ClientOrderDetail'
import ClientPayments      from './pages/client/ClientPayments'
import ClientProfile       from './pages/client/ClientProfile'
import ClientRequestLecture from './pages/client/ClientRequestLecture'
import ClientSupport       from './pages/client/ClientSupport'
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

          {/* Protected — client (nested) */}
          <Route path="/client" element={<ProtectedRoute role="client"><ClientDashboard /></ProtectedRoute>}>
            <Route index                    element={<ClientOverview />} />
            <Route path="calculator"       element={<Calculator />} />
            <Route path="orders"           element={<ClientOrders />} />
            <Route path="orders/:id"       element={<ClientOrderDetail />} />
            <Route path="payments"         element={<ClientPayments />} />
            <Route path="profile"          element={<ClientProfile />} />
            <Route path="request-lecture"  element={<ClientRequestLecture />} />
            <Route path="support"          element={<ClientSupport />} />
          </Route>

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
