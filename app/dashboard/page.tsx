"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { MetricCard } from "@/components/metric-card"
import { ChartCard } from "@/components/chart-card"
import { DataTable, StatusBadge } from "@/components/data-table"
import { HistorialUsuarioModal } from "@/components/historial-usuario-modal"
import { HistorialEmpleadoModal } from "@/components/historial-empleado-modal"
import { Users, UserCheck, AlertTriangle, DollarSign } from "lucide-react"
import { useDashboard } from "@/lib/hooks/useDashboard"
import { useState } from "react"
import type { ProximaRenovacionItem, EmpleadoDashboardItem } from "@/lib/services/dashboard"
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
  Sector,
} from "recharts"

export default function DashboardPage() {
  const {
    clientesActivosStats,
    isLoadingClientesActivos,
    asistenciasHoyStats,
    isLoadingAsistenciasHoy,
    planesPorVencerStats,
    isLoadingPlanesPorVencer,
    ingresosMesStats,
    isLoadingIngresosMes,
    asistenciaSemanal,
    isLoadingAsistenciaSemanal,
    distribucionPlanes,
    isLoadingDistribucionPlanes,
    proximasRenovaciones,
    isLoadingProximasRenovaciones,
    empleados,
    isLoadingEmpleados
  } = useDashboard()

  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [selectedPieIndex, setSelectedPieIndex] = useState<number | null>(null)
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null)
  const [selectedCliente, setSelectedCliente] = useState<{ id: number; nombre: string } | null>(null)
  const [selectedEmpleado, setSelectedEmpleado] = useState<{ id: number; nombre: string } | null>(null)

  const onPieEnter = (_: any, index: number) => {
    if (selectedPieIndex === null) {
      setActiveIndex(index)
    }
  }

  const onPieLeave = () => {
    if (selectedPieIndex === null) {
      setActiveIndex(null)
    }
  }

  const onPieClick = (_: any, index: number) => {
    if (selectedPieIndex === index) {
      setSelectedPieIndex(null)
      setActiveIndex(null)
    } else {
      setSelectedPieIndex(index)
      setActiveIndex(index)
    }
  }

  const onBarClick = (_: any, index: number) => {
    setSelectedBarIndex(selectedBarIndex === index ? null : index)
  }

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props

    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#E5E5E5" fontSize={16} fontWeight="bold">
          {payload.name}
        </text>
        <text x={cx} y={cy} dy={28} textAnchor="middle" fill="#9CA3AF" fontSize={12}>
          {`${value} (${(percent * 100).toFixed(1)}%)`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 12}
          outerRadius={outerRadius + 14}
          fill={fill}
        />
      </g>
    )
  }

  const renewalColumns = [
    { key: "usuario", header: "Usuario" },
    { key: "plan", header: "Tipo de Plan" },
    { key: "fecha_fin", header: "Fecha Fin" },
    {
      key: "estado",
      header: "Estado",
      render: (item: ProximaRenovacionItem) => <StatusBadge status={item.estado} />,
    },
  ]

  const handleVerCliente = (item: ProximaRenovacionItem) => {
    setSelectedCliente({ id: item.id, nombre: item.usuario })
  }

  const handleVerEmpleado = (item: EmpleadoDashboardItem) => {
    setSelectedEmpleado({ id: item.id, nombre: item.nombre })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value)
  }

  const empleadosColumns = [
    { key: "nombre", header: "Nombre" },
    { key: "cedula", header: "Cédula" },
    { key: "tipo_empleado", header: "Tipo" },
    { key: "dias_trabajados_mes", header: "Días (mes)" },
    {
      key: "horas_trabajadas_mes",
      header: "Horas (mes)",
      render: (item: EmpleadoDashboardItem) => `${item.horas_trabajadas_mes} hrs`,
    },
    {
      key: "ultimo_registro",
      header: "Último Registro",
      render: (item: EmpleadoDashboardItem) => item.ultimo_registro || "Sin registro",
    },
  ]

  return (
    <ProtectedRoute>
      <DashboardLayout title="Facturando como debe bro" subtitle="Gestiona Momentum Fitness con métricas en tiempo real.">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricCard
          title="Usuarios Activos"
          value={isLoadingClientesActivos ? "..." : clientesActivosStats?.total || 0}
          change={isLoadingClientesActivos ? undefined : clientesActivosStats?.cambio_porcentual}
          changeLabel="vs mes anterior"
          icon={Users}
        />
        <MetricCard
          title="Asistencias Hoy"
          value={isLoadingAsistenciasHoy ? "..." : asistenciasHoyStats?.total || 0}
          change={isLoadingAsistenciasHoy ? undefined : asistenciasHoyStats?.cambio_porcentual}
          changeLabel="vs ayer"
          icon={UserCheck}
        />
        <MetricCard
          title="Planes por Vencer (7 días)"
          value={isLoadingPlanesPorVencer ? "..." : planesPorVencerStats?.total || 0}
          variant="warning"
          icon={AlertTriangle}
        />
        <MetricCard
          title="Ingresos del Mes"
          value={isLoadingIngresosMes ? "..." : formatCurrency(ingresosMesStats?.total || 0)}
          change={isLoadingIngresosMes ? undefined : ingresosMesStats?.cambio_porcentual}
          changeLabel="vs mes anterior"
          icon={DollarSign}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Asistencia Semanal" subtitle="Número de asistencias por día">
          <div className="h-72">
            {isLoadingAsistenciaSemanal ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                Cargando...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={asistenciaSemanal || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2B35" vertical={false} />
                  <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{
                      backgroundColor: "#0A0B12",
                      border: "1px solid #2A2B35",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#E5E5E5" }}
                    itemStyle={{ color: "#A4FF1A" }}
                  />
                  <Bar
                    dataKey="asistencias"
                    radius={[4, 4, 0, 0]}
                    onClick={onBarClick}
                    onMouseEnter={(data, index, e) => {
                      e.target.setAttribute('opacity', '0.8')
                      e.target.setAttribute('transform', 'scale(1.05)')
                      e.target.style.transformOrigin = 'center bottom'
                      e.target.style.transition = 'all 0.2s ease'
                    }}
                    onMouseLeave={(data, index, e) => {
                      e.target.setAttribute('opacity', '1')
                      e.target.setAttribute('transform', 'scale(1)')
                    }}
                  >
                    {(asistenciaSemanal || []).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={selectedBarIndex === index ? '#7FCC00' : '#A4FF1A'}
                        style={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>

        <ChartCard title="Tipos de Planes Activos" subtitle="Distribución por tipo de suscripción">
          <div className="h-72">
            {isLoadingDistribucionPlanes ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                Cargando...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    activeIndex={activeIndex ?? undefined}
                    activeShape={renderActiveShape}
                    data={distribucionPlanes || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    onMouseEnter={onPieEnter}
                    onMouseLeave={onPieLeave}
                    onClick={onPieClick}
                    style={{ cursor: 'pointer' }}
                  >
                    {(distribucionPlanes || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    wrapperStyle={{ color: "#E5E5E5", fontSize: "12px" }}
                    formatter={(value) => <span style={{ color: '#E5E5E5' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>
      </div>

      {/* Empleados Table */}
      <ChartCard title="Empleados" subtitle="Información y estadísticas de empleados">
        {isLoadingEmpleados ? (
          <div className="flex items-center justify-center h-64 text-gray-400">
            Cargando...
          </div>
        ) : (
          <DataTable
            columns={empleadosColumns}
            data={empleados || []}
            onRowAction={handleVerEmpleado}
            actionLabel="Ver"
          />
        )}
      </ChartCard>

      {/* Upcoming Renewals Table */}
      <div className="mt-6">
        <ChartCard title="Próximas Renovaciones" subtitle="Usuarios con planes por vencer">
          {isLoadingProximasRenovaciones ? (
            <div className="flex items-center justify-center h-64 text-gray-400">
              Cargando...
            </div>
          ) : (
            <DataTable
              columns={renewalColumns}
              data={proximasRenovaciones || []}
              onRowAction={handleVerCliente}
              actionLabel="Ver"
            />
          )}
        </ChartCard>
      </div>
      </DashboardLayout>

      {/* Modal de Historial del Usuario */}
      {selectedCliente && (
        <HistorialUsuarioModal
          clienteId={selectedCliente.id}
          clienteNombre={selectedCliente.nombre}
          onClose={() => setSelectedCliente(null)}
        />
      )}

      {/* Modal de Historial del Empleado */}
      {selectedEmpleado && (
        <HistorialEmpleadoModal
          empleadoId={selectedEmpleado.id}
          empleadoNombre={selectedEmpleado.nombre}
          onClose={() => setSelectedEmpleado(null)}
        />
      )}
    </ProtectedRoute>
  )
}
