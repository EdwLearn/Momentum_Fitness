"use client"

import { useState, useMemo } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ChartCard } from "@/components/chart-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { FileDown, FileText } from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  useAsistenciasPorDia,
  useAsistenciasPorPlan,
  useNuevasVsRenovaciones,
  usePlanesTop,
  useIngresosPorMes,
  useIngresosPorCupon,
  useReferidosImpacto,
  useResumenIngresos,
} from "@/lib/hooks/useReportes"

export default function ReportesPage() {
  const [dateRange, setDateRange] = useState("30-dias")
  const [customDateFrom, setCustomDateFrom] = useState<string>("")
  const [customDateTo, setCustomDateTo] = useState<string>("")
  const [isExporting, setIsExporting] = useState(false)

  // Calcular días basado en el filtro seleccionado
  const diasAsistencias = useMemo(() => {
    if (dateRange === "7-dias") return 7
    if (dateRange === "30-dias") return 30
    if (dateRange === "este-mes") {
      const now = new Date()
      return now.getDate() // Día actual del mes
    }
    // Personalizado: calcular días entre fechas
    if (customDateFrom && customDateTo) {
      const dateFrom = new Date(customDateFrom)
      const dateTo = new Date(customDateTo)
      const diff = Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24))
      return Math.max(1, diff)
    }
    return 30
  }, [dateRange, customDateFrom, customDateTo])

  // Calcular meses para reportes de suscripciones e ingresos
  // Siempre mostrar 6 meses de contexto histórico para gráficas mensuales
  const mesesReportes = useMemo(() => {
    // Para todos los filtros predefinidos, mostrar 6 meses
    if (dateRange !== "personalizado") return 6

    // Personalizado: calcular meses basado en el rango seleccionado
    if (customDateFrom && customDateTo) {
      const dateFrom = new Date(customDateFrom)
      const dateTo = new Date(customDateTo)
      const diffTime = Math.abs(dateTo.getTime() - dateFrom.getTime())
      const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30))
      return Math.max(1, Math.min(12, diffMonths))
    }
    return 6
  }, [dateRange, customDateFrom, customDateTo])

  // Obtener datos del backend con parámetros dinámicos
  const { data: asistenciasPorDia, isLoading: isLoadingAsistenciasDia } = useAsistenciasPorDia(diasAsistencias)
  const { data: asistenciasPorPlan, isLoading: isLoadingAsistenciasPlan } = useAsistenciasPorPlan(diasAsistencias)
  const { data: nuevasVsRenovaciones, isLoading: isLoadingNuevasRenovaciones } = useNuevasVsRenovaciones(mesesReportes)
  const { data: planesTop, isLoading: isLoadingPlanesTop } = usePlanesTop()
  const { data: ingresosPorMes, isLoading: isLoadingIngresosMes } = useIngresosPorMes(mesesReportes)
  const { data: ingresosPorCupon, isLoading: isLoadingIngresosCupon } = useIngresosPorCupon()
  const { data: referidosImpacto, isLoading: isLoadingReferidos } = useReferidosImpacto()
  const { data: resumenIngresos, isLoading: isLoadingResumen } = useResumenIngresos()

  // Colores verde momentum para gráficas principales
  const GREEN_COLOR = "#A4FF1A"
  // Color azul complementario
  const BLUE_COLOR = "#22D3EE"
  // Colores verde y azul para gráficas multicolor
  const GREEN_BLUE_COLORS = ["#A4FF1A", "#22D3EE", "#7ACC15", "#0EA5E9", "#5A9E0E"]

  // Loading state
  const isLoading = isLoadingAsistenciasDia || isLoadingAsistenciasPlan || isLoadingNuevasRenovaciones ||
    isLoadingPlanesTop || isLoadingIngresosMes || isLoadingIngresosCupon || isLoadingReferidos || isLoadingResumen

  // Función para exportar a CSV
  const exportToCSV = () => {
    setIsExporting(true)
    try {
      let csvContent = "data:text/csv;charset=utf-8,"

      // Obtener el nombre del período
      const getPeriodName = () => {
        if (dateRange === "7-dias") return "Ultimos_7_dias"
        if (dateRange === "30-dias") return "Ultimos_30_dias"
        if (dateRange === "este-mes") return "Este_mes"
        if (dateRange === "personalizado" && customDateFrom && customDateTo) {
          return `${customDateFrom}_a_${customDateTo}`.replace(/-/g, "_")
        }
        return "Reporte"
      }

      // Encabezado del reporte
      csvContent += `Reporte de Gimnasio - ${getPeriodName()}\n`
      csvContent += `Fecha de generacion: ${new Date().toLocaleDateString('es-ES')}\n\n`

      // Sección: Asistencias por día
      csvContent += "ASISTENCIAS POR DIA\n"
      csvContent += "Fecha,Asistencias\n"
      asistenciasPorDia?.forEach(item => {
        csvContent += `${item.fecha},${item.asistencias}\n`
      })
      csvContent += "\n"

      // Sección: Asistencias por plan
      csvContent += "ASISTENCIAS POR PLAN\n"
      csvContent += "Plan,Asistencias\n"
      asistenciasPorPlan?.forEach(item => {
        csvContent += `${item.plan},${item.asistencias}\n`
      })
      csvContent += "\n"

      // Sección: Nuevas vs Renovaciones
      csvContent += "NUEVAS SUSCRIPCIONES VS RENOVACIONES\n"
      csvContent += "Mes,Nuevas,Renovaciones\n"
      nuevasVsRenovaciones?.forEach(item => {
        csvContent += `${item.mes},${item.nuevas},${item.renovaciones}\n`
      })
      csvContent += "\n"

      // Sección: Planes más vendidos
      csvContent += "PLANES MAS VENDIDOS\n"
      csvContent += "Plan,Ventas\n"
      planesTop?.forEach(item => {
        csvContent += `${item.plan},${item.ventas}\n`
      })
      csvContent += "\n"

      // Sección: Ingresos por mes
      csvContent += "INGRESOS POR MES\n"
      csvContent += "Mes,Ingresos (Millones)\n"
      ingresosPorMes?.forEach(item => {
        csvContent += `${item.mes},${item.ingresos}\n`
      })
      csvContent += "\n"

      // Sección: Resumen de Ingresos
      csvContent += "RESUMEN DE INGRESOS\n"
      csvContent += "Metrica,Valor\n"
      csvContent += `Ingresos Totales (Millones),${resumenIngresos?.ingresos_totales || 0}\n`
      csvContent += `Ticket Promedio (Miles),${resumenIngresos?.ticket_promedio || 0}\n`
      csvContent += `Ingresos por Cliente (Miles),${resumenIngresos?.ingresos_por_cliente || 0}\n`
      csvContent += "\n"

      // Sección: Referidos
      csvContent += "IMPACTO DE REFERIDOS\n"
      csvContent += "Metrica,Valor\n"
      csvContent += `Clientes Referidos,${referidosImpacto?.clientes_referidos || 0}\n`
      csvContent += `Porcentaje,${referidosImpacto?.porcentaje || 0}%\n`
      csvContent += `Meses Gratis Entregados,${referidosImpacto?.meses_gratis || 0}\n`
      csvContent += `Ratio de Conversion,${referidosImpacto?.ratio_conversion || 0}%\n`

      // Crear el enlace de descarga
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", `Reporte_Gimnasio_${getPeriodName()}_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error exportando CSV:", error)
      alert("Error al exportar el archivo CSV")
    } finally {
      setIsExporting(false)
    }
  }

  // Función para exportar a PDF
  const exportToPDF = async () => {
    setIsExporting(true)
    try {
      // Importar jsPDF y autotable dinámicamente
      const jsPDFModule = await import('jspdf')
      const jsPDF = jsPDFModule.default
      // Importar autotable para extender jsPDF
      await import('jspdf-autotable')

      const doc: any = new jsPDF()
      let yPos = 20

      // Obtener el nombre del período
      const getPeriodName = () => {
        if (dateRange === "7-dias") return "Últimos 7 días"
        if (dateRange === "30-dias") return "Últimos 30 días"
        if (dateRange === "este-mes") return "Este mes"
        if (dateRange === "personalizado" && customDateFrom && customDateTo) {
          return `${customDateFrom} a ${customDateTo}`
        }
        return "Reporte General"
      }

      // Título
      doc.setFontSize(18)
      doc.text("Reporte de Gimnasio Momentum Fitness", 105, yPos, { align: "center" })
      yPos += 10

      doc.setFontSize(12)
      doc.text(`Período: ${getPeriodName()}`, 105, yPos, { align: "center" })
      yPos += 7

      doc.setFontSize(10)
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 105, yPos, { align: "center" })
      yPos += 15

      // Tabla: Asistencias por día
      if (asistenciasPorDia && asistenciasPorDia.length > 0) {
        doc.setFontSize(14)
        doc.text("Asistencias por día", 14, yPos)
        yPos += 7

        doc.autoTable({
          startY: yPos,
          head: [['Fecha', 'Asistencias']],
          body: asistenciasPorDia.map(item => [item.fecha, item.asistencias]),
          theme: 'grid',
          headStyles: { fillColor: [164, 255, 26], textColor: [0, 0, 0] },
        })
        yPos = doc.lastAutoTable.finalY + 10
      }

      // Tabla: Asistencias por plan
      if (asistenciasPorPlan && asistenciasPorPlan.length > 0) {
        if (yPos > 250) {
          doc.addPage()
          yPos = 20
        }

        doc.setFontSize(14)
        doc.text("Asistencias por plan", 14, yPos)
        yPos += 7

        doc.autoTable({
          startY: yPos,
          head: [['Plan', 'Asistencias']],
          body: asistenciasPorPlan.map(item => [item.plan, item.asistencias]),
          theme: 'grid',
          headStyles: { fillColor: [164, 255, 26], textColor: [0, 0, 0] },
        })
        yPos = doc.lastAutoTable.finalY + 10
      }

      // Tabla: Nuevas vs Renovaciones
      if (nuevasVsRenovaciones && nuevasVsRenovaciones.length > 0) {
        if (yPos > 250) {
          doc.addPage()
          yPos = 20
        }

        doc.setFontSize(14)
        doc.text("Nuevas suscripciones vs Renovaciones", 14, yPos)
        yPos += 7

        doc.autoTable({
          startY: yPos,
          head: [['Mes', 'Nuevas', 'Renovaciones']],
          body: nuevasVsRenovaciones.map(item => [item.mes, item.nuevas, item.renovaciones]),
          theme: 'grid',
          headStyles: { fillColor: [164, 255, 26], textColor: [0, 0, 0] },
        })
        yPos = doc.lastAutoTable.finalY + 10
      }

      // Tabla: Planes más vendidos
      if (planesTop && planesTop.length > 0) {
        if (yPos > 250) {
          doc.addPage()
          yPos = 20
        }

        doc.setFontSize(14)
        doc.text("Planes más vendidos", 14, yPos)
        yPos += 7

        doc.autoTable({
          startY: yPos,
          head: [['Plan', 'Ventas']],
          body: planesTop.map(item => [item.plan, item.ventas]),
          theme: 'grid',
          headStyles: { fillColor: [164, 255, 26], textColor: [0, 0, 0] },
        })
        yPos = doc.lastAutoTable.finalY + 10
      }

      // Tabla: Ingresos por mes
      if (ingresosPorMes && ingresosPorMes.length > 0) {
        if (yPos > 250) {
          doc.addPage()
          yPos = 20
        }

        doc.setFontSize(14)
        doc.text("Ingresos por mes", 14, yPos)
        yPos += 7

        doc.autoTable({
          startY: yPos,
          head: [['Mes', 'Ingresos (Millones)']],
          body: ingresosPorMes.map(item => [item.mes, `$${item.ingresos}M`]),
          theme: 'grid',
          headStyles: { fillColor: [164, 255, 26], textColor: [0, 0, 0] },
        })
        yPos = doc.lastAutoTable.finalY + 10
      }

      // Resumen de Ingresos
      if (resumenIngresos) {
        if (yPos > 220) {
          doc.addPage()
          yPos = 20
        }

        doc.setFontSize(14)
        doc.text("Resumen de Ingresos", 14, yPos)
        yPos += 7

        doc.autoTable({
          startY: yPos,
          head: [['Métrica', 'Valor']],
          body: [
            ['Ingresos Totales', `$${resumenIngresos.ingresos_totales?.toFixed(1) || 0}M`],
            ['Ticket Promedio', `$${resumenIngresos.ticket_promedio?.toFixed(1) || 0}K`],
            ['Ingresos por Cliente', `$${resumenIngresos.ingresos_por_cliente?.toFixed(1) || 0}K`],
          ],
          theme: 'grid',
          headStyles: { fillColor: [164, 255, 26], textColor: [0, 0, 0] },
        })
        yPos = doc.lastAutoTable.finalY + 10
      }

      // Impacto de Referidos
      if (referidosImpacto) {
        if (yPos > 220) {
          doc.addPage()
          yPos = 20
        }

        doc.setFontSize(14)
        doc.text("Impacto de Referidos", 14, yPos)
        yPos += 7

        doc.autoTable({
          startY: yPos,
          head: [['Métrica', 'Valor']],
          body: [
            ['Clientes Referidos', referidosImpacto.clientes_referidos || 0],
            ['Porcentaje del total', `${referidosImpacto.porcentaje?.toFixed(1) || 0}%`],
            ['Meses Gratis Entregados', referidosImpacto.meses_gratis || 0],
            ['Ratio de Conversión', `${referidosImpacto.ratio_conversion?.toFixed(1) || 0}%`],
          ],
          theme: 'grid',
          headStyles: { fillColor: [164, 255, 26], textColor: [0, 0, 0] },
        })
      }

      // Guardar el PDF
      const getPeriodFileName = () => {
        if (dateRange === "7-dias") return "Ultimos_7_dias"
        if (dateRange === "30-dias") return "Ultimos_30_dias"
        if (dateRange === "este-mes") return "Este_mes"
        if (dateRange === "personalizado" && customDateFrom && customDateTo) {
          return `${customDateFrom}_a_${customDateTo}`.replace(/-/g, "_")
        }
        return "Reporte"
      }

      doc.save(`Reporte_Gimnasio_${getPeriodFileName()}_${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (error) {
      console.error("Error exportando PDF:", error)
      alert("Error al exportar el archivo PDF")
    } finally {
      setIsExporting(false)
    }
  }

  // Mostrar loading state
  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout title="Reportes" subtitle="Visualiza el rendimiento del gimnasio por periodos">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Cargando reportes...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout title="Reportes" subtitle="Visualiza el rendimiento del gimnasio por periodos">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-card border border-border rounded-lg">
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm text-muted-foreground mb-2 block">Período de tiempo</label>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7-dias">Últimos 7 días</SelectItem>
              <SelectItem value="30-dias">Últimos 30 días</SelectItem>
              <SelectItem value="este-mes">Este mes</SelectItem>
              <SelectItem value="personalizado">Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {dateRange === "personalizado" && (
          <>
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm text-muted-foreground mb-2 block">Fecha desde</label>
              <DatePicker
                value={customDateFrom}
                onChange={setCustomDateFrom}
                placeholder="Seleccionar fecha inicial"
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-sm text-muted-foreground mb-2 block">Fecha hasta</label>
              <DatePicker
                value={customDateTo}
                onChange={setCustomDateTo}
                placeholder="Seleccionar fecha final"
                minDate={customDateFrom}
              />
            </div>
          </>
        )}
      </div>

      {/* Section A - Asistencia */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-foreground mb-4">Asistencia</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Asistencias por día" subtitle="Total de check-ins diarios">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={asistenciasPorDia || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="fecha" stroke="#FFFFFF" />
                  <YAxis stroke="#FFFFFF" />
                  <Tooltip
                    cursor={false}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="asistencias"
                    stroke={GREEN_COLOR}
                    strokeWidth={3}
                    dot={{ fill: GREEN_COLOR, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Asistencia por tipo de plan" subtitle="Check-ins segmentados por plan">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={asistenciasPorPlan || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="plan" stroke="#FFFFFF" />
                  <YAxis stroke="#FFFFFF" />
                  <Tooltip
                    cursor={false}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Bar
                    dataKey="asistencias"
                    fill={GREEN_COLOR}
                    radius={[4, 4, 0, 0]}
                    onMouseEnter={(data, index, e) => {
                      const target = e.target as SVGElement;
                      target.style.transform = 'scaleY(1.05)';
                      target.style.transformOrigin = 'bottom';
                      target.style.transition = 'transform 0.2s ease';
                    }}
                    onMouseLeave={(data, index, e) => {
                      const target = e.target as SVGElement;
                      target.style.transform = 'scaleY(1)';
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Section B - Suscripciones */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-foreground mb-4">Suscripciones</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Nuevas suscripciones vs renovaciones" subtitle="Comparativa mensual">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={nuevasVsRenovaciones || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" stroke="#FFFFFF" />
                  <YAxis stroke="#FFFFFF" />
                  <Tooltip
                    cursor={false}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Bar
                    dataKey="nuevas"
                    fill={GREEN_COLOR}
                    radius={[4, 4, 0, 0]}
                    onMouseEnter={(data, index, e) => {
                      const target = e.target as SVGElement;
                      target.style.transform = 'scaleY(1.05)';
                      target.style.transformOrigin = 'bottom';
                      target.style.transition = 'transform 0.2s ease';
                    }}
                    onMouseLeave={(data, index, e) => {
                      const target = e.target as SVGElement;
                      target.style.transform = 'scaleY(1)';
                    }}
                  />
                  <Bar
                    dataKey="renovaciones"
                    fill={BLUE_COLOR}
                    radius={[4, 4, 0, 0]}
                    onMouseEnter={(data, index, e) => {
                      const target = e.target as SVGElement;
                      target.style.transform = 'scaleY(1.05)';
                      target.style.transformOrigin = 'bottom';
                      target.style.transition = 'transform 0.2s ease';
                    }}
                    onMouseLeave={(data, index, e) => {
                      const target = e.target as SVGElement;
                      target.style.transform = 'scaleY(1)';
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Planes más vendidos" subtitle="Ranking de popularidad">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={planesTop || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="#FFFFFF" />
                  <YAxis dataKey="plan" type="category" stroke="#FFFFFF" />
                  <Tooltip
                    cursor={false}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Bar
                    dataKey="ventas"
                    fill={GREEN_COLOR}
                    radius={[0, 4, 4, 0]}
                    onMouseEnter={(data, index, e) => {
                      const target = e.target as SVGElement;
                      target.style.transform = 'scaleX(1.05)';
                      target.style.transformOrigin = 'left';
                      target.style.transition = 'transform 0.2s ease';
                    }}
                    onMouseLeave={(data, index, e) => {
                      const target = e.target as SVGElement;
                      target.style.transform = 'scaleX(1)';
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Section C - Ingresos */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-foreground mb-4">Ingresos</h2>
        <div className="grid grid-cols-1 gap-6">
          <ChartCard title="Ingresos por mes" subtitle="Evolución de ingresos mensuales">
            <div className="h-64 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ingresosPorMes || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" stroke="#FFFFFF" />
                  <YAxis stroke="#FFFFFF" />
                  <Tooltip
                    cursor={false}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Bar
                    dataKey="ingresos"
                    fill={GREEN_COLOR}
                    radius={[4, 4, 0, 0]}
                    onMouseEnter={(data, index, e) => {
                      const target = e.target as SVGElement;
                      target.style.transform = 'scaleY(1.05)';
                      target.style.transformOrigin = 'bottom';
                      target.style.transition = 'transform 0.2s ease';
                    }}
                    onMouseLeave={(data, index, e) => {
                      const target = e.target as SVGElement;
                      target.style.transform = 'scaleY(1)';
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Summary Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Ingresos Totales</p>
                <p className="text-2xl font-bold text-primary">${resumenIngresos?.ingresos_totales?.toFixed(1) || 0}M</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Ticket Promedio</p>
                <p className="text-2xl font-bold text-foreground">${resumenIngresos?.ticket_promedio?.toFixed(1) || 0}K</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Ingresos por Cliente</p>
                <p className="text-2xl font-bold text-foreground">${resumenIngresos?.ingresos_por_cliente?.toFixed(1) || 0}K</p>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Section D - Cupones & Referidos */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-foreground mb-4">Cupones & Referidos</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Ingresos generados por cupones" subtitle="Distribución por nicho">
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ingresosPorCupon || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ nicho, percent }) => `${nicho} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="ingresos"
                  >
                    {(ingresosPorCupon || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={GREEN_BLUE_COLORS[index % GREEN_BLUE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    cursor={false}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Impacto de referidos" subtitle="Métricas de programa de referidos">
            <div className="space-y-4">
              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Clientes por Referidos</p>
                <p className="text-3xl font-bold text-primary">{referidosImpacto?.clientes_referidos || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {referidosImpacto?.porcentaje?.toFixed(1) || 0}% del total de clientes
                </p>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Meses Gratis Entregados</p>
                <p className="text-3xl font-bold text-foreground">{referidosImpacto?.meses_gratis || 0}</p>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Ratio de Conversión</p>
                <p className="text-3xl font-bold text-foreground">{referidosImpacto?.ratio_conversion?.toFixed(1) || 0}%</p>
                <p className="text-xs text-muted-foreground mt-1">De referidos que completan registro</p>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Export Section */}
      <ChartCard title="Exportar datos" subtitle="Descarga reportes en diferentes formatos">
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={exportToCSV}
            disabled={isExporting}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <FileText className="h-4 w-4" />
            {isExporting ? "Exportando..." : "Exportar CSV"}
          </Button>
          <Button
            onClick={exportToPDF}
            disabled={isExporting}
            variant="outline"
            className="gap-2 bg-transparent"
          >
            <FileDown className="h-4 w-4" />
            {isExporting ? "Exportando..." : "Exportar PDF"}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Los reportes se exportarán según el período de tiempo seleccionado.
        </p>
      </ChartCard>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
