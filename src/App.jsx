import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import useAuthStore from './store/authStore'

// Layout
import MainLayout from './components/layout/MainLayout'
import AuthLayout from './components/layout/AuthLayout'
import ProtectedRoute from './components/ProtectedRoute'

// Auth Pages
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'

// Dashboard
import Dashboard from './pages/Dashboard/Dashboard'

// Groups
import GroupList from './pages/Groups/GroupList'
import GroupDetail from './pages/Groups/GroupDetail'
import GroupCreate from './pages/Groups/GroupCreate'
import InviteLink from './pages/Groups/InviteLink'

// Profile
import Profile from './pages/Profile/Profile'

// Other
import NotFound from './pages/NotFound'

const RootRedirect = () => {
  const { isAuthenticated } = useAuthStore()
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
}

const App = () => {
  const { initAuth } = useAuthStore()

  useEffect(() => {
    initAuth()
  }, [initAuth])

  return (
    <BrowserRouter>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Auth routes — split-screen layout, no navbar */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Main app routes */}
        <Route element={<MainLayout />}>
          {/* Public Routes */}
          <Route path="/join/:token" element={<InviteLink />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/groups" element={<GroupList />} />
            <Route path="/groups/create" element={<GroupCreate />} />
            <Route path="/groups/:id" element={<GroupDetail />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
