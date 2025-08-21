"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Event } from "@/lib/types"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface EventCalendarViewProps {
  events: Event[]
}

export function EventCalendarView({ events }: EventCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.start_time)
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })

  const days = []
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{monthName}</CardTitle>
          <div className="flex gap-2">
            <button
              onClick={() => navigateMonth("prev")}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigateMonth("next")}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-4">
          {dayNames.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            if (!day) {
              return <div key={index} className="p-2 h-24"></div>
            }

            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            const dayEvents = getEventsForDate(date)
            const isToday = date.toDateString() === new Date().toDateString()

            return (
              <div
                key={day}
                className={`p-1 h-24 border border-gray-200 rounded-md ${
                  isToday ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                }`}
              >
                <div className={`text-sm font-medium mb-1 ${isToday ? "text-blue-600" : "text-gray-900"}`}>{day}</div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <Link key={event.id} href={`/events/${event.id}`}>
                      <div className="text-xs p-1 bg-blue-100 text-blue-800 rounded truncate hover:bg-blue-200 transition-colors">
                        {event.title}
                      </div>
                    </Link>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gray-500 px-1">+{dayEvents.length - 2} more</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
