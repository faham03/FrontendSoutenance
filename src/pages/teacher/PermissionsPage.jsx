"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, AlertCircle, CheckCircle, Clock, FileText, X } from "lucide-react"
import { requestsAPI } from "@/services/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export default function PermissionsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    type_request: "",
    title: "",
    description: "",
    document: null,
  })

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await requestsAPI.getMyRequests()
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
      const submitData = new FormData()
      submitData.append("type_request", formData.type_request)
      submitData.append("title", formData.title)
      submitData.append("description", formData.description)
      if (formData.document) {
        submitData.append("document", formData.document)
      }

      await requestsAPI.createRequest(submitData)
      setShowModal(false)
      setFormData({ type_request: "", title: "", description: "", document: null })
      fetchRequests()
      alert("Demande envoyée avec succès")
    } catch (error) {
      console.error("Error creating request:", error)
      alert(error.response?.data?.detail || "Erreur lors de l'envoi de la demande")
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { icon: Clock, text: "En attente", className: "bg-yellow-500/10 text-yellow-500" },
      in_progress: { icon: Clock, text: "En cours", className: "bg-blue-500/10 text-blue-500" },
      approved: { icon: CheckCircle, text: "Approuvée", className: "bg-green-500/10 text-green-500" },
      rejected: { icon: AlertCircle, text: "Rejetée", className: "bg-red-500/10 text-red-500" },
      cancelled: { icon: X, text: "Annulée", className: "bg-gray-500/10 text-gray-500" },
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

  const getTypeLabel = (type) => {
    const types = {
      academic_record: "Relevé de notes",
      certificate: "Attestation",
      grade_appeal: "Réclamation de note",
      administrative: "Demande administrative",
      other: "Autre",
    }
    return types[type] || type
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mes Demandes</h1>
          <p className="text-muted-foreground">Gérez vos demandes administratives</p>
        </div>
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle demande
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une demande</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Type de demande</Label>
                <Select
                  value={formData.type_request}
                  onValueChange={(value) => setFormData({ ...formData, type_request: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic_record">Relevé de notes</SelectItem>
                    <SelectItem value="certificate">Attestation de scolarité</SelectItem>
                    <SelectItem value="administrative">Demande administrative</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Titre</Label>
                <Input
                  placeholder="Ex: Demande d'attestation"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Décrivez votre demande..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Document (optionnel)</Label>
                <Input type="file" onChange={(e) => setFormData({ ...formData, document: e.target.files[0] })} />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Envoyer</Button>
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Annuler
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mes demandes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : requests.length === 0 ? (
            <p className="text-center text-muted-foreground">Aucune demande</p>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="rounded-lg border border-border p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{request.title}</h4>
                        <span className="text-xs text-muted-foreground">({getTypeLabel(request.type_request)})</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{request.description}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Créée le {new Date(request.created_at).toLocaleDateString("fr-FR")}
                      </p>
                      {request.document && (
                        <a
                          href={request.document}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <FileText className="h-3 w-3" />
                          Voir le document
                        </a>
                      )}
                    </div>
                    <div>{getStatusBadge(request.status)}</div>
                  </div>
                  {request.admin_response && (
                    <div className="mt-3 rounded-md bg-muted p-3">
                      <p className="text-sm font-medium">Réponse de l'administration:</p>
                      <p className="mt-1 text-sm text-muted-foreground">{request.admin_response}</p>
                      {request.processed_by_name && (
                        <p className="mt-1 text-xs text-muted-foreground">Traité par: {request.processed_by_name}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
