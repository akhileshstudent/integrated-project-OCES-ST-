"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import type { Event } from "@/lib/types"
import { Search, Calendar, MapPin, Users, Eye, Trash2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export function EventOversight() {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    filterEvents()
  }, [events, searchQuery, categoryFilter, statusFilter])

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase.from("events").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setEvents(data || [])
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to fetch events")
    } finally {
      setIsLoading(false)
    }
  }

  const filterEvents = () => {
    let filtered = [...events]

    if (searchQuery) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.location.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((event) => event.category === categoryFilter)
    }

    if (statusFilter !== "all") {
      const now = new Date()
      if (statusFilter === "upcoming") {
        filtered = filtered.filter((event) => new Date(event.start_time) > now)
      } else if (statusFilter === "ongoing") {
        filtered = filtered.filter((event) => new Date(event.start_time) <= now && new Date(event.end_time) >= now)
      } else if (statusFilter === "past") {
        filtered = filtered.filter((event) => new Date(event.end_time) < now)
      }
    }

    setFilteredEvents(filtered)
  }

  const deleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return
    }

    try {
      const { error } = await supabase.from("events").delete().eq("id", eventId)
      if (error) throw error

      setEvents((prev) => prev.filter((event) => event.id !== eventId))
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to delete event")
    }
  }

  const getEventStatus = (event: Event) => {
    const now = new Date()
    const startTime = new Date(event.start_time)
    const endTime = new Date(event.end_time)

    if (endTime < now) return { status: "Past", color: "bg-gray-100 text-gray-800" }
    if (startTime <= now && endTime >= now) return { status: "Ongoing", color: "bg-green-100 text-green-800" }
    return { status: "Upcoming", color: "bg-blue-100 text-blue-800" }
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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading events...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Event Oversight
        </CardTitle>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Academic">Academic</SelectItem>
              <SelectItem value="Career">Career</SelectItem>
              <SelectItem value="Sports">Sports</SelectItem>
              <SelectItem value="Entertainment">Entertainment</SelectItem>
              <SelectItem value="Social">Social</SelectItem>
              <SelectItem value="Workshop">Workshop</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="past">Past</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        {filteredEvents.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No events found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEvents.map((event) => {
              const eventStatus = getEventStatus(event)
              return (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{event.title}</h3>
                        <Badge className={getCategoryColor(event.category)}>{event.category}</Badge>
                        <Badge className={eventStatus.color}>{eventStatus.status}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(event.start_time).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>
                            {event.current_registrations}
                            {event.max_capacity && ` / ${event.max_capacity}`}
                          </span>
                        </div>
                      </div>
                      {event.description && <p className="text-sm text-gray-600 line-clamp-1">{event.description}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/events/${event.id}`}>
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Link>
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteEvent(event.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
