"use client"

import { useState, useMemo } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { MetricCard } from "@/components/metric-card"
import { ChartCard } from "@/components/chart-card"
import { FilterableDataTable } from "@/components/filterable-data-table"
import { StatusBadge } from "@/components/data-table"
import { Users, UserCheck, UserX, Plus, Edit, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ClientDetailModal } from "@/components/client-detail-modal"
import { NewClientDrawer } from "@/components/new-client-drawer"
import { EditClientDrawer } from "@/components/edit-client-drawer"
import { RenewMembershipDrawer } from "@/components/renew-membership-drawer"
import { SuccessToast } from "@/components/success-toast"
import { useUsuarios } from "@/lib/hooks/useUsuarios"
import { useMembresias } from "@/lib/hooks/useMembresias"
import { Usuario, Membresia, TipoUsuario } from "@/types"

// Mapper function to transform Usuario (backend) to Client (frontend)
function mapUsuarioToClient(usuario: Usuario, membresias: Membresia[], todosUsuarios: Usuario[]) {
  // Buscar membresía activa del usuario y verificar que no esté vencida
  const ahora = new Date()
  const membresiaActiva = membresias.find(
    m => m.usuario_id === usuario.id && m.activo && m.estado === "activa" && new Date(m.fecha_fin) >= ahora
  )

  // Mapear nombre del plan
  const planMap: Record<string, string> = {
    "pase_diario": "Pase Diario",
    "pase_flex": "Pase Flex",
    "mensual": "Mensual",
    "plan_3_meses": "Plan 3 Meses",
    "plan_6_meses": "Plan 6 Meses",
    "elite_anual": "Elite Anual",
  }

  // Buscar quién refirió a este usuario (buscar en la membresía activa)
  let referidoPor = "N/A"
  if (membresiaActiva?.referido_por_id) {
    const usuarioReferidor = todosUsuarios.find(u => u.id === membresiaActiva.referido_por_id)
    if (usuarioReferidor) {
      referidoPor = `${usuarioReferidor.nombre} ${usuarioReferidor.apellido}`
    }
  }

  // Determinar estado basado en membresía activa y vigente
  let estado = "Inactivo"
  if (membresiaActiva) {
    estado = "Activo"
  } else if (!usuario.activo) {
    estado = "Inactivo"
  } else {
    estado = "Sin membresía"
  }

  return {
    id: usuario.id,
    nombre: `${usuario.nombre} ${usuario.apellido}`,
    cedula: usuario.telefono || "N/A",
    plan: membresiaActiva ? planMap[membresiaActiva.tipo_plan] || membresiaActiva.tipo_plan : "Sin plan",
    fechaInicio: membresiaActiva
      ? membresiaActiva.fecha_inicio.split('T')[0]
      : usuario.fecha_registro.split('T')[0],
    fechaFin: membresiaActiva
      ? membresiaActiva.fecha_fin.split('T')[0]
      : "N/A",
    estado: estado,
    ultimaAsistencia: usuario.ultima_asistencia
      ? usuario.ultima_asistencia.split('T')[0]
      : "N/A",
    diasEntrenados: usuario.dias_entrenados || 0,
    referidoPor: referidoPor,
  }
}

// Mapper function para empleados
function mapUsuarioToEmployee(usuario: Usuario) {
  // Mapear rol del empleado
  const rolMap: Record<string, string> = {
    [TipoUsuario.ENTRENADOR]: "Entrenador",
    [TipoUsuario.ADMIN]: "Administrador",
  }

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
    cedula: usuario.telefono || "N/A",
    plan: rolMap[usuario.tipo || TipoUsuario.ENTRENADOR] || "Entrenador",
    fechaInicio: usuario.fecha_registro.split('T')[0],
    fechaFin: "N/A",
    estado: estado,
    ultimaAsistencia: usuario.ultima_asistencia
      ? usuario.ultima_asistencia.split('T')[0]
      : "N/A",
    diasEntrenados: usuario.dias_entrenados || 0,
    referidoPor: "N/A",
  }
}

