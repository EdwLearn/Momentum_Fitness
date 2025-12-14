"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { ChartCard } from "@/components/chart-card"
import { DataTable, StatusBadge } from "@/components/data-table"
import { CreditCard, Calendar, Repeat, Clock, Trophy, Gift } from "lucide-react"
import { subscriptions, subscriptionsByPlan } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"

const planCounts = [
  { name: "Diario", count: 45, icon: Clock, color: "text-chart-4" },
  { name: "Ticketera", count: 32, icon: CreditCard, color: "text-chart-5" },
  { name: "Mensual", count: 412, icon: Calendar, color: "text-primary" },
  { name: "Trimestral", count: 187, icon: Repeat, color: "text-chart-2" },
  { name: "Anual", count: 156, icon: Trophy, color: "text-chart-3" },
  { name: "Cortesía", count: 15, icon: Gift, color: "text-chart-1" },
]

export default function SuscripcionesPage() {
  const subscriptionColumns = [
    { key: "cliente", header: "Cliente" },
    { key: "plan", header: "Plan" },
    { key: "fechaInicio", header: "Fecha Inicio" },
    { key: "fechaFin", header: "Fecha Fin" },
    {
      key: "estado",
      header: "Estado",
      render: (item: (typeof subscriptions)[0]) => <StatusBadge status={item.estado} />,
    },
    { key: "metodoPago", header: "Método de Pago" },
    {
      key: "origen",
      header: "Origen",
      render: (item: (typeof subscriptions)[0]) => (
        <Badge
          variant="outline"
          className={
            item.origen === "Referido"
              ? "bg-chart-2/20 text-chart-2 border-chart-2/30"
              : item.origen === "Cupón"
                ? "bg-chart-3/20 text-chart-3 border-chart-3/30"
                : "bg-secondary text-secondary-foreground border-border"
          }
        >
          {item.origen}
        </Badge>
      ),
    },
  ]

  return (
    <DashboardLayout title="Suscripciones y Planes" subtitle="Gestiona las suscripciones activas y tipos de planes">
      {/* Plan Count Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {planCounts.map((plan) => (
          <div key={plan.name} className="bg-card border border-border rounded-xl p-4 glow-green-sm">
            <div className="flex items-center gap-2 mb-2">
              <plan.icon className={`h-5 w-5 ${plan.color}`} />
              <span className="text-sm text-muted-foreground">{plan.name}</span>
            </div>
            <p className="text-2xl font-bold text-primary">{plan.count}</p>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <ChartCard
        title="Suscripciones Activas por Tipo de Plan"
        subtitle="Comparativa de cantidad de suscripciones por cada tipo de plan"
        className="mb-6"
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={subscriptionsByPlan} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2B35" horizontal={true} vertical={false} />
              <XAxis type="number" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                dataKey="plan"
                type="category"
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0A0B12",
                  border: "1px solid #2A2B35",
                  borderRadius: "8px",
                  color: "#E5E5E5",
                }}
              />
              <Bar dataKey="cantidad" fill="#A4FF1A" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Subscriptions Table */}
      <ChartCard title="Suscripciones Actuales" subtitle="Lista completa de suscripciones">
        <DataTable
          columns={subscriptionColumns}
          data={subscriptions}
          onRowAction={(item) => console.log("Ver suscripción:", item)}
          actionLabel="Ver"
        />
      </ChartCard>
    </DashboardLayout>
  )
}
