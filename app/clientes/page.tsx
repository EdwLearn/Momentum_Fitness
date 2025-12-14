"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { MetricCard } from "@/components/metric-card"
import { ChartCard } from "@/components/chart-card"
import { DataTable, StatusBadge } from "@/components/data-table"
import { Users, UserCheck, UserX, Search, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { clients } from "@/lib/mock-data"
import { ClientDetailModal } from "@/components/client-detail-modal"
import { NewClientDrawer } from "@/components/new-client-drawer"
import { SuccessToast } from "@/components/success-toast"

type Client = (typeof clients)[0]

export default function ClientesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const clientColumns = [
    { key: "nombre", header: "Nombre" },
    { key: "cedula", header: "Cédula" },
    { key: "plan", header: "Tipo de Plan" },
    { key: "fechaInicio", header: "Fecha Inicio" },
    { key: "fechaFin", header: "Fecha Fin" },
    {
      key: "estado",
      header: "Estado",
      render: (item: Client) => <StatusBadge status={item.estado} />,
    },
    { key: "ultimaAsistencia", header: "Última Asistencia" },
    { key: "diasEntrenados", header: "Días Entrenados" },
  ]

  const filteredClients = clients.filter(
    (client) => client.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || client.cedula.includes(searchTerm),
  )

  const totalClientes = clients.length
  const clientesActivos = clients.filter((c) => c.estado === "Activo").length
  const clientesInactivos = clients.filter((c) => c.estado === "Vencido" || c.diasEntrenados === 0).length

  const handleClientCreated = () => {
    setShowToast(true)
  }

  return (
    <DashboardLayout title="Gestión de Clientes" subtitle="Administra y visualiza la información de tus clientes">
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
        <Button
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => setIsDrawerOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Nuevo cliente
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <MetricCard title="Total Clientes" value={totalClientes} icon={Users} />
        <MetricCard title="Clientes Activos" value={clientesActivos} icon={UserCheck} />
        <MetricCard title="Clientes Inactivos (+30 días)" value={clientesInactivos} variant="warning" icon={UserX} />
      </div>

      {/* Clients Table */}
      <ChartCard title="Lista de Clientes" subtitle={`${filteredClients.length} clientes encontrados`}>
        <DataTable
          columns={clientColumns}
          data={filteredClients}
          onRowAction={(item) => setSelectedClient(item as Client)}
          actionLabel="Ver detalle"
        />
      </ChartCard>

      {/* Client Detail Modal */}
      {selectedClient && <ClientDetailModal client={selectedClient} onClose={() => setSelectedClient(null)} />}

      {/* New Client Drawer */}
      <NewClientDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} onSuccess={handleClientCreated} />

      {/* Success Toast */}
      <SuccessToast
        isVisible={showToast}
        message="Cliente creado correctamente. Suscripción inicial registrada."
        onClose={() => setShowToast(false)}
      />
    </DashboardLayout>
  )
}
