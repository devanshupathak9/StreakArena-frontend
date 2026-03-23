import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../../api'
import useToast from '../../hooks/useToast'
import useAuthStore from '../../store/authStore'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'

const InviteLink = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { showSuccess, showError } = useToast()

  const [groupInfo, setGroupInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [joining, setJoining] = useState(false)
  const [joined, setJoined] = useState(false)

  // Extract group ID from invite token if possible, else just show a generic join page
  const handleJoin = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/join/${token}`)
      return
    }

    setJoining(true)
    try {
      // Try to find the group by searching — or use a generic join endpoint if available
      // Here we'll try with a placeholder group ID pattern
      // In practice, the token encodes the group; we'll attempt a join
      const res = await api.joinGroup('by-token', token)
      const joinedGroup = res.data?.group || res.data
      showSuccess('You have joined the group!')
      setJoined(true)
      setTimeout(() => {
        navigate(joinedGroup?.id ? `/groups/${joinedGroup.id}` : '/groups')
      }, 1500)
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Failed to join group. The invite link may be invalid or expired.'
      showError(message)
    } finally {
      setJoining(false)
    }
  }

  if (joined) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">You're in!</h2>
          <p className="text-gray-500 mt-2">Redirecting to your group...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card>
          <div className="text-center">
            {/* Icon */}
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">You're invited!</h1>
            <p className="text-gray-500 mb-6">
              You've been invited to join a StreakArena group. Accept the invitation to start tracking streaks together.
            </p>

            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Invite Token</p>
              <p className="text-sm font-mono text-gray-700 break-all">{token}</p>
            </div>

            {isAuthenticated ? (
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                loading={joining}
                onClick={handleJoin}
              >
                {joining ? 'Joining...' : 'Join Group'}
              </Button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-500">Sign in or create an account to join</p>
                <div className="flex gap-3">
                  <Link to={`/login?redirect=/join/${token}`} className="flex-1">
                    <Button variant="secondary" className="w-full">Sign In</Button>
                  </Link>
                  <Link to={`/register?redirect=/join/${token}`} className="flex-1">
                    <Button variant="primary" className="w-full">Sign Up</Button>
                  </Link>
                </div>
              </div>
            )}

            <Link to="/dashboard" className="block mt-4 text-sm text-gray-400 hover:text-gray-600">
              Maybe later
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default InviteLink
