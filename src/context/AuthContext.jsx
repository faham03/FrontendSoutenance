"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { authAPI } from "@/services/api"

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = sessionStorage.getItem("access_token")
    if (token) {
      try {
        const response = await authAPI.getCurrentUser()
        const userData = response.data
        console.log("[v0] User data from API:", userData)

        if (userData.role) {
          // If backend sends role directly, use it
          console.log("[v0] User role from backend:", userData.role)
        } else if (userData.is_admin) {
          userData.role = "admin"
        } else if (userData.is_teacher) {
          userData.role = "teacher"
        } else if (userData.is_student) {
          userData.role = "student"
        } else if (userData.username === "admin") {
          // Temporary workaround: detect admin by username
          userData.role = "admin"
          console.log("[v0] Role detected by username fallback: admin")
        }

        console.log("[v0] User role set to:", userData.role)
        setUser(userData)
      } catch (error) {
        console.error("[v0] Auth check failed:", error)
        sessionStorage.removeItem("access_token")
        sessionStorage.removeItem("refresh_token")
      }
    }
    setLoading(false)
  }

  const login = async (username, password) => {
    try {
      console.log("[v0] Attempting login with username:", username)
      const response = await authAPI.login(username, password)
      const { access, refresh } = response.data

      console.log("[v0] Login successful, tokens received")
      sessionStorage.setItem("access_token", access)
      sessionStorage.setItem("refresh_token", refresh)

      console.log("[v0] Calling getCurrentUser API...")
      const userResponse = await authAPI.getCurrentUser()
      console.log("[v0] Raw API response:", userResponse)
      console.log("[v0] Response data:", userResponse.data)

      const userData = userResponse.data
      console.log("[v0] User data after login:", userData)
      console.log("[v0] is_admin:", userData.is_admin)
      console.log("[v0] is_teacher:", userData.is_teacher)
      console.log("[v0] is_student:", userData.is_student)

      if (userData.role) {
        // If backend sends role directly, use it
        console.log("[v0] User role from backend:", userData.role)
      } else if (userData.is_admin) {
        userData.role = "admin"
      } else if (userData.is_teacher) {
        userData.role = "teacher"
      } else if (userData.is_student) {
        userData.role = "student"
      } else if (userData.username === "admin") {
        // Temporary workaround: detect admin by username
        userData.role = "admin"
        console.log("[v0] Role detected by username fallback: admin")
      }

      console.log("[v0] User role set to:", userData.role)
      setUser(userData)

      return { success: true }
    } catch (error) {
      console.error("[v0] Login error:", error.response?.data || error.message)
      return {
        success: false,
        error: error.response?.data?.detail || "Erreur de connexion",
      }
    }
  }

  const logout = () => {
    sessionStorage.removeItem("access_token")
    sessionStorage.removeItem("refresh_token")
    setUser(null)
  }

  const register = async (data) => {
    try {
      await authAPI.registerStudent(data)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || "Erreur lors de l'inscription",
      }
    }
  }

  return <AuthContext.Provider value={{ user, loading, login, logout, register }}>{children}</AuthContext.Provider>
}
