"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, AlertCircle, CheckCircle, Clock } from "lucide-react"

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    reason: "",
    start_date: "",
    end_date: "",
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Note: This would need the proper API endpoint for creating permissions
      // await teacherAPI.createPermission(formData)
      setShowModal(false)
      setFormData({ reason: "", start_date: "", end_date: "" })
      alert("Demande de permission envoyée avec succès")
    } catch (error) {
      console.error("Error creating permission:", error)
      alert("Erreur lors de l'envoi de la demande")
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { icon: Clock, text: "En attente", className: "bg-yellow-500/10 text-yellow-500" },
      approved: { icon: CheckCircle, text: "Approuvée", className: "bg-green-500/10 text-green-500" },
      rejected: { icon: AlertCircle, text: "Rejetée", className: "bg-red-500/10 text-red-500" },
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Demandes de Permission</h1>
          <p className="text-muted-foreground">Gérez vos demandes de permission</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle demande
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mes demandes</CardTitle>
        </CardHeader>
        <CardContent>
          {permissions.length === 0 ? (
            <p className="text-center text-muted-foreground">Aucune demande de permission</p>
          ) : (
            <div className="space-y-4">
              {permissions.map((permission) => (
                <div key={permission.id} className="rounded-lg border border-border p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{permission.reason}</h4>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Du {new Date(permission.start_date).toLocaleDateString("fr-FR")} au{" "}
                        {new Date(permission.end_date).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <div>{getStatusBadge(permission.status)}</div>
                  </div>
                  {permission.admin_response && (
                    <div className="mt-3 rounded-md bg-muted p-3">
                      <p className="text-sm font-medium">Réponse de l'administration:</p>
                      <p className="mt-1 text-sm text-muted-foreground">{permission.admin_response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Permission Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Demander une permission</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Raison</label>
                  <Input
                    placeholder="Ex: Congé maladie"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date de début</label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date de fin</label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Envoyer</Button>
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
