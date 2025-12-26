"use client"

import { X, Calendar, Clock, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/data-table"
import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/lib/services/dashboard'

interface HistorialClienteModalProps {
  clienteId: number
  clienteNombre: string
  onClose: () => void
}

export function HistorialClienteModal({ clienteId, clienteNombre, onClose }: HistorialClienteModalProps) {
  const { data: historial, isLoading } = useQuery({
    queryKey: ['historial-cliente', clienteId],
    queryFn: () => dashboardService.getHistorialCliente(clienteId),
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateStr: string) => {
    if (dateStr === "N/A") return dateStr
    const date = new Date(dateStr)
    return date.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-xl shadow-xl mx-4">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border bg-card">
          <div>
            <h2 className="text-xl font-bold text-foreground">Historial de {clienteNombre}</h2>
            <p className="text-sm text-muted-foreground">Información completa de membresías</p>
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
                    <span className="text-sm text-muted-foreground">Primera Inscripción</span>
                  </div>
                  <p className="text-lg font-semibold text-foreground">
                    {formatDate(historial.fecha_primera_inscripcion)}
                  </p>
                </div>
                <div className="bg-secondary rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Total Días Activo</span>
                  </div>
                  <p className="text-lg font-semibold text-primary">{historial.total_dias_activo} días</p>
                </div>
                <div className="bg-secondary rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Total Membresías</span>
                  </div>
                  <p className="text-lg font-semibold text-foreground">{historial.membresias.length}</p>
                </div>
              </div>

              {/* Historial de Membresías */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Historial de Membresías</h3>
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Plan</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Fecha Inicio</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Fecha Fin</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Duración</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Precio</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historial.membresias.map((membresia, index) => (
                        <tr key={index} className="border-t border-border hover:bg-secondary/50">
                          <td className="px-4 py-3 text-sm text-foreground font-medium">
                            {membresia.tipo_plan}
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">
                            {formatDate(membresia.fecha_inicio)}
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">
                            {formatDate(membresia.fecha_fin)}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {membresia.duracion_dias} días
                          </td>
                          <td className="px-4 py-3 text-sm text-primary font-medium">
                            {formatCurrency(membresia.precio)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <StatusBadge status={membresia.estado} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Resumen Total */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Invertido</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(
                        historial.membresias.reduce((sum, m) => sum + m.precio, 0)
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Tiempo como Miembro</p>
                    <p className="text-2xl font-bold text-foreground">
                      {Math.round(historial.total_dias_activo / 30)} meses
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No se encontró información del cliente
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
