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
import { useCupones } from "@/lib/hooks/useCupones"
import { TipoUsuario, TipoPlan, TipoPago, OBJETIVOS_FITNESS, Cupon } from "@/types"

// Configuración de métodos de pago
const METODOS_PAGO = [
  { id: TipoPago.EFECTIVO, nombre: "Efectivo" },
  { id: TipoPago.TRANSFERENCIA, nombre: "Transferencia" },
  { id: TipoPago.TARJETA, nombre: "Tarjeta" },
  { id: TipoPago.OTRO, nombre: "Especies" },
]

interface NewClientDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  tipoUsuarioFijo?: TipoUsuario | null
}

// Plan configuration with prices and durations
const PLANES = [
  { id: TipoPlan.PASE_DIARIO, nombre: "Pase Diario", precio: 5000, duracion: 1 },
  { id: TipoPlan.PASE_FLEX, nombre: "Pase Flex (14 días)", precio: 39900, duracion: 14 },
  { id: TipoPlan.ESTUDIANTE, nombre: "Estudiante", precio: 45000, duracion: 30 },
  { id: TipoPlan.MENSUAL, nombre: "Mensual", precio: 59900, duracion: 30 },
  { id: TipoPlan.PLAN_3_MESES, nombre: "Plan 3 Meses", precio: 149900, duracion: 90 },
  { id: TipoPlan.PLAN_6_MESES, nombre: "Plan 6 Meses", precio: 269900, duracion: 180 },
  { id: TipoPlan.ELITE_ANUAL, nombre: "Membresía Platinum", precio: 479900, duracion: 365 },
  { id: TipoPlan.SOCIO, nombre: "Socio (De por vida)", precio: 0, duracion: 36500 },
  { id: TipoPlan.CORTESIA, nombre: "Cortesía (Gratis)", precio: 0, duracion: 0 },
]

// Opciones de duración para Cortesía
const DURACIONES_CORTESIA = [
  { id: "1", nombre: "1 día", duracion: 1 },
  { id: "14", nombre: "14 días (Flex)", duracion: 14 },
  { id: "30", nombre: "30 días (Mes)", duracion: 30 },
  { id: "90", nombre: "90 días (3 Meses)", duracion: 90 },
  { id: "180", nombre: "180 días (6 Meses)", duracion: 180 },
  { id: "365", nombre: "365 días (Anual)", duracion: 365 },
]

