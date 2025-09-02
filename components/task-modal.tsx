"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { X, Check, Grid3X3, Calendar, Clock, RotateCcw, Plus, Menu, Globe, Code } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: any) => void
  selectedDate: Date | null
  routines: any[]
}

export function TaskModal({ 
  isOpen, 
  onClose, 
  onSave, 
  selectedDate, 
  routines
}: TaskModalProps) {
  const [title, setTitle] = useState("")
  const [startTime, setStartTime] = useState("08:05")
  const [endTime, setEndTime] = useState("08:20")
  const [notes, setNotes] = useState("")
  const [isAllDay, setIsAllDay] = useState(false)
  const [taskType, setTaskType] = useState<"planned" | "inbox">("planned")
  const [selectedDuration, setSelectedDuration] = useState("15m")
  const [customDuration, setCustomDuration] = useState("")
  const [selectedRoutine, setSelectedRoutine] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)

  const durations = ["1m", "15m", "30m", "45m", "1hr"]
  const daysOfWeek = [
    { key: "monday", label: "Mon" },
    { key: "tuesday", label: "Tue" },
    { key: "wednesday", label: "Wed" },
    { key: "thursday", label: "Thu" },
    { key: "friday", label: "Fri" },
    { key: "saturday", label: "Sat" },
    { key: "sunday", label: "Sun" },
  ]
  
  const programmingTemplates = [
    {
      id: "code-review",
      title: "Code Review",
      icon: "👀",
      description: "Review pull requests and provide feedback",
      duration: "30m",
      category: "Development"
    },
    {
      id: "debugging",
      title: "Debugging",
      icon: "🐛",
      description: "Fix bugs and resolve issues",
      duration: "45m",
      category: "Development"
    },
    {
      id: "feature-dev",
      title: "Feature Development",
      icon: "⚡",
      description: "Implement new features and functionality",
      duration: "2hr",
      category: "Development"
    },
    {
      id: "testing",
      title: "Testing",
      icon: "🧪",
      description: "Write and run tests",
      duration: "1hr",
      category: "Quality Assurance"
    },
    {
      id: "documentation",
      title: "Documentation",
      icon: "📚",
      description: "Update documentation and comments",
      duration: "30m",
      category: "Maintenance"
    },
    {
      id: "refactoring",
      title: "Refactoring",
      icon: "🔧",
      description: "Improve code structure and performance",
      duration: "1hr",
      category: "Maintenance"
    },
    {
      id: "learning",
      title: "Learning",
      icon: "🎓",
      description: "Study new technologies and best practices",
      duration: "1hr",
      category: "Growth"
    },
    {
      id: "planning",
      title: "Planning",
      icon: "📋",
      description: "Plan sprints and technical architecture",
      duration: "45m",
      category: "Planning"
    }
  ]

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template)
    setTitle(template.title)
    setNotes(template.description)
    setSelectedDuration(template.duration)
    setCustomDuration("")
  }

  const handleSave = () => {
    if (!title.trim()) return

    const finalDuration = customDuration ? `${customDuration}m` : selectedDuration

    const task = {
      title,
      time: isAllDay ? "All Day" : `${startTime} AM`,
      icon: selectedTemplate?.icon || "⭐",
      date: selectedDate || new Date(),
      description: notes || undefined,
      type: "task" as const,
      duration: finalDuration,
      routineId: selectedRoutine || undefined,
    }

    onSave(task)

    // Reset form
    setTitle("")
    setStartTime("08:05")
    setEndTime("08:20")
    setNotes("")
    setIsAllDay(false)
    setTaskType("planned")
    setSelectedDuration("15m")
    setCustomDuration("")
    setSelectedRoutine("")
    setSelectedTemplate(null)
  }



  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-3xl bg-gray-50 border-0 shadow-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-semibold text-gray-800">
            New Task
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
            {/* Programming Templates */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                  <Code className="h-4 w-4 text-gray-600" />
                </div>
                <h3 className="font-medium text-gray-800">Programming Templates</h3>
              </div>
              <div className="flex gap-3 overflow-x-auto max-w-[320px] md:max-w-2xl pb-2">
                {programmingTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={cn(
                      "flex-shrink-0 w-48 p-3 bg-white rounded-lg border-2 cursor-pointer transition-colors",
                      selectedTemplate?.id === template.id
                        ? "border-orange-400 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{template.icon}</span>
                      <h4 className="font-medium text-sm text-gray-800">{template.title}</h4>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{template.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-orange-400 font-medium">{template.duration}</span>
                      <span className="text-xs text-gray-500">{template.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Task Title */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                <Check className="h-4 w-4 text-gray-600" />
              </div>
              <Input
                placeholder="Task Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1 border-gray-300 focus:border-orange-400 focus:ring-orange-400"
              />
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <div className="w-0 h-0 border-l-4 border-l-gray-400 border-y-4 border-y-transparent"></div>
              </Button>
            </div>

            {/* Routine Selection */}
            {routines.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <select
                    value={selectedRoutine}
                    onChange={(e) => setSelectedRoutine(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-orange-400 focus:ring-orange-400"
                  >
                    <option value="">Select a routine (optional)</option>
                    {routines.map((routine) => (
                      <option key={routine.id} value={routine.id}>
                        {routine.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Task Type */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                <Grid3X3 className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={taskType === "planned" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTaskType("planned")}
                  className={cn(
                    "flex items-center gap-2",
                    taskType === "planned" 
                      ? "bg-orange-400 text-white hover:bg-orange-500" 
                      : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <Calendar className="h-4 w-4" />
                  Planned
                </Button>
                <Button
                  variant={taskType === "inbox" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTaskType("inbox")}
                  className={cn(
                    "flex items-center gap-2",
                    taskType === "inbox" 
                      ? "bg-orange-400 text-white hover:bg-orange-500" 
                      : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <div className="w-4 h-4 bg-gray-400 rounded"></div>
                  Inbox
                </Button>
              </div>
            </div>

          {/* Date Selection */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
              <Calendar className="h-4 w-4 text-gray-600" />
            </div>
            <div className="flex items-center gap-3">
              <Input
                type="date"
                value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")}
                className="w-auto border-gray-300 focus:border-orange-400 focus:ring-orange-400"
                readOnly
              />
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Calendar className="h-4 w-4 text-gray-600" />
              </Button>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="all-day"
                  checked={isAllDay}
                  onChange={(e) => setIsAllDay(e.target.checked)}
                  className="rounded border-gray-300 focus:ring-orange-400"
                />
                <Label htmlFor="all-day" className="text-sm text-gray-600">
                  All-Day
                </Label>
              </div>
            </div>
          </div>

          {/* Time Selection */}
          {!isAllDay && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                <Clock className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex items-center gap-3">
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-auto border-gray-300 focus:border-orange-400 focus:ring-orange-400"
                />
                <span className="text-sm text-gray-500">→</span>
                <Input 
                  type="time" 
                  value={endTime} 
                  onChange={(e) => setEndTime(e.target.value)} 
                  className="w-auto border-gray-300 focus:border-orange-400 focus:ring-orange-400" 
                />
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Globe className="h-4 w-4 text-gray-600" />
                </Button>
              </div>
            </div>
          )}

            {/* Duration Presets */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                <RotateCcw className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex gap-2 flex-wrap">
                {durations.map((duration) => (
                  <Button
                    key={duration}
                    variant={selectedDuration === duration && !customDuration ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSelectedDuration(duration)
                      setCustomDuration("")
                    }}
                    className={cn(
                      "px-3 py-1 text-sm",
                      selectedDuration === duration && !customDuration
                        ? "bg-orange-400 text-white hover:bg-orange-500"
                        : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    {duration}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Duration */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                <Clock className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Custom duration in minutes"
                  value={customDuration}
                  onChange={(e) => {
                    setCustomDuration(e.target.value)
                    setSelectedDuration("")
                  }}
                  className="w-48 border-gray-300 focus:border-orange-400 focus:ring-orange-400"
                />
                <span className="text-sm text-gray-600">minutes</span>
              </div>
            </div>

          {/* Subtask */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
              <Check className="h-4 w-4 text-gray-600" />
            </div>
            <Button variant="ghost" className="text-orange-400 hover:text-orange-500 p-0 h-auto">
              + Add Subtask
            </Button>
          </div>

          {/* Notes */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center mt-1">
              <Menu className="h-4 w-4 text-gray-600" />
            </div>
            <Textarea
              placeholder="Add notes, meeting links or phone numbers..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px] border-gray-300 focus:border-orange-400 focus:ring-orange-400 bg-white"
            />
          </div>

          {/* Create Button */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              className="bg-orange-400 text-white hover:bg-orange-500 px-6"
              disabled={!title.trim()}
            >
              Create Task
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
