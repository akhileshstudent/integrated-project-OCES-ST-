"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Bell, Check, X } from "lucide-react"
import { useEffect, useState } from "react"

interface Notification {
  id: string
  event_id: string | null
  type: string
  title: string
  message: string
  is_read: boolean
  created_at: string
}

interface NotificationsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  const fetchNotifications = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) throw error
      setNotifications(data || [])
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to fetch notifications")
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId)

      if (error) throw error

      setNotifications((prev) =>
        prev.map((notif) => (notif.id === notificationId ? { ...notif, is_read: true } : notif)),
      )
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to mark notification as read")
    }
  }

  const markAllAsRead = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id)

      if (error) throw error

      setNotifications((prev) => prev.map((notif) => ({ ...notif, is_read: true })))
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to mark all as read")
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "registration_confirmed":
        return "✅"
      case "event_reminder":
        return "⏰"
      case "event_update":
        return "📝"
      case "event_cancelled":
        return "❌"
      default:
        return "📢"
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-xl">
        <Card className="h-full rounded-none border-0">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead} className="w-full bg-transparent">
                Mark All as Read
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto h-full">
            {isLoading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading notifications...</p>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <p className="text-red-600">{error}</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.is_read ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          {!notification.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 h-auto"
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notification.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
