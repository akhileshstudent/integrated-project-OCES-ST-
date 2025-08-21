"use client"

import { Button } from "@/components/ui/button"
import { EventCard } from "@/components/event-card"
import { createClient } from "@/lib/supabase/client"
import type { Event } from "@/lib/types"
import { Plus } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function ManageEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
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
        .eq("organizer_id", user.id)
        .order("start_time", { ascending: true })

      if (error) throw error
      setEvents(data || [])
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to fetch events")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return
    }

    try {
      const { error } = await supabase.from("events").delete().eq("id", eventId)
      if (error) throw error

      setEvents(events.filter((event) => event.id !== eventId))
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to delete event")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your events...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">Manage Events</h1>
            <p className="text-gray-600 mt-2">Create and manage your campus events</p>
          </div>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/manage/events/create">
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Link>
          </Button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

        {events.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No events yet</h3>
              <p className="text-gray-600 mb-6">
                Get started by creating your first campus event. Share knowledge, build community, and engage students.
              </p>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/manage/events/create">Create Your First Event</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} showManageButtons={true} onDelete={handleDeleteEvent} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
