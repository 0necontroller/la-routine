"use client"

import { useState, useEffect } from "react"
import { startOfWeek, format as formatDate } from "date-fns"
import { CalendarHeader } from "@/components/calendar-header"
import { DayView } from "@/components/day-view"
import { TaskModal } from "@/components/task-modal"
import { RoutineModal } from "@/components/routine-modal"
import { PWAInstall } from "@/components/pwa-install"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Calendar, Wand2 } from "lucide-react"

export default function HomePage() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 8, 1)) // September 2025
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date(2025, 8, 2)) // September 2, 2025
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [currentView, setCurrentView] = useState<"day" | "multi-day" | "week" | "month">("day")
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false)
  const [tasks, setTasks] = useState<any[]>([])
  const [routines, setRoutines] = useState<any[]>([])
  const [activeRoutineId, setActiveRoutineId] = useState<string | undefined>(undefined)
  const [isApplyConfirmOpen, setIsApplyConfirmOpen] = useState(false)

  const getWeekKey = (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 0 })
    return formatDate(start, 'yyyy-MM-dd')
  }

  // Load data from localStorage on component mount and when week changes
  useEffect(() => {
    const weekKey = getWeekKey(currentDate)
    const savedTasks = localStorage.getItem(`routine-planner-tasks-${weekKey}`) || localStorage.getItem('routine-planner-tasks')
    const savedRoutines = localStorage.getItem('routine-planner-routines')
    
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
          ...task,
          date: new Date(task.date)
        }))
        setTasks(parsedTasks)
      } catch (error) {
        console.error('Error loading tasks from localStorage:', error)
      }
    } else {
      // Set default tasks if no saved data
      setTasks([
        {
          id: "1",
          title: "Wake up",
          time: "8:00 AM",
          icon: "☀️",
          completed: false,
          date: new Date(2025, 8, 2), // September 2, 2025
          description: "Major strides in 13h 59m?",
          type: "routine" as const,
        },
        {
          id: "2",
          title: "Go to bed",
          time: "10:00 PM",
          icon: "🌙",
          completed: false,
          date: new Date(2025, 8, 2), // September 2, 2025
          type: "routine" as const,
        },
      ])
    }

    if (savedRoutines) {
      try {
        setRoutines(JSON.parse(savedRoutines))
      } catch (error) {
        console.error('Error loading routines from localStorage:', error)
      }
    }

    const savedActiveRoutine = localStorage.getItem('routine-planner-active-routine')
    if (savedActiveRoutine) {
      setActiveRoutineId(savedActiveRoutine)
    }
  }, [currentDate])

  // Save tasks to localStorage whenever tasks change (scoped to current week)
  useEffect(() => {
    const weekKey = getWeekKey(currentDate)
    localStorage.setItem(`routine-planner-tasks-${weekKey}`, JSON.stringify(tasks))
  }, [tasks, currentDate])

  // Save routines to localStorage whenever routines change
  useEffect(() => {
    if (routines.length > 0) {
      localStorage.setItem('routine-planner-routines', JSON.stringify(routines))
    }
  }, [routines])

  // Save active routine to localStorage whenever it changes
  useEffect(() => {
    if (activeRoutineId) {
      localStorage.setItem('routine-planner-active-routine', activeRoutineId)
    } else {
      localStorage.removeItem('routine-planner-active-routine')
    }
  }, [activeRoutineId])

  // Notifications: ask permission once
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window)) return
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {})
    }
  }, [])

  // Service worker registration (needed for notifications from SW)
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .catch(() => {})
  }, [])

  // Helper: schedule in-tab notifications for today's tasks (when app is open)
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window)) return
    if (Notification.permission !== 'granted') return

    let timers: number[] = []

    const today = new Date()
    const todaysTasks = tasks.filter(t => t.date && new Date(t.date).toDateString() === today.toDateString())

    const postToSW = (title: string, options: NotificationOptions) => {
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'SHOW_NOTIFICATION', title, options })
      } else if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(reg => {
          if (reg.active) {
            reg.active.postMessage({ type: 'SHOW_NOTIFICATION', title, options })
          } else if (Notification.permission === 'granted') {
            // Fallback to direct Notification if SW not ready
            try { new Notification(title, options) } catch {}
          }
        })
      } else if (Notification.permission === 'granted') {
        try { new Notification(title, options) } catch {}
      }
    }

    todaysTasks.forEach(task => {
      // parse start time
      const parseTime = (timeText: string) => {
        const date = new Date()
        const ampmMatch = /(AM|PM)$/i.test(timeText)
        if (ampmMatch) {
          const [time, meridiemRaw] = timeText.split(' ')
          const [hStr, mStr] = time.split(':')
          let hours = parseInt(hStr, 10)
          const minutes = parseInt(mStr, 10)
          const meridiem = meridiemRaw.toUpperCase()
          if (meridiem === 'PM' && hours !== 12) hours += 12
          if (meridiem === 'AM' && hours === 12) hours = 0
          date.setHours(hours, minutes, 0, 0)
          return date
        }
        const [hStr, mStr] = timeText.split(':')
        const hours = parseInt(hStr, 10)
        const minutes = parseInt(mStr, 10)
        date.setHours(hours, minutes, 0, 0)
        return date
      }

      const parseDurationMinutes = (d?: string) => {
        if (!d) return 30
        const dd = d.trim().toLowerCase()
        if (dd.endsWith('hr')) return parseInt(dd, 10) * 60
        if (dd.endsWith('h')) return parseInt(dd, 10) * 60
        if (dd.endsWith('min')) return parseInt(dd, 10)
        if (dd.endsWith('m')) return parseInt(dd, 10)
        return 30
      }

      const startAt = parseTime(task.time)
      const endAt = new Date(startAt.getTime() + parseDurationMinutes((task as any).duration) * 60000)

      const schedule = (when: Date, title: string, body: string) => {
        const delay = when.getTime() - Date.now()
        if (delay > 0 && delay < 24 * 60 * 60 * 1000) {
          const id = window.setTimeout(() => {
            postToSW(title, {
              body,
              icon: '/icon-192.png',
              badge: '/icon-192.png',
            })
          }, delay)
          timers.push(id)
        }
      }

      // 5 minutes before start
      schedule(new Date(startAt.getTime() - 5 * 60 * 1000), `Starting soon: ${task.title}`,
        `${task.time} in 5 minutes • ${(task as any).description || ''}`.trim())

      // At start
      schedule(startAt, `Task starting: ${task.title}`,
        `${task.time} • ${(task as any).description || ''}`.trim())

      // 5 minutes before end
      schedule(new Date(endAt.getTime() - 5 * 60 * 1000), `Ending soon: ${task.title}`,
        `Ends at ${endAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} in 5 minutes`.trim())
    })

    return () => {
      timers.forEach(id => window.clearTimeout(id))
    }
  }, [tasks])

  // Generate routine tasks when selected date or active routine changes
  useEffect(() => {
    if (selectedDate && activeRoutineId && routines.length > 0) {
      const activeRoutine = routines.find(r => r.id === activeRoutineId)
      if (activeRoutine && activeRoutine.activities) {
        const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
        
        // Check if routine should apply to this day
        if (activeRoutine.selectedDays && activeRoutine.selectedDays.includes(dayOfWeek)) {
          // Check if tasks for this routine already exist for this date
          const existingRoutineTasks = tasks.filter(task => 
            task.date && 
            task.date.toDateString() === selectedDate.toDateString() && 
            task.routineId === activeRoutineId
          )
          
          // Only create tasks if they don't already exist
          if (existingRoutineTasks.length === 0) {
            const newRoutineTasks = activeRoutine.activities.map((activity: any) => ({
              id: `${activeRoutineId}-${activity.id}-${selectedDate.toISOString()}`,
              title: activity.title,
              time: activity.time,
              icon: activity.icon,
              completed: false,
              date: new Date(selectedDate),
              type: "routine" as const,
              routineId: activeRoutineId,
              duration: activity.duration,
              description: activity.description || undefined
            }))
            
            setTasks(prevTasks => [...prevTasks, ...newRoutineTasks])
          }
        }
      }
    }
  }, [selectedDate, activeRoutineId, routines])

  const handleAddTask = (task: any) => {
    const newTask = {
      ...task,
      id: Date.now().toString(),
      completed: false,
    }
    setTasks([...tasks, newTask])
    setIsTaskModalOpen(false)
  }

  const handleAddRoutine = (routine: any) => {
    // Save the routine
    const newRoutine = {
      ...routine,
      id: Date.now().toString(),
    }
    setRoutines([...routines, newRoutine])
    setIsRoutineModalOpen(false)
  }

  const handleToggleTask = (taskId: string) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)))
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId))
  }

  const handleEditTask = (taskId: string, updates: Partial<any>) => {
    setTasks(tasks.map(task => task.id === taskId ? { ...task, ...updates } : task))
  }

  const handleDeleteRoutine = (routineId: string) => {
    setRoutines(routines.filter(routine => routine.id !== routineId))
    // Remove all tasks from this routine
    setTasks(tasks.filter(task => task.routineId !== routineId))
    if (activeRoutineId === routineId) {
      setActiveRoutineId(undefined)
    }
  }

  const handleUpdateRoutine = (routineId: string, updatedRoutine: any) => {
    setRoutines(routines.map(routine => 
      routine.id === routineId ? { ...routine, ...updatedRoutine } : routine
    ))
  }

  const handleSetActiveRoutine = (routineId: string) => {
    if (activeRoutineId === routineId) {
      // Deactivating routine - remove all routine tasks
      setTasks(tasks.filter(task => task.routineId !== routineId))
      setActiveRoutineId(undefined)
    } else {
      // Activating routine - the useEffect will handle generating tasks
      setActiveRoutineId(routineId)
    }
  }

  // Test Notification button removed

  const handleApplyRoutineToDate = (date: Date) => {
    if (!activeRoutineId) return
    const activeRoutine = routines.find(r => r.id === activeRoutineId)
    if (!activeRoutine) return

    // Remove all tasks for that day
    const remaining = tasks.filter(t => t.date.toDateString() !== date.toDateString())

    // Create tasks from routine activities (ignore selectedDays; explicit apply)
    const routineTasks = (activeRoutine.activities || []).map((activity: any) => ({
      id: `${activeRoutineId}-${activity.id}-${date.toISOString()}`,
      title: activity.title,
      time: activity.time,
      icon: activity.icon,
      completed: false,
      date: new Date(date),
      type: "routine" as const,
      routineId: activeRoutineId,
      duration: activity.duration,
      description: activity.description || undefined
    }))

    setTasks([...remaining, ...routineTasks])
  }

  return (
    <div className="min-h-screen bg-white">
      <PWAInstall />

      <div className="max-w-7xl mx-auto">
        <CalendarHeader 
          currentDate={currentDate} 
          onDateChange={setCurrentDate}
          currentView={currentView}
          onViewChange={setCurrentView}
          onRoutineClick={() => setIsRoutineModalOpen(true)}
        />

        <div className="md:px-4 mt-4">
          <DayView
            currentDate={currentDate}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTask}
            onApplyRoutineToDate={handleApplyRoutineToDate}
          />
        </div>
      </div>

      {/* Floating Action Button */}
      <Button
        onClick={() => setIsTaskModalOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-orange-400 hover:bg-orange-500 shadow-lg z-40"
        size="icon"
      >
        <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
      </Button>

      {/* Apply Routine FAB */}
      {selectedDate && activeRoutineId && (
        <Button
          onClick={() => setIsApplyConfirmOpen(true)}
          className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-orange-400 hover:bg-orange-500 shadow-lg z-40"
          size="icon"
          title="Apply active routine to selected day"
        >
          <Wand2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        </Button>
      )}

      {/* Confirm Apply Routine */}
      <Dialog open={isApplyConfirmOpen} onOpenChange={setIsApplyConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Apply routine to this day?</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-gray-600">
            This will replace all tasks on the selected day with activities from the active routine.
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" size="sm" onClick={() => setIsApplyConfirmOpen(false)}>Cancel</Button>
            <Button
              size="sm"
              className="bg-orange-500 text-white hover:bg-orange-600"
              onClick={() => {
                if (selectedDate) {
                  handleApplyRoutineToDate(selectedDate)
                }
                setIsApplyConfirmOpen(false)
              }}
            >
              Apply
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleAddTask}
        selectedDate={selectedDate}
        routines={routines}
      />

      <RoutineModal
        isOpen={isRoutineModalOpen}
        onClose={() => setIsRoutineModalOpen(false)}
        onSave={handleAddRoutine}
        onUpdateRoutine={handleUpdateRoutine}
        onDeleteRoutine={handleDeleteRoutine}
        onSetActiveRoutine={handleSetActiveRoutine}
        selectedDate={selectedDate}
        routines={routines}
        activeRoutineId={activeRoutineId}
      />
    </div>
  )
}
