import { useState, useEffect } from 'react'
import { api } from '../../api'
import useAuth from '../../hooks/useAuth'
import useToast from '../../hooks/useToast'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'

const StatCard = ({ label, value, icon, color = 'indigo' }) => {
  const colorMap = {
    indigo: 'text-indigo-600 bg-indigo-50',
    orange: 'text-orange-600 bg-orange-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    purple: 'text-purple-600 bg-purple-50',
  }
  return (
    <div className="text-center p-4">
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${colorMap[color]} mb-3`}>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
      <p className="text-xs text-gray-500 mt-1 font-medium">{label}</p>
    </div>
  )
}

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
    <span className="text-sm text-gray-500 font-medium">{label}</span>
    <span className="text-sm text-gray-900 font-semibold">{value || '—'}</span>
  </div>
)

const Profile = () => {
  const [userData, setUserData] = useState(null)
  const [dashData, setDashData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { logout } = useAuth()
  const { showError } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meRes, dashRes] = await Promise.allSettled([
          api.getMe(),
          api.getDashboard(),
        ])
        if (meRes.status === 'fulfilled') {
          setUserData(meRes.value.data)
        }
        if (dashRes.status === 'fulfilled') {
          setDashData(dashRes.value.data)
        }
      } catch (err) {
        showError('Failed to load profile data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500 font-medium">Loading profile...</p>
        </div>
      </div>
    )
  }

  const user = userData || {}
  const stats = dashData?.stats || dashData?.streak_stats || {}
  const groups = dashData?.groups || []
  const todaysTasks = dashData?.todays_tasks || dashData?.tasks || []
  const joinedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  const avatarLetter = user.username?.charAt(0)?.toUpperCase() || '?'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <span className="text-3xl font-bold text-white">{avatarLetter}</span>
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{user.username || 'User'}</h1>
            <p className="text-gray-500 mt-0.5">{user.email || ''}</p>
            {joinedDate && (
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Member since {joinedDate}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Streak Stats */}
      <Card>
        <h2 className="text-base font-bold text-gray-900 mb-4">Streak Stats</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 divide-x divide-gray-100">
          <StatCard icon="🔥" label="Current Streak" value={stats.current_streak ?? 0} color="orange" />
          <StatCard icon="🏆" label="Longest Streak" value={stats.longest_streak ?? 0} color="purple" />
          <StatCard icon="✅" label="Total Completed" value={stats.total_completed ?? 0} color="emerald" />
          <StatCard icon="👥" label="Groups" value={groups.length} color="indigo" />
        </div>
      </Card>

      {/* Account Info */}
      <Card>
        <h2 className="text-base font-bold text-gray-900 mb-2">Account Information</h2>
        <div>
          <InfoRow label="Username" value={user.username} />
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Member Since" value={joinedDate} />
          <InfoRow label="Today's Tasks" value={`${todaysTasks.filter((t) => t.status === 'completed').length} / ${todaysTasks.length} completed`} />
          <InfoRow label="Active Groups" value={groups.length} />
        </div>
      </Card>

      {/* Groups Table */}
      {groups.length > 0 && (
        <Card>
          <h2 className="text-base font-bold text-gray-900 mb-4">Group Streaks</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                  <th className="pb-3 pr-4">Group</th>
                  <th className="pb-3 pr-4 text-center">Current Streak</th>
                  <th className="pb-3 text-center">Members</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {groups.map((group) => (
                  <tr key={group.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">
                            {group.name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-gray-800">{group.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-center">
                      <span className="inline-flex items-center gap-1 text-orange-600 font-bold">
                        🔥 {group.current_streak || 0}
                      </span>
                    </td>
                    <td className="py-3 text-center text-gray-600">{group.member_count || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Account Actions */}
      <Card>
        <h2 className="text-base font-bold text-gray-900 mb-4">Account</h2>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
            <div>
              <p className="text-sm font-semibold text-red-800">Sign out</p>
              <p className="text-xs text-red-600 mt-0.5">Sign out of your account on this device</p>
            </div>
            <Button variant="danger" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default Profile
