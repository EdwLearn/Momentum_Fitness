"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { StatusBadge } from "@/components/data-table"

interface Employee {
  id: number
  nombre: string
  rol: string
  estado: string
  ultimaEntrada: string
  horasEstaSemana: number
  horasPorDia: { fecha: string; horaEntrada: string; horaSalida: string; horas: number }[]
}

interface EmployeeDetailModalProps {
  employee: Employee
  onClose: () => void
}

export function EmployeeDetailModal({ employee, onClose }: EmployeeDetailModalProps) {
  const chartData = employee.horasPorDia.slice(-7).map((day) => ({
    dia: new Date(day.fecha).toLocaleDateString("es-ES", { weekday: "short" }),
    horas: day.horas,
  }))

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 p-4 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <Card className="bg-card border-border p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{employee.nombre}</h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{employee.rol}</span>
                <StatusBadge status={employee.estado === "Activo" ? "Activo" : "Vencido"} />
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-secondary/50 rounded-lg p-2 sm:p-4">
              <p className="text-sm text-muted-foreground mb-1">Última Entrada</p>
              <p className="text-base sm:text-lg font-semibold text-foreground">{employee.ultimaEntrada}</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-2 sm:p-4">
              <p className="text-sm text-muted-foreground mb-1">Horas Esta Semana</p>
              <p className="text-base sm:text-lg font-semibold text-foreground">{employee.horasEstaSemana}h</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-2 sm:p-4">
              <p className="text-sm text-muted-foreground mb-1">Promedio Diario</p>
              <p className="text-base sm:text-lg font-semibold text-foreground">{(employee.horasEstaSemana / 7).toFixed(1)}h</p>
            </div>
          </div>

          {/* Chart */}
          <div className="mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">Horas trabajadas (últimos 7 días)</h3>
            <div className="h-64 bg-secondary/30 rounded-lg p-2 sm:p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="dia" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Bar dataKey="horas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* History Table */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">Historial de Asistencia</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Fecha</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Hora Entrada</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Hora Salida</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Horas del Día</th>
                  </tr>
                </thead>
                <tbody>
                  {employee.horasPorDia
                    .slice(-10)
                    .reverse()
                    .map((day, index) => (
                      <tr key={index} className="border-b border-border/50 hover:bg-secondary/30">
                        <td className="py-3 px-4 text-foreground">{day.fecha}</td>
                        <td className="py-3 px-4 text-foreground">{day.horaEntrada}</td>
                        <td className="py-3 px-4 text-foreground">{day.horaSalida}</td>
                        <td className="py-3 px-4 text-foreground font-medium">{day.horas}h</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full bg-transparent">
                Ver historial completo
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  )
}
