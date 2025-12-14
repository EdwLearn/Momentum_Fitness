"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface NewClientDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function NewClientDrawer({ isOpen, onClose, onSuccess }: NewClientDrawerProps) {
  const [formData, setFormData] = useState({
    nombreCompleto: "",
    cedula: "",
    edad: "",
    genero: "",
    fechaNacimiento: "",
    tipoUsuario: "Cliente",
    tipoPlan: "",
    fechaInicioPlan: new Date().toISOString().split("T")[0],
    email: "",
    telefono: "",
    enviarBienvenida: true,
    agregarReferidos: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate API call
    setTimeout(() => {
      onSuccess()
      onClose()
      // Reset form
      setFormData({
        nombreCompleto: "",
        cedula: "",
        edad: "",
        genero: "",
        fechaNacimiento: "",
        tipoUsuario: "Cliente",
        tipoPlan: "",
        fechaInicioPlan: new Date().toISOString().split("T")[0],
        email: "",
        telefono: "",
        enviarBienvenida: true,
        agregarReferidos: false,
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
            <h2 className="text-2xl font-bold text-foreground">Nuevo Cliente</h2>
            <p className="text-sm text-muted-foreground">Registra un nuevo cliente en el sistema</p>
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
                <Label htmlFor="nombreCompleto">
                  Nombre completo <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nombreCompleto"
                  value={formData.nombreCompleto}
                  onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value })}
                  placeholder="Juan Pérez"
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
                <Label htmlFor="edad">Edad</Label>
                <Input
                  id="edad"
                  type="number"
                  value={formData.edad}
                  onChange={(e) => setFormData({ ...formData, edad: e.target.value })}
                  placeholder="25"
                  className="bg-secondary border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="genero">Género</Label>
                <Select value={formData.genero} onValueChange={(value) => setFormData({ ...formData, genero: value })}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Femenino">Femenino</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaNacimiento">Fecha de nacimiento</Label>
                <Input
                  id="fechaNacimiento"
                  type="date"
                  value={formData.fechaNacimiento}
                  onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                  className="bg-secondary border-border"
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
            </div>
          </div>

          {/* Plan Info Section */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="text-lg font-semibold text-foreground">Información del Plan</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipoPlan">
                  Tipo de plan inicial <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.tipoPlan}
                  onValueChange={(value) => setFormData({ ...formData, tipoPlan: value })}
                  required
                >
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="Seleccionar plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Diario">Diario</SelectItem>
                    <SelectItem value="Ticketera">Ticketera</SelectItem>
                    <SelectItem value="Mensual">Mensual</SelectItem>
                    <SelectItem value="Trimestral">Trimestral</SelectItem>
                    <SelectItem value="Anual">Anual</SelectItem>
                    <SelectItem value="Cortesía">Cortesía</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaInicioPlan">Fecha de inicio del plan</Label>
                <Input
                  id="fechaInicioPlan"
                  type="date"
                  value={formData.fechaInicioPlan}
                  onChange={(e) => setFormData({ ...formData, fechaInicioPlan: e.target.value })}
                  className="bg-secondary border-border"
                />
              </div>
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

          {/* Options Section */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h3 className="text-lg font-semibold text-foreground">Opciones</h3>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="enviarBienvenida"
                checked={formData.enviarBienvenida}
                onCheckedChange={(checked) => setFormData({ ...formData, enviarBienvenida: checked as boolean })}
              />
              <Label htmlFor="enviarBienvenida" className="cursor-pointer font-normal">
                Enviar mensaje de bienvenida automáticamente
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="agregarReferidos"
                checked={formData.agregarReferidos}
                onCheckedChange={(checked) => setFormData({ ...formData, agregarReferidos: checked as boolean })}
              />
              <Label htmlFor="agregarReferidos" className="cursor-pointer font-normal">
                Agregar al plan de referidos
              </Label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse md:flex-row gap-3 pt-6">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
              Guardar cliente
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
