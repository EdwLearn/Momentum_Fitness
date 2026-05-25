"use client"

import { useState, useMemo } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, TrendingUp, TrendingDown, Scale } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useMovimientos, useCreateMovimiento, useDeleteMovimiento } from "@/lib/hooks/useContabilidad"
import { CATEGORIAS_MOVIMIENTO, type TipoMovimiento, type CategoriaMovimiento, type MovimientoCreate } from "@/types"

const today = new Date().toISOString().split("T")[0]

function formatThousands(value: string): string {
  const digits = value.replace(/\D/g, "")
  if (!digits) return ""
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const CATEGORIA_COLORS: Record<CategoriaMovimiento, string> = {
  "Membresías": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "Servicios": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "Arriendo": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "Nómina": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "Equipos": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  "Servicios públicos": "bg-pink-500/20 text-pink-400 border-pink-500/30",
  "Marketing": "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  "Otro": "bg-gray-500/20 text-gray-400 border-gray-500/30",
}

interface FormState {
  tipo: TipoMovimiento
  descripcion: string
  monto: string
  fecha: string
  categoria: CategoriaMovimiento
}

const defaultForm: FormState = {
  tipo: "ingreso",
  descripcion: "",
  monto: "",
  fecha: today,
  categoria: "Membresías",
}

export default function ContabilidadPage() {
  const [filterTipo, setFilterTipo] = useState<string>("todos")
  const [filterCat, setFilterCat] = useState<string>("todas")
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<FormState>(defaultForm)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const { data: movimientos = [], isLoading } = useMovimientos()
  const createMutation = useCreateMovimiento()
  const deleteMutation = useDeleteMovimiento()

  const filtered = useMemo(() => {
    return movimientos.filter((m) => {
      const matchTipo = filterTipo === "todos" || m.tipo === filterTipo
      const matchCat = filterCat === "todas" || m.categoria === filterCat
      return matchTipo && matchCat
    })
  }, [movimientos, filterTipo, filterCat])

  const totals = useMemo(() => {
    const ingresos = movimientos
      .filter((m) => m.tipo === "ingreso")
      .reduce((acc, m) => acc + m.monto, 0)
    const egresos = movimientos
      .filter((m) => m.tipo === "egreso")
      .reduce((acc, m) => acc + m.monto, 0)
    return { ingresos, egresos, balance: ingresos - egresos }
  }, [movimientos])

  function handleOpenModal() {
    setForm(defaultForm)
    setModalOpen(true)
  }

  function handleFormChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    if (!form.descripcion.trim()) {
      toast.error("La descripción es requerida")
      return
    }
    const montoNum = parseInt(form.monto.replace(/\D/g, ""), 10)
    if (!montoNum || montoNum <= 0) {
      toast.error("El monto debe ser mayor a 0")
      return
    }
    if (!form.fecha) {
      toast.error("La fecha es requerida")
      return
    }

    const payload: MovimientoCreate = {
      tipo: form.tipo,
      descripcion: form.descripcion.trim(),
      monto: montoNum,
      categoria: form.categoria,
      fecha: form.fecha,
    }

    try {
      await createMutation.mutateAsync(payload)
      toast.success("Movimiento registrado")
      setModalOpen(false)
      setForm(defaultForm)
    } catch {
      toast.error("Error al registrar el movimiento")
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteMutation.mutateAsync(id)
      toast.success("Movimiento eliminado")
      setDeleteConfirm(null)
    } catch {
      toast.error("Error al eliminar el movimiento")
    }
  }

  return (
    <DashboardLayout title="Contabilidad" subtitle="Momentum Fitness">
      <div className="space-y-6">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div />
          <Button onClick={handleOpenModal} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo movimiento
          </Button>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/20">
                <TrendingUp className="h-5 w-5 text-green-400" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Total ingresos</span>
            </div>
            <p className="text-2xl font-bold text-green-400">{formatCOP(totals.ingresos)}</p>
          </div>

          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/20">
                <TrendingDown className="h-5 w-5 text-red-400" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Total egresos</span>
            </div>
            <p className="text-2xl font-bold text-red-400">{formatCOP(totals.egresos)}</p>
          </div>

          <div
            className={cn(
              "rounded-xl border p-5",
              totals.balance >= 0
                ? "border-green-500/20 bg-green-500/5"
                : "border-red-500/20 bg-red-500/5"
            )}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg",
                  totals.balance >= 0 ? "bg-green-500/20" : "bg-red-500/20"
                )}
              >
                <Scale
                  className={cn(
                    "h-5 w-5",
                    totals.balance >= 0 ? "text-green-400" : "text-red-400"
                  )}
                />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Balance neto</span>
            </div>
            <p
              className={cn(
                "text-2xl font-bold",
                totals.balance >= 0 ? "text-green-400" : "text-red-400"
              )}
            >
              {formatCOP(totals.balance)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <Select value={filterTipo} onValueChange={setFilterTipo}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="ingreso">Solo ingresos</SelectItem>
              <SelectItem value="egreso">Solo egresos</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterCat} onValueChange={setFilterCat}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las categorías</SelectItem>
              {CATEGORIAS_MOVIMIENTO.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="text-sm text-muted-foreground ml-auto">
            {filtered.length} movimiento{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Fecha</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Descripción</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Categoría</th>
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Monto</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground w-16">Eliminar</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Cargando movimientos...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No hay movimientos registrados
                  </td>
                </tr>
              ) : (
                filtered.map((m, i) => (
                  <tr
                    key={m.id}
                    className={cn(
                      "border-b border-border/50 transition-colors hover:bg-muted/20",
                      i % 2 === 0 ? "bg-background" : "bg-muted/10"
                    )}
                  >
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {m.fecha}
                    </td>
                    <td className="px-4 py-3 font-medium">{m.descripcion}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={cn("text-xs border", CATEGORIA_COLORS[m.categoria as CategoriaMovimiento] ?? CATEGORIA_COLORS["Otro"])}
                      >
                        {m.categoria}
                      </Badge>
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3 text-right font-semibold tabular-nums whitespace-nowrap",
                        m.tipo === "ingreso" ? "text-green-400" : "text-red-400"
                      )}
                    >
                      {m.tipo === "ingreso" ? "+" : "-"}{formatCOP(m.monto)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {deleteConfirm === m.id ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleDelete(m.id)}
                            className="rounded px-2 py-0.5 text-xs bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-colors"
                            disabled={deleteMutation.isPending}
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="rounded px-2 py-0.5 text-xs bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(m.id)}
                          className="inline-flex items-center justify-center rounded p-1.5 text-muted-foreground hover:bg-red-500/20 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal nuevo movimiento */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo movimiento</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Toggle ingreso / egreso */}
            <div className="flex rounded-lg overflow-hidden border border-border">
              <button
                type="button"
                onClick={() => handleFormChange("tipo", "ingreso")}
                className={cn(
                  "flex-1 py-2.5 text-sm font-semibold transition-colors",
                  form.tipo === "ingreso"
                    ? "bg-green-500 text-white"
                    : "bg-background text-muted-foreground hover:bg-muted/50"
                )}
              >
                Ingreso
              </button>
              <button
                type="button"
                onClick={() => handleFormChange("tipo", "egreso")}
                className={cn(
                  "flex-1 py-2.5 text-sm font-semibold transition-colors",
                  form.tipo === "egreso"
                    ? "bg-red-500 text-white"
                    : "bg-background text-muted-foreground hover:bg-muted/50"
                )}
              >
                Egreso
              </button>
            </div>

            {/* Descripción */}
            <div className="space-y-1.5">
              <Label htmlFor="descripcion">Descripción</Label>
              <Input
                id="descripcion"
                placeholder="Ej: Mensualidad enero, Pago arriendo..."
                value={form.descripcion}
                onChange={(e) => handleFormChange("descripcion", e.target.value)}
              />
            </div>

            {/* Monto */}
            <div className="space-y-1.5">
              <Label htmlFor="monto">Monto (COP)</Label>
              <Input
                id="monto"
                type="text"
                inputMode="numeric"
                placeholder="Ej: 150.000"
                value={form.monto}
                onChange={(e) => handleFormChange("monto", formatThousands(e.target.value))}
              />
            </div>

            {/* Fecha */}
            <div className="space-y-1.5">
              <Label htmlFor="fecha">Fecha</Label>
              <Input
                id="fecha"
                type="date"
                value={form.fecha}
                onChange={(e) => handleFormChange("fecha", e.target.value)}
              />
            </div>

            {/* Categoría */}
            <div className="space-y-1.5">
              <Label>Categoría</Label>
              <Select
                value={form.categoria}
                onValueChange={(v) => handleFormChange("categoria", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS_MOVIMIENTO.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                className={cn(
                  "flex-1 text-white",
                  form.tipo === "ingreso"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                )}
                onClick={handleSubmit}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
