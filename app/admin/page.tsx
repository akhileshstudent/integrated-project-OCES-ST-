"use client"

import { AdminStats } from "@/components/admin-stats"
import { UserManagement } from "@/components/user-management"
import { EventOversight } from "@/components/event-oversight"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Shield, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      // Check if user has admin role
      const { data: profile, error } = await supabase.from("user_profiles").select("role").eq("id", user.id).single()

      if (error) throw error

      if (profile?.role !== "admin") {
        router.push("/dashboard")
        return
      }

      setIsLoading(false)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Access denied")
      setTimeout(() => router.push("/dashboard"), 2000)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-red-600" />
                <span className="text-xl font-bold text-gray-900">Admin Dashboard</span>
              </div>
              <div className="hidden md:flex space-x-4">
                <Link
                  href="/admin"
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Overview
                </Link>
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Student View
                </Link>
                <Link
                  href="/manage/events"
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Manage Events
                </Link>
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={handleSignOut} className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">System Overview</h1>
          <p className="text-gray-600">Monitor and manage the campus events platform</p>
        </div>

        <div className="space-y-8">
          {/* Statistics */}
          <AdminStats />

          {/* User Management */}
          <UserManagement />

          {/* Event Oversight */}
          <EventOversight />
        </div>
      </div>
    </div>
  )
}
