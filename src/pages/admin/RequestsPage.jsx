"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { adminAPI } from "@/services/api"
import { AlertCircle, CheckCircle, Clock, X } from "lucide-react"

export default function RequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [response, setResponse] = useState("")

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const res = await adminAPI.getRequests()
      setRequests(res.data)
    } catch (error) {
      console.error("Error fetching requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRespond = async (requestId, status) => {
    try {
      await adminAPI.updateRequest(requestId, { status, admin_response: response })
      alert("Demande traitée avec succès")
      setSelectedRequest(null)
      setResponse("")
      fetchRequests()
    } catch (error) {
      console.error("Error updating request:", error)
      alert("Erreur lors du traitement")
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
      <div>
        <h1 className="text-3xl font-bold">Gestion des Demandes</h1>
        <p className="text-muted-foreground">Traitez les demandes des étudiants</p>
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
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{request.request_type}</h4>
                        {getStatusBadge(request.status)}
                      </div>
                      <p className="mt-2 text-sm">
                        <span className="font-medium">Étudiant:</span> {request.student_name || "N/A"}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">{request.description}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {new Date(request.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                  {request.status === "pending" && (
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" onClick={() => setSelectedRequest(request)}>
                        Répondre
                      </Button>
                    </div>
                  )}
                  {request.admin_response && (
                    <div className="mt-3 rounded-md bg-muted p-3">
                      <p className="text-sm font-medium">Réponse:</p>
                      <p className="mt-1 text-sm text-muted-foreground">{request.admin_response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Response Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Répondre à la demande</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm">
                  <span className="font-medium">Type:</span> {selectedRequest.request_type}
                </p>
                <p className="mt-1 text-sm">
                  <span className="font-medium">Description:</span> {selectedRequest.description}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Votre réponse</label>
                <textarea
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  rows={4}
                  placeholder="Expliquez votre décision..."
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleRespond(selectedRequest.id, "approved")} disabled={!response.trim()}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approuver
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleRespond(selectedRequest.id, "rejected")}
                  disabled={!response.trim()}
                >
                  <X className="mr-2 h-4 w-4" />
                  Rejeter
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedRequest(null)
                    setResponse("")
                  }}
                >
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
