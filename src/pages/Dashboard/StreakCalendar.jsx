import { useState, useMemo } from 'react'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const getCellStyle = (status) => {
  if (status === 'completed') return 'bg-emerald-500 hover:bg-emerald-400'
  if (status === 'missed') return 'bg-red-100 hover:bg-red-200'
  return 'bg-gray-100 hover:bg-gray-200'
}

const formatDateKey = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const StreakCalendar = ({ streakCalendar = {} }) => {
  const [tooltip, setTooltip] = useState(null)

  // Build 84-day grid (12 weeks, 7 days each, Sunday-first)
  const grid = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Go back to find the start of the week 12 weeks ago
    const startDay = new Date(today)
    startDay.setDate(today.getDate() - 83) // 84 days total

    // Align to Sunday (go back to Sunday before startDay)
    const dayOfWeek = startDay.getDay()
    startDay.setDate(startDay.getDate() - dayOfWeek)

    // Build columns (weeks)
    const columns = []
    const monthLabels = []
    const cursor = new Date(startDay)

    while (cursor <= today || columns.length < 12) {
      const week = []
      let monthLabel = null

      for (let d = 0; d < 7; d++) {
        const date = new Date(cursor)
        const dateKey = formatDateKey(date)
        const isFuture = date > today

        // Month label on first day of month
        if (date.getDate() === 1 && columns.length > 0) {
          monthLabel = MONTHS[date.getMonth()]
        }

        week.push({
          date,
          dateKey,
          status: isFuture ? 'future' : (streakCalendar[dateKey] || 'no-data'),
          isFuture,
        })
        cursor.setDate(cursor.getDate() + 1)
      }

      columns.push({ week, monthLabel })
      if (columns.length >= 13) break
    }

    return columns
  }, [streakCalendar])

  const totalCompleted = useMemo(() => {
    return Object.values(streakCalendar).filter((s) => s === 'completed').length
  }, [streakCalendar])

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Activity</h3>
        <span className="text-xs text-gray-500">{totalCompleted} completions in last 12 weeks</span>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="inline-flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-1 mr-1">
            <div className="h-4" /> {/* spacer for month labels */}
            {DAYS.map((day, i) => (
              <div
                key={day}
                className={`w-3 h-3 flex items-center text-[9px] text-gray-400 ${i % 2 === 1 ? '' : 'invisible'}`}
              >
                {day.slice(0, 1)}
              </div>
            ))}
          </div>

          {/* Calendar columns */}
          {grid.map((col, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-1">
              {/* Month label */}
              <div className="h-4 flex items-center">
                {col.monthLabel && (
                  <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">
                    {col.monthLabel}
                  </span>
                )}
              </div>

              {/* Day cells */}
              {col.week.map((cell, rowIdx) => (
                <div
                  key={rowIdx}
                  className={`
                    w-3 h-3 rounded-sm cursor-pointer transition-all duration-150 relative
                    ${cell.isFuture
                      ? 'bg-gray-50 cursor-default'
                      : getCellStyle(cell.status)
                    }
                  `}
                  onMouseEnter={(e) => {
                    if (!cell.isFuture) {
                      const rect = e.currentTarget.getBoundingClientRect()
                      setTooltip({
                        dateKey: cell.dateKey,
                        status: cell.status,
                        x: rect.left + rect.width / 2,
                        y: rect.top - 8,
                      })
                    }
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-3">
        <span className="text-xs text-gray-500">Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-gray-100" />
          <div className="w-3 h-3 rounded-sm bg-emerald-200" />
          <div className="w-3 h-3 rounded-sm bg-emerald-400" />
          <div className="w-3 h-3 rounded-sm bg-emerald-500" />
          <div className="w-3 h-3 rounded-sm bg-emerald-700" />
        </div>
        <span className="text-xs text-gray-500">More</span>
        <div className="flex items-center gap-1 ml-2">
          <div className="w-3 h-3 rounded-sm bg-red-100" />
          <span className="text-xs text-gray-500">Missed</span>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-lg shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full whitespace-nowrap"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="font-medium">{tooltip.dateKey}</div>
          <div className={`capitalize ${tooltip.status === 'completed' ? 'text-emerald-400' : tooltip.status === 'missed' ? 'text-red-400' : 'text-gray-400'}`}>
            {tooltip.status === 'no-data' ? 'No data' : tooltip.status}
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  )
}

export default StreakCalendar
