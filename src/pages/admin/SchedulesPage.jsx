"use client"

import { useState, useEffect } from "react"
import { coursesAPI } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState([])
  const [courses, setCourses] = useState([])
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    course: "",
    room: "",
    day: "monday",
    start_time: "",
    end_time: "",
    course_type: "lecture",
    is_active: true,
  })

  useEffect(() => {
    fetchSchedules()
    fetchCourses()
    fetchRooms()
  }, [])

  const fetchSchedules = async () => {
    try {
      const response = await coursesAPI.getSchedules()
      const schedulesData = Array.isArray(response.data) ? response.data : response.data.results || []
      setSchedules(schedulesData)
    } catch (error) {
      console.error("Error fetching schedules:", error)
      setSchedules([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCourses = async () => {
    try {
      const response = await coursesAPI.getCourses()
      const coursesData = Array.isArray(response.data) ? response.data : response.data.results || []
      setCourses(coursesData)
    } catch (error) {
      console.error("Error fetching courses:", error)
      setCourses([])
    }
  }

  const fetchRooms = async () => {
    try {
      const response = await coursesAPI.getRooms()
      const roomsData = Array.isArray(response.data) ? response.data : response.data.results || []
      setRooms(roomsData)
    } catch (error) {
      console.error("Error fetching rooms:", error)
      setRooms([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await coursesAPI.createSchedule({
        ...formData,
        course: Number.parseInt(formData.course),
        room: Number.parseInt(formData.room),
      })
      setShowForm(false)
      setFormData({
        course: "",
        room: "",
        day: "monday",
        start_time: "",
        end_time: "",
        course_type: "lecture",
        is_active: true,
      })
      fetchSchedules()
    } catch (error) {
      console.error("Error creating schedule:", error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet emploi du temps?")) {
      try {
        await coursesAPI.deleteSchedule(id)
        fetchSchedules()
      } catch (error) {
        console.error("Error deleting schedule:", error)
      }
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8">Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestion des Emplois du Temps</h1>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? "Annuler" : "Nouvel Emploi du Temps"}</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Créer un Emploi du Temps</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="course">Cours</Label>
                  <select
                    id="course"
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-gray-900"
                    required
                  >
                    <option value="">Sélectionner un cours</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title} ({course.code})
                      </option>
                    ))}
                  </select>
                </div>
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
                        {room.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="day">Jour</Label>
                  <select
                    id="day"
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-gray-900"
                    required
                  >
                    <option value="monday">Lundi</option>
                    <option value="tuesday">Mardi</option>
                    <option value="wednesday">Mercredi</option>
                    <option value="thursday">Jeudi</option>
                    <option value="friday">Vendredi</option>
                    <option value="saturday">Samedi</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course_type">Type</Label>
                  <select
                    id="course_type"
                    value={formData.course_type}
                    onChange={(e) => setFormData({ ...formData, course_type: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-gray-900"
                    required
                  >
                    <option value="lecture">Cours magistral</option>
                    <option value="tutorial">TD</option>
                    <option value="practical">TP</option>
                  </select>
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
                Créer l'Emploi du Temps
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {schedules.map((schedule) => (
          <Card key={schedule.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{schedule.course_title}</h3>
                  <div className="flex gap-4 text-sm">
                    <span>Jour: {schedule.day}</span>
                    <span>Salle: {schedule.room_name}</span>
                    <span>Type: {schedule.course_type}</span>
                    <span>
                      {schedule.start_time} - {schedule.end_time}
                    </span>
                  </div>
                </div>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(schedule.id)}>
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
