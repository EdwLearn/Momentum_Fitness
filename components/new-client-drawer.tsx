"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { useCreateUsuario, useUsuarios } from "@/lib/hooks/useUsuarios"
import { useCreateMembresia } from "@/lib/hooks/useMembresias"
import { useCreateAsistencia } from "@/lib/hooks/useAsistencia"
import { TipoUsuario, TipoPlan, TipoPago, OBJETIVOS_FITNESS } from "@/types"

interface NewClientDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  tipoUsuarioFijo?: TipoUsuario | null
}

// Plan configuration with prices and durations
const PLANES = [
  { id: TipoPlan.PASE_DIARIO, nombre: "Pase Diario", precio: 15000, duracion: 1 },
  { id: TipoPlan.PASE_FLEX, nombre: "Pase Flex (10 días)", precio: 120000, duracion: 30 },
  { id: TipoPlan.MENSUAL, nombre: "Mensual", precio: 180000, duracion: 30 },
  { id: TipoPlan.PLAN_3_MESES, nombre: "Plan 3 Meses", precio: 480000, duracion: 90 },
  { id: TipoPlan.PLAN_6_MESES, nombre: "Plan 6 Meses", precio: 900000, duracion: 180 },
  { id: TipoPlan.ELITE_ANUAL, nombre: "Elite Anual", precio: 1680000, duracion: 365 },
]

