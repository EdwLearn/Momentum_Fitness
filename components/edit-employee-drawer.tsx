"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { useUpdateEmpleado, useDeleteEmpleado } from "@/lib/hooks/useEmpleados"
import { Empleado, TipoEmpleado } from "@/types"

interface EditEmployeeDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  empleado: Empleado | null
}

export function EditEmployeeDrawer({ isOpen, onClose, onSuccess, empleado }: EditEmployeeDrawerProps) {
  const [formData, setFormData] = useState({
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

  const [error, setError] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmCedula, setDeleteConfirmCedula] = useState("")
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const updateEmpleado = useUpdateEmpleado()
  const deleteEmpleado = useDeleteEmpleado()

  // Load empleado data when drawer opens
  useEffect(() => {
    if (empleado && isOpen) {
      setFormData({
        nombre: empleado.nombre || "",
        apellido: empleado.apellido || "",
        cedula: empleado.cedula || "",
        email: empleado.email || "",
        telefono: empleado.telefono || "",
        fechaNacimiento: empleado.fecha_nacimiento ? empleado.fecha_nacimiento.split("T")[0] : "",
        genero: empleado.genero || "",
        tipoEmpleado: empleado.tipo_empleado,
        fechaContratacion: empleado.fecha_contratacion ? empleado.fecha_contratacion.split("T")[0] : "",
      })
    }
  }, [empleado, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!empleado) return

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

      await updateEmpleado.mutateAsync({
        id: empleado.id,
        data: empleadoData,
      })

      onSuccess()
      onClose()
    } catch (err: any) {
      console.error("Error updating empleado:", err)
      setError(err.response?.data?.detail || "Error al actualizar el empleado")
    }
  }

  const handleDelete = async () => {
    if (!empleado) return

    setDeleteError(null)

    // Validar que se ingresó la cédula correcta
    if (deleteConfirmCedula !== formData.cedula) {
      setDeleteError("El documento ingresado no coincide")
      return
    }

    try {
      await deleteEmpleado.mutateAsync(empleado.id)
      onSuccess()
      onClose()
      setShowDeleteDialog(false)
      setDeleteConfirmCedula("")
    } catch (err: any) {
      console.error("Error deleting empleado:", err)
      setDeleteError(err.response?.data?.detail || "Error al eliminar el empleado")
    }
  }

  if (!isOpen || !empleado) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 h-full w-full md:w-[600px] bg-card border-l border-border shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Editar Empleado</h2>
            <p className="text-sm text-muted-foreground">Actualiza la información del empleado</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-4 pt-6">
            <div className="flex flex-col-reverse md:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 bg-transparent"
                disabled={updateEmpleado.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={updateEmpleado.isPending}
              >
                {updateEmpleado.isPending ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>

            {/* Delete Button */}
            <div className="border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteDialog(true)}
                className="w-full border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                disabled={updateEmpleado.isPending || deleteEmpleado.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Empleado
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <>
          <div
            className="fixed inset-0 z-60 bg-background/80 backdrop-blur-sm"
            onClick={() => {
              setShowDeleteDialog(false)
              setDeleteConfirmCedula("")
              setDeleteError(null)
            }}
          />
          <div className="fixed left-1/2 top-1/2 z-60 w-full max-w-md -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-lg shadow-2xl p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                  <Trash2 className="h-6 w-6 text-destructive" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">¿Eliminar empleado?</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Esta acción no se puede deshacer. Se eliminará toda la información del empleado.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deleteConfirm" className="text-foreground">
                  Para confirmar, ingresa el documento del empleado:{" "}
                  <span className="font-semibold text-primary">{formData.cedula}</span>
                </Label>
                <Input
                  id="deleteConfirm"
                  value={deleteConfirmCedula}
                  onChange={(e) => {
                    setDeleteConfirmCedula(e.target.value)
                    setDeleteError(null)
                  }}
                  placeholder="Ingresa el documento"
                  className="bg-secondary border-border"
                  autoFocus
                />
              </div>

              {deleteError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{deleteError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowDeleteDialog(false)
                    setDeleteConfirmCedula("")
                    setDeleteError(null)
                  }}
                  className="flex-1"
                  disabled={deleteEmpleado.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleDelete}
                  className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={deleteEmpleado.isPending || !deleteConfirmCedula}
                >
                  {deleteEmpleado.isPending ? "Eliminando..." : "Eliminar"}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
