"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { adminAPI } from "@/services/api"
import { Plus, Pencil, Trash2 } from "lucide-react"

export default function CoursesPage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [filieres, setFilieres] = useState([])
  const [annees, setAnnees] = useState([])
  const [formData, setFormData] = useState({
    title: "",
    code: "",
    description: "",
    credits: "",
    volume_horaire: "",
    level: "",
    filiere: "",
    annee: "",
  })

  useEffect(() => {
    fetchCourses()
    fetchFilieres()
    fetchAnnees()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await adminAPI.getCourses()
      console.log("[v0] Courses API response:", response.data)

      const coursesData = Array.isArray(response.data) ? response.data : response.data?.results || []

      setCourses(coursesData)
    } catch (error) {
      console.error("Error fetching courses:", error)
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  const fetchFilieres = async () => {
    try {
      const response = await adminAPI.getFilieres()
      const filieresData = Array.isArray(response.data) ? response.data : response.data?.results || []
      setFilieres(filieresData)
    } catch (error) {
      console.error("Error fetching filieres:", error)
      setFilieres([])
    }
  }

  const fetchAnnees = async () => {
    try {
      const response = await adminAPI.getAnnees()
      const anneesData = Array.isArray(response.data) ? response.data : response.data?.results || []
      setAnnees(anneesData)
    } catch (error) {
      console.error("Error fetching annees:", error)
      setAnnees([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const courseData = {
        ...formData,
        credits: Number.parseInt(formData.credits),
        volume_horaire: Number.parseInt(formData.volume_horaire),
        filiere: Number.parseInt(formData.filiere),
        annee: Number.parseInt(formData.annee),
      }

      if (editingCourse) {
        await adminAPI.updateCourse(editingCourse.id, courseData)
        alert("Cours modifié avec succès")
      } else {
        await adminAPI.createCourse(courseData)
        alert("Cours créé avec succès")
      }
      setShowModal(false)
      setEditingCourse(null)
      setFormData({
        title: "",
        code: "",
        description: "",
        credits: "",
        volume_horaire: "",
        level: "",
        filiere: "",
        annee: "",
      })
      fetchCourses()
    } catch (error) {
      console.error("Error saving course:", error)
      alert("Erreur lors de l'enregistrement: " + (error.response?.data?.detail || error.message))
    }
  }

  const handleEdit = (course) => {
    setEditingCourse(course)
    setFormData({
      title: course.title,
      code: course.code,
      description: course.description || "",
      credits: course.credits || "",
      volume_horaire: course.volume_horaire || "",
      level: course.level || "",
      filiere: course.filiere || "",
      annee: course.annee || "",
    })
    setShowModal(true)
  }

  const handleDelete = async (courseId) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce cours ?")) return

    try {
      await adminAPI.deleteCourse(courseId)
      alert("Cours supprimé avec succès")
      fetchCourses()
    } catch (error) {
      console.error("Error deleting course:", error)
      alert("Erreur lors de la suppression")
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Cours</h1>
          <p className="text-muted-foreground">Gérez les cours et programmes</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau cours
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des cours</CardTitle>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <p className="text-center text-muted-foreground">Aucun cours</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Code</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Titre</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Crédits</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course.id} className="border-b border-border">
                      <td className="py-4 text-sm font-mono">{course.code}</td>
                      <td className="py-4 text-sm">{course.title}</td>
                      <td className="py-4 text-sm">{course.credits || "N/A"}</td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(course)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDelete(course.id)}>
                            <Trash2 className="h-4 w-4" />
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

      {/* Create/Edit Course Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{editingCourse ? "Modifier le cours" : "Nouveau cours"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Code du cours</label>
                  <Input
                    placeholder="Ex: ALGO-301"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Titre du cours</label>
                  <Input
                    placeholder="Ex: Algorithmique Avancée"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    rows={3}
                    placeholder="Description du cours..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Crédits</label>
                  <Input
                    type="number"
                    placeholder="4"
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                    required
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Volume horaire</label>
                  <Input
                    type="number"
                    placeholder="60"
                    value={formData.volume_horaire}
                    onChange={(e) => setFormData({ ...formData, volume_horaire: e.target.value })}
                    required
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Niveau</label>
                  <select
                    className="w-full rounded-md border border-input bg-white text-gray-900 px-3 py-2 text-sm"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    required
                  >
                    <option value="">Sélectionnez un niveau</option>
                    <option value="licence1">Licence 1</option>
                    <option value="licence2">Licence 2</option>
                    <option value="licence3">Licence 3</option>
                    <option value="master1">Master 1</option>
                    <option value="master2">Master 2</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Filière</label>
                  <select
                    className="w-full rounded-md border border-input bg-white text-gray-900 px-3 py-2 text-sm"
                    value={formData.filiere}
                    onChange={(e) => setFormData({ ...formData, filiere: e.target.value })}
                    required
                  >
                    <option value="">Sélectionnez une filière</option>
                    {filieres.map((filiere) => (
                      <option key={filiere.id} value={filiere.id}>
                        {filiere.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Année</label>
                  <select
                    className="w-full rounded-md border border-input bg-white text-gray-900 px-3 py-2 text-sm"
                    value={formData.annee}
                    onChange={(e) => setFormData({ ...formData, annee: e.target.value })}
                    required
                  >
                    <option value="">Sélectionnez une année</option>
                    {annees.map((annee) => (
                      <option key={annee.id} value={annee.id}>
                        {annee.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">{editingCourse ? "Modifier" : "Créer"}</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowModal(false)
                      setEditingCourse(null)
                      setFormData({
                        title: "",
                        code: "",
                        description: "",
                        credits: "",
                        volume_horaire: "",
                        level: "",
                        filiere: "",
                        annee: "",
                      })
                    }}
                  >
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
