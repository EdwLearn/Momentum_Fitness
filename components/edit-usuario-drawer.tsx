"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, CheckCircle2, AlertCircle, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { useUpdateUsuario, useDeleteUsuario } from "@/lib/hooks/useUsuarios"
import { usuariosService } from "@/lib/services/usuarios"
import { TipoUsuario, Usuario } from "@/types"

interface EditClientDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  usuario: Usuario | null
}

export function EditUsuarioDrawer({ isOpen, onClose, onSuccess, usuario }: EditClientDrawerProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    cedula: "",
    edad: "",
    genero: "",
    fechaNacimiento: "",
    tipoUsuario: "Usuario",
    referidoPorCedula: "",
    email: "",
    telefono: "",
    pesoInicial: "",
    altura: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [referidoInfo, setReferidoInfo] = useState<{ nombre: string; apellido: string } | null>(null)
  const [referidoError, setReferidoError] = useState<string | null>(null)
  const [isSearchingReferido, setIsSearchingReferido] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmCedula, setDeleteConfirmCedula] = useState("")
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const updateUsuario = useUpdateUsuario()
  const deleteUsuario = useDeleteUsuario()

  // Load usuario data when drawer opens
  useEffect(() => {
    if (usuario && isOpen) {
      const tipoUsuarioMap: Record<string, string> = {
        [TipoUsuario.CLIENTE]: "Usuario",
        [TipoUsuario.ENTRENADOR]: "Empleado",
        [TipoUsuario.ADMIN]: "Admin",
      }

      setFormData({
        nombre: usuario.nombre || "",
        apellido: usuario.apellido || "",
        cedula: usuario.cedula || "",
        edad: "", // No se guarda edad directamente
        genero: "", // No se guarda género directamente
        fechaNacimiento: usuario.fecha_nacimiento ? usuario.fecha_nacimiento.split("T")[0] : "",
        tipoUsuario: tipoUsuarioMap[usuario.tipo || TipoUsuario.CLIENTE] || "Usuario",
        referidoPorCedula: usuario.referido_por_cedula || "",
        email: usuario.email || "",
        telefono: usuario.telefono || "",
        pesoInicial: usuario.peso_inicial?.toString() || "",
        altura: usuario.altura?.toString() || "",
      })
    }
  }, [usuario, isOpen])

  // Search for referido by cedula
  useEffect(() => {
    const searchReferido = async () => {
      if (!formData.referidoPorCedula || formData.referidoPorCedula.length < 3) {
        setReferidoInfo(null)
        setReferidoError(null)
        return
      }

      setIsSearchingReferido(true)
      setReferidoError(null)

      try {
        const usuarioRef = await usuariosService.buscarPorCedula(formData.referidoPorCedula)
        setReferidoInfo({ nombre: usuarioRef.nombre, apellido: usuarioRef.apellido })
        setReferidoError(null)
      } catch (error) {
        setReferidoInfo(null)
        setReferidoError("No se encontró un usuario con esta cédula")
      } finally {
        setIsSearchingReferido(false)
      }
    }

    const timeoutId = setTimeout(() => {
      searchReferido()
    }, 500) // Debounce 500ms

    return () => clearTimeout(timeoutId)
  }, [formData.referidoPorCedula])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!usuario) return

    try {
      // Map tipoUsuario to TipoUsuario enum
      const tipoUsuarioMap: Record<string, TipoUsuario> = {
        Usuario: TipoUsuario.CLIENTE,
        Empleado: TipoUsuario.ENTRENADOR,
        Admin: TipoUsuario.ADMIN,
      }

      // Create usuario update data
      const usuarioData = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        cedula: formData.cedula,
        email: formData.email || `${formData.cedula}@temp.com`,
        telefono: formData.telefono || null,
        tipo: tipoUsuarioMap[formData.tipoUsuario] || TipoUsuario.CLIENTE,
        fecha_nacimiento: formData.fechaNacimiento ? `${formData.fechaNacimiento}T00:00:00` : undefined,
        referido_por_cedula: formData.referidoPorCedula || undefined,
        peso_inicial: formData.pesoInicial ? parseFloat(formData.pesoInicial) : undefined,
        altura: formData.altura ? parseFloat(formData.altura) : undefined,
      }

      console.log('📤 Enviando datos de actualización:', usuarioData)
      console.log('📝 ID del usuario:', usuario.id)

      // Update usuario
      await updateUsuario.mutateAsync({
        id: usuario.id,
        data: usuarioData,
      })

      console.log('✅ Usuario actualizado exitosamente')

      onSuccess()
      onClose()
    } catch (err: any) {
      console.error("Error updating usuario:", err)
      console.error("Response data:", err.response?.data)

      // Mostrar error específico del backend
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          const errorMessages = err.response.data.detail.map((e: any) => {
            const field = e.loc?.[e.loc.length - 1] || 'campo'
            return `${field}: ${e.msg}`
          }).join('. ')
          setError(errorMessages)
        } else {
          setError(err.response.data.detail)
        }
      } else {
        setError("Error al actualizar el usuario. Por favor intenta de nuevo.")
      }
    }
  }

  const handleDelete = async () => {
    if (!usuario) return

    setDeleteError(null)

    // Validar que se ingresó la cédula correcta
    if (deleteConfirmCedula !== formData.cedula) {
      setDeleteError("El documento ingresado no coincide")
      return
    }

    try {
      await deleteUsuario.mutateAsync(usuario.id)
      onSuccess()
      onClose()
      setShowDeleteDialog(false)
      setDeleteConfirmCedula("")
    } catch (err: any) {
      console.error("Error deleting usuario:", err)
      setDeleteError(err.response?.data?.detail || "Error al eliminar el usuario. Por favor intenta de nuevo.")
    }
  }

  if (!isOpen || !usuario) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Centrado */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 p-4 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <Card className="bg-card border-border p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Editar Usuario</h2>
              <p className="text-sm text-muted-foreground">Actualiza la información del usuario</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Información Básica</h3>

            <div className="grid md:grid-cols-2 gap-2 sm:p-4">
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
                <Label htmlFor="apellido">
                  Apellido <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="apellido"
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  placeholder="Pérez"
                  required
                  className="bg-secondary border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cedula">
                  Cédula / Documento <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cedula"
                  value={formData.cedula}
                  onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                  placeholder="12345678"
                  required
                  className="bg-secondary border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaNacimiento">Fecha de nacimiento</Label>
                <DatePicker
                  value={formData.fechaNacimiento}
                  onChange={(date) => setFormData({ ...formData, fechaNacimiento: date })}
                  maxDate={new Date().toISOString().split("T")[0]}
                  placeholder="Seleccionar fecha de nacimiento"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoUsuario">Tipo de usuario</Label>
                <Select
                  value={formData.tipoUsuario}
                  onValueChange={(value) => setFormData({ ...formData, tipoUsuario: value })}
                >
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Usuario">Usuario</SelectItem>
                    <SelectItem value="Empleado">Empleado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Campo de Referido - Solo para usuarios */}
              {formData.tipoUsuario === "Usuario" && (
                <div className="space-y-2">
                  <Label htmlFor="referidoPorCedula">
                    Referido por (Cédula del usuario)
                    <span className="ml-2 text-xs text-muted-foreground">(Opcional)</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="referidoPorCedula"
                      value={formData.referidoPorCedula}
                      onChange={(e) => setFormData({ ...formData, referidoPorCedula: e.target.value })}
                      placeholder="Ingresa la cédula del usuario que lo refirió"
                      className="bg-secondary border-border pr-10"
                    />
                    {isSearchingReferido && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    {!isSearchingReferido && referidoInfo && (
                      <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A4FF1A]" />
                    )}
                    {!isSearchingReferido && referidoError && formData.referidoPorCedula.length >= 3 && (
                      <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  {referidoInfo && (
                    <p className="text-sm text-[#A4FF1A] flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Usuario encontrado: {referidoInfo.nombre} {referidoInfo.apellido}
                    </p>
                  )}
                  {referidoError && formData.referidoPorCedula.length >= 3 && (
                    <p className="text-sm text-yellow-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {referidoError} (puedes continuar sin referido)
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Contact Info Section */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Información de Contacto</h3>

            <div className="grid md:grid-cols-2 gap-2 sm:p-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="juan@example.com"
                  className="bg-secondary border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono / WhatsApp</Label>
                <Input
                  id="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="+57 300 123 4567"
                  className="bg-secondary border-border"
                />
              </div>
            </div>
          </div>

          {/* Physical Info Section */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Información Física</h3>

            <div className="grid md:grid-cols-2 gap-2 sm:p-4">
              <div className="space-y-2">
                <Label htmlFor="pesoInicial">Peso Inicial (kg)</Label>
                <Input
                  id="pesoInicial"
                  type="number"
                  step="0.1"
                  value={formData.pesoInicial}
                  onChange={(e) => setFormData({ ...formData, pesoInicial: e.target.value })}
                  placeholder="70.5"
                  className="bg-secondary border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="altura">Altura (cm)</Label>
                <Input
                  id="altura"
                  type="number"
                  step="0.1"
                  value={formData.altura}
                  onChange={(e) => setFormData({ ...formData, altura: e.target.value })}
                  placeholder="175"
                  className="bg-secondary border-border"
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
                disabled={updateUsuario.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={updateUsuario.isPending}
              >
                {updateUsuario.isPending ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>

            {/* Delete Button */}
            <div className="border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteDialog(true)}
                className="w-full border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                disabled={updateUsuario.isPending || deleteUsuario.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Usuario
              </Button>
            </div>
          </div>
          </form>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <>
          <div className="fixed inset-0 z-60 bg-background/80 backdrop-blur-sm" onClick={() => {
            setShowDeleteDialog(false)
            setDeleteConfirmCedula("")
            setDeleteError(null)
          }} />
          <div className="fixed left-1/2 top-1/2 z-60 w-full max-w-md -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-lg shadow-2xl p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-2 sm:p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                  <Trash2 className="h-6 w-6 text-destructive" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">¿Eliminar usuario?</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Esta acción no se puede deshacer. Se eliminará toda la información del usuario.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deleteConfirm" className="text-foreground">
                  Para confirmar, ingresa el documento del usuario:{" "}
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

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowDeleteDialog(false)
                    setDeleteConfirmCedula("")
                    setDeleteError(null)
                  }}
                  className="flex-1"
                  disabled={deleteUsuario.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleDelete}
                  className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={deleteUsuario.isPending || !deleteConfirmCedula}
                >
                  {deleteUsuario.isPending ? "Eliminando..." : "Eliminar"}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
