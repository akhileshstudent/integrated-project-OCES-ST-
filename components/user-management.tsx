"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import type { UserProfile } from "@/lib/types"
import { Search, User, Shield, Crown } from "lucide-react"
import { useEffect, useState } from "react"
import Users from "lucide-react" // Declare the Users variable

export function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchQuery, roleFilter])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from("user_profiles").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to fetch users")
    } finally {
      setIsLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = [...users]

    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.student_id?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    setFilteredUsers(filtered)
  }

  const updateUserRole = async (userId: string, newRole: "student" | "admin" | "organizer") => {
    try {
      const { error } = await supabase.from("user_profiles").update({ role: newRole }).eq("id", userId)

      if (error) throw error

      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to update user role")
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="w-4 h-4" />
      case "organizer":
        return <Shield className="w-4 h-4" />
      default:
        return <User className="w-4 h-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "organizer":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading users...</p>
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
          User Management
        </CardTitle>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="student">Students</SelectItem>
              <SelectItem value="organizer">Organizers</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        {filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No users found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    {getRoleIcon(user.role)}
                  </div>
                  <div>
                    <p className="font-medium">{user.full_name || "Unknown User"}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {user.student_id && <span>ID: {user.student_id}</span>}
                      {user.year && <span>• Year: {user.year}</span>}
                      {user.major && <span>• {user.major}</span>}
                    </div>
                    <p className="text-xs text-gray-500">Joined: {new Date(user.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                  <Select
                    value={user.role}
                    onValueChange={(value) => updateUserRole(user.id, value as "student" | "admin" | "organizer")}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="organizer">Organizer</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
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
