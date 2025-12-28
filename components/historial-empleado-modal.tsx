"use client"

import { X, Calendar, Clock, Briefcase, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/lib/services/dashboard'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts"

interface HistorialEmpleadoModalProps {
  empleadoId: number
  empleadoNombre: string
  onClose: () => void
}

export function HistorialEmpleadoModal({ empleadoId, empleadoNombre, onClose }: HistorialEmpleadoModalProps) {
  const { data: historial, isLoading } = useQuery({
    queryKey: ['historial-empleado', empleadoId],
    queryFn: () => dashboardService.getHistorialEmpleado(empleadoId),
  })

  const formatDate = (dateStr: string) => {
    if (dateStr === "N/A") return dateStr
    const date = new Date(dateStr)
    return date.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return "-"
    return timeStr
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-xl shadow-xl mx-4">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border bg-card">
          <div>
            <h2 className="text-xl font-bold text-foreground">Historial de {empleadoNombre}</h2>
            <p className="text-sm text-muted-foreground">Información completa de asistencias</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Cargando historial...
            </div>
          ) : historial ? (
            <>
              {/* Estadísticas Generales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-secondary rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Fecha de Contratación</span>
                  </div>
                  <p className="text-lg font-semibold text-foreground">
                    {formatDate(historial.fecha_contratacion)}
                  </p>
                </div>
                <div className="bg-secondary rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Total Días Trabajados</span>
                  </div>
                  <p className="text-lg font-semibold text-primary">{historial.total_dias_trabajados} días</p>
                </div>
                <div className="bg-secondary rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Total Horas Trabajadas</span>
                  </div>
                  <p className="text-lg font-semibold text-foreground">{historial.total_horas_trabajadas} hrs</p>
                </div>
              </div>

              {/* Resumen */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Promedio de Horas por Día</p>
                    <p className="text-xl font-bold text-primary">
                      {historial.total_dias_trabajados > 0
                        ? (historial.total_horas_trabajadas / historial.total_dias_trabajados).toFixed(2)
                        : "0.00"} hrs
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Asistencias</p>
                    <p className="text-xl font-bold text-foreground">
                      {historial.asistencias.length} registros
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tiempo de Servicio</p>
                    <p className="text-xl font-bold text-foreground">
                      {historial.fecha_contratacion !== "N/A"
                        ? (() => {
                            const contratacion = new Date(historial.fecha_contratacion)
                            const hoy = new Date()
                            const meses = Math.round(
                              (hoy.getTime() - contratacion.getTime()) / (1000 * 60 * 60 * 24 * 30)
                            )
                            return `${meses} meses`
                          })()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Gráfico de Comparación */}
              {historial.comparacion_empleados && historial.comparacion_empleados.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Comparación de Horas Trabajadas</h3>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Comparación de horas trabajadas mensuales vs promedio de otros empleados (últimos 6 meses)
                    </p>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={historial.comparacion_empleados}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#2A2B35" />
                          <XAxis
                            dataKey="mes"
                            stroke="#9CA3AF"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            stroke="#9CA3AF"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            label={{
                              value: 'Horas',
                              angle: -90,
                              position: 'insideLeft',
                              style: { fill: '#9CA3AF', fontSize: 12 }
                            }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#0A0B12",
                              border: "1px solid #2A2B35",
                              borderRadius: "8px",
                              color: "#E5E5E5",
                            }}
                            labelStyle={{ color: "#E5E5E5" }}
                            formatter={(value: number) => [`${value} hrs`, '']}
                          />
                          <Legend
                            wrapperStyle={{ color: "#E5E5E5", fontSize: "12px" }}
                            formatter={(value) => {
                              const labels: Record<string, string> = {
                                'empleado_actual': empleadoNombre,
                                'promedio_otros': 'Promedio Otros Empleados'
                              }
                              return <span style={{ color: '#E5E5E5' }}>{labels[value] || value}</span>
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="promedio_otros"
                            stroke="#6B7280"
                            strokeWidth={2}
                            dot={{ fill: '#6B7280', r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="empleado_actual"
                            stroke="#A4FF1A"
                            strokeWidth={3}
                            dot={{ fill: '#A4FF1A', r: 5 }}
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* Historial de Asistencias */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Historial de Asistencias</h3>
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-secondary sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Fecha</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Hora Entrada</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Hora Salida</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Horas Trabajadas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historial.asistencias.length > 0 ? (
                          historial.asistencias.map((asistencia, index) => (
                            <tr key={index} className="border-t border-border hover:bg-secondary/50">
                              <td className="px-4 py-3 text-sm text-foreground font-medium">
                                {formatDate(asistencia.fecha)}
                              </td>
                              <td className="px-4 py-3 text-sm text-foreground">
                                {formatTime(asistencia.hora_entrada)}
                              </td>
                              <td className="px-4 py-3 text-sm text-foreground">
                                {formatTime(asistencia.hora_salida)}
                              </td>
                              <td className="px-4 py-3 text-sm text-primary font-medium">
                                {asistencia.horas_trabajadas > 0
                                  ? `${asistencia.horas_trabajadas} hrs`
                                  : "-"}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                              No hay registros de asistencias
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No se encontró información del empleado
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
