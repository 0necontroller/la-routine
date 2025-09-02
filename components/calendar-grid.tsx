"use client"

import { format, startOfWeek, addDays, isSameDay, isSameMonth } from "date-fns"
import { Button } from "@/components/ui/button"
import { TaskItem } from "@/components/task-item"
import { cn } from "@/lib/utils"

interface Task {
  id: string
  title: string
  time: string
  icon: string
  completed: boolean
  date: Date
  description?: string
}

interface CalendarGridProps {
  currentDate: Date
  selectedDate: Date | null
  onDateSelect: (date: Date) => void
  tasks: Task[]
  onToggleTask: (taskId: string) => void
}

export function CalendarGrid({ currentDate, selectedDate, onDateSelect, tasks, onToggleTask }: CalendarGridProps) {
  const startDate = startOfWeek(currentDate, { weekStartsOn: 0 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i))

  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => isSameDay(task.date, date))
  }

  const getTaskIndicators = (date: Date) => {
    const dateTasks = getTasksForDate(date)
    return dateTasks
      .slice(0, 3)
      .map((task, index) => (
        <div
          key={task.id}
          className={cn("w-2 h-2 rounded-full", task.completed ? "bg-muted-foreground" : "bg-primary")}
        />
      ))
  }

  return (
    <div className="space-y-4">
      {/* Week Header */}
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((day) => (
          <div key={day.toISOString()} className="text-center">
            <div className="text-sm text-muted-foreground mb-2">
              {format(day, "EEE")} {format(day, "d")}
            </div>
            <Button
              variant="ghost"
              className={cn(
                "w-full h-16 rounded-lg border-2 border-transparent flex flex-col items-center justify-center gap-1",
                selectedDate && isSameDay(day, selectedDate) && "border-primary bg-primary/10",
                !isSameMonth(day, currentDate) && "opacity-50",
              )}
              onClick={() => onDateSelect(day)}
            >
              <div className="flex gap-1">{getTaskIndicators(day)}</div>
            </Button>
          </div>
        ))}
      </div>

      {/* Selected Day Tasks */}
      {selectedDate && (
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-medium">{format(selectedDate, "EEEE, MMMM d")}</h2>

          <div className="space-y-2">
            {getTasksForDate(selectedDate).map((task) => (
              <TaskItem key={task.id} task={task} onToggle={() => onToggleTask(task.id)} />
            ))}

            {getTasksForDate(selectedDate).length === 0 && (
              <p className="text-muted-foreground text-center py-8">No tasks scheduled for this day</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
