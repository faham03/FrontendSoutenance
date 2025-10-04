"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { gradesAPI, coursesAPI, requestsAPI } from "@/services/api"
import { BookOpen, Calendar, FileText, TrendingUp } from "lucide-react"

export default function StudentDashboard() {
  const [stats, setStats] = useState({
    totalGrades: 0,
    averageGrade: 0,
    upcomingEvents: 0,
    pendingRequests: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [gradesRes, eventsRes, requestsRes] = await Promise.all([
        gradesAPI.getGrades(),
        coursesAPI.getEvents(),
        requestsAPI.getRequests(),
      ])

      const grades = gradesRes.data
      const validatedGrades = grades.filter((g) => g.status === "validated")
      const average =
        validatedGrades.length > 0
          ? validatedGrades.reduce((sum, g) => sum + Number.parseFloat(g.grade), 0) / validatedGrades.length
          : 0

      setStats({
        totalGrades: grades.length,
        averageGrade: average.toFixed(2),
        upcomingEvents: eventsRes.data.length,
        pendingRequests: requestsRes.data.filter((r) => r.status === "pending").length,
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground">Bienvenue sur votre espace étudiant</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notes totales</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGrades}</div>
            <p className="text-xs text-muted-foreground">Notes enregistrées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Moyenne générale</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageGrade}/20</div>
            <p className="text-xs text-muted-foreground">Notes validées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Événements</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
            <p className="text-xs text-muted-foreground">À venir</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Demandes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRequests}</div>
            <p className="text-xs text-muted-foreground">En attente</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Aucune activité récente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prochains événements</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Consultez la page événements pour plus de détails</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
