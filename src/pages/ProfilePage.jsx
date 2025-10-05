"use client"

import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { authAPI } from "@/services/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Lock, CheckCircle, AlertCircle } from "lucide-react"

export default function ProfilePage() {
  const { user } = useAuth()
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    new_password2: "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: "", text: "" })

    try {
      await authAPI.updatePassword(passwordData)
      setMessage({ type: "success", text: "Mot de passe changé avec succès!" })
      setPasswordData({ old_password: "", new_password: "", new_password2: "" })
    } catch (error) {
      const errorMsg = error.response?.data?.old_password?.[0] || "Erreur lors du changement de mot de passe"
      setMessage({ type: "error", text: errorMsg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mon Profil</h1>
        <p className="text-muted-foreground">Gérez vos informations personnelles et votre mot de passe</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations personnelles
            </CardTitle>
            <CardDescription>Vos informations de profil</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nom complet</Label>
              <Input value={`${user?.first_name} ${user?.last_name}`} disabled />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={user?.email} disabled />
            </div>
            <div>
              <Label>Nom d'utilisateur</Label>
              <Input value={user?.username} disabled />
            </div>
            <div>
              <Label>Rôle</Label>
              <Input
                value={
                  user?.role === "student" ? "Étudiant" : user?.role === "teacher" ? "Enseignant" : "Administrateur"
                }
                disabled
              />
            </div>
            {user?.matricule && (
              <div>
                <Label>Matricule</Label>
                <Input value={user?.matricule} disabled />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Changer le mot de passe
            </CardTitle>
            <CardDescription>Mettez à jour votre mot de passe</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <Label htmlFor="old_password">Ancien mot de passe</Label>
                <Input
                  id="old_password"
                  type="password"
                  value={passwordData.old_password}
                  onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="new_password">Nouveau mot de passe</Label>
                <Input
                  id="new_password"
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="new_password2">Confirmer le nouveau mot de passe</Label>
                <Input
                  id="new_password2"
                  type="password"
                  value={passwordData.new_password2}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password2: e.target.value })}
                  required
                />
              </div>

              {message.text && (
                <Alert variant={message.type === "error" ? "destructive" : "default"}>
                  {message.type === "success" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>{message.text}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Changement en cours..." : "Changer le mot de passe"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
