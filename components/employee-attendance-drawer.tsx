"use client"

import type React from "react"

import { useState } from "react"
import { X, LogIn, LogOut, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMarcarEntrada, useMarcarSalida } from "@/lib/hooks/useAsistenciaEmpleados"
import { empleadosService } from "@/lib/services/empleados"

interface EmployeeAttendanceDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (message: string) => void
  type: "entrada" | "salida"
}

export function EmployeeAttendanceDrawer({
  isOpen,
  onClose,
  onSuccess,
  type,
}: EmployeeAttendanceDrawerProps) {
  const [cedula, setCedula] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [empleadoInfo, setEmpleadoInfo] = useState<{
    id: number
    nombre: string
    apellido: string
  } | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  const marcarEntrada = useMarcarEntrada()
  const marcarSalida = useMarcarSalida()

  const searchEmpleado = async () => {
    if (!cedula || cedula.length < 3) {
      setEmpleadoInfo(null)
      setError(null)
      return
    }

    setIsSearching(true)
    setError(null)

    try {
      const empleado = await empleadosService.getByCedula(cedula)
      setEmpleadoInfo({
        id: empleado.id,
        nombre: empleado.nombre,
        apellido: empleado.apellido || "",
      })
      setError(null)
    } catch (err) {
      setEmpleadoInfo(null)
      setError("No se encontró un empleado con esta cédula")
    } finally {
      setIsSearching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!empleadoInfo) {
      setError("Primero busca un empleado válido")
      return
    }

    try {
      if (type === "entrada") {
        await marcarEntrada.mutateAsync({
          empleado_id: empleadoInfo.id,
        })
        onSuccess(`Entrada marcada para ${empleadoInfo.nombre} ${empleadoInfo.apellido}`)
      } else {
        await marcarSalida.mutateAsync({
          empleado_id: empleadoInfo.id,
        })
        onSuccess(`Salida marcada para ${empleadoInfo.nombre} ${empleadoInfo.apellido}`)
      }

      // Reset form
      setCedula("")
      setEmpleadoInfo(null)
      onClose()
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || "Error al marcar asistencia"
      setError(errorMessage)
    }
  }

  const handleCedulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCedula(e.target.value)
    setEmpleadoInfo(null)
    setError(null)
  }

  const handleCedulaBlur = () => {
    if (cedula.length >= 3) {
      searchEmpleado()
    }
  }

  if (!isOpen) return null

  const isEntrada = type === "entrada"
  const Icon = isEntrada ? LogIn : LogOut
  const title = isEntrada ? "Marcar Entrada" : "Marcar Salida"
  const buttonText = isEntrada ? "Marcar Entrada" : "Marcar Salida"
  const buttonColor = isEntrada ? "bg-green-600 hover:bg-green-700" : "bg-orange-600 hover:bg-orange-700"

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 h-full w-full md:w-[500px] bg-card border-l border-border shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isEntrada ? "bg-green-600/10" : "bg-orange-600/10"}`}>
              <Icon className={`h-6 w-6 ${isEntrada ? "text-green-600" : "text-orange-600"}`} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{title}</h2>
              <p className="text-sm text-muted-foreground">Empleados</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información */}
          <div className="bg-secondary/50 border border-border rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground">
                  {isEntrada ? "Hora de entrada" : "Hora de salida"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {isEntrada
                    ? "Ingresa la cédula del empleado para registrar su hora de entrada"
                    : "Ingresa la cédula del empleado para registrar su hora de salida"}
                </p>
              </div>
            </div>
          </div>

          {/* Búsqueda por cédula */}
          <div className="space-y-2">
            <Label htmlFor="cedula">
              Cédula del Empleado <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="cedula"
                value={cedula}
                onChange={handleCedulaChange}
                onBlur={handleCedulaBlur}
                placeholder="Ingresa la cédula del empleado"
                className="bg-secondary border-border pr-10"
                autoFocus
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
              )}
              {!isSearching && empleadoInfo && (
                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A4FF1A]" />
              )}
              {!isSearching && error && cedula.length >= 3 && (
                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
              )}
            </div>

            {/* Empleado encontrado */}
            {empleadoInfo && (
              <div className="mt-3 p-4 bg-[#A4FF1A]/10 border border-[#A4FF1A]/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#A4FF1A]" />
                  <div>
                    <p className="font-semibold text-foreground">
                      {empleadoInfo.nombre} {empleadoInfo.apellido}
                    </p>
                    <p className="text-sm text-muted-foreground">Cédula: {cedula}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse md:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent"
              disabled={marcarEntrada.isPending || marcarSalida.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className={`flex-1 ${buttonColor} text-white`}
              disabled={!empleadoInfo || marcarEntrada.isPending || marcarSalida.isPending}
            >
              {marcarEntrada.isPending || marcarSalida.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Marcando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {buttonText}
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
