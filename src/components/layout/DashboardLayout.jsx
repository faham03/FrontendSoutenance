"use client"

import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { GraduationCap, LayoutDashboard, BookOpen, Calendar, FileText, Bell, LogOut, Menu, X, User } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const getNavItems = () => {
    if (user?.role === "student") {
      return [
        { icon: LayoutDashboard, label: "Tableau de bord", path: "/student/dashboard" },
        { icon: BookOpen, label: "Mes Notes", path: "/student/grades" },
        { icon: Calendar, label: "Emploi du temps", path: "/student/schedule" },
        { icon: FileText, label: "Événements", path: "/student/events" },
        { icon: FileText, label: "Mes Demandes", path: "/student/requests" },
      ]
    }
    if (user?.role === "teacher") {
      return [
        { icon: LayoutDashboard, label: "Tableau de bord", path: "/teacher/dashboard" },
        { icon: BookOpen, label: "Attribuer Notes", path: "/teacher/grades" },
        { icon: Calendar, label: "Emploi du temps", path: "/teacher/schedule" },
        { icon: FileText, label: "Permissions", path: "/teacher/permissions" },
      ]
    }
    if (user?.role === "admin") {
      return [
        { icon: LayoutDashboard, label: "Tableau de bord", path: "/admin/dashboard" },
        { icon: User, label: "Utilisateurs", path: "/admin/users" },
        { icon: BookOpen, label: "Cours", path: "/admin/courses" },
        { icon: FileText, label: "Réclamations", path: "/admin/claims" },
        { icon: FileText, label: "Demandes", path: "/admin/requests" },
      ]
    }
    return []
  }

  const navItems = getNavItems()

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border bg-card transition-transform duration-300 lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 border-b border-border px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold">Ayuda</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* User info */}
          <div className="border-t border-border p-4">
            <div className="mb-3 rounded-lg bg-muted p-3">
              <p className="text-sm font-medium">{user?.first_name + " " + user?.last_name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {user?.role === "student" && "Étudiant"}
                {user?.role === "teacher" && "Enseignant"}
                {user?.role === "admin" && "Administrateur"}
              </p>
            </div>
            <Button variant="outline" className="w-full bg-transparent" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
