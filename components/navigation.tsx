"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { NotificationsPanel } from "@/components/notifications-panel"
import { createClient } from "@/lib/supabase/client"
import { Calendar, Grid, LogOut, Shield, Bell, Heart } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface NavigationProps {
  currentView: "list" | "calendar"
  onViewChange: (view: "list" | "calendar") => void
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const [userRole, setUserRole] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUserRole()
    fetchUnreadNotifications()
  }, [])

  const checkUserRole = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase.from("user_profiles").select("role").eq("id", user.id).single()

      setUserRole(profile?.role || null)
    } catch (error) {
      // Handle error silently
    }
  }

  const fetchUnreadNotifications = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false)

      if (error) throw error
      setUnreadCount(count || 0)
    } catch (error) {
      // Handle error silently
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <>
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="text-2xl font-bold text-blue-900">
                Campus Events
              </Link>
              <div className="hidden md:flex space-x-4">
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Browse Events
                </Link>
                <Link
                  href="/my-events"
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  My Events
                </Link>
                <Link
                  href="/favorites"
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1"
                >
                  <Heart className="w-4 h-4" />
                  Favorites
                </Link>
                <Link
                  href="/manage/events"
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Manage Events
                </Link>
                {userRole === "admin" && (
                  <Link
                    href="/admin"
                    className="text-red-600 hover:text-red-700 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1"
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </Link>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <Button
                  variant={currentView === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewChange("list")}
                  className="flex items-center gap-2"
                >
                  <Grid className="w-4 h-4" />
                  <span className="hidden sm:inline">Grid</span>
                </Button>
                <Button
                  variant={currentView === "calendar" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewChange("calendar")}
                  className="flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">Calendar</span>
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(true)}
                className="flex items-center gap-2 relative"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 text-xs min-w-[1.25rem] h-5">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Badge>
                )}
                <span className="hidden sm:inline">Notifications</span>
              </Button>

              <Button variant="ghost" size="sm" onClick={handleSignOut} className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <NotificationsPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </>
  )
}
