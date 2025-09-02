"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar, ChevronDown } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface CalendarHeaderProps {
  currentDate: Date
  onDateChange: (date: Date) => void
  currentView: "day" | "multi-day" | "week" | "month"
  onViewChange: (view: "day" | "multi-day" | "week" | "month") => void
  onRoutineClick: () => void
}

export function CalendarHeader({ currentDate, onDateChange, currentView, onViewChange, onRoutineClick }: CalendarHeaderProps) {
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

  const views = [
    { key: "day", label: "Day" }
  ] as const

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 px-4 border-b border-gray-200 gap-4">
      {/* Left side - Logo and Month/Year */}
      <div className="flex items-center gap-3">
        <Image 
          src="/icon-512.png"
          alt="Logo"
          width={32}
          height={32}
        />
        <div className="flex items-center gap-1">
          <h1 className="text-lg font-medium text-gray-800">{format(currentDate, "MMMM yyyy")}</h1>
        </div>
      </div>

      {/* Right side - View tabs and navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
        {/* View selection tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1 w-full sm:w-auto">
          {views.map((view) => (
            <Button
              key={view.key}
              variant="ghost"
              size="sm"
              onClick={() => onViewChange(view.key)}
              className={cn(
                "px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium transition-colors flex-1 sm:flex-none",
                currentView === view.key
                  ? "bg-pink-400 text-white hover:bg-pink-500"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
              )}
            >
              {view.label}
            </Button>
          ))}
        </div>

        {/* Navigation controls */}
        <div className="flex items-center gap-1 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </Button>

            <Button variant="ghost" size="sm" onClick={handleToday} className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800">
              Today
            </Button>

            <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8">
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </Button>
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onRoutineClick}
            className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
          >
            <Calendar className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
