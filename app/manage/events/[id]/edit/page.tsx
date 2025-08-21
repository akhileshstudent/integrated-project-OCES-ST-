"use client"

import { EventForm } from "@/components/event-form"
import { createClient } from "@/lib/supabase/client"
import type { Event } from "@/lib/types"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function EditEventPage() {
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
          <button onClick={() => router.back()} className="text-blue-600 hover:text-blue-800 underline">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <EventForm event={event} mode="edit" />
      </div>
    </div>
  )
}
