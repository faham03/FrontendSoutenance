"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { gradesAPI } from "@/services/api"
import { AlertCircle, CheckCircle, Clock } from "lucide-react"

export default function GradesPage() {
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [selectedGrade, setSelectedGrade] = useState(null)
  const [claimReason, setClaimReason] = useState("")

  useEffect(() => {
    fetchGrades()
  }, [])

  const fetchGrades = async () => {
    try {
      const response = await gradesAPI.getGrades()
      setGrades(response.data)
    } catch (error) {
      console.error("Error fetching grades:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleClaim = async () => {
    if (!selectedGrade || !claimReason.trim()) return

    try {
      await gradesAPI.createClaim({
        grade: selectedGrade.id,
        reason: claimReason,
      })
      setShowClaimModal(false)
      setClaimReason("")
      setSelectedGrade(null)
      alert("Réclamation envoyée avec succès")
      fetchGrades()
    } catch (error) {
      console.error("Error creating claim:", error)
      alert("Erreur lors de l'envoi de la réclamation")
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { icon: Clock, text: "En attente", className: "bg-yellow-500/10 text-yellow-500" },
      validated: { icon: CheckCircle, text: "Validée", className: "bg-green-500/10 text-green-500" },
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
        <h1 className="text-3xl font-bold">Mes Notes</h1>
        <p className="text-muted-foreground">Consultez vos notes et faites des réclamations si nécessaire</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des notes</CardTitle>
        </CardHeader>
        <CardContent>
          {grades.length === 0 ? (
            <p className="text-center text-muted-foreground">Aucune note disponible</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Cours</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Note</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Statut</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((grade) => (
                    <tr key={grade.id} className="border-b border-border">
                      <td className="py-4 text-sm">{grade.course_name || "Cours"}</td>
                      <td className="py-4 text-sm font-bold">{grade.grade}/20</td>
                      <td className="py-4">{getStatusBadge(grade.status)}</td>
                      <td className="py-4 text-sm text-muted-foreground">
                        {new Date(grade.created_at).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="py-4">
                        {grade.status === "validated" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedGrade(grade)
                              setShowClaimModal(true)
                            }}
                          >
                            Réclamer
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Claim Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Faire une réclamation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Note: <span className="font-bold">{selectedGrade?.grade}/20</span>
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Raison de la réclamation</label>
                <textarea
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  rows={4}
                  placeholder="Expliquez pourquoi vous réclamez cette note..."
                  value={claimReason}
                  onChange={(e) => setClaimReason(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleClaim} disabled={!claimReason.trim()}>
                  Envoyer
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowClaimModal(false)
                    setClaimReason("")
                    setSelectedGrade(null)
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
