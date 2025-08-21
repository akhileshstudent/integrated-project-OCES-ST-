"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Calendar, Users, UserCheck, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"

interface AdminStatsProps {
  className?: string
}

interface Stats {
  totalEvents: number
  totalUsers: number
  totalRegistrations: number
  upcomingEvents: number
}

export function AdminStats({ className }: AdminStatsProps) {
  const [stats, setStats] = useState<Stats>({
    totalEvents: 0,
    totalUsers: 0,
    totalRegistrations: 0,
    upcomingEvents: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch total events
      const { count: eventsCount, error: eventsError } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true })

      if (eventsError) throw eventsError

      // Fetch total users
      const { count: usersCount, error: usersError } = await supabase
        .from("user_profiles")
        .select("*", { count: "exact", head: true })

      if (usersError) throw usersError

      // Fetch total registrations
      const { count: registrationsCount, error: registrationsError } = await supabase
        .from("event_registrations")
        .select("*", { count: "exact", head: true })

      if (registrationsError) throw registrationsError

      // Fetch upcoming events
      const { count: upcomingCount, error: upcomingError } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .gte("start_time", new Date().toISOString())

      if (upcomingError) throw upcomingError

      setStats({
        totalEvents: eventsCount || 0,
        totalUsers: usersCount || 0,
        totalRegistrations: registrationsCount || 0,
        upcomingEvents: upcomingCount || 0,
      })
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to fetch stats")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600">Error loading stats: {error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Events",
      value: stats.totalEvents,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Registrations",
      value: stats.totalRegistrations,
      icon: UserCheck,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Upcoming Events",
      value: stats.upcomingEvents,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ]

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
            <div className={`p-2 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
