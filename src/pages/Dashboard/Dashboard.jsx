import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api'
import useAuthStore from '../../store/authStore'
import useToast from '../../hooks/useToast'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import StreakCalendar from './StreakCalendar'

const StatBadge = ({ icon, label, value, color = 'indigo' }) => {
  const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    orange: 'bg-orange-50 text-orange-700 border-orange-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
  }
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${colorMap[color]}`}>
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-2xl font-bold leading-none">{value ?? '—'}</p>
        <p className="text-xs font-medium opacity-70 mt-0.5">{label}</p>
      </div>
    </div>
  )
}

const TaskItem = ({ task, onComplete, completing }) => {
  const isCompleted = task.status === 'completed'
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${isCompleted ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-200 hover:border-indigo-200 hover:shadow-sm'}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isCompleted ? 'bg-emerald-500' : 'bg-gray-100'}`}>
        {isCompleted ? (
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isCompleted ? 'text-emerald-800 line-through' : 'text-gray-800'}`}>
          {task.name}
        </p>
        {task.group_name && (
          <p className="text-xs text-gray-500 mt-0.5">{task.group_name}</p>
        )}
      </div>
      {!isCompleted && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onComplete(task.id)}
          loading={completing === task.id}
          className="flex-shrink-0 text-indigo-600 hover:bg-indigo-50 text-xs px-3 py-1.5"
        >
          Complete
        </Button>
      )}
      {isCompleted && (
        <span className="text-xs font-medium text-emerald-600 flex-shrink-0">Done</span>
      )}
    </div>
  )
}

const GroupItem = ({ group }) => (
  <Link
    to={`/groups/${group.id}`}
    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-indigo-200 hover:shadow-sm hover:bg-indigo-50/30 transition-all duration-200"
  >
    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
      <span className="text-white font-bold text-sm">
        {group.name?.charAt(0)?.toUpperCase() || 'G'}
      </span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-800 truncate">{group.name}</p>
      <p className="text-xs text-gray-500">{group.member_count || 0} members</p>
    </div>
    <div className="text-right flex-shrink-0">
      <p className="text-sm font-bold text-orange-500 flex items-center gap-1">
        🔥 {group.current_streak || 0}
      </p>
      <p className="text-xs text-gray-400">streak</p>
    </div>
  </Link>
)

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(null)
  const { user } = useAuthStore()
  const { showSuccess, showError } = useToast()

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await api.getDashboard()
      setDashboardData(res.data)
    } catch (err) {
      showError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [showError])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  const handleCompleteTask = async (taskId) => {
    setCompleting(taskId)
    try {
      await api.completeTask(taskId)
      showSuccess('Task marked as complete!')
      await fetchDashboard()
    } catch (err) {
      showError('Failed to complete task. Please try again.')
    } finally {
      setCompleting(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const stats = dashboardData?.stats || dashboardData?.streak_stats || {}
  const todaysTasks = dashboardData?.todays_tasks || dashboardData?.tasks || []
  const groups = dashboardData?.groups || []
  const streakCalendar = dashboardData?.streak_calendar || dashboardData?.calendar || {}
  const username = user?.username || dashboardData?.user?.username || 'there'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, <span className="text-indigo-600">{username}</span>! 👋
          </h1>
          <p className="text-gray-500 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link to="/groups/create">
          <Button variant="primary" size="sm">
            + New Group
          </Button>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBadge icon="🔥" label="Current Streak" value={stats.current_streak ?? 0} color="orange" />
        <StatBadge icon="🏆" label="Longest Streak" value={stats.longest_streak ?? 0} color="purple" />
        <StatBadge icon="✅" label="Total Completed" value={stats.total_completed ?? 0} color="emerald" />
        <StatBadge icon="👥" label="Groups" value={groups.length} color="indigo" />
      </div>

      {/* Streak Calendar */}
      <Card>
        <h2 className="text-base font-bold text-gray-900 mb-4">Streak Calendar</h2>
        <StreakCalendar streakCalendar={streakCalendar} />
      </Card>

      {/* Two-column layout for tasks and groups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Today's Tasks</h2>
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">
              {todaysTasks.filter((t) => t.status === 'completed').length}/{todaysTasks.length} done
            </span>
          </div>

          {todaysTasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">No tasks for today</p>
              <p className="text-gray-400 text-xs mt-1">Join a group to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todaysTasks.map((task) => (
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

        {/* Groups */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Your Groups</h2>
            <Link to="/groups" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
              View all →
            </Link>
          </div>

          {groups.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">No groups yet</p>
              <Link to="/groups/create" className="text-indigo-600 text-xs font-medium hover:text-indigo-700 mt-1 inline-block">
                Create your first group
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {groups.slice(0, 5).map((group) => (
                <GroupItem key={group.id} group={group} />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
