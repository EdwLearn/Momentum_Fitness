"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Mail,
  BookOpen,
  Send,
  ChevronRight,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { useState, useEffect } from "react"
import { SuccessToast } from "@/components/success-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const faqItems = [
  {
    category: "Usuarios",
    questions: [
      {
        q: "¿Cómo registro un nuevo usuario?",
        a: "Ve a la sección 'Usuarios' en el menú lateral y haz clic en el botón '+ Nuevo Usuario'. Completa el formulario con los datos personales (nombre, email, teléfono, cédula), selecciona el tipo de plan (Mensual, Trimestral, Semestral o Anual) y haz clic en 'Crear Usuario'. El sistema generará automáticamente las fechas de inicio y fin de la suscripción.",
      },
      {
        q: "¿Cómo edito o elimino un usuario?",
        a: "En la tabla de usuarios, cada fila tiene botones de acción en el lado derecho. Usa el ícono de lápiz para editar los datos del usuario o el ícono de papelera para eliminarlo. Al editar, podrás modificar todos los campos excepto la cédula. La eliminación requiere confirmación.",
      },
      {
        q: "¿Cómo puedo buscar usuarios?",
        a: "Usa la barra de búsqueda en la parte superior de la tabla de usuarios. Puedes buscar por nombre, email, teléfono o cédula. La búsqueda es instantánea y filtra los resultados mientras escribes.",
      },
      {
        q: "¿Qué información puedo ver de cada usuario?",
        a: "La tabla muestra: nombre completo, email, teléfono, cédula, tipo de plan (Mensual/Trimestral/Semestral/Anual), fecha de inicio, fecha de vencimiento y estado de la suscripción (Activa/Vencida/Por vencer). Los estados tienen códigos de colores para identificación rápida.",
      },
    ],
  },
  {
    category: "Suscripciones",
    questions: [
      {
        q: "¿Qué tipos de planes están disponibles?",
        a: "Momentum Fitness ofrece 6 tipos de planes: Pase Diario (1 día - acceso único), Pase Flex (15 días - acceso flexible sin compromiso), Mensual (30 días), Trimestral (90 días), Semestral (180 días) y Anual (365 días). Al crear o editar un usuario, selecciona el tipo de plan y el sistema calculará automáticamente la fecha de vencimiento según corresponda.",
      },
      {
        q: "¿Cuál es la diferencia entre Pase Diario y Pase Flex?",
        a: "El Pase Diario es válido solo por un día específico, ideal para visitantes ocasionales. El Pase Flex tiene una duración de 15 días y ofrece acceso flexible, perfecto para quienes quieren probar el gimnasio por un periodo corto sin comprometerse con planes más largos. Ambos son ideales para usuarios que no quieren suscripciones extensas.",
      },
      {
        q: "¿Cómo funciona el sistema de vencimiento?",
        a: "El sistema calcula automáticamente las fechas según el tipo de plan. Una suscripción se marca como 'Por vencer' cuando faltan 7 días o menos para su vencimiento, y como 'Vencida' después de la fecha de fin. Puedes ver el estado con códigos de colores en la tabla de usuarios. Los pases diarios vencen al finalizar el día.",
      },
      {
        q: "¿Cómo renuevo una suscripción vencida?",
        a: "Para renovar una suscripción, edita el usuario usando el botón de lápiz, actualiza la fecha de inicio a la fecha actual o deseada, y confirma. El sistema recalculará automáticamente la fecha de vencimiento según el tipo de plan seleccionado. También puedes cambiar el tipo de plan durante la renovación.",
      },
    ],
  },
  {
    category: "Asistencia",
    questions: [
      {
        q: "¿Cómo registro la asistencia de un usuario?",
        a: "Ve a la sección 'Asistencia' en el menú lateral. Puedes buscar al usuario por nombre o cédula, seleccionarlo de la lista y hacer clic en '+ Registrar Asistencia'. El sistema registrará automáticamente la fecha y hora actual. También puedes ver el historial completo de asistencias de cada usuario.",
      },
      {
        q: "¿Puedo ver estadísticas de asistencia?",
        a: "Sí, en la sección de Asistencia puedes ver métricas como total de asistencias del día, asistencias del mes, comparativas con periodos anteriores, gráficos de tendencia por día/semana/mes, y horarios pico. También puedes filtrar por rangos de fechas personalizados.",
      },
      {
        q: "¿Cómo registro la asistencia de empleados?",
        a: "En la sección 'Asistencia Empleados' puedes registrar entradas y salidas del personal. El sistema lleva un control completo de horarios, horas trabajadas, y genera reportes de puntualidad y asistencia del equipo.",
      },
    ],
  },
  {
    category: "Dashboard y Reportes",
    questions: [
      {
        q: "¿Qué información muestra el Dashboard?",
        a: "El Dashboard principal muestra métricas clave en tiempo real: total de usuarios activos con tendencia porcentual, asistencias del día, ingresos del mes, gráficos de asistencia semanal, distribución de planes, usuarios próximos a vencer, y actividad reciente. Todo con actualizaciones automáticas.",
      },
      {
        q: "¿Cómo genero reportes?",
        a: "En la sección 'Reportes' puedes generar reportes de ingresos, asistencia, y usuarios. Selecciona el tipo de reporte, ajusta el rango de fechas usando el selector de calendario, y haz clic en 'Generar'. Los reportes incluyen gráficos visuales y tablas detalladas para análisis.",
      },
      {
        q: "¿Qué tipos de reportes puedo generar?",
        a: "Puedes generar tres tipos principales de reportes: Reportes de Ingresos (mostrando totales por periodo, desglose por tipo de plan y tendencias), Reportes de Asistencia (con estadísticas de asistencias diarias, semanales y mensuales), y Reportes de Usuarios (con información sobre nuevos usuarios, renovaciones y distribución de planes).",
      },
    ],
  },
  {
    category: "Sistema de Cupones y Referidos",
    questions: [
      {
        q: "¿Cómo funcionan los cupones de descuento?",
        a: "En la sección 'Cupones' puedes crear códigos promocionales con porcentaje de descuento, fecha de vencimiento y límite de usos. Los usuarios pueden usar estos códigos al momento de inscribirse o renovar para obtener descuentos en sus planes.",
      },
      {
        q: "¿Qué es el sistema de referidos?",
        a: "El sistema de referidos permite que tus usuarios actuales inviten a nuevos usuarios. Cuando un usuario nuevo se registra usando el código de referido de un miembro existente, ambos pueden recibir beneficios (descuentos, extensión de suscripción, etc.).",
      },
      {
        q: "¿Cómo puedo rastrear el uso de cupones y referidos?",
        a: "En las secciones de Cupones y Referidos encontrarás dashboards con estadísticas de uso, cupones más populares, usuarios que más refieren, total de descuentos otorgados, y tasas de conversión. Esto te ayuda a medir el éxito de tus campañas promocionales.",
      },
    ],
  },
]

