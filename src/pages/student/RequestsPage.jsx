"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { requestsAPI } from "@/services/api"
import { AlertCircle, CheckCircle, Clock, Plus } from "lucide-react"

export default function RequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    request_type: "",
    description: "",
  })

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await requestsAPI.getRequests()
      setRequests(response.data)
    } catch (error) {
      console.error("Error fetching requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await requestsAPI.createRequest(formData)
      setShowModal(false)
      setFormData({ request_type: "", description: "" })
      alert("Demande envoyée avec succès")
      fetchRequests()
    } catch (error) {
      console.error("Error creating request:", error)
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
          <h1 className="text-3xl font-bold">Mes Demandes</h1>
          <p className="text-muted-foreground">Gérez vos demandes administratives</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle demande
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des demandes</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-center text-muted-foreground">Aucune demande</p>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="rounded-lg border border-border p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{request.request_type}</h4>
                      <p className="mt-1 text-sm text-muted-foreground">{request.description}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {new Date(request.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <div>{getStatusBadge(request.status)}</div>
                  </div>
                  {request.admin_response && (
                    <div className="mt-3 rounded-md bg-muted p-3">
                      <p className="text-sm font-medium">Réponse de l'administration:</p>
                      <p className="mt-1 text-sm text-muted-foreground">{request.admin_response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Request Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Nouvelle demande</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type de demande</label>
                  <Input
                    placeholder="Ex: Attestation de scolarité"
                    value={formData.request_type}
                    onChange={(e) => setFormData({ ...formData, request_type: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    rows={4}
                    placeholder="Décrivez votre demande..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
