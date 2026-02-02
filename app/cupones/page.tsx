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
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Sector } from "recharts"
import { NewCouponDrawer } from "@/components/new-coupon-drawer"
import { PreVentaCouponDrawer } from "@/components/preventa-coupon-drawer"
import { SuccessToast } from "@/components/success-toast"
import { useCupones, useCuponesStats, useToggleCuponActivo } from "@/lib/hooks/useCupones"
import { useReferidosDetallados, useReferidosStats } from "@/lib/hooks/useReferidos"
import { Cupon } from "@/types"

export default function CuponesPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isPreVentaDrawerOpen, setIsPreVentaDrawerOpen] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [selectedPieIndex, setSelectedPieIndex] = useState<number | null>(null)

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

  const onPieEnter = (_: any, index: number) => {
    if (selectedPieIndex === null) {
      setActiveIndex(index)
    }
  }

  const onPieLeave = () => {
    if (selectedPieIndex === null) {
      setActiveIndex(null)
    }
  }

  const onPieClick = (_: any, index: number) => {
    if (selectedPieIndex === index) {
      setSelectedPieIndex(null)
      setActiveIndex(null)
    } else {
      setSelectedPieIndex(index)
      setActiveIndex(index)
    }
  }

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props

    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#E5E5E5" fontSize={16} fontWeight="bold">
          {payload.name}
        </text>
        <text x={cx} y={cy} dy={28} textAnchor="middle" fill="#9CA3AF" fontSize={12}>
          {`${value} (${(percent * 100).toFixed(1)}%)`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 12}
          outerRadius={outerRadius + 14}
          fill={fill}
        />
      </g>
    )
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
      key: "referidos_totales",
      header: "Referidos Totales",
      sortable: true,
      filter: {
        type: "number" as const,
        placeholder: "Ej: 3"
      },
      render: (item: any) => (
        <span className="font-semibold text-chart-2">{item.referidos_totales || 0}</span>
      ),
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
      subtitle="Controla descuentos, promociones y métricas de conversión"
    >
      {/* Section: Cupones */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => setIsDrawerOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(164,255,26,0.3)]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo cupón
          </Button>
          <Button
            onClick={() => setIsPreVentaDrawerOpen(true)}
            variant="outline"
            className="border-primary/50 text-primary hover:bg-primary/10 hover:border-primary"
          >
            <Ticket className="h-4 w-4 mr-2" />
            Cupón Pre-Venta (25%)
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Metric Card */}
          <MetricCard
            title="Total de Cupones Activos"
            value={cuponesStats?.cupones_activos ?? 0}
            change={
              cuponesStats?.total_cupones && cuponesStats.total_cupones > 0
                ? Math.round((cuponesStats.cupones_activos / cuponesStats.total_cupones) * 100)
                : 0
            }
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
                      activeIndex={activeIndex ?? undefined}
                      activeShape={renderActiveShape}
                      data={nicheDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      onMouseEnter={onPieEnter}
                      onMouseLeave={onPieLeave}
                      onClick={onPieClick}
                      style={{ cursor: 'pointer' }}
                    >
                      {nicheDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend
                      layout="vertical"
                      align="right"
                      verticalAlign="middle"
                      wrapperStyle={{ color: "#E5E5E5", fontSize: "12px" }}
                      formatter={(value) => <span style={{ color: '#E5E5E5' }}>{value}</span>}
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
            change={
              referidosStats?.referidos_ultimos_3_meses && referidosStats.referidos_ultimos_3_meses > 0
                ? Math.round(((referidosStats.referidos_activos ?? 0) / referidosStats.referidos_ultimos_3_meses) * 100)
                : 0
            }
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

      <PreVentaCouponDrawer
        isOpen={isPreVentaDrawerOpen}
        onClose={() => setIsPreVentaDrawerOpen(false)}
        onSuccess={handleSuccess}
      />

      <SuccessToast
        show={showSuccessToast}
        message="Cupón creado con éxito. Ahora aparece en la lista de cupones."
        onClose={() => setShowSuccessToast(false)}
      />
    </DashboardLayout>
  )
}
