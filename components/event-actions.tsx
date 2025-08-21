"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Heart, Share2, Calendar, Download } from "lucide-react"
import { useEffect, useState } from "react"

interface EventActionsProps {
  eventId: string
  eventTitle: string
  eventDate: string
  eventLocation: string
}

export function EventActions({ eventId, eventTitle, eventDate, eventLocation }: EventActionsProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    checkFavoriteStatus()
  }, [eventId])

  const checkFavoriteStatus = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("event_favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("event_id", eventId)
        .single()

      if (error && error.code !== "PGRST116") throw error
      setIsFavorited(!!data)
    } catch (error) {
      // Handle error silently
    }
  }

  const toggleFavorite = async () => {
    setIsLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      if (isFavorited) {
        const { error } = await supabase.from("event_favorites").delete().eq("user_id", user.id).eq("event_id", eventId)
        if (error) throw error
        setIsFavorited(false)
      } else {
        const { error } = await supabase.from("event_favorites").insert([{ user_id: user.id, event_id: eventId }])
        if (error) throw error
        setIsFavorited(true)
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const shareEvent = async () => {
    const shareData = {
      title: eventTitle,
      text: `Check out this event: ${eventTitle}`,
      url: `${window.location.origin}/events/${eventId}`,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareData.url)
        alert("Event link copied to clipboard!")
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(shareData.url)
      alert("Event link copied to clipboard!")
    }
  }

  const addToCalendar = () => {
    const startDate = new Date(eventDate)
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000) // Assume 2 hour duration

    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
    }

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      eventTitle,
    )}&dates=${formatDate(startDate)}/${formatDate(endDate)}&location=${encodeURIComponent(
      eventLocation,
    )}&details=${encodeURIComponent(`Event: ${eventTitle}\nLocation: ${eventLocation}`)}`

    window.open(calendarUrl, "_blank")
  }

  const downloadICS = () => {
    const startDate = new Date(eventDate)
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000)

    const formatICSDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
    }

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Campus Events//EN
BEGIN:VEVENT
UID:${eventId}@campusevents.com
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:${eventTitle}
LOCATION:${eventLocation}
DESCRIPTION:Campus Event: ${eventTitle}
END:VEVENT
END:VCALENDAR`

    const blob = new Blob([icsContent], { type: "text/calendar" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${eventTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={toggleFavorite} disabled={isLoading}>
        <Heart className={`w-4 h-4 mr-1 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
        {isFavorited ? "Favorited" : "Favorite"}
      </Button>

      <Button variant="outline" size="sm" onClick={shareEvent}>
        <Share2 className="w-4 h-4 mr-1" />
        Share
      </Button>

      <Button variant="outline" size="sm" onClick={addToCalendar}>
        <Calendar className="w-4 h-4 mr-1" />
        Add to Calendar
      </Button>

      <Button variant="outline" size="sm" onClick={downloadICS}>
        <Download className="w-4 h-4 mr-1" />
        Download
      </Button>
    </div>
  )
}
