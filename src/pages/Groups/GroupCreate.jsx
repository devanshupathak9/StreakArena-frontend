import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../../api'
import useToast from '../../hooks/useToast'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Card from '../../components/common/Card'

const TASK_TYPES = [
  { value: 'manual', label: 'Manual', desc: 'Complete manually each day' },
  { value: 'leetcode', label: 'LeetCode', desc: 'Solve a LeetCode problem' },
  { value: 'github', label: 'GitHub', desc: 'Make a GitHub commit' },
]

const defaultTask = () => ({
  name: '',
  type: 'manual',
  is_required: true,
  config: {},
  _id: Math.random().toString(36).slice(2),
})

const GroupCreate = () => {
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    visibility: 'private',
  })

  const [tasks, setTasks] = useState([defaultTask()])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleTaskChange = (index, field, value) => {
    setTasks((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
    if (errors[`task_${index}_name`]) {
      setErrors((prev) => ({ ...prev, [`task_${index}_name`]: '' }))
    }
  }

  const addTask = () => setTasks((prev) => [...prev, defaultTask()])

  const removeTask = (index) => {
    if (tasks.length === 1) return
    setTasks((prev) => prev.filter((_, i) => i !== index))
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Group name is required'
    } else if (formData.name.length > 100) {
      newErrors.name = 'Group name must be 100 characters or less'
    }
    tasks.forEach((task, i) => {
      if (!task.name.trim()) {
        newErrors[`task_${i}_name`] = 'Task name is required'
      }
    })
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        visibility: formData.visibility,
        tasks: tasks.map(({ _id, ...t }) => ({
          name: t.name.trim(),
          type: t.type,
          is_required: t.is_required,
          config: t.config,
        })),
      }
      const res = await api.createGroup(payload)
      const groupId = res.data?.id || res.data?.group?.id
      showSuccess('Group created successfully!')
      navigate(groupId ? `/groups/${groupId}` : '/groups')
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Failed to create group'
      showError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link to="/groups" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Groups
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create a Group</h1>
        <p className="text-gray-500 mt-1">Set up a new streak group with tasks for your members</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Group Details */}
        <Card>
          <h2 className="text-base font-bold text-gray-900 mb-4">Group Details</h2>
          <div className="space-y-4">
            <Input
              label="Group Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="e.g. Daily Coders"
              required
              maxLength={100}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="What is this group about?"
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow duration-200 placeholder-gray-400 hover:border-gray-400 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
              <div className="flex gap-3">
                {[
                  { value: 'private', label: '🔒 Private', desc: 'Invite-only' },
                  { value: 'public', label: '🌐 Public', desc: 'Anyone can join' },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex-1 flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${formData.visibility === opt.value ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'}`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value={opt.value}
                      checked={formData.visibility === opt.value}
                      onChange={handleChange}
                      className="text-indigo-600"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{opt.label}</p>
                      <p className="text-xs text-gray-500">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Tasks */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Daily Tasks</h2>
              <p className="text-xs text-gray-500 mt-0.5">Members must complete these tasks each day to maintain their streak</p>
            </div>
            <Button type="button" variant="secondary" size="sm" onClick={addTask}>
              + Add Task
            </Button>
          </div>

          <div className="space-y-4">
            {tasks.map((task, index) => (
              <div key={task._id} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700">Task {index + 1}</span>
                  {tasks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTask(index)}
                      className="text-red-400 hover:text-red-600 transition-colors p-1"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Task Name"
                    value={task.name}
                    onChange={(e) => handleTaskChange(index, 'name', e.target.value)}
                    error={errors[`task_${index}_name`]}
                    placeholder="e.g. Solve 1 LeetCode problem"
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
                    <select
                      value={task.type}
                      onChange={(e) => handleTaskChange(index, 'type', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow duration-200 hover:border-gray-400"
                    >
                      {TASK_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label} — {t.desc}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={task.is_required}
                      onChange={(e) => handleTaskChange(index, 'is_required', e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700 font-medium">Required for streak</span>
                    <span className="text-xs text-gray-400">(failure to complete breaks streak)</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Link to="/groups">
            <Button type="button" variant="secondary">Cancel</Button>
          </Link>
          <Button type="submit" loading={loading} disabled={loading} size="lg">
            {loading ? 'Creating...' : 'Create Group'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default GroupCreate
