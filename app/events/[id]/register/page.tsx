"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import type { Event } from "@/lib/types"
import { Calendar, MapPin, Users, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function EventRegisterPage() {
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRegistering, setIsRegistering] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
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
      if (!user) {
        router.push("/auth/login")
        return
      }

      // Fetch event details
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("id", params.id)
        .single()

      if (eventError) throw eventError
      setEvent(eventData)

      // Check if user is already registered
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
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to fetch event")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async () => {
    setIsRegistering(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Check if event is full
      if (event?.max_capacity && event.current_registrations >= event.max_capacity) {
        throw new Error("Event is full")
      }

      // Register for event
      const { error } = await supabase.from("event_registrations").insert([
        {
          event_id: params.id as string,
          user_id: user.id,
        },
      ])

      if (error) throw error

      setSuccess(true)
      setIsRegistered(true)

      // Refresh event data to get updated registration count
      const { data: updatedEvent } = await supabase.from("events").select("*").eq("id", params.id).single()
      if (updatedEvent) {
        setEvent(updatedEvent)
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to register for event")
    } finally {
      setIsRegistering(false)
    }
  }

  const handleCancelRegistration = async () => {
    if (!confirm("Are you sure you want to cancel your registration for this event?")) {
      return
    }

    setIsRegistering(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase
        .from("event_registrations")
        .delete()
        .eq("event_id", params.id)
        .eq("user_id", user.id)

      if (error) throw error

      setIsRegistered(false)

      // Refresh event data to get updated registration count
      const { data: updatedEvent } = await supabase.from("events").select("*").eq("id", params.id).single()
      if (updatedEvent) {
        setEvent(updatedEvent)
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to cancel registration")
    } finally {
      setIsRegistering(false)
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

  if (error && !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button asChild>
            <Link href="/dashboard">Back to Events</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!event) return null

  const startDate = new Date(event.start_time)
  const isEventPast = new Date(event.end_time) < new Date()
  const isEventFull = event.max_capacity && event.current_registrations >= event.max_capacity

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
          <Link href={`/events/${event.id}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Event
          </Link>
        </Button>

        <div className="max-w-2xl mx-auto">
          {success && (
            <Card className="mb-6 border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-green-800">
                  <CheckCircle className="w-6 h-6" />
                  <div>
                    <h3 className="font-semibold">Registration Successful!</h3>
                    <p className="text-sm">You have been registered for this event.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
                  <CardTitle className="text-2xl text-blue-900 mb-2">{event.title}</CardTitle>
                  <Badge className={getCategoryColor(event.category)}>{event.category}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                {event.max_capacity && (
                  <div className="flex items-center gap-3 md:col-span-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Capacity</p>
                      <p className="text-gray-600 text-sm">
                        {event.current_registrations} / {event.max_capacity} registered
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {event.description && (
                <div>
                  <h3 className="font-semibold mb-2">About This Event</h3>
                  <p className="text-gray-700">{event.description}</p>
                </div>
              )}

              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

              <div className="pt-4 border-t">
                {isEventPast ? (
                  <Button disabled className="w-full">
                    Event Has Ended
                  </Button>
                ) : isRegistered ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">You are registered for this event</span>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleCancelRegistration}
                      disabled={isRegistering}
                      className="w-full bg-transparent"
                    >
                      {isRegistering ? "Canceling..." : "Cancel Registration"}
                    </Button>
                  </div>
                ) : isEventFull ? (
                  <Button disabled className="w-full">
                    Event Full
                  </Button>
                ) : (
                  <Button
                    onClick={handleRegister}
                    disabled={isRegistering}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isRegistering ? "Registering..." : "Register for Event"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
