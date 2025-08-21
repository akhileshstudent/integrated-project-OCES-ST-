"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EventActions } from "@/components/event-actions"
import { createClient } from "@/lib/supabase/client"
import type { Event } from "@/lib/types"
import { Calendar, MapPin, Users, Clock, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function EventDetailPage() {
  const [event, setEvent] = useState<Event | null>(null)
  const [isRegistered, setIsRegistered] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchEventAndCheckRegistration()
  }, [params.id])

  const fetchEventAndCheckRegistration = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      // Fetch event details
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("id", params.id)
        .single()

      if (eventError) throw eventError
      setEvent(eventData)

      // Check if user is registered (only if authenticated)
      if (user) {
        const { data: registrationData, error: registrationError } = await supabase
          .from("event_registrations")
          .select("*")
          .eq("event_id", params.id)
          .eq("user_id", user.id)
          .single()

        if (registrationError && registrationError.code !== "PGRST116") {
          throw registrationError
        }

        setIsRegistered(!!registrationData)
      }
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
            <Link href="/dashboard">Back to Events</Link>
          </Button>
        </div>
      </div>
    )
  }

  const startDate = new Date(event.start_time)
  const endDate = new Date(event.end_time)
  const isEventPast = endDate < new Date()

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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              {event.image_url && (
                <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                  <img
                    src={event.image_url || "/placeholder.svg"}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-3xl text-blue-900 mb-2">{event.title}</CardTitle>
                    <Badge className={getCategoryColor(event.category)}>{event.category}</Badge>
                  </div>
                </div>
                <div className="pt-4">
                  <EventActions
                    eventId={event.id}
                    eventTitle={event.title}
                    eventDate={event.start_time}
                    eventLocation={event.location}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {event.description && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">About This Event</h3>
                    <p className="text-gray-700 leading-relaxed">{event.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Start Time</p>
                    <p className="text-gray-600">{formatDateTime(startDate)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium">End Time</p>
                    <p className="text-gray-600">{formatDateTime(endDate)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-gray-600">{event.location}</p>
                  </div>
                </div>

                {event.max_capacity && (
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Capacity</p>
                      <p className="text-gray-600">
                        {event.current_registrations} / {event.max_capacity} registered
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                {isEventPast ? (
                  <Button disabled className="w-full">
                    Event Has Ended
                  </Button>
                ) : isRegistered ? (
                  <div className="space-y-2">
                    <Button disabled className="w-full bg-green-600">
                      ✓ Registered
                    </Button>
                    <Button asChild variant="outline" className="w-full bg-transparent">
                      <Link href={`/events/${event.id}/register`}>Manage Registration</Link>
                    </Button>
                  </div>
                ) : event.max_capacity && event.current_registrations >= event.max_capacity ? (
                  <Button disabled className="w-full">
                    Event Full
                  </Button>
                ) : (
                  <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                    <Link href={`/events/${event.id}/register`}>Register for Event</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
