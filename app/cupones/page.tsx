"use client"

import { useState, useMemo } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { MetricCard } from "@/components/metric-card"
import { ChartCard } from "@/components/chart-card"
import { FilterableDataTable } from "@/components/filterable-data-table"
import { Ticket, Users, Check, X, Plus, Loader2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { NewCouponDrawer } from "@/components/new-coupon-drawer"
import { SuccessToast } from "@/components/success-toast"
import { useCupones, useCuponesStats, useToggleCuponActivo } from "@/lib/hooks/useCupones"
import { useReferidosDetallados, useReferidosStats } from "@/lib/hooks/useReferidos"
import { Cupon } from "@/types"

export default function CuponesPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  // Fetch data from backend
  const { data: cupones = [], isLoading: loadingCupones } = useCupones()
  const { data: cuponesStats } = useCuponesStats()
  const { data: referidosData = [], isLoading: loadingReferidos } = useReferidosDetallados()
  const { data: referidosStats } = useReferidosStats()
  const toggleCuponActivo = useToggleCuponActivo()

  const handleSuccess = () => {
    setShowSuccessToast(true)
    setTimeout(() => setShowSuccessToast(false), 3000)
  }

  const handleToggleCupon = async (id: number) => {
    try {
      await toggleCuponActivo.mutateAsync(id)
    } catch (error) {
      console.error("Error toggling coupon:", error)
    }
  }


  const nicheDistribution = useMemo(() => {
    if (!cuponesStats?.cupones_por_nicho) return []
    return Object.entries(cuponesStats.cupones_por_nicho).map(([name, value]) => ({
      name,
      value,
      color: name === "Alimenticio" ? "#A4FF1A" : "#22D3EE",
    }))
  }, [cuponesStats])

  const couponColumns = [
    {
      key: "codigo",
      header: "Código",
      sortable: true,
      filter: {
        type: "text" as const,
        placeholder: "Buscar código..."
      }
    },
    {
      key: "nicho",
      header: "Nicho",
      sortable: true,
      filter: {
        type: "select" as const,
        options: [
          { label: "Alimenticio", value: "Alimenticio" },
          { label: "Estético", value: "Estético" },
        ],
        placeholder: "Filtrar por nicho..."
      },
      render: (item: Cupon) => (
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
      sortable: true,
      filter: {
        type: "number" as const,
        placeholder: "Ej: 10"
      },
      render: (item: Cupon) => <span className="text-primary font-semibold">{item.descuento}%</span>,
    },
    {
      key: "usos_total",
      header: "Usos Totales",
      sortable: true,
      filter: {
        type: "number" as const,
        placeholder: "Ej: 5"
      },
      render: (item: Cupon) => <span>{item.usos_total}</span>,
    },
    {
      key: "usos_anio",
      header: "Usos Este Año",
      sortable: true,
      filter: {
        type: "number" as const,
        placeholder: "Ej: 3"
      },
      render: (item: Cupon) => <span>{item.usos_anio}</span>,
    },
    {
      key: "activo",
      header: "Estado",
      sortable: true,
      render: (item: Cupon) => (
        <Switch
          checked={item.activo}
          onCheckedChange={() => handleToggleCupon(item.id)}
          disabled={toggleCuponActivo.isPending}
        />
      ),
    },
  ]

  const referralColumns = [
    {
      key: "referidor",
      header: "Referidor",
      sortable: true,
      filter: {
        type: "text" as const,
        placeholder: "Buscar referidor..."
      }
    },
    {
      key: "referido",
      header: "Referido",
      sortable: true,
      filter: {
        type: "text" as const,
        placeholder: "Buscar referido..."
      }
    },
    {
      key: "plan_comprado",
      header: "Plan Comprado",
      sortable: true,
      filter: {
        type: "text" as const,
        placeholder: "Buscar plan..."
      },
      render: (item: any) => <span>{item.plan_comprado || "N/A"}</span>,
    },
    {
      key: "cumple_condicion",
      header: "Cumple Condición",
      sortable: true,
      filter: {
        type: "select" as const,
        options: [
          { label: "Sí", value: "true" },
          { label: "No", value: "false" },
        ],
        placeholder: "Filtrar por condición..."
      },
      render: (item: any) =>
        item.cumple_condicion ? (
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
      sortable: true,
      filter: {
        type: "text" as const,
        placeholder: "Buscar beneficio..."
      },
      render: (item: any) => (
        <Badge
          variant="outline"
          className={
            !item.beneficio || item.beneficio === "Pendiente"
              ? "bg-warning/20 text-warning border-warning/30"
              : "bg-primary/20 text-primary border-primary/30"
          }
        >
          {item.beneficio || "Pendiente"}
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
            title="Total de Cupones Activos"
            value={cuponesStats?.cupones_activos ?? 0}
            change={0}
            changeLabel={`${cuponesStats?.total_cupones ?? 0} cupones totales`}
            icon={Ticket}
          />

          {/* Donut Chart */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">Distribución por Nicho</h3>
            {loadingCupones ? (
              <div className="h-48 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : nicheDistribution.length > 0 ? (
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
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                No hay datos disponibles
              </div>
            )}
          </div>
        </div>

        {/* Coupons Table */}
        <ChartCard title="Lista de Cupones" subtitle="Administra los códigos de descuento">
          {loadingCupones ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <FilterableDataTable
              columns={couponColumns}
              data={cupones}
              searchPlaceholder="Buscar cupones por código, nicho..."
              showGlobalSearch={true}
              emptyMessage="No se encontraron cupones que coincidan con los filtros"
            />
          )}
        </ChartCard>
      </div>

      {/* Section: Referidos */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Referidos</h2>

        <div className="mb-6">
          <MetricCard
            title="Referidos Convertidos (últimos 3 meses)"
            value={referidosStats?.referidos_ultimos_3_meses ?? 0}
            change={0}
            changeLabel={`${referidosStats?.total_referidos ?? 0} referidos totales`}
            icon={Users}
          />
        </div>

        {/* Referrals Table */}
        <ChartCard title="Lista de Referidos" subtitle="Seguimiento del programa de referidos">
          {loadingReferidos ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <FilterableDataTable
              columns={referralColumns}
              data={referidosData}
              searchPlaceholder="Buscar referidos por nombre, plan, beneficio..."
              showGlobalSearch={true}
              emptyMessage="No se encontraron referidos que coincidan con los filtros"
            />
          )}
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
