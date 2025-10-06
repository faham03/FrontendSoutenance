"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { adminAPI } from "@/services/api"
import { AlertCircle, CheckCircle, Clock, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ClaimsPage() {
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedClaim, setSelectedClaim] = useState(null)
  const [response, setResponse] = useState("")
  const [message, setMessage] = useState({ type: "", text: "" })

  useEffect(() => {
    fetchClaims()
  }, [])

  const fetchClaims = async () => {
    try {
      const res = await adminAPI.getClaims()
      const claimsData = Array.isArray(res.data) ? res.data : res.data?.results || []
      setClaims(claimsData)
    } catch (error) {
      console.error("Error fetching claims:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRespond = async (status) => {
    if (!selectedClaim || !response.trim()) {
      setMessage({ type: "error", text: "Veuillez entrer une réponse" })
      return
    }

    try {
      await adminAPI.respondToClaim(selectedClaim.id, {
        response: response,
        status: status,
      })
      setMessage({ type: "success", text: "Réclamation traitée avec succès!" })
      setSelectedClaim(null)
      setResponse("")
      fetchClaims()
    } catch (error) {
      console.error("Error responding to claim:", error)
      const errorMsg = error.response?.data?.detail || "Erreur lors du traitement"
      setMessage({ type: "error", text: errorMsg })
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { icon: Clock, text: "En attente", variant: "secondary" },
      approved: { icon: CheckCircle, text: "Approuvée", variant: "default" },
      rejected: { icon: AlertCircle, text: "Rejetée", variant: "destructive" },
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
        <h1 className="text-3xl font-bold">Gestion des Réclamations</h1>
        <p className="text-muted-foreground">Traitez les réclamations de notes des étudiants</p>
      </div>

      {message.text && !selectedClaim && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Liste des réclamations</CardTitle>
        </CardHeader>
        <CardContent>
          {claims.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Aucune réclamation</p>
          ) : (
            <div className="space-y-4">
              {claims.map((claim) => (
                <div key={claim.id} className="rounded-lg border border-border p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">Réclamation #{claim.id}</h4>
                        {getStatusBadge(claim.status)}
                      </div>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">Étudiant:</span> {claim.student_name}
                        </p>
                        <p>
                          <span className="font-medium">Cours:</span> {claim.course_code} - {claim.course_title}
                        </p>
                        <p>
                          <span className="font-medium">Note:</span> {claim.grade_value}/20
                        </p>
                      </div>
                      <div className="mt-3">
                        <Label className="text-sm font-medium">Raison de la réclamation:</Label>
                        <p className="mt-1 text-sm text-muted-foreground">{claim.reason}</p>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Créée le {new Date(claim.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                  {claim.status === "pending" && (
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" onClick={() => setSelectedClaim(claim)}>
                        Répondre
                      </Button>
                    </div>
                  )}
                  {claim.admin_response && (
                    <div className="mt-3 rounded-md bg-muted p-3">
                      <Label className="text-sm font-medium">Réponse de l'administration:</Label>
                      <p className="mt-1 text-sm text-muted-foreground">{claim.admin_response}</p>
                      {claim.responded_at && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Répondu le {new Date(claim.responded_at).toLocaleDateString("fr-FR")}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Response Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Répondre à la réclamation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm">
                  <p>
                    <span className="font-medium">Étudiant:</span> {selectedClaim.student_name}
                  </p>
                  <p>
                    <span className="font-medium">Cours:</span> {selectedClaim.course_code}
                  </p>
                  <p>
                    <span className="font-medium">Note:</span> {selectedClaim.grade_value}/20
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Raison:</Label>
                  <p className="text-sm text-muted-foreground">{selectedClaim.reason}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="response">Votre réponse *</Label>
                <Textarea
                  id="response"
                  rows={4}
                  placeholder="Expliquez votre décision..."
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                />
              </div>
              {message.text && selectedClaim && (
                <Alert variant={message.type === "error" ? "destructive" : "default"}>
                  <AlertDescription>{message.text}</AlertDescription>
                </Alert>
              )}
              <div className="flex gap-2">
                <Button onClick={() => handleRespond("approved")} disabled={!response.trim()} className="flex-1">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approuver
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleRespond("rejected")}
                  disabled={!response.trim()}
                  className="flex-1"
                >
                  <X className="mr-2 h-4 w-4" />
                  Rejeter
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedClaim(null)
                  setResponse("")
                  setMessage({ type: "", text: "" })
                }}
                className="w-full"
              >
                Annuler
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
