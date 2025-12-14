"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ChartCard } from "@/components/chart-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { FileDown, FileText } from "lucide-react"
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
} from "recharts"
import {
  reportAttendanceByDay,
  reportAttendanceByPlan,
  reportNewVsRenewals,
  reportTopPlans,
  reportIncomeByMonth,
  reportIncomeByCoupon,
  reportReferralsImpact,
} from "@/lib/mock-data"

export default function ReportesPage() {
  const [dateRange, setDateRange] = useState("30-dias")
  const [reportType, setReportType] = useState("Asistencia")

  const COLORS = ["#A4FF1A", "#22D3EE", "#8B5CF6", "#F97316", "#EC4899"]

  return (
    <DashboardLayout title="Reportes" subtitle="Visualiza el rendimiento del gimnasio por periodos">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-card border border-border rounded-lg">
        <div className="flex-1 min-w-[200px]">
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

        <div className="flex-1 min-w-[200px]">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Asistencia">Asistencia</SelectItem>
              <SelectItem value="Suscripciones">Suscripciones</SelectItem>
              <SelectItem value="Ingresos">Ingresos</SelectItem>
              <SelectItem value="Cupones & referidos">Cupones & referidos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Section A - Asistencia */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-foreground mb-4">Asistencia</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Asistencias por día" subtitle="Total de check-ins diarios">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reportAttendanceByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="fecha" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="asistencias"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Asistencia por tipo de plan" subtitle="Check-ins segmentados por plan">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportAttendanceByPlan}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="plan" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Bar dataKey="asistencias" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
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
                <BarChart data={reportNewVsRenewals}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Bar dataKey="nuevas" fill="#A4FF1A" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="renovaciones" fill="#22D3EE" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Planes más vendidos" subtitle="Ranking de popularidad">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportTopPlans} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="plan" type="category" stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Bar dataKey="ventas" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Section C - Ingresos */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-foreground mb-4">Ingresos</h2>
        <div className="grid grid-cols-1 gap-6">
          <ChartCard title="Ingresos por mes" subtitle="Evolución de ingresos mensuales">
            <div className="h-64 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportIncomeByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Bar dataKey="ingresos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Summary Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Ingresos Totales</p>
                <p className="text-2xl font-bold text-primary">$45.2M</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Ticket Promedio</p>
                <p className="text-2xl font-bold text-foreground">$53.4K</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Ingresos por Cliente</p>
                <p className="text-2xl font-bold text-foreground">$48.2K</p>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Section D - Cupones & Referidos */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-foreground mb-4">Cupones & Referidos</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Ingresos generados por cupones" subtitle="Distribución por nicho">
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportIncomeByCoupon}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="ingresos"
                  >
                    {reportIncomeByCoupon.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Impacto de referidos" subtitle="Métricas de programa de referidos">
            <div className="space-y-4">
              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Clientes por Referidos</p>
                <p className="text-3xl font-bold text-primary">{reportReferralsImpact.clientesReferidos}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {reportReferralsImpact.porcentaje}% del total de clientes
                </p>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Meses Gratis Entregados</p>
                <p className="text-3xl font-bold text-foreground">{reportReferralsImpact.mesesGratis}</p>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Ratio de Conversión</p>
                <p className="text-3xl font-bold text-foreground">{reportReferralsImpact.ratioConversion}%</p>
                <p className="text-xs text-muted-foreground mt-1">De referidos que completan registro</p>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Export Section */}
      <ChartCard title="Exportar datos" subtitle="Descarga reportes en diferentes formatos">
        <div className="flex flex-wrap gap-4">
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <FileText className="h-4 w-4" />
            Exportar CSV
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent">
            <FileDown className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Selecciona un rango de fechas y tipo de reporte para exportar.
        </p>
      </ChartCard>
    </DashboardLayout>
  )
}
