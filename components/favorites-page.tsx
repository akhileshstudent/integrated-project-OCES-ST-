"use client"

import { EventCard } from "@/components/event-card"
import { Navigation } from "@/components/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Event } from "@/lib/types"
import { Heart } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function FavoritesPage() {
  const [favoriteEvents, setFavoriteEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchFavoriteEvents()
  }, [])

  const fetchFavoriteEvents = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data, error } = await supabase
        .from("event_favorites")
        .select(
          `
          *,
          events (*)
        `,
        )
        .eq("user_id", user.id)

      if (error) throw error

      const events = data?.map((favorite) => favorite.events).filter(Boolean) || []
      setFavoriteEvents(events as Event[])
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to fetch favorite events")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation currentView="list" onViewChange={() => {}} />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your favorite events...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentView="list" onViewChange={() => {}} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2 flex items-center gap-2">
            <Heart className="w-8 h-8 text-red-500" />
            Favorite Events
          </h1>
          <p className="text-gray-600">Events you've saved for later</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

        {favoriteEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Heart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No favorite events yet</h3>
              <p className="text-gray-600 mb-6">
                Start exploring events and click the heart icon to save them to your favorites!
              </p>
              <button
                onClick={() => router.push("/dashboard")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
              >
                Browse Events
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
