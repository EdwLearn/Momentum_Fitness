"use client"

import { X, Calendar, CreditCard, DollarSign, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/lib/services/dashboard'

interface HistorialUsuarioModalProps {
  clienteId: number
  clienteNombre: string
  onClose: () => void
}

export function HistorialUsuarioModal({ clienteId, clienteNombre, onClose }: HistorialUsuarioModalProps) {
  const { data: historial, isLoading } = useQuery({
    queryKey: ['historial-usuario', clienteId],
    queryFn: () => dashboardService.getHistorialUsuario(clienteId),
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value)
  }

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'activa':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'vencida':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'cancelada':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
      case 'suspendida':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      default:
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
    }
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
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Días Activo (Total)</span>
                  </div>
                  <p className="text-lg font-semibold text-primary">{historial.total_dias_activo} días</p>
                </div>
                <div className="bg-secondary rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Total Membresías</span>
                  </div>
                  <p className="text-lg font-semibold text-foreground">{historial.membresias.length}</p>
                </div>
              </div>

              {/* Resumen */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Invertido</p>
                    <p className="text-xl font-bold text-primary">
                      {formatCurrency(historial.membresias.reduce((sum, m) => sum + m.precio, 0))}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Membresías Activas</p>
                    <p className="text-xl font-bold text-foreground">
                      {historial.membresias.filter(m => m.estado.toLowerCase() === 'activa').length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tiempo como Usuario</p>
                    <p className="text-xl font-bold text-foreground">
                      {historial.fecha_primera_inscripcion !== "N/A"
                        ? (() => {
                            const primeraInscripcion = new Date(historial.fecha_primera_inscripcion)
                            const hoy = new Date()
                            const meses = Math.round(
                              (hoy.getTime() - primeraInscripcion.getTime()) / (1000 * 60 * 60 * 24 * 30)
                            )
                            return `${meses} meses`
                          })()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Historial de Membresías */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Historial de Membresías</h3>
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-secondary sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Tipo de Plan</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Estado</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Fecha Inicio</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Fecha Fin</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Duración</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Precio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historial.membresias.length > 0 ? (
                          historial.membresias.map((membresia, index) => (
                            <tr key={membresia.id} className="border-t border-border hover:bg-secondary/50">
                              <td className="px-4 py-3 text-sm text-foreground font-medium">
                                {membresia.tipo_plan}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEstadoBadgeColor(membresia.estado)}`}>
                                  {membresia.estado}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-foreground">
                                {formatDate(membresia.fecha_inicio)}
                              </td>
                              <td className="px-4 py-3 text-sm text-foreground">
                                {formatDate(membresia.fecha_fin)}
                              </td>
                              <td className="px-4 py-3 text-sm text-primary font-medium">
                                {membresia.duracion_dias} días
                              </td>
                              <td className="px-4 py-3 text-sm text-foreground font-medium">
                                {formatCurrency(membresia.precio)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                              No hay registros de membresías
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
              No se encontró información del usuario
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
