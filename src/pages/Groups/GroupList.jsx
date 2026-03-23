import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api'
import useToast from '../../hooks/useToast'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'

const GroupCard = ({ group }) => (
  <Link to={`/groups/${group.id}`} className="block group">
    <div className="bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-lg">
              {group.name?.charAt(0)?.toUpperCase() || 'G'}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{group.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{group.member_count || 0} members</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-black text-orange-500">🔥 {group.current_streak || 0}</p>
          <p className="text-xs text-gray-400">day streak</p>
        </div>
      </div>

      {group.description && (
        <p className="mt-3 text-sm text-gray-500 line-clamp-2">{group.description}</p>
      )}

      <div className="mt-3 flex items-center gap-3 pt-3 border-t border-gray-100">
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${group.visibility === 'public' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
          {group.visibility === 'public' ? '🌐 Public' : '🔒 Private'}
        </span>
        {group.user_rank && (
          <span className="text-xs text-gray-500">
            Rank #{group.user_rank}
          </span>
        )}
        <span className="ml-auto text-xs text-indigo-600 font-medium group-hover:underline">View →</span>
      </div>
    </div>
  </Link>
)

const GroupList = () => {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const { showError } = useToast()

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await api.getGroups()
        setGroups(res.data?.groups || res.data || [])
      } catch (err) {
        showError('Failed to load groups')
      } finally {
        setLoading(false)
      }
    }
    fetchGroups()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500 font-medium">Loading groups...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Groups</h1>
          <p className="text-gray-500 mt-1">{groups.length} group{groups.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/groups/create">
          <Button variant="primary">
            + Create Group
          </Button>
        </Link>
      </div>

      {/* Groups Grid */}
      {groups.length === 0 ? (
        <Card>
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No groups yet</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Create a group with friends and compete to build the longest streak together.
            </p>
            <Link to="/groups/create">
              <Button variant="primary" size="lg">
                Create your first group
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}
    </div>
  )
}

export default GroupList
