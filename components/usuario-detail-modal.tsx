"use client"

import { X, Calendar, CreditCard, Dumbbell, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/data-table"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"

interface Client {
  id: number
  nombre: string
  cedula: string
  plan: string
  fechaInicio: string
  fechaFin: string
  estado: string
  ultimaAsistencia: string
  diasEntrenados: number
}

interface ClientDetailModalProps {
  client: Client
  onClose: () => void
}

// Mock attendance data for the mini chart
const attendanceTimeline = [
  { mes: "Jul", dias: 12 },
  { mes: "Ago", dias: 18 },
  { mes: "Sep", dias: 15 },
  { mes: "Oct", dias: 20 },
  { mes: "Nov", dias: 22 },
  { mes: "Dic", dias: 8 },
]

const subscriptionHistory = [
  { fecha: "2024-11-15", plan: "Mensual", monto: "$180.000", metodo: "Tarjeta" },
  { fecha: "2024-10-15", plan: "Mensual", monto: "$180.000", metodo: "Efectivo" },
  { fecha: "2024-09-15", plan: "Mensual", monto: "$180.000", metodo: "Tarjeta" },
]

export function UsuarioDetailModal({ client, onClose }: ClientDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-xl shadow-xl mx-4">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border bg-card">
          <div>
            <h2 className="text-xl font-bold text-foreground">{client.nombre}</h2>
            <p className="text-sm text-muted-foreground">Cédula: {client.cedula}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Profile Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-secondary rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Plan</span>
              </div>
              <p className="text-lg font-semibold text-foreground">{client.plan}</p>
            </div>
            <div className="bg-secondary rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Dumbbell className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Días Entrenados</span>
              </div>
              <p className="text-lg font-semibold text-primary">{client.diasEntrenados}</p>
            </div>
            <div className="bg-secondary rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Última Asistencia</span>
              </div>
              <p className="text-lg font-semibold text-foreground">{client.ultimaAsistencia}</p>
            </div>
            <div className="bg-secondary rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Estado</span>
              </div>
              <StatusBadge status={client.estado} />
            </div>
          </div>

          {/* Attendance Timeline */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Historial de Asistencias</h3>
            <div className="h-48 bg-secondary rounded-lg p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceTimeline}>
                  <XAxis dataKey="mes" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0A0B12",
                      border: "1px solid #2A2B35",
                      borderRadius: "8px",
                      color: "#E5E5E5",
                    }}
                  />
                  <Bar dataKey="dias" fill="#A4FF1A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Subscription History */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Historial de Suscripciones y Pagos</h3>
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full">
                <thead className="bg-secondary">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Fecha</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Plan</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Monto</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Método</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptionHistory.map((item, index) => (
                    <tr key={index} className="border-t border-border">
                      <td className="px-4 py-3 text-sm text-foreground">{item.fecha}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{item.plan}</td>
                      <td className="px-4 py-3 text-sm text-primary font-medium">{item.monto}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{item.metodo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Referrer Tag */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Tags:</span>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
              Referidor
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}
