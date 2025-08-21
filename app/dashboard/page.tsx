"use client"

import { EventFilters } from "@/components/event-filters"
import { EventListView } from "@/components/event-list-view"
import { PageWrapper } from "@/components/page-wrapper"
import { createClient } from "@/lib/supabase/client"
import type { Event } from "@/lib/types"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [ongoingEvents, setOngoingEvents] = useState<Event[]>([])
  const [isOngoingExpanded, setIsOngoingExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedDate, setSelectedDate] = useState("")

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAuthAndFetchEvents()
  }, [])

  useEffect(() => {
    filterEvents()
  }, [events, searchQuery, selectedCategory, selectedDate])

  const checkAuthAndFetchEvents = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      await fetchEvents()
    } catch (error) {
      router.push("/auth/login")
    }
  }

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .gte("end_time", new Date().toISOString())
        .order("start_time", { ascending: true })

      if (error) throw error
      setEvents(data || [])

      const now = new Date().toISOString()
      const ongoing = (data || []).filter((event) => event.start_time <= now && event.end_time >= now)
      setOngoingEvents(ongoing)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to fetch events")
    } finally {
      setIsLoading(false)
    }
  }

  const filterEvents = () => {
    let filtered = [...events]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.location.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Category filter
    if (selectedCategory !== "All") {
      filtered = filtered.filter((event) => event.category === selectedCategory)
    }

    // Date filter
    if (selectedDate) {
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.start_time).toDateString()
        const filterDate = new Date(selectedDate).toDateString()
        return eventDate === filterDate
      })
    }

    setFilteredEvents(filtered)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("All")
    setSelectedDate("")
  }

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-gray-600 animate-pulse">Loading events...</p>
          </div>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-slideInUp">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Discover Campus Events</h1>
          <p className="text-gray-600">Find and register for exciting events happening on campus</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 animate-slideInUp">
            {error}
          </div>
        )}

        {ongoingEvents.length > 0 && (
          <div className="mb-6 animate-slideInUp">
            <button
              onClick={() => setIsOngoingExpanded(!isOngoingExpanded)}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-between shadow-lg"
            >
              <span>
                🟢 {ongoingEvents.length} ongoing event{ongoingEvents.length !== 1 ? "s" : ""}
              </span>
              <span className={`transform transition-transform duration-300 ${isOngoingExpanded ? "rotate-180" : ""}`}>
                ▼
              </span>
            </button>

            {isOngoingExpanded && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 animate-slideInDown">
                <div className="space-y-4">
                  {ongoingEvents.map((event) => (
                    <div key={event.id} className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                      <h3 className="font-semibold text-green-800 mb-2">{event.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                        <span>📍 {event.location}</span>
                        <span>
                          👥 {event.current_registrations}/{event.max_capacity}
                        </span>
                        <span>⏰ Until {new Date(event.end_time).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-1 animate-slideInLeft">
            <EventFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              onClearFilters={clearFilters}
            />
          </div>

          <div className="xl:col-span-2 animate-fadeIn">
            <div className="mb-8 flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-1">Available Events</h2>
                <p className="text-gray-600">
                  {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""} found
                </p>
              </div>
              <button
                onClick={fetchEvents}
                className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors duration-200 text-sm font-medium"
              >
                🔄 Refresh
              </button>
            </div>

            <EventListView events={filteredEvents} />
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
