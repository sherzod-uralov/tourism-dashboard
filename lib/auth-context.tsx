"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { message } from "antd"
import { api } from "@/lib/api"

type User = {
  id: string
  email: string
  firstName: string
  lastName: string
  role: "admin" | "tourist"
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      fetchUserProfile()
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true)
      const response = await api.get("/api/users/profile")
      setUser(response.data)

      // Redirect non-admin users
      if (response.data.role !== "admin") {
        message.error("Only admin users can access the dashboard")
        logout()
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error)
      logout()
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await api.post("/api/auth/login", { email, password })

      // Save token
      localStorage.setItem("token", response.data.token)

      // Fetch user profile
      await fetchUserProfile()

      message.success("Login successful")
      router.push("/dashboard")
    } catch (error) {
      console.error("Login failed:", error)
      message.error("Invalid credentials")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
