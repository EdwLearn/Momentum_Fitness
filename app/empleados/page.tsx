"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { MetricCard } from "@/components/metric-card"
import { ChartCard } from "@/components/chart-card"
import { DataTable, StatusBadge } from "@/components/data-table"
import { UsersRound, UserCheck, Clock, UserX } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { employees } from "@/lib/mock-data"
import { EmployeeDetailModal } from "@/components/employee-detail-modal"

type Employee = (typeof employees)[0]

export default function EmpleadosPage() {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [statusFilter, setStatusFilter] = useState("Todos")
  const [roleFilter, setRoleFilter] = useState("Todos")

  const employeeColumns = [
    { key: "nombre", header: "Nombre" },
    { key: "rol", header: "Rol" },
    {
      key: "estado",
      header: "Estado",
      render: (item: Employee) => <StatusBadge status={item.estado === "Activo" ? "Activo" : "Vencido"} />,
    },
    { key: "ultimaEntrada", header: "Última Entrada" },
    { key: "horasEstaSemana", header: "Horas Esta Semana" },
  ]

  const filteredEmployees = employees.filter((emp) => {
    const matchesStatus = statusFilter === "Todos" || emp.estado === statusFilter
    const matchesRole = roleFilter === "Todos" || emp.rol === roleFilter
    return matchesStatus && matchesRole
  })

  const totalEmpleados = employees.length
  const empleadosActivosHoy = employees.filter((e) => {
    const hoy = new Date().toISOString().split("T")[0]
    return e.ultimaEntrada.startsWith(hoy)
  }).length
  const horasPromedio = (employees.reduce((sum, e) => sum + e.horasEstaSemana, 0) / employees.length).toFixed(1)
  const empleadosAusencias = employees.filter((e) => {
    const ultimaEntrada = new Date(e.ultimaEntrada)
    const hoy = new Date()
    const diasSinMarcar = Math.floor((hoy.getTime() - ultimaEntrada.getTime()) / (1000 * 60 * 60 * 24))
    return diasSinMarcar > 3
  }).length

  return (
    <DashboardLayout
      title="Gestión de Empleados"
      subtitle="Controla horarios, asistencia y desempeño del equipo Momentum"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <MetricCard title="Total Empleados" value={totalEmpleados} icon={UsersRound} />
        <MetricCard title="Activos Hoy" value={empleadosActivosHoy} icon={UserCheck} />
        <MetricCard title="Horas Promedio (7 días)" value={horasPromedio} icon={Clock} />
        <MetricCard title="Con Ausencias (+3 días)" value={empleadosAusencias} variant="warning" icon={UserX} />
      </div>

      {/* Employees Table */}
      <ChartCard title="Lista de Empleados" subtitle={`${filteredEmployees.length} empleados encontrados`}>
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos los estados</SelectItem>
                <SelectItem value="Activo">Activos</SelectItem>
                <SelectItem value="Inactivo">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos los roles</SelectItem>
                <SelectItem value="Entrenador">Entrenadores</SelectItem>
                <SelectItem value="Recepción">Recepción</SelectItem>
                <SelectItem value="Admin">Administradores</SelectItem>
                <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DataTable
          columns={employeeColumns}
          data={filteredEmployees}
          onRowAction={(item) => setSelectedEmployee(item as Employee)}
          actionLabel="Ver detalle"
        />
      </ChartCard>

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <EmployeeDetailModal employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} />
      )}
    </DashboardLayout>
  )
}