type Client = ReturnType<typeof mapUsuarioToClient>
type Employee = ReturnType<typeof mapUsuarioToEmployee>

export default function ClientesPage() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [isRenewDrawerOpen, setIsRenewDrawerOpen] = useState(false)
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null)
  const [renewUsuario, setRenewUsuario] = useState<Usuario | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("Cliente creado correctamente.")

  // Fetch usuarios and membresias from API
  const { data: usuarios, isLoading: isLoadingUsuarios, isError: isErrorUsuarios } = useUsuarios()
  const { data: membresias, isLoading: isLoadingMembresias, isError: isErrorMembresias } = useMembresias()

  // Filtrar solo clientes (excluir empleados)
  const soloClientes = useMemo(() => {
    if (!usuarios) return []
    return usuarios.filter(u => u.tipo === TipoUsuario.CLIENTE)
  }, [usuarios])

  // Filtrar solo empleados
  const soloEmpleados = useMemo(() => {
    if (!usuarios) return []
    return usuarios.filter(u => u.tipo === TipoUsuario.ENTRENADOR || u.tipo === TipoUsuario.ADMIN)
  }, [usuarios])

  // Transform usuarios to clients (solo clientes, no empleados)
  const clients = useMemo(() => {
    if (!soloClientes || !membresias) return []
    return soloClientes.map(u => mapUsuarioToClient(u, membresias, usuarios || []))
  }, [soloClientes, membresias, usuarios])

  // Transform empleados to employee format
  const employees = useMemo(() => {
    if (!soloEmpleados) return []
    return soloEmpleados.map(u => mapUsuarioToEmployee(u))
  }, [soloEmpleados])

  const isLoading = isLoadingUsuarios || isLoadingMembresias
  const isError = isErrorUsuarios || isErrorMembresias

  const clientColumns = [
    {
      key: "nombre",
      header: "Nombre",
      sortable: true,
      filter: {
        type: "text" as const,
        placeholder: "Buscar por nombre..."
      }
    },
    {
      key: "cedula",
      header: "Documento Único",
      sortable: true,
      filter: {
        type: "text" as const,
        placeholder: "Buscar por documento..."
      }
    },
    {
      key: "plan",
      header: "Tipo de Plan",
      sortable: true,
      filter: {
        type: "select" as const,
        options: [
          { label: "Pase Diario", value: "Pase Diario" },
          { label: "Pase Flex", value: "Pase Flex" },
          { label: "Mensual", value: "Mensual" },
          { label: "Plan 3 Meses", value: "Plan 3 Meses" },
          { label: "Plan 6 Meses", value: "Plan 6 Meses" },
          { label: "Elite Anual", value: "Elite Anual" },
          { label: "Sin plan", value: "Sin plan" },
        ],
        placeholder: "Filtrar por plan..."
      }
    },
    {
      key: "fechaInicio",
      header: "Fecha Registro",
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
          { label: "Activo", value: "Activo" },
          { label: "Inactivo", value: "Inactivo" },
          { label: "Sin membresía", value: "Sin membresía" },
        ],
        placeholder: "Filtrar por estado..."
      },
      render: (item: Client) => <StatusBadge status={item.estado} />,
    },
    {
      key: "referidoPor",
      header: "Referido Por",
      sortable: true,
      filter: {
        type: "text" as const,
        placeholder: "Buscar referidor..."
      }
    },
    {
      key: "ultimaAsistencia",
      header: "Última Asistencia",
      sortable: true,
      filter: {
        type: "date" as const
      }
    },
    {
      key: "diasEntrenados",
      header: "Días Entrenados",
      sortable: true,
      filter: {
        type: "number" as const,
        placeholder: "Ej: 10"
      }
    },
    {
      key: "acciones",
      header: "Acciones",
      render: (item: Client) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditClick(item.id)}
            className="text-primary hover:text-primary hover:bg-primary/10"
          >
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRenewClick(item.id)}
            className="text-green-600 hover:text-green-600 hover:bg-green-600/10"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Renovar
          </Button>
        </div>
      ),
    },
  ]

  const employeeColumns = [
    { key: "nombre", header: "Nombre" },
    { key: "cedula", header: "Documento Único" },
    { key: "plan", header: "Rol" },
    {
      key: "estado",
      header: "Estado",
      render: (item: Employee) => <StatusBadge status={item.estado} />,
    },
    { key: "ultimaAsistencia", header: "Última Asistencia" },
    {
      key: "acciones",
      header: "Acciones",
      render: (item: Employee) => (
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


  const totalClientes = clients.length
  const clientesActivos = clients.filter((c) => c.estado === "Activo").length
  const clientesInactivos = clients.filter((c) => c.estado === "Inactivo" || c.estado === "Sin membresía").length

  const totalEmpleados = employees.length

  const handleClientCreated = () => {
    setToastMessage("Cliente creado correctamente.")
    setShowToast(true)
  }

  const handleClientUpdated = () => {
    setToastMessage("Cliente actualizado correctamente.")
    setShowToast(true)
  }

  const handleMembershipRenewed = () => {
    setToastMessage("Membresía renovada correctamente.")
    setShowToast(true)
  }

  const handleEditClick = (clientId: number) => {
    const usuario = usuarios?.find(u => u.id === clientId)
    if (usuario) {
      setSelectedUsuario(usuario)
      setIsEditDrawerOpen(true)
    }
  }

  const handleRenewClick = (clientId: number) => {
    const usuario = usuarios?.find(u => u.id === clientId)
    if (usuario) {
      setRenewUsuario(usuario)
      setIsRenewDrawerOpen(true)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout title="Gestión de Clientes" subtitle="Administra y visualiza la información de tus clientes">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Cargando clientes...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Error state
  if (isError) {
    return (
      <DashboardLayout title="Gestión de Clientes" subtitle="Administra y visualiza la información de tus clientes">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive">Error al cargar los clientes</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Asegúrate de que el servidor backend esté ejecutándose en {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}
            </p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Gestión de Clientes" subtitle="Administra y visualiza la información de tus clientes">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <MetricCard title="Total Clientes" value={totalClientes} icon={Users} />
        <MetricCard title="Clientes Activos" value={clientesActivos} icon={UserCheck} />
        <MetricCard title="Clientes Inactivos" value={clientesInactivos} variant="warning" icon={UserX} />
      </div>

      {/* Clients Table */}
      <ChartCard title="Lista de Clientes" subtitle="Administra y filtra tus clientes">
        {/* Actions Bar */}
        <div className="flex justify-end mb-4">
          <Button
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setIsDrawerOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Nuevo cliente
          </Button>
        </div>

        {/* Table with Filters */}
        <FilterableDataTable
          columns={clientColumns}
          data={clients}
          searchPlaceholder="Buscar clientes por nombre, cédula, plan..."
          showGlobalSearch={true}
          emptyMessage="No se encontraron clientes que coincidan con los filtros"
        />
      </ChartCard>



      {/* Client Detail Modal */}
      {selectedClient && <ClientDetailModal client={selectedClient} onClose={() => setSelectedClient(null)} />}

      {/* New Client Drawer */}
      <NewClientDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} onSuccess={handleClientCreated} />

      {/* Edit Client Drawer */}
      <EditClientDrawer
        isOpen={isEditDrawerOpen}
        onClose={() => {
          setIsEditDrawerOpen(false)
          setSelectedUsuario(null)
        }}
        onSuccess={handleClientUpdated}
        usuario={selectedUsuario}
      />

      {/* Renew Membership Drawer */}
      <RenewMembershipDrawer
        isOpen={isRenewDrawerOpen}
        onClose={() => {
          setIsRenewDrawerOpen(false)
          setRenewUsuario(null)
        }}
        onSuccess={handleMembershipRenewed}
        usuario={renewUsuario}
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
