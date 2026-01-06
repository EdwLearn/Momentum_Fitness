"use client"

import { useState, useMemo } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ChartCard } from "@/components/chart-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import {
  useAsistenciasPorDia,
  useAsistenciasPorPlan,
  useNuevasVsRenovaciones,
  usePlanesTop,
  useIngresosPorMes,
  useIngresosPorCupon,
  useReferidosImpacto,
  useResumenIngresos,
  useComparacionEmpleados,
} from "@/lib/hooks/useReportes"

export default function ReportesPage() {
  const [dateRange, setDateRange] = useState("30-dias")
  const [customDateFrom, setCustomDateFrom] = useState<string>("")
  const [customDateTo, setCustomDateTo] = useState<string>("")

  // Calcular días basado en el filtro seleccionado
  const diasAsistencias = useMemo(() => {
    if (dateRange === "7-dias") return 7
    if (dateRange === "30-dias") return 30
    if (dateRange === "este-mes") {
      const now = new Date()
      return now.getDate() // Día actual del mes
    }
    // Personalizado: calcular días entre fechas
    if (customDateFrom && customDateTo) {
      const dateFrom = new Date(customDateFrom)
      const dateTo = new Date(customDateTo)
      const diff = Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24))
      return Math.max(1, diff)
    }
    return 30
  }, [dateRange, customDateFrom, customDateTo])

  // Calcular meses para reportes de suscripciones e ingresos
  // Siempre mostrar 6 meses de contexto histórico para gráficas mensuales
  const mesesReportes = useMemo(() => {
    // Para todos los filtros predefinidos, mostrar 6 meses
    if (dateRange !== "personalizado") return 6

    // Personalizado: calcular meses basado en el rango seleccionado
    if (customDateFrom && customDateTo) {
      const dateFrom = new Date(customDateFrom)
      const dateTo = new Date(customDateTo)
      const diffTime = Math.abs(dateTo.getTime() - dateFrom.getTime())
      const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30))
      return Math.max(1, Math.min(12, diffMonths))
    }
    return 6
  }, [dateRange, customDateFrom, customDateTo])

  // Obtener datos del backend con parámetros dinámicos
  const { data: asistenciasPorDia, isLoading: isLoadingAsistenciasDia } = useAsistenciasPorDia(diasAsistencias)
  const { data: asistenciasPorPlan, isLoading: isLoadingAsistenciasPlan } = useAsistenciasPorPlan(diasAsistencias)
  const { data: nuevasVsRenovaciones, isLoading: isLoadingNuevasRenovaciones } = useNuevasVsRenovaciones(mesesReportes)
  const { data: planesTop, isLoading: isLoadingPlanesTop } = usePlanesTop(diasAsistencias)
  const { data: ingresosPorMes, isLoading: isLoadingIngresosMes } = useIngresosPorMes(mesesReportes)
  const { data: ingresosPorCupon, isLoading: isLoadingIngresosCupon } = useIngresosPorCupon()
  const { data: referidosImpacto, isLoading: isLoadingReferidos } = useReferidosImpacto()
  const { data: resumenIngresos, isLoading: isLoadingResumen } = useResumenIngresos()
  const { data: comparacionEmpleados, isLoading: isLoadingComparacionEmpleados } = useComparacionEmpleados(6)

  // Colores verde momentum para gráficas principales
  const GREEN_COLOR = "#A4FF1A"
  // Color azul complementario
  const BLUE_COLOR = "#22D3EE"
  // Colores verde y azul para gráficas multicolor
  const GREEN_BLUE_COLORS = ["#A4FF1A", "#22D3EE", "#7ACC15", "#0EA5E9", "#5A9E0E"]

  // Loading state
  const isLoading = isLoadingAsistenciasDia || isLoadingAsistenciasPlan || isLoadingNuevasRenovaciones ||
    isLoadingPlanesTop || isLoadingIngresosMes || isLoadingIngresosCupon || isLoadingReferidos || isLoadingResumen ||
    isLoadingComparacionEmpleados

  // Mostrar loading state
  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout title="Reportes" subtitle="Visualiza el rendimiento del gimnasio por periodos">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Cargando reportes...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout title="Reportes" subtitle="Visualiza el rendimiento del gimnasio por periodos">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-card border border-border rounded-lg">
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm text-muted-foreground mb-2 block">Período de tiempo</label>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7-dias">Últimos 7 días</SelectItem>
              <SelectItem value="30-dias">Últimos 30 días</SelectItem>
              <SelectItem value="este-mes">Este mes</SelectItem>
              <SelectItem value="personalizado">Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {dateRange === "personalizado" && (
          <>
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm text-muted-foreground mb-2 block">Fecha desde</label>
              <DatePicker
                value={customDateFrom}
                onChange={setCustomDateFrom}
                placeholder="Seleccionar fecha inicial"
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-sm text-muted-foreground mb-2 block">Fecha hasta</label>
              <DatePicker
                value={customDateTo}
                onChange={setCustomDateTo}
                placeholder="Seleccionar fecha final"
                minDate={customDateFrom}
              />
            </div>
          </>
        )}
      </div>

      {/* Section A - Asistencia */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-foreground mb-4">Asistencia</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Asistencias por día" subtitle="Total de check-ins diarios">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={asistenciasPorDia || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="fecha"
                    stroke="#9CA3AF"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval="preserveStartEnd"
                    tickCount={7}
                  />
                  <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{
                      backgroundColor: "#0A0B12",
                      border: "1px solid #2A2B35",
                      borderRadius: "8px",
                      color: "#E5E5E5",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="asistencias"
                    stroke={GREEN_COLOR}
                    strokeWidth={3}
                    dot={{ fill: GREEN_COLOR, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Asistencia por tipo de plan" subtitle="Check-ins segmentados por plan">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={asistenciasPorPlan || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="plan" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
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
                    dataKey="asistencias"
                    fill={GREEN_COLOR}
                    radius={[4, 4, 0, 0]}
                    onMouseEnter={(data, index, e) => {
                      const target = e.target as SVGElement;
                      target.style.transform = 'scaleY(1.05)';
                      target.style.transformOrigin = 'bottom';
                      target.style.transition = 'transform 0.2s ease';
                    }}
                    onMouseLeave={(data, index, e) => {
                      const target = e.target as SVGElement;
                      target.style.transform = 'scaleY(1)';
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Section B - Suscripciones */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-foreground mb-4">Suscripciones</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Nuevas suscripciones vs renovaciones" subtitle="Comparativa mensual">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={nuevasVsRenovaciones || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
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
                    dataKey="nuevas"
                    fill={GREEN_COLOR}
                    radius={[4, 4, 0, 0]}
                    onMouseEnter={(data, index, e) => {
                      const target = e.target as SVGElement;
                      target.style.transform = 'scaleY(1.05)';
                      target.style.transformOrigin = 'bottom';
                      target.style.transition = 'transform 0.2s ease';
                    }}
                    onMouseLeave={(data, index, e) => {
                      const target = e.target as SVGElement;
                      target.style.transform = 'scaleY(1)';
                    }}
                  />
                  <Bar
                    dataKey="renovaciones"
                    fill={BLUE_COLOR}
                    radius={[4, 4, 0, 0]}
                    onMouseEnter={(data, index, e) => {
                      const target = e.target as SVGElement;
                      target.style.transform = 'scaleY(1.05)';
                      target.style.transformOrigin = 'bottom';
                      target.style.transition = 'transform 0.2s ease';
                    }}
                    onMouseLeave={(data, index, e) => {
                      const target = e.target as SVGElement;
                      target.style.transform = 'scaleY(1)';
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Planes más vendidos" subtitle="Ranking de popularidad">
            <div className="h-64">
              {isLoadingPlanesTop ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Cargando...
                </div>
              ) : planesTop && planesTop.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={planesTop} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis dataKey="plan" type="category" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
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
                      dataKey="ventas"
                      fill={GREEN_COLOR}
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
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No hay datos de planes vendidos en este período
                </div>
              )}
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Section C - Empleados */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-foreground mb-4">Empleados</h2>
        <ChartCard title="Comparación de horas trabajadas" subtitle="Horas mensuales por empleado (últimos 6 meses)">
          <div className="h-80">
            {isLoadingComparacionEmpleados ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Cargando...
              </div>
            ) : comparacionEmpleados && comparacionEmpleados.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={comparacionEmpleados.map(mes => {
                  // Transformar datos para recharts: cada empleado es una línea
                  const mesData: any = { mes: mes.mes }
                  mes.empleados.forEach(emp => {
                    mesData[emp.nombre] = emp.horas
                  })
                  return mesData
                })}>
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
                    formatter={(value) => <span style={{ color: '#E5E5E5' }}>{value}</span>}
                  />
                  {/* Generar una línea por cada empleado */}
                  {comparacionEmpleados.length > 0 && comparacionEmpleados[0].empleados.map((emp, index) => {
                    const colores = ["#A4FF1A", "#22D3EE", "#F97316", "#EC4899", "#8B5CF6", "#6366F1"]
                    return (
                      <Line
                        key={emp.id}
                        type="monotone"
                        dataKey={emp.nombre}
                        stroke={colores[index % colores.length]}
                        strokeWidth={2}
                        dot={{ fill: colores[index % colores.length], r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    )
                  })}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No hay datos de empleados disponibles
              </div>
            )}
          </div>
        </ChartCard>
      </div>

      {/* Section D - Ingresos */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-foreground mb-4">Ingresos</h2>
        <div className="grid grid-cols-1 gap-6">
          <ChartCard title="Ingresos por mes" subtitle="Evolución de ingresos mensuales">
            <div className="h-64 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ingresosPorMes || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
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
                    dataKey="ingresos"
                    fill={GREEN_COLOR}
                    radius={[4, 4, 0, 0]}
                    onMouseEnter={(data, index, e) => {
                      const target = e.target as SVGElement;
                      target.style.transform = 'scaleY(1.05)';
                      target.style.transformOrigin = 'bottom';
                      target.style.transition = 'transform 0.2s ease';
                    }}
                    onMouseLeave={(data, index, e) => {
                      const target = e.target as SVGElement;
                      target.style.transform = 'scaleY(1)';
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Summary Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Ingresos Totales</p>
                <p className="text-2xl font-bold text-primary">${resumenIngresos?.ingresos_totales?.toFixed(1) || 0}M</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Ticket Promedio</p>
                <p className="text-2xl font-bold text-foreground">${resumenIngresos?.ticket_promedio?.toFixed(1) || 0}K</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Ingresos por Usuario</p>
                <p className="text-2xl font-bold text-foreground">${resumenIngresos?.ingresos_por_cliente?.toFixed(1) || 0}K</p>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Section E - Cupones & Referidos */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-foreground mb-4">Cupones & Referidos</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Ingresos generados por cupones" subtitle="Distribución por nicho">
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ingresosPorCupon || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ nicho, percent }) => `${nicho} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="ingresos"
                  >
                    {(ingresosPorCupon || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={GREEN_BLUE_COLORS[index % GREEN_BLUE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0A0B12",
                      border: "1px solid #2A2B35",
                      borderRadius: "8px",
                      color: "#E5E5E5",
                    }}
                    labelStyle={{ color: "#A4FF1A", fontWeight: "bold" }}
                    itemStyle={{ color: "#E5E5E5" }}
                    formatter={(value: any) => [`$${value}M`, 'Ingresos']}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value, entry: any) => {
                      const nicho = entry.payload?.nicho || value
                      const ingresos = entry.payload?.ingresos || 0
                      return `${nicho}: $${ingresos}M`
                    }}
                    wrapperStyle={{
                      paddingTop: '20px',
                      color: '#E5E5E5',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                    iconType="circle"
                    iconSize={10}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Impacto de referidos" subtitle="Métricas de programa de referidos">
            <div className="space-y-4">
              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Usuarios por Referidos</p>
                <p className="text-3xl font-bold text-primary">{referidosImpacto?.clientes_referidos || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {referidosImpacto?.porcentaje?.toFixed(1) || 0}% del total de usuarios
                </p>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Meses Gratis Entregados</p>
                <p className="text-3xl font-bold text-foreground">{referidosImpacto?.meses_gratis || 0}</p>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Ratio de Conversión</p>
                <p className="text-3xl font-bold text-foreground">{referidosImpacto?.ratio_conversion?.toFixed(1) || 0}%</p>
                <p className="text-xs text-muted-foreground mt-1">De referidos que completan registro</p>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
