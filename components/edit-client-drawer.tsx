"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { useUpdateUsuario } from "@/lib/hooks/useUsuarios"
import { usuariosService } from "@/lib/services/usuarios"
import { TipoUsuario, Usuario } from "@/types"

interface EditClientDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  usuario: Usuario | null
}

export function EditClientDrawer({ isOpen, onClose, onSuccess, usuario }: EditClientDrawerProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    cedula: "",
    edad: "",
    genero: "",
    fechaNacimiento: "",
    tipoUsuario: "Cliente",
    referidoPorCedula: "",
    email: "",
    telefono: "",
    pesoInicial: "",
    pesoActual: "",
    altura: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [referidoInfo, setReferidoInfo] = useState<{ nombre: string; apellido: string } | null>(null)
  const [referidoError, setReferidoError] = useState<string | null>(null)
  const [isSearchingReferido, setIsSearchingReferido] = useState(false)

  const updateUsuario = useUpdateUsuario()

  // Load usuario data when drawer opens
  useEffect(() => {
    if (usuario && isOpen) {
      const tipoUsuarioMap: Record<string, string> = {
        [TipoUsuario.CLIENTE]: "Cliente",
        [TipoUsuario.ENTRENADOR]: "Empleado",
        [TipoUsuario.ADMIN]: "Admin",
      }

      setFormData({
        nombre: usuario.nombre || "",
        apellido: usuario.apellido || "",
        cedula: usuario.telefono || "",
        edad: "", // No se guarda edad directamente
        genero: "", // No se guarda género directamente
        fechaNacimiento: usuario.fecha_nacimiento ? usuario.fecha_nacimiento.split("T")[0] : "",
        tipoUsuario: tipoUsuarioMap[usuario.tipo || TipoUsuario.CLIENTE] || "Cliente",
        referidoPorCedula: usuario.referido_por_cedula || "",
        email: usuario.email || "",
        telefono: usuario.telefono || "",
        pesoInicial: usuario.peso_inicial?.toString() || "",
        pesoActual: usuario.peso_actual?.toString() || "",
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
        setReferidoError("No se encontró un cliente con esta cédula")
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
        Cliente: TipoUsuario.CLIENTE,
        Empleado: TipoUsuario.ENTRENADOR,
        Admin: TipoUsuario.ADMIN,
      }

      // Create usuario update data
      const usuarioData = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email || `${formData.cedula}@temp.com`,
        telefono: formData.telefono || formData.cedula,
        tipo: tipoUsuarioMap[formData.tipoUsuario] || TipoUsuario.CLIENTE,
        fecha_nacimiento: formData.fechaNacimiento ? `${formData.fechaNacimiento}T00:00:00` : undefined,
        referido_por_cedula: formData.referidoPorCedula || undefined,
        peso_inicial: formData.pesoInicial ? parseFloat(formData.pesoInicial) : undefined,
        peso_actual: formData.pesoActual ? parseFloat(formData.pesoActual) : undefined,
        altura: formData.altura ? parseFloat(formData.altura) : undefined,
      }

      // Update usuario
      await updateUsuario.mutateAsync({
        id: usuario.id,
        data: usuarioData,
      })

      onSuccess()
      onClose()
    } catch (err) {
      console.error("Error updating usuario:", err)
      setError("Error al actualizar el cliente. Por favor intenta de nuevo.")
    }
  }

  if (!isOpen || !usuario) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 h-full w-full md:w-[600px] bg-card border-l border-border shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Editar Cliente</h2>
            <p className="text-sm text-muted-foreground">Actualiza la información del cliente</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Información Básica</h3>

            <div className="grid md:grid-cols-2 gap-4">
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
                    <SelectItem value="Cliente">Cliente</SelectItem>
                    <SelectItem value="Empleado">Empleado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Campo de Referido - Solo para clientes */}
              {formData.tipoUsuario === "Cliente" && (
                <div className="space-y-2">
                  <Label htmlFor="referidoPorCedula">
                    Referido por (Cédula del cliente)
                    <span className="ml-2 text-xs text-muted-foreground">(Opcional)</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="referidoPorCedula"
                      value={formData.referidoPorCedula}
                      onChange={(e) => setFormData({ ...formData, referidoPorCedula: e.target.value })}
                      placeholder="Ingresa la cédula del cliente que lo refirió"
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
                      Cliente encontrado: {referidoInfo.nombre} {referidoInfo.apellido}
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
            <h3 className="text-lg font-semibold text-foreground">Información de Contacto</h3>

            <div className="grid md:grid-cols-2 gap-4">
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
            <h3 className="text-lg font-semibold text-foreground">Información Física</h3>

            <div className="grid md:grid-cols-3 gap-4">
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
                <Label htmlFor="pesoActual">Peso Actual (kg)</Label>
                <Input
                  id="pesoActual"
                  type="number"
                  step="0.1"
                  value={formData.pesoActual}
                  onChange={(e) => setFormData({ ...formData, pesoActual: e.target.value })}
                  placeholder="68.0"
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
          <div className="flex flex-col-reverse md:flex-row gap-3 pt-6">
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
        </form>
      </div>
    </>
  )
}
