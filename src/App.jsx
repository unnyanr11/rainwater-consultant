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
import ClientDashboard     from './pages/client/Dashboard'

import AdminLayout         from './components/admin/AdminLayout'
import AdminDashboard      from './pages/admin/Dashboard'
import AdminVisits         from './pages/admin/Visits'
import AdminPayments       from './pages/admin/Payments'
import AdminDesigns        from './pages/admin/Designs'
import AdminCustomers      from './pages/admin/Customers'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"                        element={<Home />} />
          <Route path="/services"                element={<Services />} />
          <Route path="/how-it-works"            element={<HowItWorks Page />} />
          <Route path="/pricing"                 element={<Pricing />} />
          <Route path="/calculator"              element={<Calculator />} />
          <Route path="/get-professional-design" element={<ProfessionalDesign />} />
          <Route path="/signup"                  element={<SignUp />} />
          <Route path="/login"                   element={<Login />} />
          <Route path="/verify-email"            element={<VerifyEmail />} />
          <Route path="/forgot-password"         element={<ForgotPassword />} />

          {/* Client */}
          <Route path="/client" element={<ProtectedRoute><ClientDashboard /></ProtectedRoute>} />

          {/* Admin — nested routes */}
          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index           element={<AdminDashboard />} />
            <Route path="visits"   element={<AdminVisits />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="designs"  element={<AdminDesigns />} />
            <Route path="customers" element={<AdminCustomers />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}