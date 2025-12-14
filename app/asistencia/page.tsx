"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { MetricCard } from "@/components/metric-card"
import { ChartCard } from "@/components/chart-card"
import { DataTable } from "@/components/data-table"
import { UserCheck, TrendingUp, UserX, Calendar, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { hourlyAttendance, recentAttendance } from "@/lib/mock-data"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"

export default function AsistenciaPage() {
  const [tipoUsuario, setTipoUsuario] = useState("todos")
  const [soloInactivos, setSoloInactivos] = useState(false)

  const attendanceColumns = [
    { key: "fecha", header: "Fecha & Hora" },
    { key: "cliente", header: "Cliente" },
    {
      key: "evento",
      header: "Tipo de Evento",
      render: (item: (typeof recentAttendance)[0]) => (
        <span className={item.evento === "Entrada" ? "text-primary" : "text-muted-foreground"}>{item.evento}</span>
      ),
    },
    { key: "tipoUsuario", header: "Tipo de Usuario" },
    { key: "plan", header: "Plan Vigente" },
  ]

  const filteredAttendance = recentAttendance.filter((item) => {
    if (tipoUsuario !== "todos" && item.tipoUsuario.toLowerCase() !== tipoUsuario) {
      return false
    }
    return true
  })

  return (
    <DashboardLayout title="Panel de Asistencia" subtitle="Control y monitoreo de asistencias en tiempo real">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <MetricCard title="Asistencias Hoy" value={124} change={8} changeLabel="vs ayer" icon={UserCheck} />
        <MetricCard title="Promedio Diario (30 días)" value={142} icon={TrendingUp} />
        <MetricCard title="Sin asistir (+4 días)" value={18} variant="warning" icon={UserX} />
      </div>

      {/* Hourly Attendance Chart */}
      <ChartCard
        title="Asistencia por Hora del Día"
        subtitle="Distribución de asistencias a lo largo del día"
        className="mb-6"
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyAttendance}>
              <defs>
                <linearGradient id="colorAsistencias" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A4FF1A" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#A4FF1A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2B35" vertical={false} />
              <XAxis dataKey="hora" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0A0B12",
                  border: "1px solid #2A2B35",
                  borderRadius: "8px",
                  color: "#E5E5E5",
                }}
              />
              <Area
                type="monotone"
                dataKey="asistencias"
                stroke="#A4FF1A"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorAsistencias)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Filters and Table */}
      <ChartCard title="Registro de Accesos" subtitle="Historial detallado de entradas y salidas">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Input type="date" className="w-40 bg-secondary border-border" />
            <span className="text-muted-foreground">a</span>
            <Input type="date" className="w-40 bg-secondary border-border" />
          </div>

          <Select value={tipoUsuario} onValueChange={setTipoUsuario}>
            <SelectTrigger className="w-44 bg-secondary border-border">
              <SelectValue placeholder="Tipo de usuario" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="cliente">Clientes</SelectItem>
              <SelectItem value="empleado">Empleados</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Checkbox
              id="inactivos"
              checked={soloInactivos}
              onCheckedChange={(checked) => setSoloInactivos(checked as boolean)}
            />
            <Label htmlFor="inactivos" className="text-sm text-muted-foreground cursor-pointer">
              Solo inactivos (+4 días sin asistir)
            </Label>
          </div>

          <Button variant="outline" className="ml-auto gap-2 border-border hover:bg-secondary bg-transparent">
            <Filter className="h-4 w-4" />
            Aplicar filtros
          </Button>
        </div>

        <DataTable
          columns={attendanceColumns}
          data={filteredAttendance}
          onRowAction={(item) => console.log("Ver detalle:", item)}
          actionLabel="Ver"
        />
      </ChartCard>
    </DashboardLayout>
  )
}
