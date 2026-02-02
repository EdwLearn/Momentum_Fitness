"use client"

import type React from "react"

import { useState } from "react"
import { X, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { cuponesService } from "@/lib/services/cupones"
import { NichoCupon } from "@/types"
import { useMutation, useQueryClient } from "@tanstack/react-query"

interface PreVentaCouponDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function PreVentaCouponDrawer({ isOpen, onClose, onSuccess }: PreVentaCouponDrawerProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    codigo: "",
    nicho: "",
    fechaExpiracion: "",
  })

  const createPreVentaCupon = useMutation({
    mutationFn: cuponesService.crearCuponPreVenta,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cupones'] })
      queryClient.invalidateQueries({ queryKey: ['cupones-stats'] })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await createPreVentaCupon.mutateAsync({
        codigo: formData.codigo,
        nicho: formData.nicho,
        fecha_expiracion: formData.fechaExpiracion || null,
      })

      onSuccess()
      onClose()

      // Reset form
      setFormData({
        codigo: "",
        nicho: "",
        fechaExpiracion: "",
      })
    } catch (error) {
      console.error("Error creating pre-venta coupon:", error)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Centrado */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 p-4">
        <div className="max-h-[90vh] overflow-y-auto bg-card border border-border rounded-lg shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-primary/20 via-chart-2/20 to-primary/20 px-6 py-4 border-b border-border">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold text-foreground">Cupón de Pre-Venta</h2>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Crea un cupón especial con 25% de descuento para promoción de pre-venta
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Destacado de descuento */}
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">25%</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Descuento Pre-Venta</h3>
                  <p className="text-sm text-muted-foreground">
                    Cupón especial con descuento fijo del 25% (no acumulable con otros descuentos)
                  </p>
                </div>
              </div>
            </div>

            {/* Información del cupón */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Información del Cupón</h3>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codigo">
                    Código del cupón <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="codigo"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                    placeholder="PREVENTA2026, LANZAMIENTO25"
                    required
                    className="bg-secondary border-border font-mono text-lg"
                  />
                  <p className="text-xs text-muted-foreground">Debe ser único y descriptivo</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nicho">
                    Nicho de origen <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.nicho}
                    onValueChange={(value) => setFormData({ ...formData, nicho: value })}
                    required
                  >
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Seleccionar nicho" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NichoCupon.ALIMENTICIO}>Alimenticio (restaurantes, cafés)</SelectItem>
                      <SelectItem value={NichoCupon.ESTETICO}>Estético (barberías, spa, peluquerías)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fechaExpiracion">Fecha de expiración</Label>
                  <DatePicker
                    value={formData.fechaExpiracion}
                    onChange={(date) => setFormData({ ...formData, fechaExpiracion: date })}
                    placeholder="Seleccionar fecha (opcional)"
                    minDate={new Date().toISOString().split("T")[0]}
                    yearRange={{ start: new Date().getFullYear(), end: new Date().getFullYear() + 10 }}
                  />
                  <p className="text-xs text-muted-foreground">Opcional - dejar vacío para sin expiración</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse md:flex-row gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 bg-transparent"
                disabled={createPreVentaCupon.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(164,255,26,0.3)]"
                disabled={createPreVentaCupon.isPending}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {createPreVentaCupon.isPending ? "Creando..." : "Crear cupón de pre-venta"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
