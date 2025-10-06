"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap } from "lucide-react"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    console.log("[v0] Login form submitted")
    const result = await login(username, password)
    console.log("[v0] Login result:", result)

    if (result.success) {
      console.log("[v0] Login successful, navigating to /")
      navigate("/")
    } else {
      console.log("[v0] Login failed:", result.error)
      setError(result.error)
    }

    setLoading(false)
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Section gauche avec couleur bleue et bienvenue */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 flex-col items-center justify-center p-8 text-white">
        <div className="max-w-md text-center space-y-6">
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold">Ayuda</h1>
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold">Bienvenue sur la plateforme</h2>
            <p className="text-lg text-blue-100">
              Connectez-vous pour accéder à votre espace personnel et découvrir toutes les fonctionnalités de notre
              plateforme Ayuda.
            </p>
          </div>
        </div>

        {/* Copyright en bas */}
        <div className="absolute bottom-8 text-center">
          <p className="text-blue-200 text-sm">© {new Date().getFullYear()} Ayuda. Tous droits réservés.</p>
        </div>
      </div>

      {/* Section droite avec le formulaire de connexion */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-3xl">Ayuda</CardTitle>
              <CardDescription className="mt-2">Connectez-vous à votre compte</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Nom d'utilisateur
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="votre_nom_utilisateur"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Mot de passe
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Connexion..." : "Se connecter"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Pas encore de compte ?{" "}
                <Link to="/register" className="text-primary hover:underline">
                  S'inscrire
                </Link>
              </p>
            </form>

            {/* Copyright pour mobile */}
            <div className="mt-8 pt-4 border-t border-border lg:hidden">
              <p className="text-center text-xs text-muted-foreground">
                © {new Date().getFullYear()} Ayuda. Tous droits réservés.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
