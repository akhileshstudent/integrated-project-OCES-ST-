"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import type { EventRegistration } from "@/lib/types"
import { Users, UserCheck, UserX } from "lucide-react"
import { useEffect, useState } from "react"

interface AttendanceTrackerProps {
  eventId: string
}

interface RegistrationWithProfile extends EventRegistration {
  user_profiles: {
    full_name: string | null
    student_id: string | null
  } | null
}

export function AttendanceTracker({ eventId }: AttendanceTrackerProps) {
  const [registrations, setRegistrations] = useState<RegistrationWithProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchRegistrations()
  }, [eventId])

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from("event_registrations")
        .select(
          `
          *,
          user_profiles (
            full_name,
            student_id
          )
        `,
        )
        .eq("event_id", eventId)
        .order("registered_at", { ascending: true })

      if (error) throw error
      setRegistrations(data || [])
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to fetch registrations")
    } finally {
      setIsLoading(false)
    }
  }

  const updateAttendanceStatus = async (registrationId: string, status: "registered" | "attended" | "no_show") => {
    try {
      const { error } = await supabase
        .from("event_registrations")
        .update({ attendance_status: status })
        .eq("id", registrationId)

      if (error) throw error

      // Update local state
      setRegistrations((prev) =>
        prev.map((reg) => (reg.id === registrationId ? { ...reg, attendance_status: status } : reg)),
      )
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to update attendance")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "attended":
        return "bg-green-100 text-green-800"
      case "no_show":
        return "bg-red-100 text-red-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "attended":
        return <UserCheck className="w-4 h-4" />
      case "no_show":
        return <UserX className="w-4 h-4" />
      default:
        return <Users className="w-4 h-4" />
    }
  }

  const attendedCount = registrations.filter((reg) => reg.attendance_status === "attended").length
  const noShowCount = registrations.filter((reg) => reg.attendance_status === "no_show").length
  const registeredCount = registrations.filter((reg) => reg.attendance_status === "registered").length

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading registrations...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Attendance Tracker
        </CardTitle>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Attended: {attendedCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Registered: {registeredCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>No Show: {noShowCount}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        {registrations.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No registrations yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {registrations.map((registration) => (
              <div key={registration.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(registration.attendance_status)}
                  <div>
                    <p className="font-medium">{registration.user_profiles?.full_name || "Unknown User"}</p>
                    {registration.user_profiles?.student_id && (
                      <p className="text-sm text-gray-600">ID: {registration.user_profiles.student_id}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Registered: {new Date(registration.registered_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(registration.attendance_status)}>
                    {registration.attendance_status.replace("_", " ")}
                  </Badge>
                  <Select
                    value={registration.attendance_status}
                    onValueChange={(value) =>
                      updateAttendanceStatus(registration.id, value as "registered" | "attended" | "no_show")
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="registered">Registered</SelectItem>
                      <SelectItem value="attended">Attended</SelectItem>
                      <SelectItem value="no_show">No Show</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
