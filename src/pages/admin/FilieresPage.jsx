"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { adminAPI } from "@/services/api"
import { Plus, Pencil, Trash2 } from "lucide-react"

export default function FilieresPage() {
  const [filieres, setFilieres] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  useEffect(() => {
    fetchFilieres()
  }, [])

  const fetchFilieres = async () => {
    try {
      const response = await adminAPI.getFilieres()
      const data = Array.isArray(response.data) ? response.data : response.data.results || []
      setFilieres(data)
    } catch (error) {
      console.error("Error fetching filieres:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await adminAPI.updateFiliere(editingId, formData)
      } else {
        await adminAPI.createFiliere(formData)
      }
      setFormData({ name: "", description: "" })
      setShowForm(false)
      setEditingId(null)
      fetchFilieres()
    } catch (error) {
      console.error("Error saving filiere:", error)
      alert("Erreur lors de l'enregistrement de la filière")
    }
  }

  const handleEdit = (filiere) => {
    setFormData({
      name: filiere.name,
      description: filiere.description || "",
    })
    setEditingId(filiere.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette filière ?")) return

    try {
      await adminAPI.deleteFiliere(id)
      fetchFilieres()
    } catch (error) {
      console.error("Error deleting filiere:", error)
      alert("Erreur lors de la suppression de la filière")
    }
  }

  const handleCancel = () => {
    setFormData({ name: "", description: "" })
    setShowForm(false)
    setEditingId(null)
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
          <h1 className="text-3xl font-bold">Gestion des Filières</h1>
          <p className="text-muted-foreground">Créer et gérer les filières</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle Filière
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Modifier la filière" : "Nouvelle filière"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nom de la filière</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Informatique"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description de la filière"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editingId ? "Mettre à jour" : "Créer"}</Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Liste des filières ({filieres.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filieres.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Aucune filière créée</p>
          ) : (
            <div className="space-y-2">
              {filieres.map((filiere) => (
                <div
                  key={filiere.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent"
                >
                  <div>
                    <h3 className="font-semibold">{filiere.name}</h3>
                    {filiere.description && <p className="text-sm text-muted-foreground">{filiere.description}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(filiere)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(filiere.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
