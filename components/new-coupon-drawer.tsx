"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface NewCouponDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function NewCouponDrawer({ isOpen, onClose, onSuccess }: NewCouponDrawerProps) {
  const [formData, setFormData] = useState({
    codigo: "",
    descripcion: "",
    descuento: "",
    nicho: "",
    nombreNegocio: "",
    fechaDesde: new Date().toISOString().split("T")[0],
    fechaHasta: "",
    maxUsosPorUsuario: "1",
    activo: true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate API call
    setTimeout(() => {
      onSuccess()
      onClose()
      // Reset form
      setFormData({
        codigo: "",
        descripcion: "",
        descuento: "",
        nicho: "",
        nombreNegocio: "",
        fechaDesde: new Date().toISOString().split("T")[0],
        fechaHasta: "",
        maxUsosPorUsuario: "1",
        activo: true,
      })
    }, 500)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 h-full w-full md:w-[600px] bg-card border-l border-border shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Nuevo Cupón</h2>
            <p className="text-sm text-muted-foreground">Crea un nuevo código de descuento promocional</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
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
                  max="100"
                  value={formData.descuento}
                  onChange={(e) => setFormData({ ...formData, descuento: e.target.value })}
                  placeholder="15"
                  required
                  className="bg-secondary border-border"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Input
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Ej: Descuento para alianzas con restaurantes"
                  className="bg-secondary border-border"
                />
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
                    <SelectItem value="Alimenticio">Alimenticio (restaurantes, cafés)</SelectItem>
                    <SelectItem value="Estético">Estético (barberías, spa, peluquerías)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombreNegocio">Nombre del negocio</Label>
                <Input
                  id="nombreNegocio"
                  value={formData.nombreNegocio}
                  onChange={(e) => setFormData({ ...formData, nombreNegocio: e.target.value })}
                  placeholder="Opcional"
                  className="bg-secondary border-border"
                />
              </div>
            </div>
          </div>

          {/* Validity Section */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="text-lg font-semibold text-foreground">Validez</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fechaDesde">
                  Fecha válida desde <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fechaDesde"
                  type="date"
                  value={formData.fechaDesde}
                  onChange={(e) => setFormData({ ...formData, fechaDesde: e.target.value })}
                  required
                  className="bg-secondary border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaHasta">
                  Fecha válida hasta <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fechaHasta"
                  type="date"
                  value={formData.fechaHasta}
                  onChange={(e) => setFormData({ ...formData, fechaHasta: e.target.value })}
                  required
                  min={formData.fechaDesde}
                  className="bg-secondary border-border"
                />
              </div>
            </div>
          </div>

          {/* Usage Configuration Section */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="text-lg font-semibold text-foreground">Configuraciones de Uso</h3>

            <div className="space-y-2">
              <Label htmlFor="maxUsosPorUsuario">Máximo de usos por usuario</Label>
              <Input
                id="maxUsosPorUsuario"
                type="number"
                min="1"
                value={formData.maxUsosPorUsuario}
                onChange={(e) => setFormData({ ...formData, maxUsosPorUsuario: e.target.value })}
                className="bg-secondary border-border"
              />
              <p className="text-xs text-muted-foreground">Generalmente solo 1 vez por año</p>
            </div>

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
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
              Crear cupón
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
