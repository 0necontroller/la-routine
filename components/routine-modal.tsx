"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { X, Check, Grid3X3, Calendar, Clock, RotateCcw, Plus, Menu, Globe, Sun, Moon, Edit, Star, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface RoutineModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (routine: any) => void
  onUpdateRoutine: (routineId: string, routine: any) => void
  onDeleteRoutine: (routineId: string) => void
  onSetActiveRoutine: (routineId: string) => void
  selectedDate: Date | null
  routines: any[]
  activeRoutineId?: string
}

interface RoutineActivity {
  id: string
  title: string
  time: string
  icon: string
  duration: string
  description?: string
}

export function RoutineModal({ 
  isOpen, 
  onClose, 
  onSave, 
  onUpdateRoutine,
  onDeleteRoutine,
  onSetActiveRoutine,
  selectedDate, 
  routines,
  activeRoutineId
}: RoutineModalProps) {
  const [editingRoutine, setEditingRoutine] = useState<any>(null)
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [routineName, setRoutineName] = useState("")
  const [activities, setActivities] = useState<RoutineActivity[]>([
    { id: "1", title: "Wake up", time: "08:00", icon: "☀️", duration: "15m", description: "" },
    { id: "2", title: "Go to bed", time: "22:00", icon: "🌙", duration: "15m", description: "" }
  ])
  const [selectedDays, setSelectedDays] = useState<string[]>(["monday", "tuesday", "wednesday", "thursday", "friday"])
  const [notes, setNotes] = useState("")

  const daysOfWeek = [
    { key: "monday", label: "Mon" },
    { key: "tuesday", label: "Tue" },
    { key: "wednesday", label: "Wed" },
    { key: "thursday", label: "Thu" },
    { key: "friday", label: "Fri" },
    { key: "saturday", label: "Sat" },
    { key: "sunday", label: "Sun" },
  ]

  const durations = ["5m", "10m", "15m", "30m", "45m", "1hr", "2hr"]

  const handleAddActivity = () => {
    const newActivity: RoutineActivity = {
      id: Date.now().toString(),
      title: "",
      time: "09:00",
      icon: "⭐",
      duration: "15m",
      description: ""
    }
    setActivities([...activities, newActivity])
  }

  const handleUpdateActivity = (id: string, field: keyof RoutineActivity, value: string) => {
    setActivities(activities.map(activity => 
      activity.id === id ? { ...activity, [field]: value } : activity
    ))
  }

  const handleRemoveActivity = (id: string) => {
    setActivities(activities.filter(activity => activity.id !== id))
  }

  const handleSave = () => {
    if (!routineName.trim() || activities.length === 0) return

    const routine = {
      name: routineName,
      activities,
      selectedDays,
      notes: notes || undefined,
      type: "routine" as const,
    }

    onSave(routine)

    // Reset form
    setEditingRoutine(null)
    setIsCreatingNew(false)
    setRoutineName("")
    setActivities([
      { id: "1", title: "Wake up", time: "08:00", icon: "☀️", duration: "15m", description: "" },
      { id: "2", title: "Go to bed", time: "22:00", icon: "🌙", duration: "15m", description: "" }
    ])
    setSelectedDays(["monday", "tuesday", "wednesday", "thursday", "friday"])
    setNotes("")
  }

  const handleEditRoutine = (routine: any) => {
    setEditingRoutine(routine)
    setIsCreatingNew(false)
    setRoutineName(routine.name)
    setActivities(routine.activities || [])
    setSelectedDays(routine.selectedDays || [])
    setNotes(routine.notes || "")
  }

  const handleUpdateRoutine = () => {
    if (!routineName.trim() || activities.length === 0) return

    const updatedRoutine = {
      name: routineName,
      activities,
      selectedDays,
      notes: notes || undefined,
    }

    onUpdateRoutine(editingRoutine.id, updatedRoutine)
    setEditingRoutine(null)
    setIsCreatingNew(false)
    setRoutineName("")
    setActivities([
      { id: "1", title: "Wake up", time: "08:00", icon: "☀️", duration: "15m", description: "" },
      { id: "2", title: "Go to bed", time: "22:00", icon: "🌙", duration: "15m", description: "" }
    ])
    setSelectedDays(["monday", "tuesday", "wednesday", "thursday", "friday"])
    setNotes("")
  }

  const handleCreateNewRoutine = () => {
    setEditingRoutine(null)
    setIsCreatingNew(true)
    setRoutineName("")
    setActivities([
      { id: "1", title: "Wake up", time: "08:00", icon: "☀️", duration: "15m", description: "" },
      { id: "2", title: "Go to bed", time: "22:00", icon: "🌙", duration: "15m", description: "" }
    ])
    setSelectedDays(["monday", "tuesday", "wednesday", "thursday", "friday"])
    setNotes("")
  }

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl bg-gray-50 border-0 shadow-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between pb-4">
          <DialogTitle className="text-lg font-semibold text-gray-800">
            {editingRoutine ? "Edit Routine" : isCreatingNew ? "Create New Routine" : "Routine Manager"}
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {(editingRoutine || isCreatingNew) ? (
          /* Edit/Create Routine Form */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-800">
                {editingRoutine ? "Edit Routine" : "Create New Routine"}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingRoutine(null)
                  setIsCreatingNew(false)
                }}
                className="text-gray-600 hover:text-gray-800"
              >
                Cancel
              </Button>
            </div>

          {/* Routine Name */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
              <Check className="h-4 w-4 text-gray-600" />
            </div>
            <Input
              placeholder="Routine Name (e.g., Morning Routine, Work Day)"
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
              className="flex-1 border-gray-300 focus:border-pink-400 focus:ring-pink-400"
            />
          </div>

          {/* Days Selection */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
              <Calendar className="h-4 w-4 text-gray-600" />
            </div>
            <div className="flex gap-2">
              {daysOfWeek.map((day) => (
                <Button
                  key={day.key}
                  variant={selectedDays.includes(day.key) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleDay(day.key)}
                  className={cn(
                    "px-3 py-1 text-sm",
                    selectedDays.includes(day.key)
                      ? "bg-pink-400 text-white hover:bg-pink-500"
                      : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {day.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Activities */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                <Clock className="h-4 w-4 text-gray-600" />
              </div>
              <h3 className="font-medium text-gray-800">Activities</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddActivity}
                className="text-pink-400 hover:text-pink-500"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Activity
              </Button>
            </div>

            <div className="space-y-3 ml-11">
              {activities.map((activity, index) => (
                <div key={activity.id} className="p-3 bg-white rounded-lg border border-gray-200 space-y-3">
                  {/* Main activity row */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={activity.time}
                        onChange={(e) => handleUpdateActivity(activity.id, "time", e.target.value)}
                        className="w-auto border-gray-300 focus:border-pink-400 focus:ring-pink-400"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <select
                        value={activity.icon}
                        onChange={(e) => handleUpdateActivity(activity.id, "icon", e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:border-pink-400 focus:ring-pink-400"
                      >
                        <option value="☀️">☀️</option>
                        <option value="🌙">🌙</option>
                        <option value="💪">💪</option>
                        <option value="🍳">🍳</option>
                        <option value="🚿">🚿</option>
                        <option value="📚">📚</option>
                        <option value="💼">💼</option>
                        <option value="🏃">🏃</option>
                        <option value="🧘">🧘</option>
                        <option value="⭐">⭐</option>
                      </select>
                    </div>

                    <Input
                      placeholder="Activity name"
                      value={activity.title}
                      onChange={(e) => handleUpdateActivity(activity.id, "title", e.target.value)}
                      className="flex-1 border-gray-300 focus:border-pink-400 focus:ring-pink-400"
                    />

                    <select
                      value={activity.duration}
                      onChange={(e) => handleUpdateActivity(activity.id, "duration", e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm focus:border-pink-400 focus:ring-pink-400"
                    >
                      {durations.map(duration => (
                        <option key={duration} value={duration}>{duration}</option>
                      ))}
                    </select>

                    {activities.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveActivity(activity.id)}
                        className="h-6 w-6 text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Description input field */}
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center mt-1">
                      <Menu className="h-3 w-3 text-gray-500" />
                    </div>
                    <Textarea
                      placeholder="Add description for this activity (optional)"
                      value={activity.description || ""}
                      onChange={(e) => handleUpdateActivity(activity.id, "description", e.target.value)}
                      className="flex-1 min-h-[60px] border-gray-300 focus:border-pink-400 focus:ring-pink-400 bg-white text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center mt-1">
              <Menu className="h-4 w-4 text-gray-600" />
            </div>
            <Textarea
              placeholder="Add notes about your routine..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px] border-gray-300 focus:border-pink-400 focus:ring-pink-400 bg-white"
            />
          </div>

            {/* Create/Update Button */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={editingRoutine ? handleUpdateRoutine : handleSave}
                className="bg-pink-400 text-white hover:bg-pink-500 px-6"
                disabled={!routineName.trim() || activities.some(a => !a.title.trim())}
              >
                {editingRoutine ? "Update Routine" : "Create Routine"}
              </Button>
            </div>
          </div>
        ) : (
          /* Routine List */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-800">Your Routines</h3>
              <Button
                onClick={handleCreateNewRoutine}
                className="bg-pink-400 text-white hover:bg-pink-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Routine
              </Button>
            </div>
            
            {routines.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500">No routines created yet</p>
                <p className="text-sm text-gray-400 mt-1">Create your first routine to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {routines.map((routine) => (
                  <div key={routine.id} className="p-4 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-800">{routine.name}</h4>
                        {activeRoutineId === routine.id && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onSetActiveRoutine(routine.id)}
                          className={cn(
                            "h-8 w-8",
                            activeRoutineId === routine.id
                              ? "text-yellow-500 hover:text-yellow-600"
                              : "text-gray-400 hover:text-yellow-500"
                          )}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditRoutine(routine)}
                          className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteRoutine(routine.id)}
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {routine.activities?.map((activity: any, index: number) => (
                        <div key={index} className="space-y-1">
                          <div className="flex items-center gap-3 text-sm">
                            <span className="text-gray-600">{activity.time}</span>
                            <span className="text-lg">{activity.icon}</span>
                            <span className="text-gray-800">{activity.title}</span>
                            <span className="text-gray-500">({activity.duration})</span>
                          </div>
                          {activity.description && (
                            <div className="ml-8 text-xs text-gray-500 italic">
                              {activity.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex flex-wrap gap-1">
                        {routine.selectedDays?.map((day: string) => (
                          <span key={day} className="px-2 py-1 bg-pink-100 text-pink-600 text-xs rounded">
                            {day.charAt(0).toUpperCase() + day.slice(1)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
