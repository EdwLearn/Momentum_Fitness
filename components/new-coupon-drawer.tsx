"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { DatePicker } from "@/components/ui/date-picker"
import { useCreateCupon } from "@/lib/hooks/useCupones"
import { NichoCupon } from "@/types"

interface NewCouponDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function NewCouponDrawer({ isOpen, onClose, onSuccess }: NewCouponDrawerProps) {
  const createCupon = useCreateCupon()
  const [formData, setFormData] = useState({
    codigo: "",
    descuento: "",
    nicho: "",
    fechaExpiracion: "",
    activo: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await createCupon.mutateAsync({
        codigo: formData.codigo,
        nicho: formData.nicho,
        descuento: parseInt(formData.descuento),
        activo: formData.activo,
        fecha_expiracion: formData.fechaExpiracion || null,
      })

      onSuccess()
      onClose()

      // Reset form
      setFormData({
        codigo: "",
        descuento: "",
        nicho: "",
        fechaExpiracion: "",
        activo: true,
      })
    } catch (error) {
      console.error("Error creating coupon:", error)
      // You could add toast notification here
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Centrado */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 p-4">
        <div className="max-h-[90vh] overflow-y-auto bg-card border border-border rounded-lg shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 bg-secondary px-6 py-4 border-b border-border">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Nuevo Cupón</h2>
                <p className="text-sm text-muted-foreground">Crea un nuevo código de descuento promocional</p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* General Info Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Información General</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codigo">
                    Código del cupón <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="codigo"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                    placeholder="RESTO10, GYM15, SPA2025"
                    required
                    className="bg-secondary border-border font-mono"
                  />
                  <p className="text-xs text-muted-foreground">Debe ser único</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descuento">
                    % de descuento <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="descuento"
                    type="number"
                    min="1"
                    max="20"
                    value={formData.descuento}
                    onChange={(e) => setFormData({ ...formData, descuento: e.target.value })}
                    placeholder="10"
                    required
                    className="bg-secondary border-border"
                  />
                  <p className="text-xs text-muted-foreground">
                    Máximo 20% - No acumulable con descuento por referido
                  </p>
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

            {/* Status Section */}
            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="text-lg font-semibold text-foreground">Estado</h3>

              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg border border-border">
                <div className="space-y-0.5">
                  <Label htmlFor="activo" className="text-base">
                    Cupón activo
                  </Label>
                  <p className="text-xs text-muted-foreground">El cupón estará disponible para usar inmediatamente</p>
                </div>
                <Switch
                  id="activo"
                  checked={formData.activo}
                  onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse md:flex-row gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 bg-transparent"
                disabled={createCupon.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={createCupon.isPending}
              >
                {createCupon.isPending ? "Creando..." : "Crear cupón"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
