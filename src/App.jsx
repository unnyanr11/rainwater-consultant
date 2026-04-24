import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'

import Home            from './pages/public/Home'
import Calculator      from './pages/calculator/Calculator'
import SignUp          from './pages/auth/SignUp'
import Login           from './pages/auth/Login'
import VerifyEmail     from './pages/auth/VerifyEmail'
import ForgotPassword  from './pages/auth/ForgotPassword'
import ClientDashboard from './pages/client/Dashboard'
import AdminDashboard  from './pages/admin/Dashboard'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"                element={<Home />} />
          <Route path="/calculator"      element={<Calculator />} />
          <Route path="/signup"          element={<SignUp />} />
          <Route path="/login"           element={<Login />} />
          <Route path="/verify-email"    element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected — login redirects to correct dashboard by role */}
          <Route path="/client" element={<ProtectedRoute><ClientDashboard /></ProtectedRoute>} />
          <Route path="/admin"  element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}