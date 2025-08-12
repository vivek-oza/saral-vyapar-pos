import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/LanguageContext'
import Signup from './pages/Signup'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import ResetPasswordOTP from './pages/ResetPasswordOTP'
import Dashboard from './pages/Dashboard'
import ModuleSelection from './pages/ModuleSelection'
import Products from './pages/Products'
import Inventory from './pages/Inventory'
import Billing from './pages/Billing'
import Reports from './pages/Reports'
import MobilePOS from './pages/MobilePOS'
import ShopSettings from './pages/ShopSettings'
import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ResetPasswordOTP />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/reset-password-otp" element={<ResetPasswordOTP />} />
              <Route
                path="/:shopUsername/modules"
                element={
                  <ProtectedRoute>
                    <ModuleSelection />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/:shopUsername/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/:shopUsername/products"
                element={
                  <ProtectedRoute>
                    <Products />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/:shopUsername/inventory"
                element={
                  <ProtectedRoute>
                    <Inventory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/:shopUsername/billing"
                element={
                  <ProtectedRoute>
                    <Billing />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/:shopUsername/reports"
                element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/:shopUsername/mobile-pos"
                element={
                  <ProtectedRoute>
                    <MobilePOS />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/:shopUsername/settings"
                element={
                  <ProtectedRoute>
                    <ShopSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={<Navigate to="/login" replace />}
              />
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App
