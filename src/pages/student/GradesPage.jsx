"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { gradesAPI } from "@/services/api"
import { CheckCircle, Clock, XCircle, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function GradesPage() {
  const [grades, setGrades] = useState([])
  const [averages, setAverages] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGrades()
  }, [])

  const fetchGrades = async () => {
    try {
      const [gradesRes, averagesRes] = await Promise.all([gradesAPI.getMyGrades(), gradesAPI.getAverages()])

      const gradesData = Array.isArray(gradesRes.data) ? gradesRes.data : gradesRes.data?.results || []
      setGrades(gradesData)
      setAverages(averagesRes.data)
    } catch (error) {
      console.error("Error fetching grades:", error)
      setGrades([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { icon: Clock, text: "En attente", variant: "secondary" },
      validated: { icon: CheckCircle, text: "Validée", variant: "default" },
      rejected: { icon: XCircle, text: "Rejetée", variant: "destructive" },
    }
    const badge = badges[status] || badges.pending
    const Icon = badge.icon
    return (
      <Badge variant={badge.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {badge.text}
      </Badge>
    )
  }

  const getEvaluationType = (type) => {
    const types = {
      exam: "Examen",
      test: "Contrôle continu",
      project: "Projet",
      participation: "Participation",
    }
    return types[type] || type
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
        <h1 className="text-3xl font-bold">Mes Notes</h1>
        <p className="text-muted-foreground">Consultez vos notes et vos moyennes</p>
      </div>

      {averages && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Moyennes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Moyenne générale</p>
                <p className="text-3xl font-bold">{averages.average ? averages.average.toFixed(2) : "N/A"}/20</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Moyenne pondérée</p>
                <p className="text-3xl font-bold">
                  {averages.weighted_avg ? averages.weighted_avg.toFixed(2) : "N/A"}/20
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Liste des notes</CardTitle>
        </CardHeader>
        <CardContent>
          {grades.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Aucune note disponible</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Cours</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Type</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Note</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Coef.</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Semestre</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Statut</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((grade) => (
                    <tr key={grade.id} className="border-b border-border">
                      <td className="py-4">
                        <div>
                          <p className="text-sm font-medium">{grade.course_code}</p>
                          <p className="text-xs text-muted-foreground">{grade.course_title}</p>
                        </div>
                      </td>
                      <td className="py-4 text-sm">{getEvaluationType(grade.evaluation_type)}</td>
                      <td className="py-4 text-lg font-bold">{grade.value}/20</td>
                      <td className="py-4 text-sm">×{grade.weight}</td>
                      <td className="py-4 text-sm">{grade.semester}</td>
                      <td className="py-4">{getStatusBadge(grade.status)}</td>
                      <td className="py-4 text-sm text-muted-foreground">
                        {new Date(grade.evaluation_date).toLocaleDateString("fr-FR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
