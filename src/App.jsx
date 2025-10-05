"use client"

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "@/context/AuthContext"
import ProtectedRoute from "@/components/ProtectedRoute"
import DashboardLayout from "@/components/layout/DashboardLayout"
import LoginPage from "@/pages/auth/LoginPage"
import RegisterPage from "@/pages/auth/RegisterPage"
import StudentDashboard from "@/pages/student/StudentDashboard"
import GradesPage from "@/pages/student/GradesPage"
import SchedulePage from "@/pages/student/SchedulePage"
import EventsPage from "@/pages/student/EventsPage"
import RequestsPage from "@/pages/student/RequestsPage"
import TeacherDashboard from "@/pages/teacher/TeacherDashboard"
import AssignGradesPage from "@/pages/teacher/AssignGradesPage"
import TeacherSchedulePage from "@/pages/teacher/TeacherSchedulePage"
import PermissionsPage from "@/pages/teacher/PermissionsPage"
import AdminDashboard from "@/pages/admin/AdminDashboard"
import UsersPage from "@/pages/admin/UsersPage"
import CoursesPage from "@/pages/admin/CoursesPage"
import ClaimsPage from "@/pages/admin/ClaimsPage"
import AdminRequestsPage from "@/pages/admin/RequestsPage"
import FilieresPage from "@/pages/admin/FilieresPage"
import AnneesPage from "@/pages/admin/AnneesPage"

function RoleBasedRedirect() {
  const { user, loading } = useAuth()

  console.log("[v0] RoleBasedRedirect - loading:", loading, "user:", user)

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!user) {
    console.log("[v0] No user, redirecting to login")
    return <Navigate to="/login" replace />
  }

  console.log("[v0] User role:", user.role)

  if (user.role === "student") {
    console.log("[v0] Redirecting to student dashboard")
    return <Navigate to="/student/dashboard" replace />
  }
  if (user.role === "teacher") {
    console.log("[v0] Redirecting to teacher dashboard")
    return <Navigate to="/teacher/dashboard" replace />
  }
  if (user.role === "admin") {
    console.log("[v0] Redirecting to admin dashboard")
    return <Navigate to="/admin/dashboard" replace />
  }

  console.log("[v0] No valid role, redirecting to login")
  return <Navigate to="/login" replace />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/" element={<RoleBasedRedirect />} />

          {/* Student Routes */}
          <Route
            path="/student/*"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <DashboardLayout>
                  <Routes>
                    <Route path="dashboard" element={<StudentDashboard />} />
                    <Route path="grades" element={<GradesPage />} />
                    <Route path="schedule" element={<SchedulePage />} />
                    <Route path="events" element={<EventsPage />} />
                    <Route path="requests" element={<RequestsPage />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Teacher Routes */}
          <Route
            path="/teacher/*"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <DashboardLayout>
                  <Routes>
                    <Route path="dashboard" element={<TeacherDashboard />} />
                    <Route path="grades" element={<AssignGradesPage />} />
                    <Route path="schedule" element={<TeacherSchedulePage />} />
                    <Route path="permissions" element={<PermissionsPage />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="users" element={<UsersPage />} />
                    <Route path="filieres" element={<FilieresPage />} />
                    <Route path="annees" element={<AnneesPage />} />
                    <Route path="courses" element={<CoursesPage />} />
                    <Route path="claims" element={<ClaimsPage />} />
                    <Route path="requests" element={<AdminRequestsPage />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
