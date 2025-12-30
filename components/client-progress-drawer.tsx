"use client"

import { useState, useEffect } from "react"
import { X, TrendingUp, TrendingDown, Scale, Calendar, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Usuario, HistorialPeso } from "@/types"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, BarChart, Bar } from "recharts"

type BodyZone = 'brazos' | 'pecho' | 'cintura' | 'cadera' | 'piernas' | null

interface ClientProgressDrawerProps {
  isOpen: boolean
  onClose: () => void
  usuario: Usuario | null
}

export function ClientProgressDrawer({ isOpen, onClose, usuario }: ClientProgressDrawerProps) {
  const [historial, setHistorial] = useState<HistorialPeso[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedZone, setSelectedZone] = useState<BodyZone>(null)

  useEffect(() => {
    if (isOpen && usuario) {
      fetchHistorial()
    }
  }, [isOpen, usuario])

  const fetchHistorial = async () => {
    if (!usuario) return

    setIsLoading(true)
    setError("")

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${API_URL}/api/historial-peso/${usuario.id}`)

      if (!response.ok) {
        throw new Error("Error al cargar el historial")
      }

      const data = await response.json()
      setHistorial(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar el historial")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !usuario) return null

  // Calcular estadísticas
  const pesoInicial = usuario.peso_inicial || (historial.length > 0 ? historial[historial.length - 1].peso : 0)
  const pesoActual = usuario.peso_actual || (historial.length > 0 ? historial[0].peso : 0)
  const diferenciaPeso = pesoActual - pesoInicial
  const porcentajeCambio = pesoInicial > 0 ? ((diferenciaPeso / pesoInicial) * 100) : 0

  // Evaluar si está en dirección correcta según objetivo
  const evaluarObjetivo = () => {
    const objetivo = usuario.objetivo?.toLowerCase() || ""
    if (objetivo === "subir" || objetivo === "subir de peso") {
      return pesoActual > pesoInicial
    } else if (objetivo === "bajar" || objetivo === "bajar de peso") {
      return pesoActual < pesoInicial
    } else if (objetivo === "mantener" || objetivo === "mantener peso") {
      return Math.abs(diferenciaPeso) <= 2
    }
    return null // No hay objetivo definido
  }

  const direccionCorrecta = evaluarObjetivo()

  // Calcular tendencia (últimos 2-3 pesajes)
  const calcularTendencia = () => {
    if (historial.length < 2) return null

    const ultimosPesajes = historial.slice(0, 3) // Los 3 más recientes
    if (ultimosPesajes.length < 2) return null

    // Comparar el más reciente con el promedio de los anteriores
    const pesoMasReciente = ultimosPesajes[0].peso
    const pesosAnteriores = ultimosPesajes.slice(1)
    const promedioAnterior = pesosAnteriores.reduce((sum, p) => sum + p.peso, 0) / pesosAnteriores.length

    const diferencia = pesoMasReciente - promedioAnterior

    if (diferencia > 0.5) return "subiendo" // Subiendo
    if (diferencia < -0.5) return "bajando" // Bajando
    return "estable" // Se mantiene
  }

  const tendencia = calcularTendencia()

  // Preparar datos para la gráfica (invertir para mostrar del más antiguo al más reciente)
  const chartData = historial.slice().reverse().map(registro => ({
    fecha: new Date(registro.fecha_pesaje).toLocaleDateString("es-CO", {
      month: 'short',
      day: 'numeric'
    }),
    peso: registro.peso,
    brazos: registro.circunferencia_brazos,
    pecho: registro.circunferencia_pecho,
    cintura: registro.circunferencia_cintura,
    cadera: registro.circunferencia_cadera,
    piernas: registro.circunferencia_piernas,
  }))

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Centrado */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-6xl -translate-x-1/2 -translate-y-1/2 p-4 max-h-[90vh] overflow-y-auto">
        <Card className="bg-card border-border p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">Progreso del Cliente</h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {usuario.nombre} {usuario.apellido}
                </span>
                {usuario.objetivo && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">
                      Objetivo: {usuario.objetivo}
                    </span>
                  </>
                )}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Cargando historial...</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          ) : historial.length === 0 ? (
            <div className="text-center py-12">
              <Scale className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No hay registros de peso para este cliente</p>
              <p className="text-sm text-muted-foreground mt-2">
                Usa el botón "Pesar" para agregar el primer registro
              </p>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Peso Inicial */}
                <div className="bg-secondary/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Peso Inicial</p>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-foreground">{pesoInicial.toFixed(1)} kg</p>
                    <Scale className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>

                {/* Peso Actual */}
                <div className="bg-secondary/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Peso Actual</p>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-foreground">{pesoActual.toFixed(1)} kg</p>
                    <Scale className="h-6 w-6 text-primary" />
                  </div>
                </div>

                {/* Diferencia */}
                <div className="bg-secondary/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Cambio Total</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-foreground">
                          {diferenciaPeso > 0 ? '+' : ''}{diferenciaPeso.toFixed(1)} kg
                        </p>
                        {diferenciaPeso > 0 ? (
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        ) : diferenciaPeso < 0 ? (
                          <TrendingDown className="h-5 w-5 text-orange-600" />
                        ) : null}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {porcentajeCambio > 0 ? '+' : ''}{porcentajeCambio.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Análisis de Progreso - Visualizaciones Gráficas */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Análisis de Progreso
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Gráfica 1: Diferencia de Peso */}
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-4 border border-primary/20">
                    <p className="text-sm font-medium text-foreground mb-3 text-center">Diferencia de Peso</p>
                    <div className="flex flex-col items-center">
                      <ResponsiveContainer width="100%" height={120}>
                        <BarChart data={[
                          { name: 'Inicial', value: pesoInicial },
                          { name: 'Actual', value: pesoActual }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#2A2B35" vertical={false} />
                          <XAxis
                            dataKey="name"
                            stroke="#9CA3AF"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            stroke="#9CA3AF"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            domain={['dataMin - 5', 'dataMax + 5']}
                          />
                          <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{
                              backgroundColor: "#0A0B12",
                              border: "1px solid #2A2B35",
                              borderRadius: "8px",
                            }}
                            labelStyle={{ color: "#E5E5E5" }}
                            formatter={(value: number) => [`${value.toFixed(1)} kg`, 'Peso']}
                          />
                          <Bar dataKey="value" fill="#a4ff1a" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="mt-3 text-center">
                        <p className="text-2xl font-bold text-foreground">
                          {diferenciaPeso > 0 ? '+' : ''}{diferenciaPeso.toFixed(1)} kg
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {diferenciaPeso > 0 ? "Ganados" : diferenciaPeso < 0 ? "Perdidos" : "Sin cambio"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Gráfica 2: Dirección según Objetivo */}
                  {usuario.objetivo && direccionCorrecta !== null && (
                    <div className={`rounded-lg p-4 border ${direccionCorrecta ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                      <p className="text-sm font-medium text-foreground mb-3 text-center">
                        Objetivo: {usuario.objetivo}
                      </p>
                      <div className="flex flex-col items-center justify-center h-[120px]">
                        <ResponsiveContainer width="100%" height={100}>
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Progreso', value: direccionCorrecta ? 100 : 0 },
                                { name: 'Restante', value: direccionCorrecta ? 0 : 100 }
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={30}
                              outerRadius={45}
                              startAngle={90}
                              endAngle={-270}
                              dataKey="value"
                            >
                              <Cell fill={direccionCorrecta ? "#a4ff1a" : "#ef4444"} />
                              <Cell fill="#2A2B35" />
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute flex items-center justify-center">
                          <span className="text-4xl">{direccionCorrecta ? "✅" : "❌"}</span>
                        </div>
                      </div>
                      <div className="mt-3 text-center">
                        <p className={`text-sm font-semibold ${direccionCorrecta ? 'text-green-600' : 'text-red-600'}`}>
                          {direccionCorrecta ? "Dirección correcta" : "Fuera de dirección"}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Gráfica 3: Tendencia Reciente */}
                  {tendencia && (
                    <div className={`rounded-lg p-4 border ${
                      tendencia === "subiendo" ? 'bg-green-500/10 border-green-500/30' :
                      tendencia === "bajando" ? 'bg-orange-500/10 border-orange-500/30' :
                      'bg-blue-500/10 border-blue-500/30'
                    }`}>
                      <p className="text-sm font-medium text-foreground mb-3 text-center">
                        Tendencia Reciente
                      </p>
                      <div className="flex flex-col items-center">
                        <ResponsiveContainer width="100%" height={120}>
                          <LineChart data={historial.slice(0, 3).reverse().map((h, idx) => ({
                            name: `P${idx + 1}`,
                            peso: h.peso
                          }))}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                            <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} domain={['dataMin - 2', 'dataMax + 2']} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "0.5rem",
                                fontSize: "12px"
                              }}
                              formatter={(value: number) => [`${value.toFixed(1)} kg`, 'Peso']}
                            />
                            <Line
                              type="monotone"
                              dataKey="peso"
                              stroke={
                                tendencia === "subiendo" ? "#22c55e" :
                                tendencia === "bajando" ? "#f97316" :
                                "#3b82f6"
                              }
                              strokeWidth={3}
                              dot={{ fill: "hsl(var(--background))", strokeWidth: 2, r: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                        <div className="mt-3 text-center flex items-center gap-2 justify-center">
                          <span className="text-3xl">
                            {tendencia === "subiendo" && "↗️"}
                            {tendencia === "bajando" && "↘️"}
                            {tendencia === "estable" && "→"}
                          </span>
                          <p className={`text-sm font-semibold ${
                            tendencia === "subiendo" ? 'text-green-600' :
                            tendencia === "bajando" ? 'text-orange-600' :
                            'text-blue-600'
                          }`}>
                            {tendencia === "subiendo" && "En aumento"}
                            {tendencia === "bajando" && "En descenso"}
                            {tendencia === "estable" && "Estable"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Visualización Anatómica Interactiva */}
              {chartData.some(d => d.brazos || d.pecho || d.cintura || d.cadera || d.piernas) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Análisis Corporal Interactivo
                  </h3>
                  <div className={`grid gap-6 transition-all duration-1500 ease-in-out ${selectedZone ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                    {/* Hombre de Vitruvio */}
                    <div className={`bg-secondary/30 rounded-lg p-6 flex items-center justify-center transition-all duration-1500 ease-in-out ${selectedZone ? '' : 'mx-auto max-w-4xl'}`}>
                      <div className="relative w-full transition-all duration-1500 ease-in-out">
                        <img
                          src="/vitruvio.svg"
                          alt="Hombre de Vitruvio"
                          className={`w-full h-auto mx-auto transition-all duration-1500 ease-in-out ${selectedZone ? 'max-w-md' : 'max-w-2xl'}`}
                        />
                        {/* Zonas Interactivas */}
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                          {/* Brazos */}
                          <rect
                            x="13" y="23" width="22" height="16"
                            className="cursor-pointer hover:fill-blue-500/30 transition-all"
                            fill={selectedZone === 'brazos' ? 'rgba(59, 130, 246, 0.3)' : 'transparent'}
                            rx="4"
                            onClick={() => setSelectedZone(selectedZone === 'brazos' ? null : 'brazos')}
                          />
                          <rect
                            x="65" y="23" width="22" height="16"
                            className="cursor-pointer hover:fill-blue-500/30 transition-all"
                            fill={selectedZone === 'brazos' ? 'rgba(59, 130, 246, 0.3)' : 'transparent'}
                            rx="4"
                            onClick={() => setSelectedZone(selectedZone === 'brazos' ? null : 'brazos')}
                          />
                          {/* Pecho */}
                          <rect
                            x="35" y="28" width="30" height="15"
                            className="cursor-pointer hover:fill-green-500/30 transition-all"
                            fill={selectedZone === 'pecho' ? 'rgba(34, 197, 94, 0.3)' : 'transparent'}
                            rx="4"
                            onClick={() => setSelectedZone(selectedZone === 'pecho' ? null : 'pecho')}
                          />
                          {/* Cintura */}
                          <rect
                            x="38" y="44" width="24" height="12"
                            className="cursor-pointer hover:fill-yellow-500/30 transition-all"
                            fill={selectedZone === 'cintura' ? 'rgba(234, 179, 8, 0.3)' : 'transparent'}
                            rx="4"
                            onClick={() => setSelectedZone(selectedZone === 'cintura' ? null : 'cintura')}
                          />
                          {/* Cadera */}
                          <rect
                            x="36" y="54" width="28" height="10"
                            className="cursor-pointer hover:fill-red-500/30 transition-all"
                            fill={selectedZone === 'cadera' ? 'rgba(239, 68, 68, 0.3)' : 'transparent'}
                            rx="4"
                            onClick={() => setSelectedZone(selectedZone === 'cadera' ? null : 'cadera')}
                          />
                          {/* Piernas */}
                          <rect
                            x="30" y="66" width="40" height="28"
                            className="cursor-pointer hover:fill-purple-500/30 transition-all"
                            fill={selectedZone === 'piernas' ? 'rgba(168, 85, 247, 0.3)' : 'transparent'}
                            rx="4"
                            onClick={() => setSelectedZone(selectedZone === 'piernas' ? null : 'piernas')}
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Panel Lateral con Información - Solo aparece si hay zona seleccionada */}
                    {selectedZone && (
                    <div
                      key={selectedZone}
                      className="bg-secondary/30 rounded-lg p-6 overflow-hidden opacity-0"
                      style={{ animation: 'fadeInSlideIn 1.5s ease-out 0.5s forwards' }}
                    >
                      <div className="space-y-6">
                          {/* Título de la zona */}
                          <div className="flex items-center justify-between">
                            <h4 className="text-xl font-bold text-foreground capitalize">
                              {selectedZone === 'cintura' ? 'Cintura' :
                               selectedZone === 'brazos' ? 'Brazos' :
                               selectedZone === 'pecho' ? 'Pecho' :
                               selectedZone === 'cadera' ? 'Cadera' : 'Piernas'}
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedZone(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          {(() => {
                            const zoneData = chartData.map(d => ({
                              fecha: d.fecha,
                              valor: selectedZone === 'brazos' ? d.brazos :
                                     selectedZone === 'pecho' ? d.pecho :
                                     selectedZone === 'cintura' ? d.cintura :
                                     selectedZone === 'cadera' ? d.cadera :
                                     d.piernas
                            })).filter(d => d.valor)

                            if (zoneData.length === 0) {
                              return (
                                <div className="text-center py-8">
                                  <p className="text-muted-foreground">No hay datos de medición para esta zona</p>
                                </div>
                              )
                            }

                            const valorInicial = zoneData[0]?.valor || 0
                            const valorActual = zoneData[zoneData.length - 1]?.valor || 0
                            const diferencia = valorActual - valorInicial
                            const porcentaje = valorInicial > 0 ? (diferencia / valorInicial) * 100 : 0

                            const zoneColor = selectedZone === 'brazos' ? '#3b82f6' :
                                            selectedZone === 'pecho' ? '#22c55e' :
                                            selectedZone === 'cintura' ? '#eab308' :
                                            selectedZone === 'cadera' ? '#ef4444' : '#a855f7'

                            return (
                              <>
                                {/* Medida Inicial vs Actual */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="bg-card/50 rounded-lg p-4 border border-border">
                                    <p className="text-xs text-muted-foreground mb-1">Medida Inicial</p>
                                    <p className="text-2xl font-bold text-foreground">{valorInicial.toFixed(1)}</p>
                                    <p className="text-xs text-muted-foreground">cm</p>
                                  </div>
                                  <div className="bg-card/50 rounded-lg p-4 border border-border">
                                    <p className="text-xs text-muted-foreground mb-1">Medida Actual</p>
                                    <p className="text-2xl font-bold text-foreground">{valorActual.toFixed(1)}</p>
                                    <p className="text-xs text-muted-foreground">cm</p>
                                  </div>
                                </div>

                                {/* Cambio Total */}
                                <div className="bg-card/50 rounded-lg p-4 border border-border">
                                  <p className="text-xs text-muted-foreground mb-2">Cambio Total</p>
                                  <div className="flex items-center gap-2">
                                    <p className="text-2xl font-bold text-foreground">
                                      {diferencia > 0 ? '+' : ''}{diferencia.toFixed(1)} cm
                                    </p>
                                    {diferencia !== 0 && (
                                      <span className={`text-sm font-medium ${diferencia > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                                        ({porcentaje > 0 ? '+' : ''}{porcentaje.toFixed(1)}%)
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Gráfica de Evolución */}
                                <div>
                                  <p className="text-sm font-medium text-foreground mb-3">Evolución Temporal</p>
                                  <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={zoneData}>
                                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                      <XAxis
                                        dataKey="fecha"
                                        stroke="hsl(var(--muted-foreground))"
                                        tick={{ fontSize: 10 }}
                                      />
                                      <YAxis
                                        stroke="hsl(var(--muted-foreground))"
                                        tick={{ fontSize: 10 }}
                                        domain={['dataMin - 2', 'dataMax + 2']}
                                      />
                                      <Tooltip
                                        contentStyle={{
                                          backgroundColor: "hsl(var(--card))",
                                          border: "1px solid hsl(var(--border))",
                                          borderRadius: "0.5rem",
                                          fontSize: "11px"
                                        }}
                                        formatter={(value: number) => [`${value.toFixed(1)} cm`, 'Medida']}
                                      />
                                      <Line
                                        type="monotone"
                                        dataKey="valor"
                                        stroke={zoneColor}
                                        strokeWidth={3}
                                        dot={{ fill: zoneColor, r: 4 }}
                                      />
                                    </LineChart>
                                  </ResponsiveContainer>
                                </div>

                                {/* Objetivo (si aplica) */}
                                {usuario.objetivo && (
                                  <div className="bg-card/50 rounded-lg p-4 border border-border">
                                    <p className="text-xs text-muted-foreground mb-2">Progreso según objetivo</p>
                                    <div className="flex items-center gap-2">
                                      {usuario.objetivo.toLowerCase().includes('subir') ? (
                                        diferencia > 0 ? (
                                          <>
                                            <span className="text-2xl">✅</span>
                                            <p className="text-sm font-medium text-green-600">Incremento positivo</p>
                                          </>
                                        ) : (
                                          <>
                                            <span className="text-2xl">⚠️</span>
                                            <p className="text-sm font-medium text-orange-600">Sin incremento</p>
                                          </>
                                        )
                                      ) : usuario.objetivo.toLowerCase().includes('bajar') ? (
                                        diferencia < 0 ? (
                                          <>
                                            <span className="text-2xl">✅</span>
                                            <p className="text-sm font-medium text-green-600">Reducción positiva</p>
                                          </>
                                        ) : (
                                          <>
                                            <span className="text-2xl">⚠️</span>
                                            <p className="text-sm font-medium text-orange-600">Sin reducción</p>
                                          </>
                                        )
                                      ) : (
                                        <>
                                          <span className="text-2xl">ℹ️</span>
                                          <p className="text-sm font-medium text-blue-600">
                                            Variación: {Math.abs(diferencia).toFixed(1)} cm
                                          </p>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </>
                            )
                          })()}
                      </div>
                    </div>
                    )}
                  </div>
                </div>
              )}

              {/* Gráfica de Peso */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Evolución del Peso</h3>
                <div className="bg-secondary/30 rounded-lg p-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2A2B35" vertical={false} />
                      <XAxis
                        dataKey="fecha"
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        domain={['dataMin - 2', 'dataMax + 2']}
                      />
                      <Tooltip
                        cursor={{ stroke: '#2A2B35', strokeWidth: 1 }}
                        contentStyle={{
                          backgroundColor: "#0A0B12",
                          border: "1px solid #2A2B35",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "#E5E5E5" }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="peso"
                        stroke="#a4ff1a"
                        strokeWidth={2}
                        name="Peso (kg)"
                        dot={{ fill: "#a4ff1a" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gráfica de Medidas Corporales */}
              {chartData.some(d => d.brazos || d.pecho || d.cintura || d.cadera || d.piernas) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Evolución de Medidas Corporales</h3>
                  <div className="bg-secondary/30 rounded-lg p-4">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2A2B35" vertical={false} />
                        <XAxis
                          dataKey="fecha"
                          stroke="#9CA3AF"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#9CA3AF"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          cursor={{ stroke: '#2A2B35', strokeWidth: 1 }}
                          contentStyle={{
                            backgroundColor: "#0A0B12",
                            border: "1px solid #2A2B35",
                            borderRadius: "8px",
                          }}
                          labelStyle={{ color: "#E5E5E5" }}
                        />
                        <Legend />
                        {chartData.some(d => d.brazos) && (
                          <Line
                            type="monotone"
                            dataKey="brazos"
                            stroke="#8884d8"
                            strokeWidth={2}
                            name="Brazos (cm)"
                          />
                        )}
                        {chartData.some(d => d.pecho) && (
                          <Line
                            type="monotone"
                            dataKey="pecho"
                            stroke="#82ca9d"
                            strokeWidth={2}
                            name="Pecho (cm)"
                          />
                        )}
                        {chartData.some(d => d.cintura) && (
                          <Line
                            type="monotone"
                            dataKey="cintura"
                            stroke="#ffc658"
                            strokeWidth={2}
                            name="Cintura (cm)"
                          />
                        )}
                        {chartData.some(d => d.cadera) && (
                          <Line
                            type="monotone"
                            dataKey="cadera"
                            stroke="#ff7c7c"
                            strokeWidth={2}
                            name="Cadera (cm)"
                          />
                        )}
                        {chartData.some(d => d.piernas) && (
                          <Line
                            type="monotone"
                            dataKey="piernas"
                            stroke="#a78bfa"
                            strokeWidth={2}
                            name="Piernas (cm)"
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Tabla de Historial */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Historial Detallado</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Fecha</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Peso (kg)</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Brazos (cm)</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Pecho (cm)</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Cintura (cm)</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Cadera (cm)</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Piernas (cm)</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Notas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historial.map((registro) => (
                        <tr key={registro.id} className="border-b border-border/50 hover:bg-secondary/30">
                          <td className="py-3 px-4 text-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              {new Date(registro.fecha_pesaje).toLocaleDateString("es-CO")}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-foreground font-medium">{registro.peso.toFixed(1)}</td>
                          <td className="py-3 px-4 text-foreground">{registro.circunferencia_brazos?.toFixed(1) || '-'}</td>
                          <td className="py-3 px-4 text-foreground">{registro.circunferencia_pecho?.toFixed(1) || '-'}</td>
                          <td className="py-3 px-4 text-foreground">{registro.circunferencia_cintura?.toFixed(1) || '-'}</td>
                          <td className="py-3 px-4 text-foreground">{registro.circunferencia_cadera?.toFixed(1) || '-'}</td>
                          <td className="py-3 px-4 text-foreground">{registro.circunferencia_piernas?.toFixed(1) || '-'}</td>
                          <td className="py-3 px-4 text-muted-foreground max-w-[200px] truncate">
                            {registro.notas || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </>
  )
}
