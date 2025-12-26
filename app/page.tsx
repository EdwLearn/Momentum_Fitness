"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { MetricCard } from "@/components/metric-card"
import { ChartCard } from "@/components/chart-card"
import { DataTable, StatusBadge } from "@/components/data-table"
import { Users, UserCheck, AlertTriangle, DollarSign } from "lucide-react"
import { dashboardMetrics, weeklyAttendance, planDistribution, upcomingRenewals } from "@/lib/mock-data"
import { useDashboard } from "@/lib/hooks/useDashboard"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
} from "recharts"

export default function DashboardPage() {
  const { clientesActivosStats, isLoadingClientesActivos } = useDashboard()

  const renewalColumns = [
    { key: "cliente", header: "Cliente" },
    { key: "plan", header: "Tipo de Plan" },
    { key: "fechaFin", header: "Fecha Fin" },
    {
      key: "estado",
      header: "Estado",
      render: (item: (typeof upcomingRenewals)[0]) => <StatusBadge status={item.estado} />,
    },
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <ProtectedRoute>
      <DashboardLayout title="Bienvenido, Admin" subtitle="Gestiona Momentum Fitness con métricas en tiempo real.">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricCard
          title="Clientes Activos"
          value={isLoadingClientesActivos ? "..." : clientesActivosStats?.total || 0}
          change={isLoadingClientesActivos ? undefined : clientesActivosStats?.cambio_porcentual}
          changeLabel="vs mes anterior"
          icon={Users}
        />
        <MetricCard
          title="Asistencias Hoy"
          value={dashboardMetrics.asistenciasHoy}
          change={8}
          changeLabel="vs ayer"
          icon={UserCheck}
        />
        <MetricCard
          title="Planes por Vencer (7 días)"
          value={dashboardMetrics.planesPorVencer}
          variant="warning"
          icon={AlertTriangle}
        />
        <MetricCard
          title="Ingresos del Mes"
          value={formatCurrency(dashboardMetrics.ingresosMes)}
          change={15}
          changeLabel="vs mes anterior"
          icon={DollarSign}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Asistencia Semanal" subtitle="Número de asistencias por día">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyAttendance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2B35" vertical={false} />
                <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0A0B12",
                    border: "1px solid #2A2B35",
                    borderRadius: "8px",
                    color: "#E5E5E5",
                  }}
                />
                <Bar dataKey="asistencias" fill="#A4FF1A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Tipos de Planes Activos" subtitle="Distribución por tipo de suscripción">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={planDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0A0B12",
                    border: "1px solid #2A2B35",
                    borderRadius: "8px",
                    color: "#E5E5E5",
                  }}
                />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  wrapperStyle={{ color: "#9CA3AF", fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Upcoming Renewals Table */}
      <ChartCard title="Próximas Renovaciones" subtitle="Clientes con planes por vencer">
        <DataTable
          columns={renewalColumns}
          data={upcomingRenewals}
          onRowAction={(item) => console.log("Ver cliente:", item)}
          actionLabel="Ver"
        />
      </ChartCard>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
