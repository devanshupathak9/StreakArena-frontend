import { Link, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import useAuth from '../../hooks/useAuth'

const FlameIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2C12 2 8 6 8 10C8 10 6 9 6 7C6 7 3 10 3 14C3 18.418 7.134 22 12 22C16.866 22 21 18.418 21 14C21 9 16 4 12 2Z"
      fill="url(#flameGradient)"
    />
    <path
      d="M12 8C12 8 10 11 10 13.5C10 13.5 9 12.5 9 11.5C9 11.5 7.5 13 7.5 15C7.5 17.485 9.515 19.5 12 19.5C14.485 19.5 16.5 17.485 16.5 15C16.5 12 14 9 12 8Z"
      fill="#FDE68A"
    />
    <defs>
      <linearGradient id="flameGradient" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F97316" />
        <stop offset="1" stopColor="#EF4444" />
      </linearGradient>
    </defs>
  </svg>
)

const NavLink = ({ to, children, active }) => (
  <Link
    to={to}
    className={`
      px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
      ${active
        ? 'bg-indigo-50 text-indigo-700'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }
    `}
  >
    {children}
  </Link>
)

const Navbar = () => {
  const { isAuthenticated } = useAuthStore()
  const { logout } = useAuth()
  const location = useLocation()

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="transition-transform duration-200 group-hover:scale-110">
              <FlameIcon />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              StreakArena
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard" active={isActive('/dashboard')}>
                  Dashboard
                </NavLink>
                <NavLink to="/groups" active={isActive('/groups')}>
                  Groups
                </NavLink>
                <NavLink to="/profile" active={isActive('/profile')}>
                  Profile
                </NavLink>
                <button
                  onClick={logout}
                  className="ml-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" active={isActive('/login')}>
                  Sign In
                </NavLink>
                <Link
                  to="/register"
                  className="ml-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all duration-200 shadow-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
