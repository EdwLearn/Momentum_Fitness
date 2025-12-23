"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  MessageCircle,
  Mail,
  Phone,
  BookOpen,
  Video,
  FileText,
  Send,
  ChevronRight,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react"
import { useState } from "react"
import { SuccessToast } from "@/components/success-toast"

const faqItems = [
  {
    category: "Clientes",
    questions: [
      {
        q: "¿Cómo registro un nuevo cliente?",
        a: "Ve a la sección Clientes y haz clic en el botón 'Nuevo cliente'. Completa el formulario con la información requerida.",
      },
      {
        q: "¿Cómo busco un cliente específico?",
        a: "Usa la barra de búsqueda en la página de Clientes para buscar por nombre o cédula.",
      },
      {
        q: "¿Puedo exportar la lista de clientes?",
        a: "Sí, en la página de Clientes hay un botón 'Exportar' que te permite descargar la lista en formato CSV o PDF.",
      },
    ],
  },
  {
    category: "Suscripciones",
    questions: [
      {
        q: "¿Cómo creo un nuevo plan de suscripción?",
        a: "En la sección Suscripciones, usa el botón 'Nuevo plan' para configurar tipos de planes, precios y duración.",
      },
      {
        q: "¿Cómo renuevo una suscripción?",
        a: "Ve al perfil del cliente y selecciona 'Renovar suscripción'. El sistema calculará automáticamente la nueva fecha de vencimiento.",
      },
      {
        q: "¿Puedo configurar renovaciones automáticas?",
        a: "Sí, en Configuración > Suscripciones puedes habilitar la renovación automática con cargo a tarjeta.",
      },
    ],
  },
  {
    category: "Reportes",
    questions: [
      {
        q: "¿Cómo genero reportes personalizados?",
        a: "En la sección Reportes, selecciona el tipo de reporte, ajusta los filtros de fecha y haz clic en 'Generar'.",
      },
      {
        q: "¿Puedo programar reportes automáticos?",
        a: "Sí, en Configuración > Reportes puedes programar envíos automáticos por email semanalmente o mensualmente.",
      },
      {
        q: "¿Qué formatos de exportación están disponibles?",
        a: "Puedes exportar reportes en formato PDF para presentaciones o CSV para análisis en Excel.",
      },
    ],
  },
  {
    category: "Notificaciones",
    questions: [
      {
        q: "¿Cómo configuro notificaciones automáticas?",
        a: "Ve a Notificaciones y activa las reglas que desees. Puedes personalizar los mensajes y los triggers.",
      },
      {
        q: "¿Puedo enviar mensajes masivos?",
        a: "Sí, en la sección de Clientes puedes seleccionar múltiples usuarios y enviar un mensaje grupal por WhatsApp o Email.",
      },
      {
        q: "¿Cómo integro WhatsApp Business?",
        a: "En Configuración > Notificaciones, ingresa tu API Key de WhatsApp Business y el número autorizado.",
      },
    ],
  },
]

const supportTickets = [
  {
    id: "#TKT-001",
    asunto: "Error al exportar reporte de ingresos",
    estado: "Resuelto",
    prioridad: "Media",
    fecha: "2024-12-08",
  },
  {
    id: "#TKT-002",
    asunto: "Consulta sobre integración con pasarela de pago",
    estado: "En progreso",
    prioridad: "Alta",
    fecha: "2024-12-09",
  },
  {
    id: "#TKT-003",
    asunto: "Solicitud de nueva funcionalidad",
    estado: "Abierto",
    prioridad: "Baja",
    fecha: "2024-12-10",
  },
]

