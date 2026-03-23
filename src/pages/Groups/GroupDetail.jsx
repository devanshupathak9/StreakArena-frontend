import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../../api'
import useToast from '../../hooks/useToast'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'

const LeaderboardRow = ({ member, rank, isCurrentUser }) => {
  const rankColors = {
    1: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    2: 'bg-gray-100 text-gray-600 border-gray-200',
    3: 'bg-orange-100 text-orange-700 border-orange-200',
  }
  const rankEmoji = { 1: '🥇', 2: '🥈', 3: '🥉' }

  return (
    <tr className={`border-b border-gray-100 last:border-0 transition-colors ${isCurrentUser ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}>
      <td className="py-3 px-4">
        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold border ${rankColors[rank] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>
          {rankEmoji[rank] || rank}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {member.username?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <span className={`text-sm font-medium ${isCurrentUser ? 'text-indigo-700 font-bold' : 'text-gray-800'}`}>
            {member.username}
            {isCurrentUser && <span className="ml-1 text-xs text-indigo-500">(you)</span>}
          </span>
        </div>
      </td>
      <td className="py-3 px-4 text-center">
        <span className="text-sm font-bold text-orange-500">🔥 {member.current_streak || 0}</span>
      </td>
      <td className="py-3 px-4 text-center text-sm text-gray-600">{member.total_completions || 0}</td>
    </tr>
  )
}

const TaskItem = ({ task, onComplete, completing }) => {
  const isCompleted = task.status === 'completed'
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${isCompleted ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-200 hover:border-indigo-200'}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${isCompleted ? 'bg-emerald-500' : 'bg-gray-100'}`}>
        {isCompleted ? (
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : (
          <div className="w-3 h-3 rounded-full border-2 border-gray-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isCompleted ? 'text-emerald-700 line-through' : 'text-gray-800'}`}>
          {task.name}
        </p>
        <p className="text-xs text-gray-400 capitalize">{task.type || 'manual'}</p>
      </div>
      {task.is_required && (
        <span className="text-xs text-red-500 font-medium flex-shrink-0">Required</span>
      )}
      {!isCompleted && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onComplete(task.id)}
          loading={completing === task.id}
          className="flex-shrink-0 text-indigo-600 text-xs"
        >
          Done
        </Button>
      )}
    </div>
  )
}

const GroupDetail = () => {
  const { id } = useParams()
  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(null)
  const [copySuccess, setCopySuccess] = useState(false)
  const { showSuccess, showError, showInfo } = useToast()

  const fetchGroup = useCallback(async () => {
    try {
      const res = await api.getGroup(id)
      setGroup(res.data?.group || res.data)
    } catch (err) {
      showError('Failed to load group details')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchGroup()
  }, [fetchGroup])

  const handleCompleteTask = async (taskId) => {
    setCompleting(taskId)
    try {
      await api.completeTask(taskId)
      showSuccess('Task completed!')
      await fetchGroup()
    } catch (err) {
      showError('Failed to complete task')
    } finally {
      setCompleting(null)
    }
  }

  const handleCopyInvite = async () => {
    try {
      const res = await api.getInvite(id)
      const token = res.data?.invite_token || res.data?.token
      const inviteUrl = `${window.location.origin}/join/${token}`
      await navigator.clipboard.writeText(inviteUrl)
      setCopySuccess(true)
      showSuccess('Invite link copied to clipboard!')
      setTimeout(() => setCopySuccess(false), 3000)
    } catch (err) {
      showError('Failed to generate invite link')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500 font-medium">Loading group...</p>
        </div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Group not found.</p>
        <Link to="/groups" className="text-indigo-600 hover:underline mt-2 inline-block">Back to groups</Link>
      </div>
    )
  }

  const leaderboard = group.leaderboard || group.members || []
  const tasks = group.tasks || []

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link to="/groups" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Groups
      </Link>

      {/* Group Header */}
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-md">
              <span className="text-3xl font-black text-white">
                {group.name?.charAt(0)?.toUpperCase() || 'G'}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
              {group.description && (
                <p className="text-gray-500 mt-1 text-sm">{group.description}</p>
              )}
              <div className="flex items-center gap-3 mt-2">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {group.member_count || leaderboard.length} members
                </span>
                <span className="text-sm font-bold text-orange-500">
                  🔥 {group.current_streak || 0} day streak
                </span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${group.visibility === 'public' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                  {group.visibility === 'public' ? '🌐 Public' : '🔒 Private'}
                </span>
              </div>
            </div>
          </div>

          <Button
            variant={copySuccess ? 'secondary' : 'outline'}
            size="sm"
            onClick={handleCopyInvite}
            className="flex-shrink-0"
          >
            {copySuccess ? '✓ Copied!' : '🔗 Invite'}
          </Button>
        </div>
      </Card>

      {/* Two-column: Tasks + Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <Card>
          <h2 className="text-base font-bold text-gray-900 mb-4">Today's Tasks</h2>
          {tasks.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No tasks for this group</p>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onComplete={handleCompleteTask}
                  completing={completing}
                />
              ))}
            </div>
          )}
        </Card>

        {/* Leaderboard */}
        <Card padding={false}>
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">Leaderboard</h2>
          </div>
          {leaderboard.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">No members yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    <th className="py-2.5 px-4 text-left w-12">Rank</th>
                    <th className="py-2.5 px-4 text-left">Player</th>
                    <th className="py-2.5 px-4 text-center">Streak</th>
                    <th className="py-2.5 px-4 text-center">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((member, index) => (
                    <LeaderboardRow
                      key={member.id || member.user_id}
                      member={member}
                      rank={index + 1}
                      isCurrentUser={member.is_current_user}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Members */}
      {leaderboard.length > 0 && (
        <Card>
          <h2 className="text-base font-bold text-gray-900 mb-4">Members</h2>
          <div className="flex flex-wrap gap-2">
            {leaderboard.map((member) => (
              <div
                key={member.id || member.user_id}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-200"
              >
                <div className="w-5 h-5 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {member.username?.charAt(0)?.toUpperCase()}
                </div>
                <span className="text-sm text-gray-700 font-medium">{member.username}</span>
                {member.is_admin && <span className="text-xs text-indigo-500 font-semibold">Owner</span>}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

export default GroupDetail