export function NewUsuarioDrawer({ isOpen, onClose, onSuccess, tipoUsuarioFijo = TipoUsuario.CLIENTE }: NewClientDrawerProps) {
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
    tipoPago: TipoPago.EFECTIVO,
    fechaInicio: "",

    // Referido (opcional)
    usarPlanReferidos: false,
    referidoPorCedula: "",

    // Cupón (opcional)
    codigoCupon: "",
  })

  const [fechaFin, setFechaFin] = useState("")
  const [precioFinal, setPrecioFinal] = useState(0)
  const [descuentoAplicado, setDescuentoAplicado] = useState(false)
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState(0)
  const [tipoDescuento, setTipoDescuento] = useState<"referido" | "cupon" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cuponValidado, setCuponValidado] = useState<Cupon | null>(null)
  const [cuponError, setCuponError] = useState<string | null>(null)

  const { data: usuarios } = useUsuarios()
  const { data: cupones } = useCupones()
  const createUsuario = useCreateUsuario()
  const createMembresia = useCreateMembresia()
  const createAsistencia = useCreateAsistencia()

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
      setCuponError("Cupón no está disponible")
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

    // Validar que el plan sea elegible (no planes especiales)
    const planesEspeciales = [TipoPlan.PASE_DIARIO, TipoPlan.PASE_FLEX, TipoPlan.SOCIO, TipoPlan.CORTESIA]
    if (planesEspeciales.includes(formData.tipoPlan as TipoPlan)) {
      setCuponValidado(null)
      setCuponError("Cupones no aplican a este tipo de plan")
      return
    }

    // NUEVA VALIDACIÓN: Cupones 3M y 6M solo para upgrades desde Pase Mes
    const codigo = codigoUpper.toUpperCase()
    if (codigo.includes("3M") || codigo.includes("UPGRADE-3M")) {
      if (formData.tipoPlan !== TipoPlan.PLAN_3_MESES) {
        setCuponValidado(null)
        setCuponError("Cupón 3M solo aplica al Plan de 3 Meses")
        return
      }
      // Nota: La validación de que el usuario tenga Pase Mes activo se hace en backend
      setCuponValidado(cuponEncontrado)
      setCuponError(null)
      return
    }

    if (codigo.includes("6M") || codigo.includes("UPGRADE-6M")) {
      if (formData.tipoPlan !== TipoPlan.PLAN_6_MESES) {
        setCuponValidado(null)
        setCuponError("Cupón 6M solo aplica al Plan de 6 Meses")
        return
      }
      // Nota: La validación de que el usuario tenga Pase Mes activo se hace en backend
      setCuponValidado(cuponEncontrado)
      setCuponError(null)
      return
    }

    // Cupón válido
    setCuponValidado(cuponEncontrado)
    setCuponError(null)
  }, [formData.codigoCupon, formData.tipoPlan, cupones])

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
        let descuento = 0
        let tipo: "referido" | "cupon" | null = null

        // VALIDACIÓN: Planes especiales NO pueden recibir cupones ni referidos
        const planesEspeciales = [TipoPlan.PASE_DIARIO, TipoPlan.PASE_FLEX, TipoPlan.SOCIO, TipoPlan.CORTESIA]
        const esPlanBasico = planesEspeciales.includes(formData.tipoPlan as TipoPlan)

        if (esPlanBasico) {
          // No aplicar descuentos
          setDescuentoAplicado(false)
          setDescuentoPorcentaje(0)
          setTipoDescuento(null)
          setPrecioFinal(precio)
          return
        }

        // Verificar si tiene cupón válido
        const tieneCuponValido = cuponValidado && formData.codigoCupon && !cuponError

        // Verificar si tiene referido válido (ya validamos que no es plan básico)
        const tieneReferidoValido = formData.usarPlanReferidos && formData.referidoPorCedula

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
    const cedulaExiste = usuarios?.some(u => u.cedula === formData.cedula)
    if (cedulaExiste) {
      setError("Ya existe un usuario con esta cédula")
      return
    }

    // Validar edad mínima 15 años
    if (formData.fechaNacimiento) {
      const edad = calcularEdad(formData.fechaNacimiento)
      if (edad < 15) {
        setError("El usuario debe tener al menos 15 años")
        return
      }
    }

    // Validar que planes especiales NO tengan cupones ni referidos
    const planesEspecialesSubmit = [TipoPlan.PASE_DIARIO, TipoPlan.PASE_FLEX, TipoPlan.SOCIO, TipoPlan.CORTESIA]
    if (planesEspecialesSubmit.includes(formData.tipoPlan as TipoPlan)) {
      if (formData.codigoCupon) {
        setError("Este tipo de plan no puede recibir cupones")
        return
      }
      if (formData.usarPlanReferidos || formData.referidoPorCedula) {
        setError("Este tipo de plan no puede recibir beneficios de referidos")
        return
      }
    }

    // Validar que el referido existe si se marcó checkbox y se proporcionó
    let referidoId: number | null = null
    if (formData.usarPlanReferidos && formData.referidoPorCedula) {
      const referido = usuarios?.find(u => u.cedula === formData.referidoPorCedula)
      if (!referido) {
        setError("El referido no existe en el sistema")
        return
      }
      referidoId = referido.id
    }

    // Validar cupón si se proporcionó
    if (formData.codigoCupon && cuponError) {
      setError(cuponError)
      return
    }

    try {
      const usuarioData = {
        nombre: formData.nombre,
        apellido: formData.apellido || formData.nombre,
        cedula: formData.cedula,
        email: formData.email || `${formData.cedula}@temp.com`,
        telefono: formData.telefono || null,
        tipo: tipoUsuarioFijo || TipoUsuario.CLIENTE,
        fecha_nacimiento: formData.fechaNacimiento || null,
        genero: formData.genero || null,
        peso_inicial: formData.peso ? parseFloat(formData.peso) : null,
        altura: formData.altura ? parseFloat(formData.altura) : null,
        objetivo: formData.objetivos.length > 0 ? formData.objetivos.join(", ") : null,
      }

      console.log('📤 Enviando datos de usuario:', usuarioData)
      console.log('📝 Tipo de usuario (valor enum):', TipoUsuario.CLIENTE)
      console.log('📝 Tipo de usuario enviado:', usuarioData.tipo)

      const nuevoUsuario = await createUsuario.mutateAsync(usuarioData)

      // Crear membresía si se seleccionó plan
      console.log('🔍 Verificando creación de membresía...')
      console.log('  - Tipo de plan:', formData.tipoPlan)
      console.log('  - Fecha de inicio:', formData.fechaInicio)

      if (formData.tipoPlan && formData.fechaInicio) {
        console.log('✅ Creando membresía para el usuario...')

        // Preparar datos de membresía
        const cuponCodigo = (tipoDescuento === "cupon" && formData.codigoCupon) ? formData.codigoCupon.toUpperCase() : null
        const referidoIdFinal = tipoDescuento === "referido" ? referidoId : null

        await createMembresia.mutateAsync({
          usuario_id: nuevoUsuario.id,
          tipo_plan: formData.tipoPlan as TipoPlan,
          tipo_pago: formData.tipoPago,
          descripcion: null, // El backend lo generará automáticamente
          referido_por_id: referidoIdFinal,
          cupon_codigo: cuponCodigo,
          fecha_inicio: formData.fechaInicio || null,
        })

        console.log('✅ Membresía creada exitosamente - El usuario ahora tiene estado ACTIVO')

        // Registrar asistencia automáticamente para todos los planes
        try {
          const now = new Date()
          const horaEntrada = now.toTimeString().split(' ')[0] // "HH:MM:SS"

          await createAsistencia.mutateAsync({
            usuario_id: nuevoUsuario.id,
            hora_entrada: horaEntrada,
          })
          console.log('✅ Asistencia registrada automáticamente')
        } catch (asistenciaError: any) {
          // Si falla el registro de asistencia, mostrar error pero no bloquear la creación del usuario
          console.error('Error al registrar asistencia automática:', asistenciaError)
          setError(`Usuario creado exitosamente, pero hubo un error al registrar la asistencia automática: ${asistenciaError.response?.data?.detail || 'Error desconocido'}`)
        }
      } else {
        console.log('⚠️ Usuario creado SIN membresía (no se seleccionó plan o fecha de inicio)')
        console.log('   Nota: El usuario aparecerá como "Sin membresía" hasta que se le asigne un plan')
      }

      // Esperar un momento para que el backend procese completamente antes de actualizar
      await new Promise(resolve => setTimeout(resolve, 500))

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
        tipoPago: TipoPago.EFECTIVO,
        fechaInicio: "",
        usarPlanReferidos: false,
        referidoPorCedula: "",
        codigoCupon: "",
      })
      setFechaFin("")
      setPrecioFinal(0)
      setDescuentoAplicado(false)
      setDescuentoPorcentaje(0)
      setTipoDescuento(null)
      setCuponValidado(null)
      setCuponError(null)
    } catch (err: any) {
      console.error('Error completo al crear usuario:', err)
      console.error('Response data:', err.response?.data)

      // Manejar diferentes tipos de errores
      if (err.response?.data?.detail) {
        // Error con mensaje específico del backend
        if (Array.isArray(err.response.data.detail)) {
          // Errores de validación de Pydantic (array de objetos)
          const errorMessages = err.response.data.detail.map((e: any) => {
            const field = e.loc?.[e.loc.length - 1] || 'campo desconocido'
            const fieldNames: Record<string, string> = {
              'nombre': 'Nombre',
              'apellido': 'Apellido',
              'email': 'Email',
              'telefono': 'Teléfono',
              'cedula': 'Cédula',
              'tipo': 'Tipo de usuario',
            }
            const fieldName = fieldNames[field] || field

            // Mejorar mensajes de Pydantic
            let msg = e.msg
            if (msg.includes('valid email')) {
              msg = 'debe ser un email válido'
            } else if (msg.includes('field required')) {
              msg = 'es obligatorio'
            } else if (msg.includes('not a valid')) {
              msg = 'tiene un formato inválido'
            } else if (msg.includes('Input should be') && field === 'tipo') {
              // Error específico del tipo de usuario
              console.error('❌ Error de tipo de usuario. Expected:', e.ctx?.expected, 'Received:', e.input)
              msg = `tiene un valor inválido (recibido: "${e.input}"). Esto podría ser un error del sistema.`
            }

            return `${fieldName} ${msg}`
          }).join('. ')
          setError(errorMessages)
        } else {
          // Mensaje de error simple
          setError(err.response.data.detail)
        }
      } else if (err.message) {
        // Error de red o timeout
        setError(`Error de conexión: ${err.message}`)
      } else {
        // Error genérico
        setError("Error desconocido al crear el usuario. Por favor verifica los datos e intenta nuevamente.")
      }
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

  // Determinar si debe mostrar el campo de referido (todos los planes excepto planes especiales)
  const planesEspecialesUI = [TipoPlan.PASE_DIARIO, TipoPlan.PASE_FLEX, TipoPlan.SOCIO, TipoPlan.CORTESIA]
  const mostrarReferido = formData.tipoPlan && !planesEspecialesUI.includes(formData.tipoPlan as TipoPlan)

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Centrado */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 p-2 sm:p-4">
        <div className="max-h-[95vh] sm:max-h-[90vh] overflow-y-auto bg-card border border-border rounded-lg shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 bg-secondary px-4 sm:px-6 py-3 sm:py-4 border-b border-border">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">Nuevo Usuario</h2>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                  Completa la información del usuario y su membresía
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-4 sm:py-6">
            <div className="space-y-6">
              {error && (
                <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Datos Personales */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-semibold border-b border-border pb-2">Datos Personales</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                    <div className="flex gap-4 pt-2">
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
              </div>

              {/* Información Física */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-semibold border-b border-border pb-2 text-foreground">Información Física</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                <h3 className="text-base sm:text-lg font-semibold border-b border-border pb-2">Información del Plan</h3>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-3">
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    ℹ️ <strong>Opcional:</strong> Si no seleccionas un plan ahora, el usuario se creará sin membresía. Podrás agregar la membresía después desde la lista de clientes.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipoPlan">Tipo de Plan (Opcional)</Label>
                  <Select
                    value={formData.tipoPlan}
                    onValueChange={(value) => {
                      // Auto-establecer fecha de inicio a hoy si no hay fecha seleccionada
                      const fechaHoy = new Date().toISOString().split('T')[0]
                      setFormData({
                        ...formData,
                        tipoPlan: value,
                        fechaInicio: formData.fechaInicio || fechaHoy
                      })
                    }}
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
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tipoPago">Método de Pago</Label>
                      <Select
                        value={formData.tipoPago}
                        onValueChange={(value) => setFormData({ ...formData, tipoPago: value as TipoPago })}
                      >
                        <SelectTrigger className="bg-secondary border-border">
                          <SelectValue placeholder="Selecciona método de pago" />
                        </SelectTrigger>
                        <SelectContent>
                          {METODOS_PAGO.map((metodo) => (
                            <SelectItem key={metodo.id} value={metodo.id}>
                              {metodo.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-3">
                          <p className="text-xs text-amber-800 dark:text-amber-200">
                            ℹ️ <strong>Importante:</strong> Pase Día y Pase Flex no pueden recibir cupones ni beneficios de referidos.
                          </p>
                        </div>

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
                        <div className="space-y-2 pt-2">
                          <Label htmlFor="codigoCupon">
                            Código de cupón (opcional)
                          </Label>
                          <Input
                            id="codigoCupon"
                            value={formData.codigoCupon}
                            onChange={(e) => setFormData({ ...formData, codigoCupon: e.target.value.toUpperCase() })}
                            placeholder="Ej: PRIMERA-VEZ, UPGRADE-3M"
                            className="bg-secondary border-border font-mono"
                            disabled={formData.usarPlanReferidos && formData.referidoPorCedula !== ""}
                          />
                          <p className="text-xs text-muted-foreground">
                            ⚠️ Los cupones NO son acumulables con descuento por referido
                          </p>
                          <p className="text-xs text-muted-foreground">
                            📌 Cupones 3M/6M solo para usuarios con Pase Mes activo
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
                      </>
                    )}

                    {/* Mensaje informativo para Pase Día y Pase Flex */}
                    {!mostrarReferido && formData.tipoPlan && (
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                        <p className="text-xs text-muted-foreground">
                          ℹ️ Los planes <strong>Pase Día</strong> y <strong>Pase Flex</strong> no pueden recibir cupones ni beneficios de referidos.
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* Resumen de precio */}
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
              </div>

              {/* Footer */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 mt-6 border-t border-border">
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
                  {(createUsuario.isPending || createMembresia.isPending) ? "Guardando..." : "Guardar Usuario"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
