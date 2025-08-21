"use client"

import { AttendanceTracker } from "@/components/attendance-tracker"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import type { Event } from "@/lib/types"
import { ArrowLeft, Calendar, MapPin, Users } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function EventAttendancePage() {
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchEvent()
  }, [params.id])

  const fetchEvent = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", params.id)
        .eq("organizer_id", user.id)
        .single()

      if (error) throw error
      setEvent(data)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to fetch event")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event...</p>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-4">{error || "The event you are looking for does not exist."}</p>
          <Button asChild>
            <Link href="/manage/events">Back to Events</Link>
          </Button>
        </div>
      </div>
    )
  }

  const startDate = new Date(event.start_time)
  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/manage/events">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Manage Events
          </Link>
        </Button>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-blue-900">{event.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Date & Time</p>
                    <p className="text-gray-600 text-sm">{formatDateTime(startDate)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-gray-600 text-sm">{event.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Registrations</p>
                    <p className="text-gray-600 text-sm">
                      {event.current_registrations}
                      {event.max_capacity && ` / ${event.max_capacity}`}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <AttendanceTracker eventId={event.id} />
        </div>
      </div>
    </div>
  )
}
