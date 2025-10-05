"use client"

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap } from "lucide-react"
import { adminAPI } from "@/services/api"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    first_name: "",
    last_name: "",
    filiere: "",
    annee: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [filieres, setFilieres] = useState([])
  const [annees, setAnnees] = useState([])
  const { register } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchFilieres()
    fetchAnnees()
  }, [])

  const fetchFilieres = async () => {
    try {
      const response = await adminAPI.getFilieres()
      const filieresData = Array.isArray(response.data) ? response.data : response.data?.results || []
      setFilieres(filieresData)
    } catch (error) {
      console.error("Error fetching filieres:", error)
      setFilieres([])
    }
  }

  const fetchAnnees = async () => {
    try {
      const response = await adminAPI.getAnnees()
      const anneesData = Array.isArray(response.data) ? response.data : response.data?.results || []
      setAnnees(anneesData)
    } catch (error) {
      console.error("Error fetching annees:", error)
      setAnnees([])
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.password2) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    if (!formData.filiere || !formData.annee) {
      setError("Veuillez sélectionner une filière et une année")
      return
    }

    setLoading(true)

    const dataToSend = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      password2: formData.password2,
      first_name: formData.first_name,
      last_name: formData.last_name,
      filiere: Number.parseInt(formData.filiere),
      annee: Number.parseInt(formData.annee),
    }

    console.log("[v0] Sending registration data:", dataToSend)
    const result = await register(dataToSend)

    if (result.success) {
      navigate("/login", {
        state: { message: "Inscription réussie ! Vous pouvez maintenant vous connecter." },
      })
    } else {
      console.error("[v0] Registration error:", result.error)
      setError(typeof result.error === "string" ? result.error : JSON.stringify(result.error))
    }

    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-3xl">Inscription Étudiant</CardTitle>
            <CardDescription className="mt-2">Créez votre compte Ayuda</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="first_name" className="text-sm font-medium">
                  Prénom
                </label>
                <Input
                  id="first_name"
                  name="first_name"
                  placeholder="Jean"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="last_name" className="text-sm font-medium">
                  Nom
                </label>
                <Input
                  id="last_name"
                  name="last_name"
                  placeholder="Dupont"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Nom d'utilisateur
              </label>
              <Input
                id="username"
                name="username"
                placeholder="jean.dupont"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="votre.email@universite.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="filiere" className="text-sm font-medium">
                  Filière
                </label>
                <select
                  id="filiere"
                  name="filiere"
                  className="w-full rounded-md border border-input bg-white text-gray-900 px-3 py-2 text-sm"
                  value={formData.filiere}
                  onChange={handleChange}
                  required
                >
                  <option value="">Sélectionnez une filière</option>
                  {filieres.map((filiere) => (
                    <option key={filiere.id} value={filiere.id}>
                      {filiere.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="annee" className="text-sm font-medium">
                  Année
                </label>
                <select
                  id="annee"
                  name="annee"
                  className="w-full rounded-md border border-input bg-white text-gray-900 px-3 py-2 text-sm"
                  value={formData.annee}
                  onChange={handleChange}
                  required
                >
                  <option value="">Sélectionnez une année</option>
                  {annees.map((annee) => (
                    <option key={annee.id} value={annee.id}>
                      {annee.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Mot de passe
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password2" className="text-sm font-medium">
                Confirmer le mot de passe
              </label>
              <Input
                id="password2"
                name="password2"
                type="password"
                placeholder="••••••••"
                value={formData.password2}
                onChange={handleChange}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Inscription..." : "S'inscrire"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Déjà un compte ?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Se connecter
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
