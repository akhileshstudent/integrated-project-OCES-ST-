"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Event } from "@/lib/types"
import { Calendar, MapPin, Users, UserCheck } from "lucide-react"
import Link from "next/link"

interface EventCardProps {
  event: Event
  showManageButtons?: boolean
  onDelete?: (eventId: string) => void
}

export function EventCard({ event, showManageButtons = false, onDelete }: EventCardProps) {
  const startDate = new Date(event.start_time)
  const endDate = new Date(event.end_time)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      Academic: "bg-blue-100 text-blue-800",
      Career: "bg-green-100 text-green-800",
      Sports: "bg-orange-100 text-orange-800",
      Entertainment: "bg-purple-100 text-purple-800",
      Social: "bg-pink-100 text-pink-800",
      Workshop: "bg-yellow-100 text-yellow-800",
      Other: "bg-gray-100 text-gray-800",
    }
    return colors[category as keyof typeof colors] || colors.Other
  }

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      {event.image_url && (
        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
          <img src={event.image_url || "/placeholder.svg"} alt={event.title} className="w-full h-full object-cover" />
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
          <Badge className={getCategoryColor(event.category)}>{event.category}</Badge>
        </div>
        {event.description && <CardDescription className="line-clamp-2">{event.description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>
            {formatDate(startDate)} at {formatTime(startDate)}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{event.location}</span>
        </div>

        {event.max_capacity && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>
              {event.current_registrations} / {event.max_capacity} registered
            </span>
          </div>
        )}

        {showManageButtons ? (
          <div className="flex gap-2 pt-2">
            <Button asChild size="sm" variant="outline">
              <Link href={`/manage/events/${event.id}/edit`}>Edit</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href={`/manage/events/${event.id}/attendance`}>
                <UserCheck className="w-4 h-4 mr-1" />
                Attendance
              </Link>
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onDelete?.(event.id)}>
              Delete
            </Button>
          </div>
        ) : (
          <Button asChild className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
            <Link href={`/events/${event.id}`}>View Details</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
