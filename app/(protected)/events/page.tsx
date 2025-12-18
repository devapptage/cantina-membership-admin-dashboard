"use client"

import { useState } from "react"
import { Search, Plus, Edit, Trash2, Calendar, MapPin, Users, X } from "lucide-react"

const eventsData = [
  {
    id: 1,
    title: "Mezcal Tasting Night",
    description: "Experience premium mezcal selections with live music",
    location: "Downtown Lounge",
    date: "20/12/2024",
    time: "7:00 PM",
    capacity: 50,
    attendees: 38,
    status: "Upcoming",
  },
  {
    id: 2,
    title: "Holiday Celebration",
    description: "Annual members-only holiday party with cocktails",
    location: "Main Hall",
    date: "25/12/2024",
    time: "6:00 PM",
    capacity: 100,
    attendees: 82,
    status: "Upcoming",
  },
  {
    id: 3,
    title: "Bartender Workshop",
    description: "Learn cocktail mixing techniques from professionals",
    location: "Training Center",
    date: "15/12/2024",
    time: "5:00 PM",
    capacity: 30,
    attendees: 28,
    status: "Ongoing",
  },
  {
    id: 4,
    title: "Member Appreciation Lunch",
    description: "Networking and lunch for premium members",
    location: "Restaurant",
    date: "10/12/2024",
    time: "12:00 PM",
    capacity: 40,
    attendees: 40,
    status: "Completed",
  },
  {
    id: 5,
    title: "New Year Mixer",
    description: "Start the year with fellow members and new arrivals",
    location: "Rooftop Bar",
    date: "01/01/2025",
    time: "8:00 PM",
    capacity: 75,
    attendees: 0,
    status: "Upcoming",
  },
]

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<(typeof eventsData)[0] | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    time: "",
    capacity: "",
    attendees: "",
  })
  const [deletingEvent, setDeletingEvent] = useState<(typeof eventsData)[0] | null>(null)

  const statuses = ["All", "Upcoming", "Ongoing", "Completed"]

  const filteredEvents = eventsData.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "All" || event.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-accent/10 text-accent"
      case "Ongoing":
        return "bg-blue-500/10 text-blue-400"
      case "Upcoming":
        return "bg-amber-500/10 text-amber-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const handleCreateEvent = () => {
    setFormData({ title: "", description: "", location: "", date: "", time: "", capacity: "", attendees: "" })
    setEditingEvent(null)
    setShowModal(true)
  }

  const handleEditEvent = (event: (typeof eventsData)[0]) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      description: event.description,
      location: event.location,
      date: event.date,
      time: event.time,
      capacity: event.capacity.toString(),
      attendees: event.attendees.toString(),
    })
    setShowModal(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Events Management</h1>
        <p className="text-muted-foreground mt-1">Create and manage member events</p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search events by title, location, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card/50 border border-border/50 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
          />
        </div>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-2 overflow-x-auto flex-1">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-full whitespace-nowrap font-medium text-sm transition-all ${
                  statusFilter === status
                    ? "bg-accent text-accent-foreground"
                    : "bg-card/50 border border-border/50 text-foreground hover:border-accent"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <button
            onClick={handleCreateEvent}
            className="px-4 py-2.5 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-all flex items-center gap-2 font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Create Event
          </button>
        </div>
      </div>

      <div className="bg-card/30 border border-border/30 rounded-xl overflow-hidden">
        {filteredEvents.length > 0 ? (
          <div className="divide-y divide-border/30">
            {filteredEvents.map((event) => (
              <div key={event.id} className="p-6 hover:bg-accent/5 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold text-lg text-foreground">{event.title}</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm mb-3">{event.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {event.date} at {event.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {event.attendees}/{event.capacity} attendees
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEditEvent(event)}
                      className="p-2 hover:bg-accent/10 rounded-lg transition-all"
                    >
                      <Edit className="w-4 h-4 text-muted-foreground hover:text-accent" />
                    </button>
                    <button
                      onClick={() => setDeletingEvent(event)}
                      className="p-2 hover:bg-destructive/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">No events found</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">{editingEvent ? "Edit Event" : "Create Event"}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">Event Title</label>
                <input
                  type="text"
                  placeholder="Enter event title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">Description</label>
                <textarea
                  placeholder="Enter event description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">Location</label>
                <input
                  type="text"
                  placeholder="Enter event location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">Date</label>
                  <input
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">Time</label>
                  <input
                    type="text"
                    placeholder="HH:MM"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">Capacity</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">Attendees</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.attendees}
                    onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                    className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-border rounded-lg hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    console.log("[v0] Event saved:", formData)
                    setShowModal(false)
                  }}
                  className="flex-1 px-4 py-2.5 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90"
                >
                  Save Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deletingEvent && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl max-w-sm w-full p-8 space-y-6 shadow-2xl">
            <h2 className="text-2xl font-bold">Delete Event?</h2>
            <p className="text-muted-foreground">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">"{deletingEvent.title}"</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingEvent(null)}
                className="flex-1 px-4 py-2.5 border border-border rounded-lg hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log("[v0] Event deleted:", deletingEvent.id)
                  setDeletingEvent(null)
                }}
                className="flex-1 px-4 py-2.5 bg-destructive text-white rounded-lg hover:bg-destructive/90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
