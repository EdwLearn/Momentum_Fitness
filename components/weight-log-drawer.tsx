"use client"

import { useState } from "react"
import { X, Scale, Flame, Dumbbell, Heart, Zap, Calendar } from "lucide-react"
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
  // Campos originales
  const [peso, setPeso] = useState("")
  const [circunferenciaBrazos, setCircunferenciaBrazos] = useState("")
  const [circunferenciaPecho, setCircunferenciaPecho] = useState("")
  const [circunferenciaCintura, setCircunferenciaCintura] = useState("")
  const [circunferenciaCadera, setCircunferenciaCadera] = useState("")
  const [circunferenciaPiernas, setCircunferenciaPiernas] = useState("")
  const [notas, setNotas] = useState("")

  // Campos báscula inteligente
  const [porcentajeGrasa, setPorcentajeGrasa] = useState("")
  const [grasaVisceral, setGrasaVisceral] = useState("")
  const [porcentajeMusculo, setPorcentajeMusculo] = useState("")
  const [imc, setImc] = useState("")
  const [metabolismoBasal, setMetabolismoBasal] = useState("")
  const [edadCorporal, setEdadCorporal] = useState("")

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  if (!isOpen || !usuario) return null

  const resetForm = () => {
    setPeso("")
    setCircunferenciaBrazos("")
    setCircunferenciaPecho("")
    setCircunferenciaCintura("")
    setCircunferenciaCadera("")
    setCircunferenciaPiernas("")
    setNotas("")
    setPorcentajeGrasa("")
    setGrasaVisceral("")
    setPorcentajeMusculo("")
    setImc("")
    setMetabolismoBasal("")
    setEdadCorporal("")
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

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
        headers: { "Content-Type": "application/json" },
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
      if (!historialResponse.ok) throw new Error("Error al guardar el registro de peso")

      // 2. Actualizar peso_actual del usuario
      const updateResponse = await fetch(`${API_URL}/api/usuarios/${usuario.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...usuario, peso_actual: pesoNum }),
      })
      if (!updateResponse.ok) throw new Error("Error al actualizar el peso del usuario")

      // 3. Guardar en báscula inteligente si hay datos adicionales
      const hayDatosBascula = porcentajeGrasa || grasaVisceral || porcentajeMusculo || imc || metabolismoBasal || edadCorporal
      if (hayDatosBascula) {
        await fetch(`${API_URL}/api/mediciones-bascula/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuario_id: usuario.id,
            peso: pesoNum,
            porcentaje_grasa: porcentajeGrasa ? parseFloat(porcentajeGrasa) : null,
            grasa_visceral: grasaVisceral ? parseInt(grasaVisceral) : null,
            porcentaje_musculo: porcentajeMusculo ? parseFloat(porcentajeMusculo) : null,
            imc: imc ? parseFloat(imc) : null,
            metabolismo_basal: metabolismoBasal ? parseInt(metabolismoBasal) : null,
            edad_corporal: edadCorporal ? parseInt(edadCorporal) : null,
            notas: notas.trim() || null,
          }),
        })
      }

      resetForm()
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el peso")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={handleClose} />

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

          {/* Usuario Info */}
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Usuario</p>
            <p className="font-semibold">{usuario.nombre} {usuario.apellido}</p>
            {usuario.peso_actual && (
              <p className="text-sm text-muted-foreground mt-1">Peso actual: {usuario.peso_actual} kg</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Peso */}
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

            {/* Medidas Corporales */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Medidas Corporales (opcional)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="brazos">Circunferencia de Brazos (cm)</Label>
                  <Input id="brazos" type="number" step="0.1" placeholder="Ej: 35.5" value={circunferenciaBrazos} onChange={(e) => setCircunferenciaBrazos(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pecho">Circunferencia de Pecho (cm)</Label>
                  <Input id="pecho" type="number" step="0.1" placeholder="Ej: 95.0" value={circunferenciaPecho} onChange={(e) => setCircunferenciaPecho(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cintura">Circunferencia de Cintura (cm)</Label>
                  <Input id="cintura" type="number" step="0.1" placeholder="Ej: 80.0" value={circunferenciaCintura} onChange={(e) => setCircunferenciaCintura(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cadera">Circunferencia de Cadera (cm)</Label>
                  <Input id="cadera" type="number" step="0.1" placeholder="Ej: 98.0" value={circunferenciaCadera} onChange={(e) => setCircunferenciaCadera(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="piernas">Circunferencia de Piernas (cm)</Label>
                  <Input id="piernas" type="number" step="0.1" placeholder="Ej: 55.0" value={circunferenciaPiernas} onChange={(e) => setCircunferenciaPiernas(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Báscula Inteligente */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-1 text-foreground flex items-center gap-2">
                <Scale className="h-4 w-4 text-primary" />
                Datos de Báscula Inteligente (opcional)
              </h3>
              <p className="text-xs text-muted-foreground mb-3">Ingresa los valores que muestra la báscula</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="porcentajeGrasa" className="flex items-center gap-1">
                    <Flame className="h-3.5 w-3.5 text-orange-500" />
                    % Grasa corporal
                  </Label>
                  <Input id="porcentajeGrasa" type="number" step="0.1" placeholder="Ej: 18.5" value={porcentajeGrasa} onChange={(e) => setPorcentajeGrasa(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grasaVisceral" className="flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5 text-red-500" />
                    Grasa visceral (nivel)
                  </Label>
                  <Input id="grasaVisceral" type="number" step="1" placeholder="Ej: 5" value={grasaVisceral} onChange={(e) => setGrasaVisceral(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="porcentajeMusculo" className="flex items-center gap-1">
                    <Dumbbell className="h-3.5 w-3.5 text-blue-500" />
                    % Músculo esquelético
                  </Label>
                  <Input id="porcentajeMusculo" type="number" step="0.1" placeholder="Ej: 42.0" value={porcentajeMusculo} onChange={(e) => setPorcentajeMusculo(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imc" className="flex items-center gap-1">
                    <Scale className="h-3.5 w-3.5 text-muted-foreground" />
                    IMC (kg/m²)
                  </Label>
                  <Input id="imc" type="number" step="0.1" placeholder="Ej: 22.4" value={imc} onChange={(e) => setImc(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metabolismoBasal" className="flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5 text-yellow-500" />
                    Metabolismo basal (kcal/día)
                  </Label>
                  <Input id="metabolismoBasal" type="number" step="1" placeholder="Ej: 1650" value={metabolismoBasal} onChange={(e) => setMetabolismoBasal(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edadCorporal" className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-purple-500" />
                    Edad corporal (años)
                  </Label>
                  <Input id="edadCorporal" type="number" step="1" placeholder="Ej: 28" value={edadCorporal} onChange={(e) => setEdadCorporal(e.target.value)} />
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
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1" disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar Peso"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  )
}
