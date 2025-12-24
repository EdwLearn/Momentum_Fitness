"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Lock } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
}

const CORRECT_PASSWORD = "GetRich666"
const SESSION_KEY = "momentum_auth"
const SESSION_TIMEOUT = 10 * 60 * 1000 // 10 minutos en milisegundos

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isChecking, setIsChecking] = useState(true)

  // Verificar sesión existente al montar
  useEffect(() => {
    const checkSession = () => {
      if (typeof window === "undefined") return

      const session = sessionStorage.getItem(SESSION_KEY)
      if (session) {
        try {
          const { timestamp } = JSON.parse(session)
          const now = Date.now()

          // Verificar si la sesión no ha expirado
          if (now - timestamp < SESSION_TIMEOUT) {
            setIsAuthenticated(true)
            // Actualizar timestamp de actividad
            sessionStorage.setItem(SESSION_KEY, JSON.stringify({ timestamp: now }))
          } else {
            // Sesión expirada
            sessionStorage.removeItem(SESSION_KEY)
          }
        } catch (e) {
          sessionStorage.removeItem(SESSION_KEY)
        }
      }
      setIsChecking(false)
    }

    checkSession()
  }, [])

  // Renovar timestamp en cada interacción
  useEffect(() => {
    if (!isAuthenticated) return

    const updateActivity = () => {
      const session = sessionStorage.getItem(SESSION_KEY)
      if (session) {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({ timestamp: Date.now() }))
      }
    }

    // Escuchar eventos de usuario para renovar sesión
    const events = ["mousedown", "keydown", "scroll", "touchstart"]
    events.forEach(event => window.addEventListener(event, updateActivity))

    return () => {
      events.forEach(event => window.removeEventListener(event, updateActivity))
    }
  }, [isAuthenticated])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (password === CORRECT_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ timestamp: Date.now() }))
      setIsAuthenticated(true)
      setError("")
      setPassword("")
    } else {
      setError("Contraseña incorrecta")
      setPassword("")
    }
  }

  // Mostrar loading mientras verifica sesión
  if (isChecking) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Mostrar modal de contraseña si no está autenticado
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-[#2a2a2a] border border-border rounded-xl p-8 w-full max-w-md shadow-2xl">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-primary/10 p-4 rounded-full">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center mb-2 text-foreground">
            Contenido Protegido
          </h2>
          <p className="text-center text-muted-foreground mb-6">
            Ingresa la contraseña para acceder a esta sección
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError("")
                  }}
                  placeholder="Contraseña"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-12"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {error && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <span className="text-lg">⚠️</span>
                  {error}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 text-base font-semibold"
            >
              🔓 Desbloquear
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            La sesión expirará después de 10 minutos de inactividad
          </p>
        </div>
      </div>
    )
  }

  // Renderizar contenido protegido
  return <>{children}</>
}
