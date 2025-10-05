"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { adminAPI } from "@/services/api"
import { Plus, Pencil, Trash2 } from "lucide-react"

export default function AnneesPage() {
  const [annees, setAnnees] = useState([])
  const [filieres, setFilieres] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    filiere: "",
    is_active: true,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [anneesRes, filieresRes] = await Promise.all([adminAPI.getAnnees(), adminAPI.getFilieres()])

      const anneesData = Array.isArray(anneesRes.data) ? anneesRes.data : anneesRes.data.results || []
      const filieresData = Array.isArray(filieresRes.data) ? filieresRes.data : filieresRes.data.results || []

      setAnnees(anneesData)
      setFilieres(filieresData)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const dataToSend = {
        ...formData,
        filiere: Number.parseInt(formData.filiere),
      }

      if (editingId) {
        await adminAPI.updateAnnee(editingId, dataToSend)
      } else {
        await adminAPI.createAnnee(dataToSend)
      }
      setFormData({ name: "", filiere: "", is_active: true })
      setShowForm(false)
      setEditingId(null)
      fetchData()
    } catch (error) {
      console.error("Error saving annee:", error)
      alert("Erreur lors de l'enregistrement de l'année")
    }
  }

  const handleEdit = (annee) => {
    setFormData({
      name: annee.name,
      filiere: annee.filiere.toString(),
      is_active: annee.is_active,
    })
    setEditingId(annee.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette année ?")) return

    try {
      await adminAPI.deleteAnnee(id)
      fetchData()
    } catch (error) {
      console.error("Error deleting annee:", error)
      alert("Erreur lors de la suppression de l'année")
    }
  }

  const handleCancel = () => {
    setFormData({ name: "", filiere: "", is_active: true })
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
          <h1 className="text-3xl font-bold">Gestion des Années</h1>
          <p className="text-muted-foreground">Créer et gérer les années académiques</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle Année
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Modifier l'année" : "Nouvelle année"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nom de l'année</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Première année"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Filière</label>
                <select
                  value={formData.filiere}
                  onChange={(e) => setFormData({ ...formData, filiere: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-gray-900"
                  required
                >
                  <option value="">Sélectionner une filière</option>
                  {filieres.map((filiere) => (
                    <option key={filiere.id} value={filiere.id}>
                      {filiere.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4"
                />
                <label htmlFor="is_active" className="text-sm font-medium">
                  Active
                </label>
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
          <CardTitle>Liste des années ({annees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {annees.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Aucune année créée</p>
          ) : (
            <div className="space-y-2">
              {annees.map((annee) => (
                <div key={annee.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent">
                  <div>
                    <h3 className="font-semibold">{annee.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Filière: {annee.filiere_name}
                      {annee.is_active && <span className="ml-2 text-green-600">• Active</span>}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(annee)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(annee.id)}>
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
