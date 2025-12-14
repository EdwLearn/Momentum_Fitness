"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { MetricCard } from "@/components/metric-card"
import { ChartCard } from "@/components/chart-card"
import { DataTable } from "@/components/data-table"
import { Ticket, Users, Check, X, Plus, Search } from "lucide-react"
import { coupons, referrals } from "@/lib/mock-data"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { NewCouponDrawer } from "@/components/new-coupon-drawer"
import { SuccessToast } from "@/components/success-toast"

const nicheDistribution = [
  { name: "Alimenticio", value: 134, color: "#A4FF1A" },
  { name: "Estético", value: 89, color: "#22D3EE" },
]

export default function CuponesPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [nichoFilter, setNichoFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const handleSuccess = () => {
    setShowSuccessToast(true)
    setTimeout(() => setShowSuccessToast(false), 3000)
  }

  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch = coupon.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesNicho = nichoFilter === "all" || coupon.nicho === nichoFilter
    const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? coupon.activo : !coupon.activo)
    return matchesSearch && matchesNicho && matchesStatus
  })

  const couponColumns = [
    { key: "codigo", header: "Código" },
    {
      key: "nicho",
      header: "Nicho",
      render: (item: (typeof coupons)[0]) => (
        <Badge
          variant="outline"
          className={
            item.nicho === "Alimenticio"
              ? "bg-primary/20 text-primary border-primary/30"
              : "bg-chart-2/20 text-chart-2 border-chart-2/30"
          }
        >
          {item.nicho}
        </Badge>
      ),
    },
    {
      key: "descuento",
      header: "% Descuento",
      render: (item: (typeof coupons)[0]) => <span className="text-primary font-semibold">{item.descuento}%</span>,
    },
    { key: "usosTotal", header: "Usos Totales" },
    { key: "usosAnio", header: "Usos Este Año" },
    {
      key: "activo",
      header: "Estado",
      render: (item: (typeof coupons)[0]) => <Switch checked={item.activo} />,
    },
  ]

  const referralColumns = [
    { key: "referidor", header: "Referidor" },
    { key: "referido", header: "Referido" },
    { key: "planComprado", header: "Plan Comprado" },
    {
      key: "cumpleCondicion",
      header: "Cumple Condición",
      render: (item: (typeof referrals)[0]) =>
        item.cumpleCondicion ? (
          <div className="flex items-center gap-1 text-primary">
            <Check className="h-4 w-4" />
            <span>Sí</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-warning">
            <X className="h-4 w-4" />
            <span>No</span>
          </div>
        ),
    },
    {
      key: "beneficio",
      header: "Beneficio Otorgado",
      render: (item: (typeof referrals)[0]) => (
        <Badge
          variant="outline"
          className={
            item.beneficio === "Pendiente"
              ? "bg-warning/20 text-warning border-warning/30"
              : "bg-primary/20 text-primary border-primary/30"
          }
        >
          {item.beneficio}
        </Badge>
      ),
    },
  ]

  return (
    <DashboardLayout
      title="Cupones y Plan de Referidos"
      subtitle="Gestiona cupones promocionales y el programa de referidos"
    >
      {/* Section: Cupones */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Gestión de Cupones</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Controla descuentos, promociones y métricas de conversión
            </p>
          </div>
          <Button
            onClick={() => setIsDrawerOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(164,255,26,0.3)]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo cupón
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Metric Card */}
          <MetricCard
            title="Clientes por Cupones (este mes)"
            value={23}
            change={15}
            changeLabel="vs mes anterior"
            icon={Ticket}
          />

          {/* Donut Chart */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">Distribución por Nicho</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={nicheDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {nicheDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0A0B12",
                      border: "1px solid #2A2B35",
                      borderRadius: "8px",
                      color: "#E5E5E5",
                    }}
                  />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    wrapperStyle={{ color: "#9CA3AF", fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mb-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-card border-border"
            />
          </div>
          <Select value={nichoFilter} onValueChange={setNichoFilter}>
            <SelectTrigger className="w-full md:w-[200px] bg-card border-border">
              <SelectValue placeholder="Filtrar por nicho" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los nichos</SelectItem>
              <SelectItem value="Alimenticio">Alimenticio</SelectItem>
              <SelectItem value="Estético">Estético</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[200px] bg-card border-border">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="inactive">Inactivos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Coupons Table */}
        <ChartCard title="Lista de Cupones" subtitle="Administra los códigos de descuento">
          <DataTable columns={couponColumns} data={filteredCoupons} />
        </ChartCard>
      </div>

      {/* Section: Referidos */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Referidos</h2>

        <div className="mb-6">
          <MetricCard
            title="Referidos Convertidos (últimos 3 meses)"
            value={47}
            change={22}
            changeLabel="vs período anterior"
            icon={Users}
          />
        </div>

        {/* Referrals Table */}
        <ChartCard title="Lista de Referidos" subtitle="Seguimiento del programa de referidos">
          <DataTable columns={referralColumns} data={referrals} />
        </ChartCard>
      </div>

      <NewCouponDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} onSuccess={handleSuccess} />

      <SuccessToast
        show={showSuccessToast}
        message="Cupón creado con éxito. Ahora aparece en la lista de cupones."
        onClose={() => setShowSuccessToast(false)}
      />
    </DashboardLayout>
  )
}
