"use client"

import { useState, useEffect } from "react"
import { gradesAPI } from "@/services/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Plus, CheckCircle, XCircle, Clock } from "lucide-react"

export default function GradeClaimsPage() {
  const [claims, setClaims] = useState([])
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    grade: "",
    reason: "",
  })
  const [message, setMessage] = useState({ type: "", text: "" })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [claimsRes, gradesRes] = await Promise.all([gradesAPI.getClaims(), gradesAPI.getMyGrades()])
      const claimsData = Array.isArray(claimsRes.data) ? claimsRes.data : claimsRes.data?.results || []
      const gradesData = Array.isArray(gradesRes.data) ? gradesRes.data : gradesRes.data?.results || []

      setClaims(claimsData)
      setGrades(gradesData.filter((g) => g.status === "validated"))
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: "", text: "" })

    try {
      await gradesAPI.createClaim(formData)
      setMessage({ type: "success", text: "Réclamation créée avec succès!" })
      setDialogOpen(false)
      setFormData({ grade: "", reason: "" })
      fetchData()
    } catch (error) {
      const errorMsg = error.response?.data?.grade?.[0] || error.response?.data?.detail || "Erreur lors de la création"
      setMessage({ type: "error", text: errorMsg })
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      pending: { variant: "secondary", icon: Clock, label: "En attente" },
      approved: { variant: "default", icon: CheckCircle, label: "Approuvée" },
      rejected: { variant: "destructive", icon: XCircle, label: "Rejetée" },
    }
    const config = variants[status] || variants.pending
    const Icon = config.icon
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getEvaluationType = (type) => {
    const types = {
      exam: "Examen",
      test: "Contrôle continu",
      project: "Projet",
      participation: "Participation",
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
          <h1 className="text-3xl font-bold">Réclamations de notes</h1>
          <p className="text-muted-foreground">Contestez vos notes si nécessaire</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle réclamation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une réclamation</DialogTitle>
              <DialogDescription>Sélectionnez la note à contester et expliquez votre raison</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="grade">Note à contester</Label>
                <select
                  id="grade"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  required
                >
                  <option value="">Sélectionner une note</option>
                  {grades.map((grade) => (
                    <option key={grade.id} value={grade.id}>
                      {grade.course_code} - {grade.value}/20 ({getEvaluationType(grade.evaluation_type)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="reason">Raison de la réclamation</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Expliquez pourquoi vous contestez cette note..."
                  rows={4}
                  required
                />
              </div>
              {message.text && (
                <Alert variant={message.type === "error" ? "destructive" : "default"}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{message.text}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full">
                Soumettre la réclamation
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {claims.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Aucune réclamation pour le moment</p>
            </CardContent>
          </Card>
        ) : (
          claims.map((claim) => (
            <Card key={claim.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {claim.course_code} - {claim.course_title}
                    </CardTitle>
                    <CardDescription>Note: {claim.grade_value}/20</CardDescription>
                  </div>
                  {getStatusBadge(claim.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Votre raison:</Label>
                  <p className="mt-1 text-sm text-muted-foreground">{claim.reason}</p>
                </div>
                {claim.admin_response && (
                  <div className="rounded-md bg-muted p-3">
                    <Label className="text-sm font-medium">Réponse de l'administration:</Label>
                    <p className="mt-1 text-sm text-muted-foreground">{claim.admin_response}</p>
                    {claim.responded_at && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Répondu le {new Date(claim.responded_at).toLocaleDateString("fr-FR")}
                      </p>
                    )}
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  Créée le {new Date(claim.created_at).toLocaleDateString("fr-FR")}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
