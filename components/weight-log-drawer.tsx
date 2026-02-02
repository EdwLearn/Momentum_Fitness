"use client"

import { useState } from "react"
import { X, Scale } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Usuario } from "@/types"

interface WeightLogDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  usuario: Usuario | null
}

export function WeightLogDrawer({ isOpen, onClose, onSuccess, usuario }: WeightLogDrawerProps) {
  const [peso, setPeso] = useState("")
  const [circunferenciaBrazos, setCircunferenciaBrazos] = useState("")
  const [circunferenciaPecho, setCircunferenciaPecho] = useState("")
  const [circunferenciaCintura, setCircunferenciaCintura] = useState("")
  const [circunferenciaCadera, setCircunferenciaCadera] = useState("")
  const [circunferenciaPiernas, setCircunferenciaPiernas] = useState("")
  const [notas, setNotas] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  if (!isOpen || !usuario) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validaciones
    const pesoNum = parseFloat(peso)
    if (isNaN(pesoNum) || pesoNum <= 0) {
      setError("Por favor ingresa un peso válido")
      return
    }

    if (pesoNum < 20 || pesoNum > 300) {
      setError("El peso debe estar entre 20 y 300 kg")
      return
    }

    setIsSubmitting(true)

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

      // 1. Guardar en historial_peso
      const historialResponse = await fetch(`${API_URL}/api/historial-peso`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario_id: usuario.id,
          peso: pesoNum,
          circunferencia_brazos: circunferenciaBrazos ? parseFloat(circunferenciaBrazos) : null,
          circunferencia_pecho: circunferenciaPecho ? parseFloat(circunferenciaPecho) : null,
          circunferencia_cintura: circunferenciaCintura ? parseFloat(circunferenciaCintura) : null,
          circunferencia_cadera: circunferenciaCadera ? parseFloat(circunferenciaCadera) : null,
          circunferencia_piernas: circunferenciaPiernas ? parseFloat(circunferenciaPiernas) : null,
          notas: notas.trim() || null,
        }),
      })

      if (!historialResponse.ok) {
        throw new Error("Error al guardar el registro de peso")
      }

      // 2. Actualizar peso_actual del usuario
      const updateUsuarioResponse = await fetch(`${API_URL}/api/usuarios/${usuario.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...usuario,
          peso_actual: pesoNum,
        }),
      })

      if (!updateUsuarioResponse.ok) {
        throw new Error("Error al actualizar el peso del usuario")
      }

      // Limpiar formulario y cerrar
      setPeso("")
      setCircunferenciaBrazos("")
      setCircunferenciaPecho("")
      setCircunferenciaCintura("")
      setCircunferenciaCadera("")
      setCircunferenciaPiernas("")
      setNotas("")
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el peso")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setPeso("")
    setCircunferenciaBrazos("")
    setCircunferenciaPecho("")
    setCircunferenciaCintura("")
    setCircunferenciaCadera("")
    setCircunferenciaPiernas("")
    setNotas("")
    setError("")
    onClose()
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal Centrado */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 p-4 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <Card className="bg-card border-border p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-2">
              <Scale className="h-6 w-6 text-primary" />
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Registrar Peso</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div>
          {/* Usuario Info */}
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Usuario</p>
            <p className="font-semibold">{usuario.nombre} {usuario.apellido}</p>
            {usuario.peso_actual && (
              <p className="text-sm text-muted-foreground mt-1">
                Peso actual: {usuario.peso_actual} kg
              </p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Peso - Obligatorio */}
            <div className="space-y-2">
              <Label htmlFor="peso" className="flex items-center gap-1">
                Peso (kg) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="peso"
                type="number"
                step="0.1"
                placeholder="Ej: 75.5"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                required
                autoFocus
              />
            </div>

            {/* Sección de Circunferencias - Opcional */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                Medidas Corporales (opcional)
              </h3>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="brazos">Circunferencia de Brazos (cm)</Label>
                  <Input
                    id="brazos"
                    type="number"
                    step="0.1"
                    placeholder="Ej: 35.5"
                    value={circunferenciaBrazos}
                    onChange={(e) => setCircunferenciaBrazos(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pecho">Circunferencia de Pecho (cm)</Label>
                  <Input
                    id="pecho"
                    type="number"
                    step="0.1"
                    placeholder="Ej: 95.0"
                    value={circunferenciaPecho}
                    onChange={(e) => setCircunferenciaPecho(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cintura">Circunferencia de Cintura (cm)</Label>
                  <Input
                    id="cintura"
                    type="number"
                    step="0.1"
                    placeholder="Ej: 80.0"
                    value={circunferenciaCintura}
                    onChange={(e) => setCircunferenciaCintura(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cadera">Circunferencia de Cadera (cm)</Label>
                  <Input
                    id="cadera"
                    type="number"
                    step="0.1"
                    placeholder="Ej: 98.0"
                    value={circunferenciaCadera}
                    onChange={(e) => setCircunferenciaCadera(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="piernas">Circunferencia de Piernas (cm)</Label>
                  <Input
                    id="piernas"
                    type="number"
                    step="0.1"
                    placeholder="Ej: 55.0"
                    value={circunferenciaPiernas}
                    onChange={(e) => setCircunferenciaPiernas(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Notas */}
            <div className="space-y-2 border-t pt-4">
              <Label htmlFor="notas">Notas (opcional)</Label>
              <Textarea
                id="notas"
                placeholder="Ej: Usuario reporta mejor condición física..."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={3}
              />
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Guardando..." : "Guardar Peso"}
              </Button>
            </div>
          </form>
          </div>
        </Card>
      </div>
    </>
  )
}
