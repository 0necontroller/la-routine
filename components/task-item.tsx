"use client"

import { Button } from "@/components/ui/button"
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

interface TaskItemProps {
  task: Task
  onToggle: () => void
}

export function TaskItem({ task, onToggle }: TaskItemProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-card rounded-lg border">
      <div className="text-sm text-muted-foreground min-w-[60px]">{task.time}</div>

      <div className="flex items-center gap-3 flex-1">
        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-lg">{task.icon}</div>

        <div className="flex-1">
          <h3 className={cn("font-medium", task.completed && "line-through text-muted-foreground")}>{task.title}</h3>
          {task.description && <p className="text-sm text-muted-foreground mt-1">{task.description}</p>}
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="h-6 w-6 rounded-full border-2 border-muted-foreground/30 hover:border-primary"
      >
        {task.completed && <div className="w-3 h-3 bg-primary rounded-full" />}
      </Button>
    </div>
  )
}