export default function SoportePage() {
  const [showSuccess, setShowSuccess] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)

  const handleSubmitTicket = () => {
    setShowSuccess(true)
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
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Centro de Soporte</h1>
            <p className="text-muted-foreground mt-1">Encuentra ayuda y recursos para usar Momentum Fitness</p>
          </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 bg-card border-sidebar-border hover:border-primary transition-colors cursor-pointer group">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all">
                <MessageCircle className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Chat en Vivo</h3>
                <p className="text-sm text-muted-foreground mt-1">Respuesta en menos de 5 minutos</p>
              </div>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 glow-green-sm">
                Iniciar chat
              </Button>
            </div>
          </Card>

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
              >
                Enviar email
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-card border-sidebar-border hover:border-primary transition-colors cursor-pointer group">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500 group-hover:scale-110 transition-all">
                <Phone className="h-6 w-6 text-purple-500 group-hover:text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Teléfono</h3>
                <p className="text-sm text-muted-foreground mt-1">+57 1 234 5678</p>
              </div>
              <Button
                variant="outline"
                className="border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white bg-transparent"
              >
                Llamar ahora
              </Button>
            </div>
          </Card>
        </div>

        {/* Quick Resources */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Recursos Rápidos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-card border-sidebar-border hover:border-primary transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">Documentación</h4>
                  <p className="text-xs text-muted-foreground">Guías completas de uso</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Card>

            <Card className="p-4 bg-card border-sidebar-border hover:border-primary transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Video className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">Video Tutoriales</h4>
                  <p className="text-xs text-muted-foreground">Aprende con videos</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Card>

            <Card className="p-4 bg-card border-sidebar-border hover:border-primary transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-purple-500" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">API Reference</h4>
                  <p className="text-xs text-muted-foreground">Integración y desarrollo</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Card>
          </div>
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
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Nuevo ticket
                  </Button>
                </div>

                <div className="space-y-3">
                  {supportTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="p-4 rounded-lg bg-sidebar-accent border border-sidebar-border hover:border-primary transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-mono text-muted-foreground">{ticket.id}</span>
                            {ticket.estado === "Resuelto" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                            {ticket.estado === "En progreso" && <Clock className="h-4 w-4 text-yellow-500" />}
                            {ticket.estado === "Abierto" && <AlertCircle className="h-4 w-4 text-blue-500" />}
                          </div>
                          <p className="font-medium text-foreground">{ticket.asunto}</p>
                          <p className="text-sm text-muted-foreground mt-1">{ticket.fecha}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              ticket.prioridad === "Alta"
                                ? "bg-red-500/20 text-red-500"
                                : ticket.prioridad === "Media"
                                  ? "bg-yellow-500/20 text-yellow-500"
                                  : "bg-blue-500/20 text-blue-500"
                            }`}
                          >
                            {ticket.prioridad}
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
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-card border-sidebar-border sticky top-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Crear Ticket</h2>
                <p className="text-sm text-muted-foreground">
                  ¿No encontraste lo que buscabas? Contáctanos directamente.
                </p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ticket-name">Nombre</Label>
                    <Input id="ticket-name" placeholder="Tu nombre" className="bg-sidebar" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ticket-email">Email</Label>
                    <Input id="ticket-email" type="email" placeholder="tu@email.com" className="bg-sidebar" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ticket-category">Categoría</Label>
                    <Select>
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
                    <Select>
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
                    <Input id="ticket-subject" placeholder="Breve descripción del problema" className="bg-sidebar" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ticket-message">Mensaje</Label>
                    <Textarea
                      id="ticket-message"
                      placeholder="Describe tu problema o pregunta en detalle..."
                      rows={6}
                      className="bg-sidebar resize-none"
                    />
                  </div>

                  <Button
                    onClick={handleSubmitTicket}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-green-sm"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Enviar ticket
                  </Button>
                </div>

                <div className="pt-4 border-t border-sidebar-border">
                  <p className="text-xs text-muted-foreground text-center">
                    Tiempo promedio de respuesta: <span className="text-primary font-semibold">2 horas</span>
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Additional Resources */}
        <Card className="p-6 bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">¿Necesitas ayuda personalizada?</h3>
              <p className="text-muted-foreground">
                Agenda una sesión con nuestro equipo de soporte para resolver tus dudas en tiempo real.
              </p>
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 glow-green-sm">
              Agendar sesión
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </Card>

        <SuccessToast
          open={showSuccess}
          onOpenChange={setShowSuccess}
          message="Ticket creado exitosamente. Te responderemos pronto."
        />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
