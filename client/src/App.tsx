import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/jobs"
            element={
              <ProtectedRoute>
                <div className="p-8 text-center text-gray-500">Jobs page coming soon</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <div className="p-8 text-center text-gray-500">Profile page coming soon</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/wallet"
            element={
              <ProtectedRoute>
                <div className="p-8 text-center text-gray-500">Wallet page coming soon</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/badges"
            element={
              <ProtectedRoute>
                <div className="p-8 text-center text-gray-500">Badges page coming soon</div>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<div className="p-8 text-center text-gray-500">Page not found</div>} />
        </Routes>
      </main>
      <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} CampusCollar. All rights reserved.
      </footer>
    </div>
  )
}
