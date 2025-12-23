"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { MetricCard } from "@/components/metric-card"
import { ChartCard } from "@/components/chart-card"
import { DataTable, StatusBadge } from "@/components/data-table"
import { UsersRound, UserCheck, Clock, UserX, Plus, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUsuarios } from "@/lib/hooks/useUsuarios"
import { useAsistenciasByFecha } from "@/lib/hooks/useAsistencia"
import { Usuario } from "@/types"
import { EmployeeDetailModal } from "@/components/employee-detail-modal"
import { NewClientDrawer } from "@/components/new-client-drawer"
import { SuccessToast } from "@/components/success-toast"
import { TipoUsuario } from "@/types"

type Employee = {
  id: number
  nombre: string
  rol: string
  estado: string
  ultimaEntrada: string
  horasEstaSemana: number
}

export default function EmpleadosPage() {
  const { data: usuarios } = useUsuarios()
  const today = new Date().toISOString().split('T')[0]
  const { data: asistenciasHoy } = useAsistenciasByFecha(today)

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [statusFilter, setStatusFilter] = useState("Todos")
  const [roleFilter, setRoleFilter] = useState("Todos")
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [tipoEmpleadoSeleccionado, setTipoEmpleadoSeleccionado] = useState<TipoUsuario | null>(null)

  // Filtrar solo empleados (entrenadores y admins)
  const empleados = usuarios?.filter(u =>
    u.tipo === TipoUsuario.ENTRENADOR || u.tipo === TipoUsuario.ADMIN
  ) || []

  // Mapear rol readable
  const rolMap: Record<string, string> = {
    [TipoUsuario.ENTRENADOR]: "Entrenador",
    [TipoUsuario.ADMIN]: "Administrador",
  }

  // Mapear usuarios a empleados con datos reales
  const employees: Employee[] = empleados.map(usuario => {
    // Determinar última entrada desde asistencias
    const ultimaAsistencia = usuario.ultima_asistencia
      ? new Date(usuario.ultima_asistencia).toISOString().replace('T', ' ').split('.')[0]
      : "Nunca"

    // Determinar estado basado en última asistencia
    let estado = "Activo"
    if (usuario.ultima_asistencia) {
      const ultimaFecha = new Date(usuario.ultima_asistencia)
      const hoy = new Date()
      const diasSinMarcar = Math.floor((hoy.getTime() - ultimaFecha.getTime()) / (1000 * 60 * 60 * 24))
      if (diasSinMarcar > 3) {
        estado = "Inactivo"
      }
    } else {
      estado = "Inactivo"
    }

    return {
      id: usuario.id,
      nombre: `${usuario.nombre} ${usuario.apellido}`,
      rol: rolMap[usuario.tipo || TipoUsuario.ENTRENADOR] || "Entrenador",
      estado: estado,
      ultimaEntrada: ultimaAsistencia,
      horasEstaSemana: 0, // TODO: Calcular del backend cuando tengamos hora_salida
    }
  })

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
  const empleadosActivosHoy = asistenciasHoy?.filter(asistencia => {
    const usuario = usuarios?.find(u => u.id === asistencia.usuario_id)
    return usuario && (usuario.tipo === TipoUsuario.ENTRENADOR || usuario.tipo === TipoUsuario.ADMIN)
  }).length || 0

  const horasPromedio = employees.length > 0
    ? (employees.reduce((sum, e) => sum + e.horasEstaSemana, 0) / employees.length).toFixed(1)
    : "0.0"

  const empleadosAusencias = employees.filter((e) => e.estado === "Inactivo").length

  const handleEmpleadoCreated = () => {
    setShowToast(true)
  }

  const handleNuevoEmpleado = (tipo: TipoUsuario) => {
    setTipoEmpleadoSeleccionado(tipo)
    setIsDrawerOpen(true)
  }

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
        {/* Top Bar with Filters and Add Button */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
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

          {/* Dropdown Menu for New Employee */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                Nuevo empleado
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => handleNuevoEmpleado(TipoUsuario.ENTRENADOR)}>
                Asesor / Entrenador
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleNuevoEmpleado(TipoUsuario.ADMIN)}>
                Administrador
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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

      {/* New Employee Drawer */}
      <NewClientDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false)
          setTipoEmpleadoSeleccionado(null)
        }}
        onSuccess={handleEmpleadoCreated}
        tipoUsuarioFijo={tipoEmpleadoSeleccionado}
      />

      {/* Success Toast */}
      <SuccessToast
        isVisible={showToast}
        message="Empleado registrado correctamente."
        onClose={() => setShowToast(false)}
      />
    </DashboardLayout>
  )
}
