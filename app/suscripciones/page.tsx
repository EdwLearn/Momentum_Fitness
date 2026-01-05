"use client"

import { useMemo, useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ChartCard } from "@/components/chart-card"
import { FilterableDataTable } from "@/components/filterable-data-table"
import { StatusBadge } from "@/components/data-table"
import { HistorialClienteModal } from "@/components/historial-cliente-modal"
import { CreditCard, Calendar, Repeat, Clock, Trophy, Gift } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"
import { useMembresias, useSuscripcionesStats } from "@/lib/hooks/useMembresias"
import { useUsuarios } from "@/lib/hooks/useUsuarios"
import { Membresia, Usuario, TipoPlan, TipoPago } from "@/types"

export default function SuscripcionesPage() {
  const { data: membresias, isLoading: isLoadingMembresias } = useMembresias()
  const { data: usuarios, isLoading: isLoadingUsuarios } = useUsuarios()
  const { data: stats, isLoading: isLoadingStats } = useSuscripcionesStats()
  const [selectedCliente, setSelectedCliente] = useState<{ id: number; nombre: string } | null>(null)

  // Crear lookup map de usuarios
  const usuariosMap = useMemo(() => {
    if (!usuarios) return new Map()
    return new Map(usuarios.map(u => [u.id, u]))
  }, [usuarios])

  // Mapear nombres de planes
  const planNameMap: Record<string, string> = {
    "pase_diario": "Pase Diario",
    "pase_flex": "Pase Flex",
    "mensual": "Mensual",
    "plan_3_meses": "Plan 3 Meses",
    "plan_6_meses": "Plan 6 Meses",
    "elite_anual": "Elite Anual",
  }

  // Mapear nombres de métodos de pago
  const pagoNameMap: Record<string, string> = {
    "efectivo": "Efectivo",
    "tarjeta": "Tarjeta",
    "transferencia": "Transferencia",
    "nequi": "Nequi",
    "daviplata": "Daviplata",
    "otro": "Otro",
  }

  // Calcular conteos por tipo de plan usando datos del backend
  const planCounts = useMemo(() => {
    if (!stats) return []

    return [
      { name: "Pase Diario", count: stats.pase_diario, icon: Clock, color: "text-chart-4", key: "pase_diario" },
      { name: "Pase Flex", count: stats.pase_flex, icon: CreditCard, color: "text-chart-5", key: "pase_flex" },
      { name: "Mensual", count: stats.mensual, icon: Calendar, color: "text-primary", key: "mensual" },
      { name: "3 Meses", count: stats.plan_3_meses, icon: Repeat, color: "text-chart-2", key: "plan_3_meses" },
      { name: "6 Meses", count: stats.plan_6_meses, icon: Trophy, color: "text-chart-3", key: "plan_6_meses" },
      { name: "Elite Anual", count: stats.elite_anual, icon: Gift, color: "text-chart-1", key: "elite_anual" },
    ]
  }, [stats])

  // Datos para la gráfica de barras
  const chartData = useMemo(() => {
    return planCounts.map(plan => ({
      plan: plan.name,
      cantidad: plan.count,
    }))
  }, [planCounts])

  // Preparar datos para la tabla
  const subscriptionsData = useMemo(() => {
    if (!membresias || !usuarios) return []

    return membresias
      .filter(m => m.activo) // Solo mostrar activas
      .map(m => {
        const usuario = usuariosMap.get(m.usuario_id)
        const fechaFin = new Date(m.fecha_fin)
        const hoy = new Date()
        const diasRestantes = Math.ceil((fechaFin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))

        // Determinar estado visual
        let estadoVisual = "Activa"
        if (m.estado === "vencida") {
          estadoVisual = "Vencido"
        } else if (m.estado === "suspendida") {
          estadoVisual = "Suspendida"
        } else if (m.estado === "cancelada") {
          estadoVisual = "Cancelada"
        } else if (diasRestantes <= 7 && diasRestantes > 0) {
          estadoVisual = "Por vencer"
        }

        // Determinar origen (referido o normal)
        const origen = usuario?.referido_por_cedula ? "Referido" : "Directo"

        return {
          id: m.id,
          usuario_id: m.usuario_id,
          cliente: usuario ? `${usuario.nombre} ${usuario.apellido}` : "Desconocido",
          plan: planNameMap[m.tipo_plan] || m.tipo_plan,
          fechaInicio: m.fecha_inicio.split('T')[0],
          fechaFin: m.fecha_fin.split('T')[0],
          estado: estadoVisual,
          metodoPago: m.tipo_pago ? (pagoNameMap[m.tipo_pago] || m.tipo_pago) : "N/A",
          origen: origen,
          precio: m.precio,
          diasRestantes: diasRestantes,
        }
      })
      .sort((a, b) => {
        // Ordenar por estado (activas primero) y luego por días restantes
        if (a.estado === "Activa" && b.estado !== "Activa") return -1
        if (a.estado !== "Activa" && b.estado === "Activa") return 1
        return a.diasRestantes - b.diasRestantes
      })
  }, [membresias, usuarios, usuariosMap])

  // Obtener totales del backend
  const totalActivas = stats?.total_activas || 0
  const totalReferidos = stats?.por_referidos || 0
  const tiposPlanesCount = stats?.tipos_planes || 6

  // Handler para ver historial del cliente
  const handleVerCliente = (item: any) => {
    setSelectedCliente({ id: item.usuario_id, nombre: item.cliente })
  }

  const subscriptionColumns = [
    {
      key: "cliente",
      header: "Cliente",
      sortable: true,
      filter: {
        type: "text" as const,
        placeholder: "Buscar cliente..."
      }
    },
    {
      key: "plan",
      header: "Plan",
      sortable: true,
      filter: {
        type: "select" as const,
        options: [
          { label: "Pase Diario", value: "Pase Diario" },
          { label: "Pase Flex", value: "Pase Flex" },
          { label: "Mensual", value: "Mensual" },
          { label: "3 Meses", value: "Plan 3 Meses" },
          { label: "6 Meses", value: "Plan 6 Meses" },
          { label: "Elite Anual", value: "Elite Anual" },
        ],
        placeholder: "Filtrar por plan..."
      }
    },
    {
      key: "fechaInicio",
      header: "Fecha Inicio",
      sortable: true,
      filter: {
        type: "date" as const
      }
    },
    {
      key: "fechaFin",
      header: "Fecha Fin",
      sortable: true,
      filter: {
        type: "date" as const
      }
    },
    {
      key: "estado",
      header: "Estado",
      sortable: true,
      filter: {
        type: "select" as const,
        options: [
          { label: "Activa", value: "Activa" },
          { label: "Por vencer", value: "Por vencer" },
          { label: "Vencido", value: "Vencido" },
          { label: "Suspendida", value: "Suspendida" },
          { label: "Cancelada", value: "Cancelada" },
        ],
        placeholder: "Filtrar por estado..."
      },
      render: (item: any) => <StatusBadge status={item.estado} />,
    },
    {
      key: "metodoPago",
      header: "Método de Pago",
      sortable: true,
      filter: {
        type: "select" as const,
        options: [
          { label: "Efectivo", value: "Efectivo" },
          { label: "Tarjeta", value: "Tarjeta" },
          { label: "Transferencia", value: "Transferencia" },
          { label: "Nequi", value: "Nequi" },
          { label: "Daviplata", value: "Daviplata" },
          { label: "Otro", value: "Otro" },
          { label: "N/A", value: "N/A" },
        ],
        placeholder: "Filtrar por método..."
      }
    },
    {
      key: "origen",
      header: "Origen",
      sortable: true,
      filter: {
        type: "select" as const,
        options: [
          { label: "Referido", value: "Referido" },
          { label: "Directo", value: "Directo" },
        ],
        placeholder: "Filtrar por origen..."
      },
      render: (item: any) => (
        <Badge
          variant="outline"
          className={
            item.origen === "Referido"
              ? "bg-chart-2/20 text-chart-2 border-chart-2/30"
              : "bg-secondary text-secondary-foreground border-border"
          }
        >
          {item.origen}
        </Badge>
      ),
    },
  ]

  // Loading state
  if (isLoadingMembresias || isLoadingUsuarios || isLoadingStats) {
    return (
      <ProtectedRoute>
        <DashboardLayout title="Suscripciones y Planes" subtitle="Gestiona las suscripciones activas y tipos de planes">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Cargando suscripciones...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout title="Suscripciones y Planes" subtitle="Gestiona las suscripciones activas y tipos de planes">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Activas</p>
              <p className="text-3xl font-bold text-primary mt-1">{totalActivas}</p>
            </div>
            <Calendar className="h-10 w-10 text-primary/30" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Por Referidos</p>
              <p className="text-3xl font-bold text-chart-2 mt-1">{totalReferidos}</p>
            </div>
            <Gift className="h-10 w-10 text-chart-2/30" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tipos de Planes</p>
              <p className="text-3xl font-bold text-chart-3 mt-1">{tiposPlanesCount}</p>
            </div>
            <Trophy className="h-10 w-10 text-chart-3/30" />
          </div>
        </div>
      </div>

      {/* Plan Count Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {planCounts.map((plan) => (
          <div key={plan.key} className="bg-card border border-border rounded-xl p-4 glow-green-sm">
            <div className="flex items-center gap-2 mb-2">
              <plan.icon className={`h-5 w-5 ${plan.color}`} />
              <span className="text-sm text-muted-foreground">{plan.name}</span>
            </div>
            <p className="text-2xl font-bold text-primary">{plan.count}</p>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <ChartCard
        title="Suscripciones Activas por Tipo de Plan"
        subtitle="Comparativa de cantidad de suscripciones por cada tipo de plan"
        className="mb-6"
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                dataKey="plan"
                type="category"
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={100}
              />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                contentStyle={{
                  backgroundColor: "#0A0B12",
                  border: "1px solid #2A2B35",
                  borderRadius: "8px",
                  color: "#E5E5E5",
                }}
              />
              <Bar
                dataKey="cantidad"
                fill="#A4FF1A"
                radius={[0, 4, 4, 0]}
                onMouseEnter={(data, index, e) => {
                  const target = e.target as SVGElement;
                  target.style.transform = 'scaleX(1.05)';
                  target.style.transformOrigin = 'left';
                  target.style.transition = 'transform 0.2s ease';
                }}
                onMouseLeave={(data, index, e) => {
                  const target = e.target as SVGElement;
                  target.style.transform = 'scaleX(1)';
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Subscriptions Table */}
      <ChartCard
        title="Suscripciones Actuales"
        subtitle={`${subscriptionsData.length} suscripciones activas (${totalReferidos} por referidos)`}
      >
        <FilterableDataTable
          columns={subscriptionColumns}
          data={subscriptionsData}
          searchPlaceholder="Buscar suscripciones por cliente, plan, método de pago..."
          showGlobalSearch={true}
          emptyMessage="No se encontraron suscripciones que coincidan con los filtros"
          onRowAction={handleVerCliente}
          actionLabel="Ver"
        />
      </ChartCard>
      </DashboardLayout>

      {/* Modal de Historial del Cliente */}
      {selectedCliente && (
        <HistorialClienteModal
          clienteId={selectedCliente.id}
          clienteNombre={selectedCliente.nombre}
          onClose={() => setSelectedCliente(null)}
        />
      )}
    </ProtectedRoute>
  )
}