interface Ticket {
  id: number
  nombre: string
  categoria: string
  prioridad: string
  asunto: string
  mensaje: string
  estado: string
  created_at: string
}

export default function SoportePage() {
  const [showSuccess, setShowSuccess] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    nombre: "",
    categoria: "",
    prioridad: "",
    asunto: "",
    mensaje: "",
  })

  // Fetch tickets on mount
  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      console.log("Obteniendo tickets desde:", `${API_URL}/api/tickets-soporte/`)
      const response = await fetch(`${API_URL}/api/tickets-soporte/`)
      console.log("Respuesta fetchTickets:", response.status)
      if (response.ok) {
        const data = await response.json()
        console.log("Tickets obtenidos:", data)
        setTickets(data)
      } else {
        console.error("Error al obtener tickets, status:", response.status)
      }
    } catch (error) {
      console.error("Error fetching tickets:", error)
    }
  }

  const handleSubmitTicket = async () => {
    // Validar campos
    if (!formData.nombre || !formData.categoria || !formData.prioridad || !formData.asunto || !formData.mensaje) {
      alert("Por favor completa todos los campos")
      return
    }

    setLoading(true)
    try {
      console.log("Enviando ticket:", formData)
      const response = await fetch(`${API_URL}/api/tickets-soporte/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      console.log("Respuesta del servidor:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("Ticket creado:", data)
        setShowSuccess(true)
        setFormData({
          nombre: "",
          categoria: "",
          prioridad: "",
          asunto: "",
          mensaje: "",
        })
        // Refresh tickets list
        await fetchTickets()
      } else {
        const errorData = await response.json()
        console.error("Error del servidor:", errorData)
        alert(`Error al crear el ticket: ${errorData.detail || "Error desconocido"}`)
      }
    } catch (error) {
      console.error("Error creating ticket:", error)
      alert(`Error de conexión: ${error}. Verifica que el servidor backend esté corriendo.`)
    } finally {
      setLoading(false)
    }
  }

  const handleNewTicket = () => {
    // Limpiar el formulario
    setFormData({
      nombre: "",
      categoria: "",
      prioridad: "",
      asunto: "",
      mensaje: "",
    })
    // Hacer scroll hacia el formulario con un pequeño delay para asegurar que el DOM se actualice
    setTimeout(() => {
      const formElement = document.getElementById("ticket-form")
      if (formElement) {
        // Calcular la posición considerando el sidebar y padding
        const yOffset = -20 // offset para no quedar pegado al top
        const element = formElement
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset

        window.scrollTo({ top: y, behavior: "smooth" })

        // Enfocar el primer campo del formulario
        const nombreInput = document.getElementById("ticket-name")
        if (nombreInput) {
          setTimeout(() => nombreInput.focus(), 500)
        }
      }
    }, 100)
  }

  const filteredFaqs = faqItems
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (item) =>
          item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.a.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((category) => category.questions.length > 0)

  return (
    <DashboardLayout
      title="Centro de Soporte"
      subtitle="Encuentra ayuda y recursos para usar Momentum Fitness"
    >
      <div className="space-y-6">

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6 bg-card border-sidebar-border hover:border-primary transition-colors cursor-pointer group">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500 group-hover:scale-110 transition-all">
                <Mail className="h-6 w-6 text-blue-500 group-hover:text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Email</h3>
                <p className="text-sm text-muted-foreground mt-1">support@momentum.com</p>
              </div>
              <Button
                variant="outline"
                className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white bg-transparent"
                onClick={() => {
                  const email = "edwardgiraldo101@gmail.com"
                  const subject = "Consulta de Soporte - Momentum Fitness"
                  const body = `Hola equipo de Momentum Fitness,

Tengo una consulta sobre el sistema.

Nombre:
Asunto:
Descripción del problema:


Gracias por su atención.`
                  window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_blank")
                }}
              >
                Enviar email
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-card border-sidebar-border hover:border-primary transition-colors cursor-pointer group">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all">
                <BookOpen className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Documentación</h3>
                <p className="text-sm text-muted-foreground mt-1">Guía completa de uso</p>
              </div>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 glow-green-sm">
                Ver documentación
              </Button>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* FAQ Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 bg-card border-sidebar-border">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Preguntas Frecuentes</h2>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar en preguntas frecuentes..."
                    className="pl-10 bg-sidebar"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="space-y-4">
                  {filteredFaqs.length > 0 ? (
                    filteredFaqs.map((category) => (
                      <div key={category.category}>
                        <h3 className="text-lg font-semibold text-primary mb-3">{category.category}</h3>
                        <div className="space-y-2">
                          {category.questions.map((item, idx) => (
                            <div key={idx} className="border border-sidebar-border rounded-lg overflow-hidden">
                              <button
                                onClick={() =>
                                  setExpandedFaq(
                                    expandedFaq === `${category.category}-${idx}`
                                      ? null
                                      : `${category.category}-${idx}`,
                                  )
                                }
                                className="w-full flex items-center justify-between p-4 text-left hover:bg-sidebar-accent transition-colors"
                              >
                                <span className="font-medium text-foreground">{item.q}</span>
                                <ChevronRight
                                  className={`h-5 w-5 text-muted-foreground transition-transform ${expandedFaq === `${category.category}-${idx}` ? "rotate-90" : ""}`}
                                />
                              </button>
                              {expandedFaq === `${category.category}-${idx}` && (
                                <div className="px-4 pb-4 text-muted-foreground border-t border-sidebar-border pt-3">
                                  {item.a}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No se encontraron resultados para "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* My Support Tickets */}
            <Card className="p-6 bg-card border-sidebar-border">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground">Mis Tickets de Soporte</h2>
                  <Button
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={handleNewTicket}
                  >
                    Nuevo ticket
                  </Button>
                </div>

                <div className="space-y-3">
                  {tickets.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No hay tickets creados aún</p>
                    </div>
                  ) : (
                    tickets.map((ticket: Ticket) => (
                      <div
                        key={ticket.id}
                        className="p-4 rounded-lg bg-sidebar-accent border border-sidebar-border hover:border-primary transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-mono text-muted-foreground">#{ticket.id}</span>
                              {ticket.estado === "Resuelto" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                              {ticket.estado === "En progreso" && <Clock className="h-4 w-4 text-yellow-500" />}
                              {ticket.estado === "Abierto" && <AlertCircle className="h-4 w-4 text-blue-500" />}
                            </div>
                            <p className="font-medium text-foreground">{ticket.asunto}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {new Date(ticket.created_at).toLocaleDateString("es-ES")}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                ticket.prioridad === "high" || ticket.prioridad === "urgent"
                                  ? "bg-red-500/20 text-red-500"
                                  : ticket.prioridad === "medium"
                                    ? "bg-yellow-500/20 text-yellow-500"
                                    : "bg-blue-500/20 text-blue-500"
                              }`}
                            >
                              {ticket.prioridad === "low"
                                ? "Baja"
                                : ticket.prioridad === "medium"
                                  ? "Media"
                                  : ticket.prioridad === "high"
                                    ? "Alta"
                                    : "Urgente"}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                ticket.estado === "Resuelto"
                                  ? "bg-green-500/20 text-green-500"
                                  : ticket.estado === "En progreso"
                                    ? "bg-yellow-500/20 text-yellow-500"
                                    : "bg-blue-500/20 text-blue-500"
                              }`}
                            >
                              {ticket.estado}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-1">
            <Card id="ticket-form" className="p-6 bg-card border-sidebar-border sticky top-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Crear Ticket</h2>
                <p className="text-sm text-muted-foreground">
                  ¿No encontraste lo que buscabas? Contáctanos directamente.
                </p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ticket-name">Nombre</Label>
                    <Input
                      id="ticket-name"
                      placeholder="Tu nombre"
                      className="bg-sidebar"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ticket-category">Categoría</Label>
                    <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })}>
                      <SelectTrigger className="bg-sidebar">
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Problema Técnico</SelectItem>
                        <SelectItem value="billing">Facturación</SelectItem>
                        <SelectItem value="feature">Nueva Funcionalidad</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ticket-priority">Prioridad</Label>
                    <Select value={formData.prioridad} onValueChange={(value) => setFormData({ ...formData, prioridad: value })}>
                      <SelectTrigger className="bg-sidebar">
                        <SelectValue placeholder="Selecciona la prioridad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baja</SelectItem>
                        <SelectItem value="medium">Media</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ticket-subject">Asunto</Label>
                    <Input
                      id="ticket-subject"
                      placeholder="Breve descripción del problema"
                      className="bg-sidebar"
                      value={formData.asunto}
                      onChange={(e) => setFormData({ ...formData, asunto: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ticket-message">Mensaje</Label>
                    <Textarea
                      id="ticket-message"
                      placeholder="Describe tu problema o pregunta en detalle..."
                      rows={6}
                      className="bg-sidebar resize-none"
                      value={formData.mensaje}
                      onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                    />
                  </div>

                  <Button
                    onClick={handleSubmitTicket}
                    disabled={loading}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-green-sm disabled:opacity-50"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {loading ? "Enviando..." : "Enviar ticket"}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <SuccessToast
          open={showSuccess}
          onOpenChange={setShowSuccess}
          message="Ticket creado exitosamente. Te responderemos pronto."
        />
      </div>
    </DashboardLayout>
  )
}
