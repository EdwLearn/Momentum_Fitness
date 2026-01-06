"use client"

import type React from "react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { ChartCard } from "@/components/chart-card"
import { DataTable, StatusBadge } from "@/components/data-table"
import { Bell, MessageSquare, Mail, Gift, Clock, Award, Calendar, Heart } from "lucide-react"
import { notificationRules, recentNotifications } from "@/lib/mock-data"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

const triggerIcons: Record<string, React.ElementType> = {
  Registro: Gift,
  Inactividad: Clock,
  Logro: Award,
  Renovación: Calendar,
  "Fecha especial": Heart,
}

const triggerColors: Record<string, string> = {
  Registro: "bg-chart-2/20 text-chart-2 border-chart-2/30",
  Inactividad: "bg-warning/20 text-warning border-warning/30",
  Logro: "bg-primary/20 text-primary border-primary/30",
  Renovación: "bg-chart-3/20 text-chart-3 border-chart-3/30",
  "Fecha especial": "bg-chart-5/20 text-chart-5 border-chart-5/30",
}

export default function NotificacionesPage() {
  const notificationColumns = [
    { key: "fecha", header: "Fecha" },
    { key: "usuario", header: "Usuario" },
    { key: "regla", header: "Regla" },
    {
      key: "canal",
      header: "Canal",
      render: (item: (typeof recentNotifications)[0]) => (
        <div className="flex items-center gap-2">
          {item.canal === "WhatsApp" ? (
            <MessageSquare className="h-4 w-4 text-primary" />
          ) : (
            <Mail className="h-4 w-4 text-chart-2" />
          )}
          <span>{item.canal}</span>
        </div>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      render: (item: (typeof recentNotifications)[0]) => <StatusBadge status={item.estado} />,
    },
  ]

  return (
    <DashboardLayout
      title="Notificaciones & Chatbot"
      subtitle="Configura reglas de notificación automáticas y visualiza el historial"
    >
      {/* Notification Rules Grid */}
      <ChartCard
        title="Reglas de Notificación"
        subtitle="Configura los mensajes automáticos para diferentes eventos"
        className="mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notificationRules.map((rule) => {
            const IconComponent = triggerIcons[rule.trigger] || Bell
            return (
              <div
                key={rule.id}
                className="bg-secondary border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-card">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{rule.titulo}</h4>
                      <Badge variant="outline" className={`mt-1 text-xs ${triggerColors[rule.trigger]}`}>
                        {rule.trigger}
                      </Badge>
                    </div>
                  </div>
                  <Switch checked={rule.activo} />
                </div>
                <p className="text-sm text-muted-foreground">{rule.descripcion}</p>
              </div>
            )
          })}
        </div>
      </ChartCard>

      {/* Recent Notifications Table */}
      <ChartCard title="Notificaciones Recientes" subtitle="Historial de mensajes enviados a usuarios">
        <DataTable
          columns={notificationColumns}
          data={recentNotifications}
          onRowAction={(item) => console.log("Ver notificación:", item)}
          actionLabel="Ver"
        />
      </ChartCard>
    </DashboardLayout>
  )
}