export function NewClientDrawer({ isOpen, onClose, onSuccess, tipoUsuarioFijo = TipoUsuario.CLIENTE }: NewClientDrawerProps) {
  const [formData, setFormData] = useState({
    // Datos personales
    nombre: "",
    apellido: "",
    cedula: "",
    email: "",
    telefono: "",
    fechaNacimiento: "",
    genero: "",

    // Información física
    peso: "",
    altura: "",
    objetivos: [] as string[],

    // Plan
    tipoPlan: "",
    fechaInicio: "",

    // Referido (opcional)
    usarPlanReferidos: false,
    referidoPorCedula: "",
  })

  const [fechaFin, setFechaFin] = useState("")
  const [precioFinal, setPrecioFinal] = useState(0)
  const [descuentoAplicado, setDescuentoAplicado] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: usuarios } = useUsuarios()
  const createUsuario = useCreateUsuario()
  const createMembresia = useCreateMembresia()
  const createAsistencia = useCreateAsistencia()

  // Auto-calcular fecha fin cuando cambia plan o fecha inicio
  useEffect(() => {
    if (formData.tipoPlan && formData.fechaInicio) {
      const plan = PLANES.find(p => p.id === formData.tipoPlan)
      if (plan) {
        const fechaInicioDate = new Date(formData.fechaInicio + "T00:00:00")
        const fechaFinDate = new Date(fechaInicioDate)
        fechaFinDate.setDate(fechaFinDate.getDate() + plan.duracion)

        const year = fechaFinDate.getFullYear()
        const month = String(fechaFinDate.getMonth() + 1).padStart(2, "0")
        const day = String(fechaFinDate.getDate()).padStart(2, "0")
        setFechaFin(`${year}-${month}-${day}`)
      }
    } else {
      setFechaFin("")
    }
  }, [formData.tipoPlan, formData.fechaInicio])

  // Calcular precio con descuento si aplica
  useEffect(() => {
    if (formData.tipoPlan) {
      const plan = PLANES.find(p => p.id === formData.tipoPlan)
      if (plan) {
        let precio = plan.precio

        // Aplicar 5% descuento si marcó checkbox referidos, tiene referido y plan != PASE_DIARIO
        if (formData.usarPlanReferidos && formData.referidoPorCedula && formData.tipoPlan !== TipoPlan.PASE_DIARIO) {
          precio = precio * 0.95 // 5% descuento
          setDescuentoAplicado(true)
        } else {
          setDescuentoAplicado(false)
        }

        setPrecioFinal(Math.round(precio))
      }
    } else {
      setPrecioFinal(0)
      setDescuentoAplicado(false)
    }
  }, [formData.tipoPlan, formData.usarPlanReferidos, formData.referidoPorCedula])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

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

    // Validar que la cédula sea única
    const cedulaExiste = usuarios?.some(u => u.telefono === formData.cedula)
    if (cedulaExiste) {
      setError("Ya existe un usuario con esta cédula")
      return
    }

    // Validar edad mínima 15 años
    if (formData.fechaNacimiento) {
      const edad = calcularEdad(formData.fechaNacimiento)
      if (edad < 15) {
        setError("El cliente debe tener al menos 15 años")
        return
      }
    }

    // Validar que el referido existe si se marcó checkbox y se proporcionó
    let referidoId: number | null = null
    if (formData.usarPlanReferidos && formData.referidoPorCedula) {
      const referido = usuarios?.find(u => u.telefono === formData.referidoPorCedula)
      if (!referido) {
        setError("El referido no existe en el sistema")
        return
      }
      referidoId = referido.id
    }

    try {
      const usuarioData = {
        nombre: formData.nombre,
        apellido: formData.apellido || formData.nombre,
        email: formData.email || `${formData.cedula}@temp.com`,
        telefono: formData.cedula,
        tipo: tipoUsuarioFijo || TipoUsuario.CLIENTE,
        fecha_nacimiento: formData.fechaNacimiento || null,
        genero: formData.genero || null,
        peso_inicial: formData.peso ? parseFloat(formData.peso) : null,
        altura: formData.altura ? parseFloat(formData.altura) : null,
        objetivo: formData.objetivos.length > 0 ? formData.objetivos.join(", ") : null,
      }

      const nuevoUsuario = await createUsuario.mutateAsync(usuarioData)

      // Crear membresía si se seleccionó plan
      if (formData.tipoPlan && formData.fechaInicio) {
        await createMembresia.mutateAsync({
          usuario_id: nuevoUsuario.id,
          tipo_plan: formData.tipoPlan as TipoPlan,
          tipo_pago: TipoPago.EFECTIVO, // Default, puede cambiarse después
          descripcion: descuentoAplicado ? "Descuento 5% por referido aplicado" : null,
          referido_por_id: referidoId,
        })

        // Si es Pase Diario, registrar asistencia automáticamente
        if (formData.tipoPlan === TipoPlan.PASE_DIARIO) {
          try {
            const now = new Date()
            const horaEntrada = now.toTimeString().split(' ')[0] // "HH:MM:SS"

            await createAsistencia.mutateAsync({
              usuario_id: nuevoUsuario.id,
              hora_entrada: horaEntrada,
            })
          } catch (asistenciaError: any) {
            // Si falla el registro de asistencia, mostrar error pero no bloquear la creación del usuario
            console.error('Error al registrar asistencia automática:', asistenciaError)
            setError(`Cliente creado exitosamente, pero hubo un error al registrar la asistencia automática: ${asistenciaError.response?.data?.detail || 'Error desconocido'}`)
          }
        }
      }

      onSuccess()
      onClose()

      // Reset form
      setFormData({
        nombre: "",
        apellido: "",
        cedula: "",
        email: "",
        telefono: "",
        fechaNacimiento: "",
        genero: "",
        peso: "",
        altura: "",
        objetivos: [],
        tipoPlan: "",
        fechaInicio: "",
        usarPlanReferidos: false,
        referidoPorCedula: "",
      })
      setFechaFin("")
      setPrecioFinal(0)
      setDescuentoAplicado(false)
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al crear el cliente")
    }
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatDisplayDate = (dateString: string): string => {
    if (!dateString) return ""
    const date = new Date(dateString + "T00:00:00")
    const day = date.getDate()
    const month = date.toLocaleDateString('es-ES', { month: 'long' })
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
  }

  const calcularEdad = (fechaNacimiento: string): number => {
    if (!fechaNacimiento) return 0
    const hoy = new Date()
    const nacimiento = new Date(fechaNacimiento + "T00:00:00")
    let edad = hoy.getFullYear() - nacimiento.getFullYear()
    const mesActual = hoy.getMonth()
    const mesNacimiento = nacimiento.getMonth()

    if (mesActual < mesNacimiento || (mesActual === mesNacimiento && hoy.getDate() < nacimiento.getDate())) {
      edad--
    }
    return edad
  }

  // Determinar si debe mostrar el campo de referido (todos los planes excepto Pase Diario)
  const mostrarReferido = formData.tipoPlan && formData.tipoPlan !== TipoPlan.PASE_DIARIO

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
        <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
          <div className="w-screen max-w-md">
            <div className="flex h-full flex-col overflow-y-scroll bg-card shadow-xl border-l border-border">
              {/* Header */}
              <div className="bg-secondary px-6 py-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-primary">Nuevo Cliente</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Completa la información del cliente y su membresía
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-md text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex-1 px-6 py-6">
                <div className="space-y-6">
                  {error && (
                    <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

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
                        maxDate={new Date().toISOString().split('T')[0]}
                        yearRange={{ start: 1950, end: new Date().getFullYear() }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Género</Label>
                      <div className="flex gap-4">
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

                    {formData.fechaNacimiento && (
                      <div className="space-y-2">
                        <Label>Edad</Label>
                        <div className="px-3 py-2 bg-secondary/50 border border-border rounded-md text-sm text-muted-foreground">
                          {calcularEdad(formData.fechaNacimiento)} años
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Información Física */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b border-border pb-2 text-foreground">Información Física</h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="peso">Peso (kg)</Label>
                        <Input
                          id="peso"
                          type="number"
                          step="0.1"
                          value={formData.peso}
                          onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
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

                    <div className="space-y-2">
                      <Label>Objetivo(s) Fitness</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {OBJETIVOS_FITNESS.map((objetivo) => (
                          <label key={objetivo} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.objetivos.includes(objetivo)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({ ...formData, objetivos: [...formData.objetivos, objetivo] })
                                } else {
                                  setFormData({ ...formData, objetivos: formData.objetivos.filter(o => o !== objetivo) })
                                }
                              }}
                              className="w-4 h-4 text-primary accent-primary rounded"
                            />
                            <span className="text-sm">{objetivo}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Información del Plan */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b border-border pb-2">Información del Plan</h3>

                    <div className="space-y-2">
                      <Label htmlFor="tipoPlan">Tipo de Plan</Label>
                      <Select
                        value={formData.tipoPlan}
                        onValueChange={(value) => setFormData({ ...formData, tipoPlan: value })}
                      >
                        <SelectTrigger className="bg-secondary border-border">
                          <SelectValue placeholder="Selecciona un plan" />
                        </SelectTrigger>
                        <SelectContent>
                          {PLANES.map((plan) => (
                            <SelectItem key={plan.id} value={plan.id}>
                              {plan.nombre} - {formatCurrency(plan.precio)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.tipoPlan && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
                          <DatePicker
                            value={formData.fechaInicio}
                            onChange={(date) => setFormData({ ...formData, fechaInicio: date })}
                            placeholder="Seleccionar fecha de inicio"
                            minDate={new Date().toISOString().split('T')[0]}
                          />
                        </div>

                        {fechaFin && (
                          <div className="space-y-2">
                            <Label>Fecha de Fin (Auto-calculada)</Label>
                            <div className="px-3 py-2 bg-secondary/50 border border-border rounded-md text-sm text-muted-foreground">
                              {formatDisplayDate(fechaFin)}
                            </div>
                          </div>
                        )}

                        {/* Checkbox Plan de Referidos - solo si plan >= Mensual */}
                        {mostrarReferido && (
                          <>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="usarPlanReferidos"
                                checked={formData.usarPlanReferidos}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  usarPlanReferidos: e.target.checked,
                                  referidoPorCedula: e.target.checked ? formData.referidoPorCedula : ""
                                })}
                                className="w-4 h-4 text-primary accent-primary rounded"
                              />
                              <Label htmlFor="usarPlanReferidos" className="cursor-pointer">
                                Usar plan de referidos (5% descuento)
                              </Label>
                            </div>

                            {formData.usarPlanReferidos && (
                              <div className="space-y-2">
                                <Label htmlFor="referidoPorCedula">
                                  Cédula del referidor <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                  id="referidoPorCedula"
                                  value={formData.referidoPorCedula}
                                  onChange={(e) => setFormData({ ...formData, referidoPorCedula: e.target.value })}
                                  placeholder="Cédula del referidor"
                                  className="bg-secondary border-border"
                                  required={formData.usarPlanReferidos}
                                />
                              </div>
                            )}
                          </>
                        )}

                        {/* Resumen de precio */}
                        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Precio base:</span>
                            <span className="font-medium">
                              {formatCurrency(PLANES.find(p => p.id === formData.tipoPlan)?.precio || 0)}
                            </span>
                          </div>
                          {descuentoAplicado && (
                            <div className="flex items-center justify-between text-sm text-primary">
                              <span>Descuento (5%):</span>
                              <span className="font-medium">
                                -{formatCurrency((PLANES.find(p => p.id === formData.tipoPlan)?.precio || 0) * 0.05)}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between pt-2 border-t border-primary/30">
                            <span className="font-semibold text-primary">Total a pagar:</span>
                            <span className="font-bold text-xl text-primary">
                              {formatCurrency(precioFinal)}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 pt-6 mt-6 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1 border-border hover:bg-secondary"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createUsuario.isPending || createMembresia.isPending}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    {(createUsuario.isPending || createMembresia.isPending) ? "Guardando..." : "Guardar Cliente"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
