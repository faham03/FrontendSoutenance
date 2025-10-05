"use client"

import { useState, useEffect } from "react"
import { adminAPI } from "@/services/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { MapPin, Plus, Edit, Trash2, Users } from "lucide-react"

export default function RoomsPage() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    room_type: "classroom",
    is_available: true,
  })

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      const response = await adminAPI.getRooms()
      setRooms(response.data)
    } catch (error) {
      console.error("Error fetching rooms:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingRoom) {
        await adminAPI.updateRoom(editingRoom.id, formData)
      } else {
        await adminAPI.createRoom(formData)
      }
      setDialogOpen(false)
      setEditingRoom(null)
      setFormData({ name: "", capacity: "", room_type: "classroom", is_available: true })
      fetchRooms()
    } catch (error) {
      console.error("Error saving room:", error)
    }
  }

  const handleEdit = (room) => {
    setEditingRoom(room)
    setFormData({
      name: room.name,
      capacity: room.capacity,
      room_type: room.room_type,
      is_available: room.is_available,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette salle?")) {
      try {
        await adminAPI.deleteRoom(id)
        fetchRooms()
      } catch (error) {
        console.error("Error deleting room:", error)
      }
    }
  }

  const getRoomTypeLabel = (type) => {
    const types = {
      classroom: "Salle de classe",
      lab: "Laboratoire",
      amphitheater: "Amphithéâtre",
      library: "Bibliothèque",
      other: "Autre",
    }
    return types[type] || type
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des salles</h1>
          <p className="text-muted-foreground">Gérez les salles de cours et leur disponibilité</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingRoom(null)
                setFormData({ name: "", capacity: "", room_type: "classroom", is_available: true })
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle salle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingRoom ? "Modifier la salle" : "Créer une salle"}</DialogTitle>
              <DialogDescription>Remplissez les informations de la salle</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nom de la salle</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Salle A101"
                  required
                />
              </div>
              <div>
                <Label htmlFor="capacity">Capacité</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  placeholder="Ex: 30"
                  required
                />
              </div>
              <div>
                <Label htmlFor="room_type">Type de salle</Label>
                <select
                  id="room_type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.room_type}
                  onChange={(e) => setFormData({ ...formData, room_type: e.target.value })}
                >
                  <option value="classroom">Salle de classe</option>
                  <option value="lab">Laboratoire</option>
                  <option value="amphitheater">Amphithéâtre</option>
                  <option value="library">Bibliothèque</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_available"
                  checked={formData.is_available}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="is_available" className="cursor-pointer">
                  Salle disponible
                </Label>
              </div>
              <Button type="submit" className="w-full">
                {editingRoom ? "Mettre à jour" : "Créer"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <Card key={room.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{room.name}</CardTitle>
                </div>
                <Badge variant={room.is_available ? "default" : "secondary"}>
                  {room.is_available ? "Disponible" : "Indisponible"}
                </Badge>
              </div>
              <CardDescription>{getRoomTypeLabel(room.room_type)}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                Capacité: {room.capacity} personnes
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={() => handleEdit(room)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(room.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
