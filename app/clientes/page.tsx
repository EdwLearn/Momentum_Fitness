"use client"

import { useState, useMemo } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { MetricCard } from "@/components/metric-card"
import { ChartCard } from "@/components/chart-card"
import { FilterableDataTable } from "@/components/filterable-data-table"
import { StatusBadge } from "@/components/data-table"
import { Users, UserCheck, UserX, Plus, Edit, RefreshCw, Scale, TrendingUp, X, Calendar, Gift, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UsuarioDetailModal } from "@/components/usuario-detail-modal"
import { NewUsuarioDrawer } from "@/components/new-usuario-drawer"
import { EditUsuarioDrawer } from "@/components/edit-usuario-drawer"
import { RenewMembershipDrawer } from "@/components/renew-membership-drawer"
import { WeightLogDrawer } from "@/components/weight-log-drawer"
import { UsuarioProgressDrawer } from "@/components/usuario-progress-drawer"
import { CourtesyDrawer } from "@/components/courtesy-drawer"
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
    "estudiante": "Estudiante",
    "plan_3_meses": "Plan 3 Meses",
    "plan_6_meses": "Plan 6 Meses",
    "elite_anual": "Elite Anual",
    "cortesia": "Cortesía",
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

  // Buscar última membresía (para usuarios inactivos mostrar qué plan tenían)
  const ultimaMembresia = membresias
    .filter(m => m.usuario_id === usuario.id)
    .sort((a, b) => new Date(b.fecha_fin).getTime() - new Date(a.fecha_fin).getTime())[0]

  return {
    id: usuario.id,
    nombre: `${usuario.nombre} ${usuario.apellido}`,
    cedula: usuario.cedula || "N/A",
    telefono: usuario.telefono || null,
    plan: membresiaActiva ? planMap[membresiaActiva.tipo_plan] || membresiaActiva.tipo_plan : "Sin plan",
    ultimoPlan: ultimaMembresia ? planMap[ultimaMembresia.tipo_plan] || ultimaMembresia.tipo_plan : "Nunca tuvo",
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
    cedula: usuario.cedula || "N/A",
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
  const [isWeightDrawerOpen, setIsWeightDrawerOpen] = useState(false)
  const [isProgressDrawerOpen, setIsProgressDrawerOpen] = useState(false)
  const [isCourtesyDrawerOpen, setIsCourtesyDrawerOpen] = useState(false)
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null)
  const [renewUsuario, setRenewUsuario] = useState<Usuario | null>(null)
  const [weightUsuario, setWeightUsuario] = useState<Usuario | null>(null)
  const [progressUsuario, setProgressUsuario] = useState<Usuario | null>(null)
  const [courtesyUsuario, setCourtesyUsuario] = useState<Usuario | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("Usuario creado correctamente.")
  const [showInactivosModal, setShowInactivosModal] = useState(false)

  // Fetch usuarios and membresias from API
  const { data: usuarios, isLoading: isLoadingUsuarios, isError: isErrorUsuarios } = useUsuarios()
  const { data: membresias, isLoading: isLoadingMembresias, isError: isErrorMembresias } = useMembresias()

  // Filtrar solo usuarios (excluir empleados)
  const soloClientes = useMemo(() => {
    if (!usuarios) return []
    return usuarios.filter(u => u.tipo === TipoUsuario.CLIENTE)
  }, [usuarios])

  // Filtrar solo empleados
  const soloEmpleados = useMemo(() => {
    if (!usuarios) return []
    return usuarios.filter(u => u.tipo === TipoUsuario.ENTRENADOR || u.tipo === TipoUsuario.ADMIN)
  }, [usuarios])

  // Transform usuarios to clients (solo usuarios, no empleados)
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
          { label: "Estudiante", value: "Estudiante" },
          { label: "Plan 3 Meses", value: "Plan 3 Meses" },
          { label: "Plan 6 Meses", value: "Plan 6 Meses" },
          { label: "Elite Anual", value: "Elite Anual" },
          { label: "Cortesía", value: "Cortesía" },
          { label: "Sin plan", value: "Sin plan" },
        ],
        placeholder: "Filtrar por plan..."
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
        <div className="flex gap-2 flex-wrap">
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleWeightClick(item.id)}
            className="text-blue-600 hover:text-blue-600 hover:bg-blue-600/10"
          >
            <Scale className="h-4 w-4 mr-1" />
            Pesar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleProgressClick(item.id)}
            className="text-purple-600 hover:text-purple-600 hover:bg-purple-600/10"
          >
            <TrendingUp className="h-4 w-4 mr-1" />
            Ver Progreso
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleCourtesyClick(item.id)}
            className="text-amber-600 hover:text-amber-600 hover:bg-amber-600/10"
          >
            <Gift className="h-4 w-4 mr-1" />
            Cortesía
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
    setToastMessage("Usuario creado correctamente.")
    setShowToast(true)
  }

  const handleClientUpdated = () => {
    setToastMessage("Usuario actualizado correctamente.")
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

  const handleWeightClick = (clientId: number) => {
    const usuario = usuarios?.find(u => u.id === clientId)
    if (usuario) {
      setWeightUsuario(usuario)
      setIsWeightDrawerOpen(true)
    }
  }

  const handleWeightLogged = () => {
    setToastMessage("Peso registrado correctamente.")
    setShowToast(true)
  }

  const handleProgressClick = (clientId: number) => {
    const usuario = usuarios?.find(u => u.id === clientId)
    if (usuario) {
      setProgressUsuario(usuario)
      setIsProgressDrawerOpen(true)
    }
  }

  const handleCourtesyClick = (clientId: number) => {
    const usuario = usuarios?.find(u => u.id === clientId)
    if (usuario) {
      setCourtesyUsuario(usuario)
      setIsCourtesyDrawerOpen(true)
    }
  }

  const handleCourtesyGranted = () => {
    setToastMessage("Cortesía otorgada correctamente.")
    setShowToast(true)
  }

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout title="Gestión de Usuarios" subtitle="Administra y visualiza la información de tus usuarios">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Cargando usuarios...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Error state
  if (isError) {
    return (
      <DashboardLayout title="Gestión de Usuarios" subtitle="Administra y visualiza la información de tus usuarios">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive">Error al cargar los usuarios</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Asegúrate de que el servidor backend esté ejecutándose en {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}
            </p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Gestión de Usuarios" subtitle="Administra y visualiza la información de tus usuarios">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <MetricCard title="Total Usuarios" value={totalClientes} icon={Users} />
        <MetricCard title="Usuarios Activos" value={clientesActivos} icon={UserCheck} />
        <MetricCard
          title="Usuarios Inactivos"
          value={clientesInactivos}
          variant="warning"
          icon={UserX}
          onClick={() => setShowInactivosModal(true)}
        />
      </div>

      {/* Clients Table */}
      <ChartCard title="Lista de Usuarios" subtitle="Administra y filtra tus usuarios">
        {/* Actions Bar */}
        <div className="flex justify-end mb-4">
          <Button
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setIsDrawerOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Nuevo usuario
          </Button>
        </div>

        {/* Table with Filters */}
        <FilterableDataTable
          columns={clientColumns}
          data={clients}
          searchPlaceholder="Buscar usuarios por nombre, cédula, plan..."
          showGlobalSearch={true}
          emptyMessage="No se encontraron usuarios que coincidan con los filtros"
        />
      </ChartCard>



      {/* Client Detail Modal */}
      {selectedClient && <UsuarioDetailModal client={selectedClient} onClose={() => setSelectedClient(null)} />}

      {/* New Client Drawer */}
      <NewUsuarioDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} onSuccess={handleClientCreated} />

      {/* Edit Client Drawer */}
      <EditUsuarioDrawer
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

      {/* Weight Log Drawer */}
      <WeightLogDrawer
        isOpen={isWeightDrawerOpen}
        onClose={() => {
          setIsWeightDrawerOpen(false)
          setWeightUsuario(null)
        }}
        onSuccess={handleWeightLogged}
        usuario={weightUsuario}
      />

      {/* Client Progress Drawer */}
      <UsuarioProgressDrawer
        isOpen={isProgressDrawerOpen}
        onClose={() => {
          setIsProgressDrawerOpen(false)
          setProgressUsuario(null)
        }}
        usuario={progressUsuario}
      />

      {/* Courtesy Drawer */}
      <CourtesyDrawer
        isOpen={isCourtesyDrawerOpen}
        onClose={() => {
          setIsCourtesyDrawerOpen(false)
          setCourtesyUsuario(null)
        }}
        onSuccess={handleCourtesyGranted}
        usuario={courtesyUsuario}
      />

      {/* Success Toast */}
      <SuccessToast
        isVisible={showToast}
        message={toastMessage}
        onClose={() => setShowToast(false)}
      />

      {/* Modal de Usuarios Inactivos */}
      {showInactivosModal && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowInactivosModal(false)}
          />

          {/* Modal */}
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 p-4">
            <Card className="bg-card border-border max-h-[80vh] flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <UserX className="h-5 w-5 text-warning" />
                    Usuarios Inactivos
                  </CardTitle>
                  <CardDescription>
                    {clientesInactivos} usuarios sin membresía activa
                  </CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowInactivosModal(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto pt-4">
                {clients.filter(c => c.estado === "Inactivo" || c.estado === "Sin membresía").length > 0 ? (
                  <div className="space-y-3">
                    {clients
                      .filter(c => c.estado === "Inactivo" || c.estado === "Sin membresía")
                      .map((cliente) => (
                        <div
                          key={cliente.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border hover:border-warning/30 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-warning/20 flex items-center justify-center">
                              <UserX className="h-5 w-5 text-warning" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{cliente.nombre}</p>
                              <div className="flex flex-col gap-0.5">
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {cliente.telefono || "Sin teléfono"}
                                </p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {cliente.ultimaAsistencia !== "N/A"
                                    ? `Última visita: ${new Date(cliente.ultimaAsistencia).toLocaleDateString('es-CO', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                      })}`
                                    : "Sin asistencias registradas"
                                  }
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex flex-col gap-1">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
                              {cliente.ultimoPlan}
                            </span>
                            <StatusBadge status={cliente.estado} />
                          </div>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <UserCheck className="h-12 w-12 text-primary mb-4" />
                    <p className="text-lg font-medium text-foreground">¡Todos activos!</p>
                    <p className="text-sm text-muted-foreground">
                      No hay usuarios inactivos en este momento
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </DashboardLayout>
  )
}
