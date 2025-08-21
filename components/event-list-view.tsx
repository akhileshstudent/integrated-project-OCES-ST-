import { EventCard } from "@/components/event-card"
import type { Event } from "@/lib/types"

interface EventListViewProps {
  events: Event[]
}

export function EventListView({ events }: EventListViewProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📅</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-600">Try adjusting your filters to see more events.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  )
}
