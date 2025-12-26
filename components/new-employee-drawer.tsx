"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Textarea } from "@/components/ui/textarea"
import { useCreateEmpleado } from "@/lib/hooks/useEmpleados"
import { TipoEmpleado } from "@/types"

interface NewEmployeeDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function NewEmployeeDrawer({ isOpen, onClose, onSuccess }: NewEmployeeDrawerProps) {
  const [formData, setFormData] = useState({
    // Datos personales
    nombre: "",
    apellido: "",
    cedula: "",
    email: "",
    telefono: "",
    fechaNacimiento: "",
    genero: "",

    // Datos laborales
    tipoEmpleado: TipoEmpleado.ENTRENADOR,
    fechaContratacion: "",
  })

  const [error, setError] = useState<string | null>(null)

  const createEmpleado = useCreateEmpleado()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validaciones
    if (!formData.nombre || !formData.cedula) {
      setError("Nombre y cédula son obligatorios")
      return
    }

    // Validar email si se proporciona
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Email inválido")
      return
    }

    try {
      const empleadoData = {
        nombre: formData.nombre,
        apellido: formData.apellido || formData.nombre,
        cedula: formData.cedula,
        email: formData.email || undefined,
        telefono: formData.telefono || undefined,
        fecha_nacimiento: formData.fechaNacimiento || undefined,
        genero: formData.genero || undefined,
        tipo_empleado: formData.tipoEmpleado,
        fecha_contratacion: formData.fechaContratacion || undefined,
      }

      await createEmpleado.mutateAsync(empleadoData)

      onSuccess()
      onClose()

      // Reset form
      setFormData({
        nombre: "",
        apellido: "",
        cedula: "",
        email: "",
        telefono: "",
        fechaNacimiento: "",
        genero: "",
        tipoEmpleado: TipoEmpleado.ENTRENADOR,
        fechaContratacion: "",
      })
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al crear el empleado")
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
        <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
          <div className="w-screen max-w-2xl">
            <div className="flex h-full flex-col overflow-y-scroll bg-card shadow-xl border-l border-border">
              {/* Header */}
              <div className="bg-secondary px-6 py-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-primary">Nuevo Empleado</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Completa la información del empleado
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-md text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex-1 px-6 py-6">
                <div className="space-y-6">
                  {error && (
                    <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  {/* Datos Personales */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b border-border pb-2">Datos Personales</h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nombre">
                          Nombre <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="nombre"
                          value={formData.nombre}
                          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                          placeholder="Juan"
                          required
                          className="bg-secondary border-border"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="apellido">Apellido</Label>
                        <Input
                          id="apellido"
                          value={formData.apellido}
                          onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                          placeholder="Pérez"
                          className="bg-secondary border-border"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cedula">
                          Cédula <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="cedula"
                          value={formData.cedula}
                          onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                          placeholder="1234567890"
                          required
                          className="bg-secondary border-border"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="correo@ejemplo.com"
                          className="bg-secondary border-border"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="telefono">Teléfono</Label>
                        <Input
                          id="telefono"
                          value={formData.telefono}
                          onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                          placeholder="3001234567"
                          className="bg-secondary border-border"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                        <DatePicker
                          value={formData.fechaNacimiento}
                          onChange={(date) => setFormData({ ...formData, fechaNacimiento: date })}
                          placeholder="Seleccionar fecha"
                          maxDate={new Date().toISOString().split("T")[0]}
                          yearRange={{ start: 1950, end: new Date().getFullYear() }}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Género</Label>
                        <div className="flex gap-4 pt-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="genero"
                              value="masculino"
                              checked={formData.genero === "masculino"}
                              onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                              className="w-4 h-4 text-primary accent-primary"
                            />
                            <span className="text-sm">Masculino</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="genero"
                              value="femenino"
                              checked={formData.genero === "femenino"}
                              onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                              className="w-4 h-4 text-primary accent-primary"
                            />
                            <span className="text-sm">Femenino</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Datos Laborales */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b border-border pb-2 text-foreground">
                      Datos Laborales
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tipoEmpleado">
                          Tipo de Empleado <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={formData.tipoEmpleado}
                          onValueChange={(value) =>
                            setFormData({ ...formData, tipoEmpleado: value as TipoEmpleado })
                          }
                        >
                          <SelectTrigger className="bg-secondary border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={TipoEmpleado.ENTRENADOR}>Entrenador</SelectItem>
                            <SelectItem value={TipoEmpleado.RECEPCION}>Recepción</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fechaContratacion">Fecha de Contratación</Label>
                        <DatePicker
                          value={formData.fechaContratacion}
                          onChange={(date) => setFormData({ ...formData, fechaContratacion: date })}
                          placeholder="Seleccionar fecha"
                          maxDate={new Date().toISOString().split("T")[0]}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 pt-6 mt-6 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1 border-border hover:bg-secondary"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createEmpleado.isPending}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    {createEmpleado.isPending ? "Guardando..." : "Guardar Empleado"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
