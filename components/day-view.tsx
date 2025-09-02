"use client"

import { format, startOfWeek, addDays, isSameDay, isSameMonth } from "date-fns"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TaskItem } from "@/components/task-item"
import { cn } from "@/lib/utils"
import { Wand2, Pencil, Trash2, EllipsisVertical, Check, Undo2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

interface Task {
  id: string
  title: string
  time: string
  icon: string
  completed: boolean
  date: Date
  description?: string
  type: "routine" | "task"
  duration?: string
}

interface DayViewProps {
  currentDate: Date
  selectedDate: Date | null
  onDateSelect: (date: Date) => void
  tasks: Task[]
  onToggleTask: (taskId: string) => void
  onDeleteTask: (taskId: string) => void
  onEditTask: (taskId: string, updates: Partial<Task>) => void
  onApplyRoutineToDate: (date: Date) => void
}

export function DayView({ currentDate, selectedDate, onDateSelect, tasks, onToggleTask, onDeleteTask, onEditTask, onApplyRoutineToDate }: DayViewProps) {
  const startDate = startOfWeek(currentDate, { weekStartsOn: 0 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i))

  const [now, setNow] = useState<Date>(new Date())
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null)
  const [menuTaskId, setMenuTaskId] = useState<string | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editTime, setEditTime] = useState("")
  const [editEndTime, setEditEndTime] = useState("")

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
    }, 1000) // update every second for smoother countdown
    return () => clearInterval(interval)
  }, [])

  const parseTimeToDate = (baseDate: Date, timeText: string): Date => {
    // Supports "8:00 AM" and "08:00"
    const date = new Date(baseDate)
    const ampmMatch = /(AM|PM)$/i.test(timeText)
    if (ampmMatch) {
      const [time, meridiemRaw] = timeText.split(" ")
      const [hStr, mStr] = time.split(":")
      let hours = parseInt(hStr, 10)
      const minutes = parseInt(mStr, 10)
      const meridiem = meridiemRaw.toUpperCase()
      if (meridiem === "PM" && hours !== 12) hours += 12
      if (meridiem === "AM" && hours === 12) hours = 0
      date.setHours(hours, minutes, 0, 0)
      return date
    }
    // 24h format
    const [hStr, mStr] = timeText.split(":")
    const hours = parseInt(hStr, 10)
    const minutes = parseInt(mStr, 10)
    date.setHours(hours, minutes, 0, 0)
    return date
  }

  const getDurationMinutes = (duration?: string): number => {
    if (!duration) return 30
    const d = duration.trim().toLowerCase()
    if (d.endsWith("hr")) return parseInt(d, 10) * 60
    if (d.endsWith("m")) return parseInt(d, 10)
    if (d.endsWith("min")) return parseInt(d, 10)
    if (d.endsWith("h")) return parseInt(d, 10) * 60
    return 30
  }

  const formatRemaining = (end: Date) => {
    const ms = Math.max(end.getTime() - now.getTime(), 0)
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    }
    return `${seconds}s`
  }

  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => isSameDay(task.date, date))
  }

  const getTaskIndicators = (date: Date) => {
    const dateTasks = getTasksForDate(date)
    return dateTasks
      .slice(0, 2)
      .map((task, index) => (
        <div
          key={task.id}
          className={cn(
            "w-3 h-3 rounded-full",
            index === 0 ? "bg-orange-400" : "bg-blue-400"
          )}
        />
      ))
  }

  const getSelectedDayTasks = () => {
    if (!selectedDate) return []
    return getTasksForDate(selectedDate).sort((a, b) => {
      const aStart = parseTimeToDate(selectedDate, a.time)
      const bStart = parseTimeToDate(selectedDate, b.time)
      return aStart.getTime() - bStart.getTime()
    })
  }

  return (
    <div className="space-y-6">
      {/* Week Header */}
      <div className="grid grid-cols-7 gap-2 sm:gap-4 px-2 sm:px-4">
        {weekDays.map((day) => (
          <div key={day.toISOString()} className="text-center">
            <div className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
              {format(day, "EEE")} {format(day, "d")}
            </div>
            <Button
              variant="ghost"
              className={cn(
                "w-full h-16 sm:h-20 rounded-lg border-2 border-transparent flex flex-col items-center justify-center gap-1 sm:gap-2 relative",
                selectedDate && isSameDay(day, selectedDate) && "border-orange-400 bg-orange-50",
                !isSameMonth(day, currentDate) && "opacity-50",
              )}
              onClick={() => onDateSelect(day)}
            >
              <div className="flex gap-0.5 sm:gap-1">{getTaskIndicators(day)}</div>
            </Button>
          </div>
        ))}
      </div>

      {/* Selected Day Timeline */}
      {selectedDate && (
        <div className="px-2 sm:px-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-12 sm:left-16 top-0 bottom-0 w-0.5 border-l-2 border-dashed border-gray-300"></div>
              
              {/* Time markers and tasks */}
              <div className="space-y-6 sm:space-y-8">
                {getSelectedDayTasks().map((task, index) => {
                  const start = selectedDate ? parseTimeToDate(selectedDate, task.time) : null
                  const end = start ? new Date(start.getTime() + getDurationMinutes(task.duration) * 60000) : null
                  const isCurrent = start && end ? now >= start && now <= end : false
                  const progress = start && end ? Math.min(Math.max((now.getTime() - start.getTime()) / (end.getTime() - start.getTime()), 0), 1) : 0
                  const remaining = 1 - progress
                  const sweepDeg = Math.round(remaining * 360)
                  const isPast = end ? now > end : false
                  return (
                  <div key={task.id} className={cn("relative flex items-start gap-3 sm:gap-6", isPast && "opacity-60")}> 
                    {/* Time marker */}
                    <div className={cn("w-16 sm:w-24 text-right text-[11px] sm:text-xs mt-1 font-medium", isPast ? "text-gray-400" : "text-gray-600")}>
                      {task.time}
                      {end && (
                        <span className="text-gray-400"> → {format(end, "h:mm a")}</span>
                      )}
                    </div>
                    
                    {/* Task icon */}
                    <div className="relative z-10">
                      {isCurrent ? (
                        <div
                          className="relative w-10 h-10 sm:w-12 sm:h-12"
                          aria-label="Task in progress"
                          title="Task in progress"
                          onMouseEnter={() => setHoveredTaskId(task.id)}
                          onMouseLeave={() => setHoveredTaskId(null)}
                        >
                          <div
                            className="absolute inset-0 rounded-full"
                            style={{
                              background: `conic-gradient(rgb(244 114 182) ${sweepDeg}deg, rgb(229 231 235) 0deg)`
                            }}
                          />
                          <div className="absolute inset-[3px] sm:inset-1 rounded-full flex items-center justify-center text-white text-xs sm:text-sm"
                            style={{ backgroundColor: task.icon === "☀️" ? "rgb(244 114 182)" : "rgb(96 165 250)" }}
                          >
                            {task.icon}
                          </div>
                          {hoveredTaskId === task.id && end && (
                            <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 text-white text-[10px] px-2 py-1 shadow">
                              {formatRemaining(end)} left
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className={cn(
                          "w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-xs sm:text-sm",
                          task.icon === "☀️" ? "bg-orange-400" : "bg-blue-400",
                          isPast && "opacity-60"
                        )}>
                          {task.icon}
                        </div>
                      )}
                    </div>
                    
                    {/* Task content */}
                    <div className="flex-1 pt-1">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <h3 className={cn(
                          "font-medium text-sm sm:text-base",
                          task.completed ? "text-gray-400 line-through italic" : (isPast ? "text-gray-400" : "text-gray-800")
                        )}>
                          {task.completed && <span className="mr-1">✅</span>}
                          {task.title}
                        </h3>
                        <button
                          onClick={() => onToggleTask(task.id)}
                          className={cn(
                            "w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 transition-colors flex-shrink-0",
                            task.completed 
                              ? "bg-orange-400 border-orange-400" 
                              : "border-gray-300 hover:border-orange-400"
                          )}
                        >
                          {task.completed && (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </button>
                        {/* Actions menu */}
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-gray-500 hover:text-gray-700"
                            onClick={() => setMenuTaskId(menuTaskId === task.id ? null : task.id)}
                            title="Actions"
                          >
                            <EllipsisVertical className="h-4 w-4" />
                          </Button>
                          {menuTaskId === task.id && (
                            <div className="absolute z-50 mt-1 right-0 w-44 rounded-md border border-gray-200 bg-white shadow-md py-1">
                              <button
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                                onClick={() => {
                                  onToggleTask(task.id)
                                  setMenuTaskId(null)
                                }}
                              >
                                {task.completed ? (
                                  <Undo2 className="h-4 w-4 text-gray-600" />
                                ) : (
                                  <Check className="h-4 w-4 text-green-600" />
                                )}
                                <span>{task.completed ? "Mark as incomplete" : "Mark as completed"}</span>
                              </button>
                              <button
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                                onClick={() => {
                                  setEditingTaskId(task.id)
                                  setEditTitle(task.title)
                                  setEditTime(task.time)
                                  // derive end time from current duration
                                  const start = selectedDate ? parseTimeToDate(selectedDate, task.time) : new Date()
                                  const end = new Date(start.getTime() + getDurationMinutes((task as any).duration) * 60000)
                                  setEditEndTime(format(end, 'h:mm a'))
                                  setIsEditOpen(true)
                                  setMenuTaskId(null)
                                }}
                              >
                                <Pencil className="h-4 w-4 text-gray-600" />
                                <span>Edit</span>
                              </button>
                              <button
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                onClick={() => {
                                  onDeleteTask(task.id)
                                  setMenuTaskId(null)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      {task.description && (
                        <p className={cn(
                          "text-xs sm:text-sm mt-1",
                          task.completed ? "text-gray-400 line-through italic" : (isPast ? "text-gray-400" : "text-gray-600")
                        )}>
                          <span className="text-orange-400 font-medium">{task.description.split(" ")[0]} {task.description.split(" ")[1]}</span>
                          <span className="text-gray-500"> {task.description.split(" ").slice(2).join(" ")}</span>
                        </p>
                      )}
                    </div>
                  </div>
                )})}
                {/* Edit Task Dialog */}
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                  <DialogContent className="max-w-sm">
                    <DialogHeader>
                      <DialogTitle>Edit Task</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <Label htmlFor="edit-title" className="text-sm">Title</Label>
                        <Input id="edit-title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Task title" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="edit-time" className="text-sm">Start time</Label>
                        <Input id="edit-time" value={editTime} onChange={(e) => setEditTime(e.target.value)} placeholder="e.g. 8:00 AM or 08:00" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="edit-end-time" className="text-sm">End time</Label>
                        <Input id="edit-end-time" value={editEndTime} onChange={(e) => setEditEndTime(e.target.value)} placeholder="e.g. 8:45 AM or 08:45" />
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" size="sm" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                        <Button
                          size="sm"
                          className="bg-orange-400 text-white hover:bg-orange-500"
                          onClick={() => {
                            if (editingTaskId) {
                              // compute duration from start/end
                              let updates: any = { title: editTitle.trim() || undefined, time: editTime.trim() || undefined }
                              try {
                                const base = selectedDate || new Date()
                                const start = parseTimeToDate(base, editTime.trim())
                                const end = parseTimeToDate(base, editEndTime.trim())
                                let diffMin = Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000))
                                // if negative, assume end is next day
                                if (diffMin <= 0) diffMin = Math.max(1, Math.round(((end.getTime() + 24*60*60000) - start.getTime()) / 60000))
                                // format duration (prefer hours for multiples of 60)
                                updates.duration = diffMin % 60 === 0 ? `${Math.floor(diffMin / 60)}hr` : `${diffMin}m`
                              } catch {}
                              onEditTask(editingTaskId, updates)
                            }
                            setIsEditOpen(false)
                          }}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                {/* Empty state for days with no tasks */}
                {getSelectedDayTasks().length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                    </div>
                    <p className="text-gray-500">No routines scheduled for this day</p>
                    <p className="text-sm text-gray-400 mt-1">Add a routine to get started</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
