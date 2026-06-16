import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useUIStore } from '../store/uiStore'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-campus-primary">CampusCollar</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/jobs" className="text-gray-600 hover:text-campus-primary transition-colors">
              Find Jobs
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/badges" className="text-gray-600 hover:text-campus-primary transition-colors">
                  Badges
                </Link>
                <Link to="/wallet" className="text-gray-600 hover:text-campus-primary transition-colors">
                  Wallet
                </Link>
                <div className="flex items-center gap-3 ml-4">
                  <Link to="/profile" className="text-sm font-medium text-gray-700 hover:text-campus-primary">
                    {user?.name || user?.email}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-500 hover:text-campus-danger transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-campus-primary transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-medium bg-campus-primary text-white px-4 py-2 rounded-lg hover:bg-campus-secondary transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={toggleSidebar}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {sidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {sidebarOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-2">
            <Link to="/jobs" className="block py-2 text-gray-600" onClick={toggleSidebar}>
              Find Jobs
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/badges" className="block py-2 text-gray-600" onClick={toggleSidebar}>
                  Badges
                </Link>
                <Link to="/wallet" className="block py-2 text-gray-600" onClick={toggleSidebar}>
                  Wallet
                </Link>
                <Link to="/profile" className="block py-2 text-gray-600" onClick={toggleSidebar}>
                  Profile
                </Link>
                <button onClick={() => { handleLogout(); toggleSidebar() }} className="block py-2 text-gray-600">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 text-gray-600" onClick={toggleSidebar}>
                  Log in
                </Link>
                <Link to="/signup" className="block py-2 text-campus-primary font-medium" onClick={toggleSidebar}>
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
