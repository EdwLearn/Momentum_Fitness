"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Gift, Calendar, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useCreateCortesia } from "@/lib/hooks/useMembresias"
import { useUsuarios } from "@/lib/hooks/useUsuarios"
import { Usuario } from "@/types"

interface CourtesyDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  usuario?: Usuario | null
}

// Opciones predefinidas de duración
const DURACIONES_PREDEFINIDAS = [
  { value: "1", label: "1 día (Pase Diario)", dias: 1 },
  { value: "3", label: "3 días", dias: 3 },
  { value: "7", label: "1 semana", dias: 7 },
  { value: "14", label: "2 semanas", dias: 14 },
  { value: "30", label: "1 mes", dias: 30 },
  { value: "custom", label: "Personalizado", dias: 0 },
]

// Opciones de visitas (tipo pase flex)
const VISITAS_OPCIONES = [
  { value: "ilimitadas", label: "Ilimitadas", visitas: null },
  { value: "5", label: "5 visitas", visitas: 5 },
  { value: "10", label: "10 visitas", visitas: 10 },
  { value: "14", label: "14 visitas (tipo Flex)", visitas: 14 },
  { value: "custom", label: "Personalizado", visitas: 0 },
]

export function CourtesyDrawer({ isOpen, onClose, onSuccess, usuario = null }: CourtesyDrawerProps) {
  const [selectedUsuarioId, setSelectedUsuarioId] = useState<number | null>(usuario?.id || null)
  const [formData, setFormData] = useState({
    duracionSeleccionada: "",
    duracionCustom: "",
    visitasSeleccionadas: "ilimitadas",
    visitasCustom: "",
    motivo: "",
  })

  const [error, setError] = useState<string | null>(null)

  const { data: usuarios } = useUsuarios()
  const createCortesia = useCreateCortesia()

  // Sincronizar usuario seleccionado cuando cambia la prop
  useEffect(() => {
    if (usuario) {
      setSelectedUsuarioId(usuario.id)
    }
  }, [usuario])

  // Calcular días finales
  const getDiasFinal = (): number => {
    if (formData.duracionSeleccionada === "custom") {
      return parseInt(formData.duracionCustom) || 0
    }
    const opcion = DURACIONES_PREDEFINIDAS.find(d => d.value === formData.duracionSeleccionada)
    return opcion?.dias || 0
  }

  // Calcular visitas finales
  const getVisitasFinal = (): number | null => {
    if (formData.visitasSeleccionadas === "ilimitadas") {
      return null
    }
    if (formData.visitasSeleccionadas === "custom") {
      const custom = parseInt(formData.visitasCustom)
      return custom > 0 ? custom : null
    }
    const opcion = VISITAS_OPCIONES.find(v => v.value === formData.visitasSeleccionadas)
    return opcion?.visitas ?? null
  }

  const diasFinal = getDiasFinal()
  const visitasFinal = getVisitasFinal()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!selectedUsuarioId) {
      setError("Debe seleccionar un usuario")
      return
    }

    if (diasFinal < 1 || diasFinal > 365) {
      setError("La duración debe estar entre 1 y 365 días")
      return
    }

    if (visitasFinal !== null && (visitasFinal < 1 || visitasFinal > 100)) {
      setError("El número de visitas debe estar entre 1 y 100")
      return
    }

    try {
      await createCortesia.mutateAsync({
        usuario_id: selectedUsuarioId,
        duracion_dias: diasFinal,
        visitas_disponibles: visitasFinal,
        motivo: formData.motivo.trim() || null,
      })

      onSuccess()
      onClose()

      // Reset form
      setSelectedUsuarioId(null)
      setFormData({
        duracionSeleccionada: "",
        duracionCustom: "",
        visitasSeleccionadas: "ilimitadas",
        visitasCustom: "",
        motivo: "",
      })
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al crear la cortesía")
    }
  }

  // Obtener usuario seleccionado actual
  const usuarioActual = selectedUsuarioId ? usuarios?.find(u => u.id === selectedUsuarioId) : null

  // Filtrar solo usuarios (no empleados)
  const soloClientes = usuarios?.filter(u => u.tipo === "usuario") || []

  // Calcular fecha de fin estimada
  const calcularFechaFin = (): string => {
    if (diasFinal <= 0) return ""
    const fechaFin = new Date()
    fechaFin.setDate(fechaFin.getDate() + diasFinal)
    return fechaFin.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Centrado */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 p-4 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <Card className="bg-card border-border p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Gift className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">Dar Cortesía</h2>
                <p className="text-sm text-muted-foreground">
                  {usuarioActual ? `${usuarioActual.nombre} ${usuarioActual.apellido}` : "Otorga acceso gratuito flexible"}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Client Selection - Only show if no usuario prop was passed */}
            {!usuario && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">Seleccionar Usuario</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clienteSelect">
                    Usuario <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={selectedUsuarioId?.toString() || ""}
                    onValueChange={(value) => setSelectedUsuarioId(parseInt(value))}
                    required
                  >
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Selecciona un usuario" />
                    </SelectTrigger>
                    <SelectContent>
                      {soloClientes.map((usuario) => (
                        <SelectItem key={usuario.id} value={usuario.id.toString()}>
                          {usuario.nombre} {usuario.apellido} - {usuario.telefono}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Duración */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-base sm:text-lg font-semibold text-foreground">Duración de la Cortesía</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duracion">
                  Tiempo <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.duracionSeleccionada}
                  onValueChange={(value) => setFormData({ ...formData, duracionSeleccionada: value, duracionCustom: "" })}
                  required
                >
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="Selecciona la duración" />
                  </SelectTrigger>
                  <SelectContent>
                    {DURACIONES_PREDEFINIDAS.map((opcion) => (
                      <SelectItem key={opcion.value} value={opcion.value}>
                        {opcion.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.duracionSeleccionada === "custom" && (
                <div className="space-y-2">
                  <Label htmlFor="duracionCustom">
                    Días personalizados <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="duracionCustom"
                    type="number"
                    min={1}
                    max={365}
                    value={formData.duracionCustom}
                    onChange={(e) => setFormData({ ...formData, duracionCustom: e.target.value })}
                    placeholder="Número de días (1-365)"
                    className="bg-secondary border-border"
                    required
                  />
                </div>
              )}
            </div>

            {/* Visitas (tipo Pase Flex) */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-foreground">Visitas Disponibles</h3>
              <p className="text-sm text-muted-foreground">
                Opcional: limita el número de entradas como un Pase Flex
              </p>

              <div className="space-y-2">
                <Label htmlFor="visitas">Número de visitas</Label>
                <Select
                  value={formData.visitasSeleccionadas}
                  onValueChange={(value) => setFormData({ ...formData, visitasSeleccionadas: value, visitasCustom: "" })}
                >
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VISITAS_OPCIONES.map((opcion) => (
                      <SelectItem key={opcion.value} value={opcion.value}>
                        {opcion.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.visitasSeleccionadas === "custom" && (
                <div className="space-y-2">
                  <Label htmlFor="visitasCustom">
                    Visitas personalizadas <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="visitasCustom"
                    type="number"
                    min={1}
                    max={100}
                    value={formData.visitasCustom}
                    onChange={(e) => setFormData({ ...formData, visitasCustom: e.target.value })}
                    placeholder="Número de visitas (1-100)"
                    className="bg-secondary border-border"
                    required
                  />
                </div>
              )}
            </div>

            {/* Motivo */}
            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo de la cortesía (opcional)</Label>
              <Textarea
                id="motivo"
                value={formData.motivo}
                onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                placeholder="Ej: Promoción de apertura, Invitado especial, Compensación..."
                className="bg-secondary border-border resize-none"
                rows={2}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                {formData.motivo.length}/200 caracteres
              </p>
            </div>

            {/* Resumen */}
            {diasFinal > 0 && (
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-primary">Resumen de Cortesía</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Duración:</span>
                    <span className="font-semibold text-foreground">
                      {diasFinal} {diasFinal === 1 ? 'día' : 'días'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Visitas:</span>
                    <span className="font-semibold text-foreground">
                      {visitasFinal === null ? 'Ilimitadas' : `${visitasFinal} visitas`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Válido hasta:</span>
                    <span className="font-semibold text-foreground">
                      {calcularFechaFin()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-primary/30">
                    <span className="font-semibold text-primary">Precio:</span>
                    <span className="font-bold text-xl text-green-600 dark:text-green-400">
                      GRATIS
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col-reverse md:flex-row gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 bg-transparent"
                disabled={createCortesia.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={createCortesia.isPending || !selectedUsuarioId || diasFinal < 1}
              >
                {createCortesia.isPending ? "Otorgando..." : "Dar Cortesía"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  )
}
