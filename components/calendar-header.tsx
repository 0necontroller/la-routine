"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Settings } from "lucide-react"
import { format } from "date-fns"

interface CalendarHeaderProps {
  currentDate: Date
  onDateChange: (date: Date) => void
}

export function CalendarHeader({ currentDate, onDateChange }: CalendarHeaderProps) {
  const handlePrevMonth = () => {
    const prevMonth = new Date(currentDate)
    prevMonth.setMonth(currentDate.getMonth() - 1)
    onDateChange(prevMonth)
  }

  const handleNextMonth = () => {
    const nextMonth = new Date(currentDate)
    nextMonth.setMonth(currentDate.getMonth() + 1)
    onDateChange(nextMonth)
  }

  const handleToday = () => {
    onDateChange(new Date())
  }

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-muted rounded border flex items-center justify-center">
            <div className="w-3 h-3 bg-foreground/20 rounded-sm"></div>
          </div>
          <h1 className="text-lg font-medium text-foreground">{format(currentDate, "MMMM yyyy")}</h1>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <ChevronLeft className="h-4 w-4" onClick={handlePrevMonth} />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex bg-muted rounded-lg p-1">
          <Button variant="ghost" size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
            Day
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            Multi-Day
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            Week
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            Month
          </Button>
        </div>

        <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="sm" onClick={handleToday}>
          Today
        </Button>

        <Button variant="ghost" size="icon" onClick={handleNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
