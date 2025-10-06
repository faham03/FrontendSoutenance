"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { teacherAPI, adminAPI } from "@/services/api"
import { Plus, CheckCircle, Clock, XCircle, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AssignGradesPage() {
  const [grades, setGrades] = useState([])
  const [courses, setCourses] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingGrade, setEditingGrade] = useState(null)
  const [message, setMessage] = useState({ type: "", text: "" })

  const [formData, setFormData] = useState({
    student: "",
    course: "",
    value: "",
    weight: "1.0",
    evaluation_type: "test",
    comment: "",
    evaluation_date: new Date().toISOString().split("T")[0],
    semester: "S1",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [gradesRes, coursesRes, usersRes] = await Promise.all([
        teacherAPI.getMyGrades(),
        teacherAPI.getMyCourses(),
        adminAPI.getUsers(),
      ])

      const gradesData = Array.isArray(gradesRes.data) ? gradesRes.data : gradesRes.data?.results || []
      const coursesData = Array.isArray(coursesRes.data) ? coursesRes.data : coursesRes.data?.results || []
      const usersData = Array.isArray(usersRes.data) ? usersRes.data : usersRes.data?.results || []

      setGrades(gradesData)
      setCourses(coursesData)
      setStudents(usersData.filter((u) => u.role === "student"))
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: "", text: "" })

    try {
      const payload = {
        ...formData,
        value: Number.parseFloat(formData.value),
        weight: Number.parseFloat(formData.weight),
        student: Number.parseInt(formData.student),
        course: Number.parseInt(formData.course),
      }

      if (editingGrade) {
        await teacherAPI.updateGrade(editingGrade.id, payload)
        setMessage({ type: "success", text: "Note mise à jour avec succès!" })
      } else {
        await teacherAPI.createGrade(payload)
        setMessage({ type: "success", text: "Note créée avec succès!" })
      }

      setDialogOpen(false)
      resetForm()
      fetchData()
    } catch (error) {
      console.error("Error saving grade:", error)
      const errorMsg =
        error.response?.data?.detail ||
        error.response?.data?.value?.[0] ||
        error.response?.data?.student?.[0] ||
        "Erreur lors de l'enregistrement"
      setMessage({ type: "error", text: errorMsg })
    }
  }

  const handleEdit = (grade) => {
    setEditingGrade(grade)
    setFormData({
      student: grade.student.toString(),
      course: grade.course.toString(),
      value: grade.value.toString(),
      weight: grade.weight.toString(),
      evaluation_type: grade.evaluation_type,
      comment: grade.comment || "",
      evaluation_date: grade.evaluation_date,
      semester: grade.semester,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (gradeId) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette note?")) return

    try {
      await teacherAPI.deleteGrade(gradeId)
      setMessage({ type: "success", text: "Note supprimée avec succès!" })
      fetchData()
    } catch (error) {
      console.error("Error deleting grade:", error)
      setMessage({ type: "error", text: "Erreur lors de la suppression" })
    }
  }

  const resetForm = () => {
    setEditingGrade(null)
    setFormData({
      student: "",
      course: "",
      value: "",
      weight: "1.0",
      evaluation_type: "test",
      comment: "",
      evaluation_date: new Date().toISOString().split("T")[0],
      semester: "S1",
    })
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Notes</h1>
          <p className="text-muted-foreground">Attribuez et gérez les notes de vos étudiants</p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle note
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingGrade ? "Modifier la note" : "Attribuer une note"}</DialogTitle>
              <DialogDescription>
                Remplissez tous les champs pour {editingGrade ? "modifier" : "créer"} une note
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="student">Étudiant *</Label>
                  <select
                    id="student"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.student}
                    onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                    required
                  >
                    <option value="">Sélectionner un étudiant</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.first_name} {student.last_name} ({student.matricule})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="course">Cours *</Label>
                  <select
                    id="course"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    required
                  >
                    <option value="">Sélectionner un cours</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.code} - {course.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="value">Note (sur 20) *</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    min="0"
                    max="20"
                    placeholder="15.5"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Coefficient *</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="5.0"
                    placeholder="1.0"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="semester">Semestre *</Label>
                  <select
                    id="semester"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    required
                  >
                    <option value="S1">S1</option>
                    <option value="S2">S2</option>
                    <option value="S3">S3</option>
                    <option value="S4">S4</option>
                    <option value="S5">S5</option>
                    <option value="S6">S6</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="evaluation_type">Type d'évaluation *</Label>
                  <select
                    id="evaluation_type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.evaluation_type}
                    onChange={(e) => setFormData({ ...formData, evaluation_type: e.target.value })}
                    required
                  >
                    <option value="test">Contrôle continu</option>
                    <option value="exam">Examen</option>
                    <option value="project">Projet</option>
                    <option value="participation">Participation</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="evaluation_date">Date d'évaluation *</Label>
                  <Input
                    id="evaluation_date"
                    type="date"
                    value={formData.evaluation_date}
                    onChange={(e) => setFormData({ ...formData, evaluation_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="comment">Commentaire (optionnel)</Label>
                <Textarea
                  id="comment"
                  placeholder="Ajoutez un commentaire sur cette note..."
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  rows={3}
                />
              </div>

              {message.text && (
                <Alert variant={message.type === "error" ? "destructive" : "default"}>
                  <AlertDescription>{message.text}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingGrade ? "Mettre à jour" : "Créer"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false)
                    resetForm()
                  }}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {message.text && !dialogOpen && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
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
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Étudiant</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Cours</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Type</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Note</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Coef.</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Statut</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((grade) => (
                    <tr key={grade.id} className="border-b border-border">
                      <td className="py-4">
                        <div>
                          <p className="text-sm font-medium">{grade.student_name}</p>
                          <p className="text-xs text-muted-foreground">{grade.student_matricule}</p>
                        </div>
                      </td>
                      <td className="py-4">
                        <div>
                          <p className="text-sm font-medium">{grade.course_code}</p>
                          <p className="text-xs text-muted-foreground">{grade.course_title}</p>
                        </div>
                      </td>
                      <td className="py-4 text-sm">{getEvaluationType(grade.evaluation_type)}</td>
                      <td className="py-4 text-lg font-bold">{grade.value}/20</td>
                      <td className="py-4 text-sm">×{grade.weight}</td>
                      <td className="py-4">{getStatusBadge(grade.status)}</td>
                      <td className="py-4 text-sm text-muted-foreground">
                        {new Date(grade.evaluation_date).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(grade)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDelete(grade.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
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
