"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { NotificationsPanel } from "@/components/notifications-panel"
import { createClient } from "@/lib/supabase/client"
import { Calendar, Grid, LogOut, Shield, Bell, Heart, Menu, X, Home, Settings, User, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface AnimatedSidebarProps {
  currentView: "list" | "calendar"
  onViewChange: (view: "list" | "calendar") => void
}

export function AnimatedSidebar({ currentView, onViewChange }: AnimatedSidebarProps) {
  const [userRole, setUserRole] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
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
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
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

  const navigationItems = [
    {
      name: "Browse Events",
      href: "/dashboard",
      icon: Home,
      active: pathname === "/dashboard",
      planet: "🌍", // Added planet emojis for space theme
    },
    {
      name: "My Events",
      href: "/my-events",
      icon: User,
      active: pathname === "/my-events",
      planet: "🪐",
    },
    {
      name: "Favorites",
      href: "/favorites",
      icon: Heart,
      active: pathname === "/favorites",
      planet: "⭐",
    },
    {
      name: "Manage Events",
      href: "/manage/events",
      icon: Settings,
      active: pathname.startsWith("/manage"),
      planet: "🌙",
    },
  ]

  if (userRole === "admin") {
    navigationItems.push({
      name: "Admin Panel",
      href: "/admin",
      icon: Shield,
      active: pathname === "/admin",
      planet: "☄️", // Added comet for admin
    })
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden bg-black shadow-sm border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold text-white">
          🚀 OCES
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-white hover:bg-gray-700/50"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Sidebar Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/70 z-40 transition-opacity duration-300 lg:hidden",
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full w-72 bg-black text-white z-50 transform transition-transform duration-300 ease-in-out shadow-2xl relative overflow-hidden",
          "lg:translate-x-0 lg:static lg:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 20px 30px, #fff, transparent),
            radial-gradient(1px 1px at 40px 70px, #fff, transparent),
            radial-gradient(1px 1px at 90px 40px, #fff, transparent),
            radial-gradient(1px 1px at 130px 80px, #fff, transparent),
            radial-gradient(1px 1px at 160px 30px, #fff, transparent),
            radial-gradient(1px 1px at 200px 60px, #fff, transparent),
            radial-gradient(1px 1px at 250px 20px, #fff, transparent),
            radial-gradient(1px 1px at 280px 90px, #fff, transparent)
          `,
          backgroundRepeat: "repeat",
          backgroundSize: "300px 120px",
        }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-4 text-2xl">🪐</div>
          <div className="absolute top-32 left-4 text-lg">🌙</div>
          <div className="absolute top-64 right-8 text-xl">⭐</div>
          <div className="absolute bottom-32 left-6 text-lg">☄️</div>
        </div>

        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-700 relative z-10">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="text-2xl font-bold text-white hover:text-blue-200 transition-colors duration-200 flex items-center gap-2"
              onClick={() => setSidebarOpen(false)}
            >
              🚀{" "}
              <span className="bg-gradient-to-r from-blue-300 to-purple-300 px-3 py-1 rounded-lg text-white font-bold">
                OCES
              </span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white hover:bg-gray-700/50 p-2"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Loading Animation */}
          {isLoading && (
            <div className="mt-4 flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-purple-300 rounded-full animate-pulse delay-75"></div>
              <div className="w-2 h-2 bg-indigo-300 rounded-full animate-pulse delay-150"></div>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-2 relative z-10">
          {navigationItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden backdrop-blur-sm",
                "hover:bg-gray-700/50 hover:translate-x-1 hover:shadow-lg hover:shadow-blue-500/20",
                item.active ? "bg-gray-700/70 shadow-md shadow-blue-500/30" : "hover:bg-gray-700/30",
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <span className="text-lg">{item.planet}</span>
              <item.icon
                className={cn(
                  "w-5 h-5 transition-all duration-200",
                  item.active ? "text-blue-200" : "text-blue-300 group-hover:text-white",
                )}
              />
              <span
                className={cn(
                  "font-medium transition-colors duration-200",
                  item.active ? "text-white" : "text-blue-100 group-hover:text-white",
                )}
              >
                {item.name}
              </span>
              <ChevronRight
                className={cn(
                  "w-4 h-4 ml-auto transition-all duration-200 opacity-0 group-hover:opacity-100 group-hover:translate-x-1",
                  item.active ? "opacity-100" : "",
                )}
              />

              {/* Active indicator */}
              {item.active && (
                <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-blue-300 to-purple-300 rounded-r-full"></div>
              )}
            </Link>
          ))}
        </nav>

        {/* View Toggle */}
        <div className="p-4 border-t border-gray-700 relative z-10">
          <div className="mb-3">
            <span className="text-sm font-medium text-blue-200 flex items-center gap-2">🌌 View Mode</span>
          </div>
          <div className="flex bg-slate-800/50 rounded-lg p-1 backdrop-blur-sm">
            <Button
              variant={currentView === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange("list")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 transition-all duration-200",
                currentView === "list"
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                  : "text-blue-200 hover:text-white hover:bg-gray-700/50",
              )}
            >
              <Grid className="w-4 h-4" />
              Grid
            </Button>
            <Button
              variant={currentView === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange("calendar")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 transition-all duration-200",
                currentView === "calendar"
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                  : "text-blue-200 hover:text-white hover:bg-gray-700/50",
              )}
            >
              <Calendar className="w-4 h-4" />
              Calendar
            </Button>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700 space-y-2 backdrop-blur-sm relative z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotifications(true)}
            className="w-full flex items-center justify-start gap-3 text-blue-200 hover:text-white hover:bg-gray-700/50 transition-all duration-200 relative"
          >
            <Bell className="w-5 h-5" />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="ml-auto text-xs min-w-[1.25rem] h-5 bg-gradient-to-r from-red-500 to-pink-500"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="w-full flex items-center justify-start gap-3 text-blue-200 hover:text-red-300 hover:bg-red-500/20 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>🚀 Sign Out</span>
          </Button>
        </div>
      </div>

      <NotificationsPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </>
  )
}
