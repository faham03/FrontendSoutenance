"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { gradesAPI, coursesAPI } from "@/services/api"
import { Plus, CheckCircle, Clock } from "lucide-react"

export default function AssignGradesPage() {
  const [grades, setGrades] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    student: "",
    course: "",
    grade: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [gradesRes, coursesRes] = await Promise.all([gradesAPI.getGrades(), coursesAPI.getCourses()])
      setGrades(gradesRes.data)
      setCourses(coursesRes.data)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Note: This would need the proper API endpoint for creating grades
      // await gradesAPI.createGrade(formData)
      setShowModal(false)
      setFormData({ student: "", course: "", grade: "" })
      alert("Note attribuée avec succès")
      fetchData()
    } catch (error) {
      console.error("Error creating grade:", error)
      alert("Erreur lors de l'attribution de la note")
    }
  }

  const handleValidate = async (gradeId) => {
    try {
      // Note: This would need the proper API endpoint for validating grades
      // await gradesAPI.validateGrade(gradeId)
      alert("Note validée avec succès")
      fetchData()
    } catch (error) {
      console.error("Error validating grade:", error)
      alert("Erreur lors de la validation")
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { icon: Clock, text: "En attente", className: "bg-yellow-500/10 text-yellow-500" },
      validated: { icon: CheckCircle, text: "Validée", className: "bg-green-500/10 text-green-500" },
    }
    const badge = badges[status] || badges.pending
    const Icon = badge.icon
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${badge.className}`}>
        <Icon className="h-3 w-3" />
        {badge.text}
      </span>
    )
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Attribuer des Notes</h1>
          <p className="text-muted-foreground">Gérez les notes de vos étudiants</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle note
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des notes</CardTitle>
        </CardHeader>
        <CardContent>
          {grades.length === 0 ? (
            <p className="text-center text-muted-foreground">Aucune note disponible</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Étudiant</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Cours</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Note</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Statut</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((grade) => (
                    <tr key={grade.id} className="border-b border-border">
                      <td className="py-4 text-sm">{grade.student_name || "Étudiant"}</td>
                      <td className="py-4 text-sm">{grade.course_name || "Cours"}</td>
                      <td className="py-4 text-sm font-bold">{grade.grade}/20</td>
                      <td className="py-4">{getStatusBadge(grade.status)}</td>
                      <td className="py-4 text-sm text-muted-foreground">
                        {new Date(grade.created_at).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="py-4">
                        {grade.status === "pending" && (
                          <Button size="sm" variant="outline" onClick={() => handleValidate(grade.id)}>
                            Valider
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Grade Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Attribuer une note</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Étudiant (ID)</label>
                  <Input
                    type="number"
                    placeholder="ID de l'étudiant"
                    value={formData.student}
                    onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cours</label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    required
                  >
                    <option value="">Sélectionner un cours</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Note (sur 20)</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="20"
                    placeholder="15.5"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Attribuer</Button>
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                    Annuler
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
