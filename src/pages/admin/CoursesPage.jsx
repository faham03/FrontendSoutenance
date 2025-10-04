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
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    credits: "",
  })

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await adminAPI.getCourses()
      setCourses(response.data)
    } catch (error) {
      console.error("Error fetching courses:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingCourse) {
        await adminAPI.updateCourse(editingCourse.id, formData)
        alert("Cours modifié avec succès")
      } else {
        await adminAPI.createCourse(formData)
        alert("Cours créé avec succès")
      }
      setShowModal(false)
      setEditingCourse(null)
      setFormData({ name: "", code: "", description: "", credits: "" })
      fetchCourses()
    } catch (error) {
      console.error("Error saving course:", error)
      alert("Erreur lors de l'enregistrement")
    }
  }

  const handleEdit = (course) => {
    setEditingCourse(course)
    setFormData({
      name: course.name,
      code: course.code,
      description: course.description || "",
      credits: course.credits || "",
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
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Nom</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Crédits</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course.id} className="border-b border-border">
                      <td className="py-4 text-sm font-mono">{course.code}</td>
                      <td className="py-4 text-sm">{course.name}</td>
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
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{editingCourse ? "Modifier le cours" : "Nouveau cours"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Code du cours</label>
                  <Input
                    placeholder="Ex: CS101"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom du cours</label>
                  <Input
                    placeholder="Ex: Introduction à la programmation"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Crédits</label>
                  <Input
                    type="number"
                    placeholder="3"
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">{editingCourse ? "Modifier" : "Créer"}</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowModal(false)
                      setEditingCourse(null)
                      setFormData({ name: "", code: "", description: "", credits: "" })
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
