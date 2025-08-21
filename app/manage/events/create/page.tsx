import { EventForm } from "@/components/event-form"

export default function CreateEventPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <EventForm mode="create" />
      </div>
    </div>
  )
}
