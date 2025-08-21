export interface Event {
  id: string
  title: string
  description: string | null
  location: string
  start_time: string
  end_time: string
  max_capacity: number | null
  current_registrations: number
  category: string
  image_url: string | null
  organizer_id: string
  created_at: string
  updated_at: string
}

export interface EventRegistration {
  id: string
  event_id: string
  user_id: string
  registered_at: string
  attendance_status: "registered" | "attended" | "no_show"
}

export interface UserProfile {
  id: string
  full_name: string | null
  student_id: string | null
  year: string | null
  major: string | null
  role: "student" | "admin" | "organizer"
  created_at: string
}
