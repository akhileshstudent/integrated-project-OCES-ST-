"use client"

import { EventCard } from "@/components/event-card"
import { PageWrapper } from "@/components/page-wrapper"
import { createClient } from "@/lib/supabase/client"
import type { Event } from "@/lib/types"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function MyEventsPage() {
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchMyEvents()
  }, [])

  const fetchMyEvents = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data, error } = await supabase
        .from("event_registrations")
        .select(
          `
          *,
          events (*)
        `,
        )
        .eq("user_id", user.id)

      if (error) throw error

      const events = data?.map((registration) => registration.events).filter(Boolean) || []
      setRegisteredEvents(events as Event[])
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to fetch your events")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 animate-pulse">Loading your events...</p>
          </div>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-slideInUp">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">My Events</h1>
          <p className="text-gray-600">Events you have registered for</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 animate-slideInUp">
            {error}
          </div>
        )}

        {registeredEvents.length === 0 ? (
          <div className="text-center py-12 animate-fadeIn">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <span className="text-2xl">📅</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No events registered</h3>
              <p className="text-gray-600 mb-6">
                You haven't registered for any events yet. Discover exciting events on campus!
              </p>
              <button
                onClick={() => router.push("/dashboard")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-all duration-200 btn-animate"
              >
                Browse Events
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            {registeredEvents.map((event, index) => (
              <div
                key={event.id}
                className="animate-slideInUp card-hover"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <EventCard event={event} />
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
