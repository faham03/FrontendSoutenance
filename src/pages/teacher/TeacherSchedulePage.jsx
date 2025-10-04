"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { coursesAPI } from "@/services/api"
import { Calendar, Clock, MapPin } from "lucide-react"

export default function TeacherSchedulePage() {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
    try {
      const response = await coursesAPI.getSchedules()
      setSchedules(response.data)
    } catch (error) {
      console.error("Error fetching schedules:", error)
    } finally {
      setLoading(false)
    }
  }

  const getDayName = (dayNumber) => {
    const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
    return days[dayNumber]
  }

  const groupByDay = () => {
    const grouped = {}
    schedules.forEach((schedule) => {
      const day = getDayName(schedule.day_of_week)
      if (!grouped[day]) grouped[day] = []
      grouped[day].push(schedule)
    })
    return grouped
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  const groupedSchedules = groupByDay()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mon Emploi du temps</h1>
        <p className="text-muted-foreground">Consultez votre emploi du temps hebdomadaire</p>
      </div>

      {Object.keys(groupedSchedules).length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">Aucun cours programmé</CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedSchedules).map(([day, daySchedules]) => (
            <Card key={day}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {day}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {daySchedules.map((schedule) => (
                    <div key={schedule.id} className="flex items-start gap-4 rounded-lg border border-border p-4">
                      <div className="flex-1">
                        <h4 className="font-semibold">{schedule.course_name || "Cours"}</h4>
                        <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {schedule.start_time} - {schedule.end_time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {schedule.room_name || "Salle non définie"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
