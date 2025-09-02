"use client"

import { useState } from "react"
import { CalendarHeader } from "@/components/calendar-header"
import { CalendarGrid } from "@/components/calendar-grid"
import { TaskModal } from "@/components/task-modal"
import { PWAInstall } from "@/components/pwa-install"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function HomePage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [tasks, setTasks] = useState([
    {
      id: "1",
      title: "Wake up",
      time: "8:00 AM",
      icon: "☀️",
      completed: false,
      date: new Date(2025, 8, 2), // September 2, 2025
      description: "Major strides in 13h 59m?",
    },
    {
      id: "2",
      title: "Go to bed",
      time: "10:00 PM",
      icon: "🌙",
      completed: false,
      date: new Date(2025, 8, 2), // September 2, 2025
    },
  ])

  const handleAddTask = (task: any) => {
    const newTask = {
      ...task,
      id: Date.now().toString(),
      completed: false,
    }
    setTasks([...tasks, newTask])
    setIsTaskModalOpen(false)
  }

  const handleToggleTask = (taskId: string) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)))
  }

  return (
    <div className="min-h-screen bg-background">
      <PWAInstall />

      <div className="max-w-6xl mx-auto p-4">
        <CalendarHeader currentDate={currentDate} onDateChange={setCurrentDate} />

        <CalendarGrid
          currentDate={currentDate}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          tasks={tasks}
          onToggleTask={handleToggleTask}
        />
      </div>

      {/* Floating Action Button */}
      <Button
        onClick={() => setIsTaskModalOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleAddTask}
        selectedDate={selectedDate}
      />
    </div>
  )
}
