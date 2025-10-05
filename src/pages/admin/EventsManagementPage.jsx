"use client"

import { useState, useEffect } from "react"
import { adminAPI } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export default function EventsManagementPage() {
  const [events, setEvents] = useState([])
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_type: "conference",
    room: "",
    date: "",
    start_time: "",
    end_time: "",
  })

  useEffect(() => {
    fetchEvents()
    fetchRooms()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await adminAPI.getEvents()
      const eventsData = Array.isArray(response.data) ? response.data : response.data.results || []
      setEvents(eventsData)
    } catch (error) {
      console.error("Error fetching events:", error)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const fetchRooms = async () => {
    try {
      const response = await adminAPI.getRooms()
      const roomsData = Array.isArray(response.data) ? response.data : response.data.results || []
      setRooms(roomsData)
    } catch (error) {
      console.error("Error fetching rooms:", error)
      setRooms([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log("[v0] Submitting event data:", formData)
    try {
      await adminAPI.createEvent({
        ...formData,
        room: Number.parseInt(formData.room),
      })
      setShowForm(false)
      setFormData({
        title: "",
        description: "",
        event_type: "conference",
        room: "",
        date: "",
        start_time: "",
        end_time: "",
      })
      fetchEvents()
    } catch (error) {
      console.error("[v0] Error creating event:", error)
      console.error("[v0] Error response:", error.response?.data)
      alert(`Erreur lors de la création: ${error.response?.data?.message || error.message}`)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet événement?")) {
      try {
        await adminAPI.deleteEvent(id)
        fetchEvents()
      } catch (error) {
        console.error("Error deleting event:", error)
        alert(`Erreur lors de la suppression: ${error.response?.data?.message || error.message}`)
      }
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8">Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestion des Événements</h1>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? "Annuler" : "Nouvel Événement"}</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Créer un Événement</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event_type">Type</Label>
                  <select
                    id="event_type"
                    value={formData.event_type}
                    onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-gray-900"
                    required
                  >
                    <option value="conference">Conférence</option>
                    <option value="workshop">Atelier</option>
                    <option value="exam">Examen</option>
                    <option value="meeting">Réunion</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-gray-900"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="room">Salle</Label>
                  <select
                    id="room"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-gray-900"
                    required
                  >
                    <option value="">Sélectionner une salle</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name} (Capacité: {room.capacity})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">Heure de début</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">Heure de fin</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Créer l'Événement
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {events.map((event) => (
          <Card key={event.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{event.title}</h3>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                  <div className="flex gap-4 text-sm">
                    <span>Type: {event.event_type}</span>
                    <span>Salle: {event.room_name}</span>
                    <span>Date: {event.date}</span>
                    <span>
                      {event.start_time} - {event.end_time}
                    </span>
                  </div>
                </div>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(event.id)}>
                  Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
