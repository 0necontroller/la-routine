"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import { format } from "date-fns"

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: any) => void
  selectedDate: Date | null
}

export function TaskModal({ isOpen, onClose, onSave, selectedDate }: TaskModalProps) {
  const [title, setTitle] = useState("")
  const [startTime, setStartTime] = useState("08:05")
  const [endTime, setEndTime] = useState("08:20")
  const [notes, setNotes] = useState("")
  const [isAllDay, setIsAllDay] = useState(false)

  const handleSave = () => {
    if (!title.trim()) return

    const task = {
      title,
      time: isAllDay ? "All Day" : `${startTime} AM`,
      icon: "⭐",
      date: selectedDate || new Date(),
      description: notes || undefined,
    }

    onSave(task)

    // Reset form
    setTitle("")
    setStartTime("08:05")
    setEndTime("08:20")
    setNotes("")
    setIsAllDay(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-medium">
            New <span className="text-primary">Task</span>
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">⭐</div>
            <Input
              placeholder="Task Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1"
            />
            <div className="w-4 h-4 bg-primary rounded-full"></div>
          </div>

          <div className="flex gap-2">
            <Button
              variant={!isAllDay ? "default" : "outline"}
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Planned
            </Button>
            <Button variant="outline" size="sm">
              Inbox
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm">📅</Label>
              <Input
                type="date"
                value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")}
                className="w-auto"
                readOnly
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="all-day"
                checked={isAllDay}
                onChange={(e) => setIsAllDay(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="all-day" className="text-sm">
                All-Day
              </Label>
            </div>
          </div>

          {!isAllDay && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label className="text-sm">🕐</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-auto"
                />
                <span className="text-sm text-muted-foreground">→</span>
                <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-auto" />
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              1m
            </Button>
            <Button variant="default" size="sm" className="bg-primary text-primary-foreground">
              15m
            </Button>
            <Button variant="outline" size="sm">
              30m
            </Button>
            <Button variant="outline" size="sm">
              45m
            </Button>
            <Button variant="outline" size="sm">
              1hr
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">🔄 Once</Label>
            <Button variant="outline" className="w-full justify-start text-left bg-transparent">
              Once
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-primary">+ Add Subtask</Label>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">📝</Label>
            <Textarea
              placeholder="Add notes, meeting links or phone numbers..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <Button
            onClick={handleSave}
            className="w-full bg-muted text-muted-foreground hover:bg-muted/80"
            disabled={!title.trim()}
          >
            Create Task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
