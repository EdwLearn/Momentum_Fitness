"use client"

import { useState, useMemo } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { MetricCard } from "@/components/metric-card"
import { ChartCard } from "@/components/chart-card"
import { DataTable, StatusBadge } from "@/components/data-table"
import { UsersRound, UserCheck, UserX, Plus, Edit, LogIn, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { NewEmployeeDrawer } from "@/components/new-employee-drawer"
import { EditEmployeeDrawer } from "@/components/edit-employee-drawer"
import { EmployeeAttendanceDrawer } from "@/components/employee-attendance-drawer"
import { SuccessToast } from "@/components/success-toast"
import { useEmpleados } from "@/lib/hooks/useEmpleados"
import { Empleado, TipoEmpleado } from "@/types"

type EmpleadoDisplay = {
  id: number
  nombre: string
  cedula: string
  tipo: string
  telefono: string
  fechaContratacion: string
  estado: string
}

export default function EmpleadosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [isAttendanceDrawerOpen, setIsAttendanceDrawerOpen] = useState(false)
  const [attendanceType, setAttendanceType] = useState<"entrada" | "salida">("entrada")
  const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("Empleado creado correctamente.")

  // Fetch empleados from API
  const { data: empleados, isLoading, isError } = useEmpleados()

  // Transform empleados to display format
  const empleadosDisplay: EmpleadoDisplay[] = useMemo(() => {
    if (!empleados) return []

    return empleados.map(emp => {
      const tipoMap: Record<string, string> = {
        [TipoEmpleado.ENTRENADOR]: "Entrenador",
        [TipoEmpleado.RECEPCION]: "Recepción",
      }

      return {
        id: emp.id,
        nombre: `${emp.nombre} ${emp.apellido || ""}`.trim(),
        cedula: emp.cedula,
        tipo: tipoMap[emp.tipo_empleado] || emp.tipo_empleado,
        telefono: emp.telefono || "N/A",
        fechaContratacion: emp.fecha_contratacion
          ? new Date(emp.fecha_contratacion).toLocaleDateString("es-CO")
          : "N/A",
        estado: emp.activo ? "Activo" : "Inactivo",
      }
    })
  }, [empleados])

  const employeeColumns = [
    { key: "nombre", header: "Nombre" },
    { key: "cedula", header: "Cédula" },
    { key: "tipo", header: "Tipo" },
    { key: "telefono", header: "Teléfono" },
    { key: "fechaContratacion", header: "Fecha Contratación" },
    {
      key: "estado",
      header: "Estado",
      render: (item: EmpleadoDisplay) => (
        <StatusBadge status={item.estado === "Activo" ? "Activo" : "Inactivo"} />
      ),
    },
    {
      key: "acciones",
      header: "Acciones",
      render: (item: EmpleadoDisplay) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleEditClick(item.id)}
          className="text-primary hover:text-primary hover:bg-primary/10"
        >
          <Edit className="h-4 w-4 mr-1" />
          Editar
        </Button>
      ),
    },
  ]

  const filteredEmployees = empleadosDisplay.filter(
    (emp) =>
      emp.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.cedula.includes(searchTerm)
  )

  const totalEmpleados = empleadosDisplay.length
  const empleadosActivos = empleadosDisplay.filter((e) => e.estado === "Activo").length
  const empleadosInactivos = empleadosDisplay.filter((e) => e.estado === "Inactivo").length

  const handleEmployeeCreated = () => {
    setToastMessage("Empleado creado correctamente.")
    setShowToast(true)
  }

  const handleEmployeeUpdated = () => {
    setToastMessage("Empleado actualizado correctamente.")
    setShowToast(true)
  }

  const handleAttendanceSuccess = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
  }

  const handleEditClick = (empleadoId: number) => {
    const empleado = empleados?.find((emp) => emp.id === empleadoId)
    if (empleado) {
      setSelectedEmpleado(empleado)
      setIsEditDrawerOpen(true)
    }
  }

  const handleEntradaClick = () => {
    setAttendanceType("entrada")
    setIsAttendanceDrawerOpen(true)
  }

  const handleSalidaClick = () => {
    setAttendanceType("salida")
    setIsAttendanceDrawerOpen(true)
  }

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout title="Gestión de Empleados" subtitle="Administra tu equipo de trabajo">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Cargando empleados...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Error state
  if (isError) {
    return (
      <DashboardLayout title="Gestión de Empleados" subtitle="Administra tu equipo de trabajo">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive">Error al cargar los empleados</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Asegúrate de que el servidor backend esté ejecutándose
            </p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Gestión de Empleados" subtitle="Administra tu equipo de trabajo">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o cédula"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-secondary border-border focus:border-primary"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
            onClick={handleEntradaClick}
          >
            <LogIn className="h-4 w-4" />
            Marcar Entrada
          </Button>
          <Button
            variant="outline"
            className="gap-2 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white"
            onClick={handleSalidaClick}
          >
            <LogOut className="h-4 w-4" />
            Marcar Salida
          </Button>
          <Button
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setIsDrawerOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Nuevo empleado
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <MetricCard title="Total Empleados" value={totalEmpleados} icon={UsersRound} />
        <MetricCard title="Empleados Activos" value={empleadosActivos} icon={UserCheck} />
        <MetricCard
          title="Empleados Inactivos"
          value={empleadosInactivos}
          variant="warning"
          icon={UserX}
        />
      </div>

      {/* Employees Table */}
      <ChartCard
        title="Lista de Empleados"
        subtitle={`${filteredEmployees.length} empleados encontrados`}
      >
        <DataTable columns={employeeColumns} data={filteredEmployees} />
      </ChartCard>

      {/* New Employee Drawer */}
      <NewEmployeeDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSuccess={handleEmployeeCreated}
      />

      {/* Edit Employee Drawer */}
      <EditEmployeeDrawer
        isOpen={isEditDrawerOpen}
        onClose={() => {
          setIsEditDrawerOpen(false)
          setSelectedEmpleado(null)
        }}
        onSuccess={handleEmployeeUpdated}
        empleado={selectedEmpleado}
      />

      {/* Employee Attendance Drawer */}
      <EmployeeAttendanceDrawer
        isOpen={isAttendanceDrawerOpen}
        onClose={() => setIsAttendanceDrawerOpen(false)}
        onSuccess={handleAttendanceSuccess}
        type={attendanceType}
      />

      {/* Success Toast */}
      <SuccessToast
        isVisible={showToast}
        message={toastMessage}
        onClose={() => setShowToast(false)}
      />
    </DashboardLayout>
  )
}
