"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { useCreateMembresia, useMembresiaActiva } from "@/lib/hooks/useMembresias"
import { useCupones } from "@/lib/hooks/useCupones"
import { useUsuarios } from "@/lib/hooks/useUsuarios"
import { TipoPlan, TipoPago, Usuario, Cupon } from "@/types"

interface RenewMembershipDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  usuario?: Usuario | null
}

// Plan configuration with prices and durations
const PLANES = [
  { id: TipoPlan.PASE_DIARIO, nombre: "Pase Diario", precio: 5000, duracion: 1 },
  { id: TipoPlan.PASE_FLEX, nombre: "Pase Flex (14 días)", precio: 39900, duracion: 14 },
  { id: TipoPlan.MENSUAL, nombre: "Mensual", precio: 59900, duracion: 30 },
  { id: TipoPlan.PLAN_3_MESES, nombre: "Plan 3 Meses", precio: 149900, duracion: 90 },
  { id: TipoPlan.PLAN_6_MESES, nombre: "Plan 6 Meses", precio: 269900, duracion: 180 },
  { id: TipoPlan.ELITE_ANUAL, nombre: "Membresía Platinum", precio: 479900, duracion: 365 },
]

export function RenewMembershipDrawer({ isOpen, onClose, onSuccess, usuario = null }: RenewMembershipDrawerProps) {
  const [selectedUsuarioId, setSelectedUsuarioId] = useState<number | null>(usuario?.id || null)
  const [formData, setFormData] = useState({
    tipoPlan: "",
    tipoPago: TipoPago.EFECTIVO,
    usarPlanReferidos: false,
    referidoPorCedula: "",
    codigoCupon: "",
  })

  const [precioFinal, setPrecioFinal] = useState(0)
  const [descuentoAplicado, setDescuentoAplicado] = useState(false)
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState(0)
  const [tipoDescuento, setTipoDescuento] = useState<"referido" | "cupon" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cuponValidado, setCuponValidado] = useState<Cupon | null>(null)
  const [cuponError, setCuponError] = useState<string | null>(null)

  const { data: cupones } = useCupones()
  const { data: usuarios } = useUsuarios()
  const createMembresia = useCreateMembresia()

  // Obtener membresía activa del usuario seleccionado
  const { data: membresiaActiva } = useMembresiaActiva(selectedUsuarioId || 0)

  // Calcular días restantes de la membresía actual
  const calcularDiasRestantes = (): number => {
    if (!membresiaActiva) return 0

    const hoy = new Date()
    const fechaFin = new Date(membresiaActiva.fecha_fin)

    // Calcular diferencia en milisegundos y convertir a días
    const diferenciaMilisegundos = fechaFin.getTime() - hoy.getTime()
    const diasRestantes = Math.ceil(diferenciaMilisegundos / (1000 * 60 * 60 * 24))

    // Si ya expiró, devolver 0
    return diasRestantes > 0 ? diasRestantes : 0
  }

  const diasRestantes = calcularDiasRestantes()
  const diasNuevoPlan = PLANES.find(p => p.id === formData.tipoPlan)?.duracion || 0
  const diasTotales = diasRestantes + diasNuevoPlan

  // Sincronizar usuario seleccionado cuando cambia la prop
  useEffect(() => {
    if (usuario) {
      setSelectedUsuarioId(usuario.id)
    }
  }, [usuario])

  // Validar cupón cuando se ingresa código
  useEffect(() => {
    if (!formData.codigoCupon || formData.codigoCupon.length < 3) {
      setCuponValidado(null)
      setCuponError(null)
      return
    }

    const codigoUpper = formData.codigoCupon.toUpperCase().trim()
    const cuponEncontrado = cupones?.find(c => c.codigo === codigoUpper)

    if (!cuponEncontrado) {
      setCuponValidado(null)
      setCuponError("Cupón no encontrado")
      return
    }

    if (!cuponEncontrado.activo) {
      setCuponValidado(null)
      setCuponError("Cupón inactivo")
      return
    }

    // Validar expiración
    if (cuponEncontrado.fecha_expiracion) {
      const fechaExpiracion = new Date(cuponEncontrado.fecha_expiracion)
      const hoy = new Date()
      if (fechaExpiracion < hoy) {
        setCuponValidado(null)
        setCuponError("Cupón expirado")
        return
      }
    }

    // Validar que el plan sea elegible (no Pase Diario ni Pase Flex)
    if (formData.tipoPlan === TipoPlan.PASE_DIARIO || formData.tipoPlan === TipoPlan.PASE_FLEX) {
      setCuponValidado(null)
      setCuponError("Cupones no aplican a Pase Diario o Pase Flex")
      return
    }

    // Cupón válido
    setCuponValidado(cuponEncontrado)
    setCuponError(null)
  }, [formData.codigoCupon, formData.tipoPlan, cupones])

  // Calcular precio con descuento si aplica
  useEffect(() => {
    if (formData.tipoPlan) {
      const plan = PLANES.find(p => p.id === formData.tipoPlan)
      if (plan) {
        let precio = plan.precio
        let descuento = 0
        let tipo: "referido" | "cupon" | null = null

        // Verificar si tiene cupón válido
        const tieneCuponValido = cuponValidado && formData.codigoCupon && !cuponError

        // Verificar si tiene referido válido
        const tieneReferidoValido = formData.usarPlanReferidos &&
                                    formData.referidoPorCedula &&
                                    formData.tipoPlan !== TipoPlan.PASE_DIARIO

        // Validar que no se intenten usar ambos descuentos
        if (tieneCuponValido && tieneReferidoValido) {
          // Usar el descuento mayor (cupones son hasta 20%, referidos solo 5%)
          if (cuponValidado && cuponValidado.descuento > 5) {
            // Aplicar cupón
            descuento = cuponValidado.descuento
            tipo = "cupon"
          } else {
            // Aplicar referido
            descuento = 5
            tipo = "referido"
          }
        } else if (tieneCuponValido && cuponValidado) {
          // Solo cupón
          descuento = cuponValidado.descuento
          tipo = "cupon"
        } else if (tieneReferidoValido) {
          // Solo referido
          descuento = 5
          tipo = "referido"
        }

        // Aplicar descuento
        if (descuento > 0) {
          precio = precio * (1 - descuento / 100)
          setDescuentoAplicado(true)
          setDescuentoPorcentaje(descuento)
          setTipoDescuento(tipo)
        } else {
          setDescuentoAplicado(false)
          setDescuentoPorcentaje(0)
          setTipoDescuento(null)
        }

        setPrecioFinal(Math.round(precio))
      }
    } else {
      setPrecioFinal(0)
      setDescuentoAplicado(false)
      setDescuentoPorcentaje(0)
      setTipoDescuento(null)
    }
  }, [formData.tipoPlan, formData.usarPlanReferidos, formData.referidoPorCedula, cuponValidado, formData.codigoCupon, cuponError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!selectedUsuarioId) {
      setError("Debe seleccionar un usuario")
      return
    }

    if (!formData.tipoPlan) {
      setError("Debe seleccionar un plan")
      return
    }

    const usuarioSeleccionado = usuarios?.find(u => u.id === selectedUsuarioId)
    if (!usuarioSeleccionado) {
      setError("Usuario no encontrado")
      return
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
      // Preparar descripción según el tipo de descuento
      let descripcionMembresia = null
      if (tipoDescuento === "cupon" && cuponValidado) {
        descripcionMembresia = `Cupón ${cuponValidado.codigo} aplicado (${cuponValidado.descuento}% descuento) - Renovación`
      } else if (tipoDescuento === "referido") {
        descripcionMembresia = "Descuento 5% por referido aplicado - Renovación"
      } else {
        descripcionMembresia = "Renovación de membresía"
      }

      await createMembresia.mutateAsync({
        usuario_id: selectedUsuarioId,
        tipo_plan: formData.tipoPlan as TipoPlan,
        tipo_pago: formData.tipoPago,
        descripcion: descripcionMembresia,
        referido_por_id: referidoId || null,
        cupon_codigo: (tipoDescuento === "cupon" && formData.codigoCupon) ? formData.codigoCupon.trim() : null,
      })

      onSuccess()
      onClose()

      // Reset form
      setSelectedUsuarioId(null)
      setFormData({
        tipoPlan: "",
        tipoPago: TipoPago.EFECTIVO,
        usarPlanReferidos: false,
        referidoPorCedula: "",
        codigoCupon: "",
      })
      setPrecioFinal(0)
      setDescuentoAplicado(false)
      setDescuentoPorcentaje(0)
      setTipoDescuento(null)
      setCuponValidado(null)
      setCuponError(null)
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al renovar la membresía")
    }
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value)
  }

  // Determinar si debe mostrar el campo de referido (todos los planes excepto Pase Diario y Pase Flex)
  const mostrarReferido = formData.tipoPlan &&
    formData.tipoPlan !== TipoPlan.PASE_DIARIO &&
    formData.tipoPlan !== TipoPlan.PASE_FLEX

  // Obtener usuario seleccionado actual
  const usuarioActual = selectedUsuarioId ? usuarios?.find(u => u.id === selectedUsuarioId) : null

  // Filtrar solo usuarios (no empleados)
  const soloClientes = usuarios?.filter(u => u.tipo === "usuario") || []

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Centrado */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 p-4 max-h-[90vh] overflow-y-auto">
        <Card className="bg-card border-border p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Renovar Membresía</h2>
              <p className="text-sm text-muted-foreground">
                {usuarioActual ? `${usuarioActual.nombre} ${usuarioActual.apellido}` : "Selecciona un usuario para renovar su membresía"}
              </p>
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
              <h3 className="text-lg font-semibold text-foreground">Seleccionar Usuario</h3>

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

          {/* Plan Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Seleccionar Nuevo Plan</h3>

            <div className="space-y-2">
              <Label htmlFor="tipoPlan">
                Tipo de Plan <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.tipoPlan}
                onValueChange={(value) => setFormData({ ...formData, tipoPlan: value })}
                required
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

            <div className="space-y-2">
              <Label htmlFor="tipoPago">Método de Pago</Label>
              <Select
                value={formData.tipoPago}
                onValueChange={(value) => setFormData({ ...formData, tipoPago: value as TipoPago })}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TipoPago.EFECTIVO}>Efectivo</SelectItem>
                  <SelectItem value={TipoPago.TARJETA}>Tarjeta</SelectItem>
                  <SelectItem value={TipoPago.TRANSFERENCIA}>Transferencia</SelectItem>
                  <SelectItem value={TipoPago.NEQUI}>Nequi</SelectItem>
                  <SelectItem value={TipoPago.DAVIPLATA}>Daviplata</SelectItem>
                  <SelectItem value={TipoPago.OTRO}>Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Membership Info - Show remaining days if user has active membership */}
          {selectedUsuarioId && membresiaActiva && diasRestantes > 0 && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 space-y-2">
              <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                Información de Membresía Actual
              </h3>
              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Días restantes actuales:</span>
                  <span className="font-semibold text-foreground">{diasRestantes} días</span>
                </div>
                {formData.tipoPlan && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Días del nuevo plan:</span>
                      <span className="font-semibold text-foreground">+ {diasNuevoPlan} días</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-blue-500/30">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">Total de días:</span>
                      <span className="font-bold text-lg text-blue-600 dark:text-blue-400">{diasTotales} días</span>
                    </div>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                ✓ Al renovar antes de que expire, se sumarán los días restantes al nuevo plan
              </p>
            </div>
          )}

          {/* Discounts Section */}
          {mostrarReferido && formData.tipoPlan && (
            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="text-lg font-semibold text-foreground">Descuentos</h3>

              {/* Checkbox Plan de Referidos */}
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
                  disabled={!!cuponValidado}
                />
                <Label htmlFor="usarPlanReferidos" className={`cursor-pointer ${cuponValidado ? 'text-muted-foreground' : ''}`}>
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

              {/* Campo de Cupón */}
              <div className="space-y-2">
                <Label htmlFor="codigoCupon">
                  Código de cupón (opcional)
                </Label>
                <Input
                  id="codigoCupon"
                  value={formData.codigoCupon}
                  onChange={(e) => setFormData({ ...formData, codigoCupon: e.target.value.toUpperCase() })}
                  placeholder="Ej: RENUEVA-AHORA, UPGRADE-6M"
                  className="bg-secondary border-border font-mono"
                  disabled={formData.usarPlanReferidos && formData.referidoPorCedula !== ""}
                />
                <p className="text-xs text-muted-foreground">
                  ⚠️ Los cupones NO son acumulables con descuento por referido
                </p>
                {cuponValidado && (
                  <p className="text-sm text-green-500 flex items-center gap-1">
                    ✓ Cupón válido: {cuponValidado.descuento}% descuento ({cuponValidado.nicho})
                  </p>
                )}
                {cuponError && (
                  <p className="text-sm text-destructive">
                    ✗ {cuponError}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Price Summary */}
          {formData.tipoPlan && (
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Precio base:</span>
                <span className="font-medium">
                  {formatCurrency(PLANES.find(p => p.id === formData.tipoPlan)?.precio || 0)}
                </span>
              </div>
              {descuentoAplicado && (
                <div className="flex items-center justify-between text-sm text-primary">
                  <span>Descuento ({descuentoPorcentaje}% {tipoDescuento === "cupon" ? "cupón" : "referido"}):</span>
                  <span className="font-medium">
                    -{formatCurrency((PLANES.find(p => p.id === formData.tipoPlan)?.precio || 0) * (descuentoPorcentaje / 100))}
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
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse md:flex-row gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent"
              disabled={createMembresia.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={createMembresia.isPending}
            >
              {createMembresia.isPending ? "Renovando..." : "Renovar Membresía"}
            </Button>
          </div>
          </form>
        </Card>
      </div>
    </>
  )
}
