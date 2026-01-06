"use client"

import { useState, useMemo } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { MetricCard } from "@/components/metric-card"
import { ChartCard } from "@/components/chart-card"
import { DataTable } from "@/components/data-table"
import { UserCheck, TrendingUp, UserX, Search, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { usuariosService } from "@/lib/services/usuarios"
import { useCreateAsistencia, useAsistenciasByFecha, usePromedioDiario, useUsuariosInactivos } from "@/lib/hooks/useAsistencia"
import { useUsuarios } from "@/lib/hooks/useUsuarios"
import { useMembresias } from "@/lib/hooks/useMembresias"
import { UsuarioBusqueda, Asistencia } from "@/types"
import { SuccessToast } from "@/components/success-toast"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"

export default function AsistenciaPage() {
  const [cedula, setCedula] = useState("")
  const [searchedUser, setSearchedUser] = useState<UsuarioBusqueda | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState("")
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  // Obtener fecha local en formato YYYY-MM-DD
  const getLocalDate = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const today = getLocalDate()
  const { data: asistenciasHoy } = useAsistenciasByFecha(today)
  const { data: usuarios } = useUsuarios()
  const { data: membresias } = useMembresias()
  const { data: promedioDiario } = usePromedioDiario()
  const { data: usuariosInactivos } = useUsuariosInactivos()
  const createAsistencia = useCreateAsistencia()

  // Debug logging
  console.log('🔍 Datos de asistencia cargados:', {
    asistenciasHoy: asistenciasHoy?.length || 0,
    usuarios: usuarios?.length || 0,
    membresias: membresias?.length || 0,
  })

  // Calcular métricas
  const asistenciasHoyCount = asistenciasHoy?.length || 0
  const promedioMensual = promedioDiario ?? 0
  const usuariosSinAsistir = usuariosInactivos?.length || 0

  // Agrupar asistencias por hora para la gráfica
  const hourlyData = useMemo(() => {
    if (!asistenciasHoy) return []

    // Crear array de horas de 6 AM a 10 PM
    const hours = Array.from({ length: 17 }, (_, i) => {
      const hour = i + 6 // Empieza en 6 AM
      return {
        hora: `${hour.toString().padStart(2, '0')}:00`,
        asistencias: 0,
      }
    })

    // Contar asistencias por hora
    asistenciasHoy.forEach((asistencia) => {
      const horaEntrada = asistencia.hora_entrada.split(':')[0] // Obtener solo la hora
      const hourIndex = parseInt(horaEntrada) - 6 // Índice relativo a 6 AM

      if (hourIndex >= 0 && hourIndex < hours.length) {
        hours[hourIndex].asistencias++
      }
    })

    return hours
  }, [asistenciasHoy])

  // Crear lookup map de usuarios
  const usuariosMap = useMemo(() => {
    if (!usuarios) return new Map()
    return new Map(usuarios.map(u => [u.id, u]))
  }, [usuarios])

  // Crear lookup map de membresías
  const membresiasMap = useMemo(() => {
    if (!membresias) return new Map()
    const map = new Map()
    membresias.forEach(m => {
      if (m.activo && m.estado === "activa") {
        map.set(m.usuario_id, m)
      }
    })
    return map
  }, [membresias])

  // Mapear nombres de planes
  const planMap: Record<string, string> = {
    "pase_diario": "Pase Diario",
    "pase_flex": "Pase Flex",
    "mensual": "Mensual",
    "plan_3_meses": "Plan 3 Meses",
    "plan_6_meses": "Plan 6 Meses",
    "elite_anual": "Elite Anual",
  }

  // Mapear asistencias para la tabla con datos reales
  const asistenciasData = useMemo(() => {
    if (!asistenciasHoy) return []

    return asistenciasHoy
      .map((asistencia: Asistencia) => {
        const usuario = usuariosMap.get(asistencia.usuario_id)
        const membresia = membresiasMap.get(asistencia.usuario_id)

        return {
          id: asistencia.id,
          fecha: `${asistencia.fecha.split('T')[0]} ${asistencia.hora_entrada}`,
          usuario: usuario ? `${usuario.nombre} ${usuario.apellido}` : "Desconocido",
          evento: asistencia.hora_salida ? "Salida" : "Entrada",
          tipoUsuario: usuario?.tipo || "Usuario",
          plan: membresia ? (planMap[membresia.tipo_plan] || membresia.tipo_plan) : "N/A",
        }
      })
      .sort((a, b) => b.id - a.id) // Ordenar por más reciente primero
      .slice(0, 20) // Mostrar últimas 20
  }, [asistenciasHoy, usuariosMap, membresiasMap])

  // Buscar usuario por cédula
  const handleSearchByCedula = async () => {
    if (!cedula.trim()) {
      setSearchError("Por favor ingrese una cédula")
      return
    }

    setIsSearching(true)
    setSearchError("")
    setSearchedUser(null)

    try {
      const user = await usuariosService.buscarPorCedula(cedula)
      setSearchedUser(user)
      setSearchError("")
    } catch (error: any) {
      setSearchError(error.response?.data?.detail || "Usuario no encontrado")
      setSearchedUser(null)
    } finally {
      setIsSearching(false)
    }
  }

  // Marcar entrada
  const handleMarcarEntrada = async () => {
    if (!searchedUser) return

    try {
      const now = new Date()
      const horaEntrada = now.toTimeString().split(' ')[0] // "HH:MM:SS"

      console.log('📤 Enviando asistencia:', { usuario_id: searchedUser.id, hora_entrada: horaEntrada })

      const result = await createAsistencia.mutateAsync({
        usuario_id: searchedUser.id,
        hora_entrada: horaEntrada,
      })

      console.log('✅ Asistencia creada exitosamente:', result)

      setSuccessMessage(`¡Entrada registrada! Bienvenido/a ${searchedUser.nombre} ${searchedUser.apellido}`)
      setShowSuccessToast(true)

      // Limpiar formulario
      setCedula("")
      setSearchedUser(null)
      setSearchError("")
    } catch (error: any) {
      console.error('❌ Error al crear asistencia:', error)
      console.error('Response:', error.response)

      const errorMsg = error.response?.data?.detail || "Error al registrar entrada"

      if (errorMsg.includes("membresía activa")) {
        setSearchError("Este usuario no tiene una membresía activa")
      } else if (errorMsg.includes("ya tiene asistencia registrada")) {
        setSearchError("Este usuario ya registró su entrada el día de hoy")
      } else {
        setSearchError(errorMsg)
      }
    }
  }

  // Handler para Enter en el input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchByCedula()
    }
  }

  const attendanceColumns = [
    { key: "fecha", header: "Fecha & Hora" },
    { key: "usuario", header: "Usuario" },
    { key: "plan", header: "Plan Vigente" },
  ]

  return (
    <DashboardLayout title="Panel de Asistencia" subtitle="Control y monitoreo de asistencias en tiempo real">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <MetricCard title="Asistencias Hoy" value={asistenciasHoyCount} icon={UserCheck} />
        <MetricCard title="Promedio Diario (30 días)" value={promedioMensual} icon={TrendingUp} />
        <MetricCard title="Sin asistir (+4 días)" value={usuariosSinAsistir} variant="warning" icon={UserX} />
      </div>

      {/* Check-in Section */}
      <Card className="mb-6 border-border bg-card">
        <CardHeader>
          <CardTitle className="text-xl">Marcar Asistencia</CardTitle>
          <CardDescription>Ingrese la cédula del usuario para registrar su entrada</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Número de cédula"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-9 bg-secondary border-border"
                disabled={isSearching}
              />
            </div>
            <Button
              onClick={handleSearchByCedula}
              disabled={isSearching || !cedula.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Buscando...
                </>
              ) : (
                "Buscar"
              )}
            </Button>
          </div>

          {/* Error Message */}
          {searchError && (
            <div className="flex items-center gap-2 text-yellow-500 text-sm mb-4">
              <AlertCircle className="h-4 w-4" />
              <span>{searchError}</span>
            </div>
          )}

          {/* User Confirmation Card */}
          {searchedUser && !searchError && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                      <UserCheck className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold">
                          {searchedUser.nombre} {searchedUser.apellido}
                        </h3>
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground">Cédula: {searchedUser.telefono}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Hora: {new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleMarcarEntrada}
                    disabled={createAsistencia.isPending}
                    className="bg-primary hover:bg-primary/90"
                    size="lg"
                  >
                    {createAsistencia.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registrando...
                      </>
                    ) : (
                      "Marcar Entrada"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Hourly Attendance Chart */}
      <ChartCard
        title="Asistencia por Hora del Día"
        subtitle="Distribución de asistencias a lo largo del día"
        className="mb-6"
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData}>
              <defs>
                <linearGradient id="colorAsistencias" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A4FF1A" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#A4FF1A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2B35" vertical={false} />
              <XAxis dataKey="hora" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0A0B12",
                  border: "1px solid #2A2B35",
                  borderRadius: "8px",
                  color: "#E5E5E5",
                }}
              />
              <Area
                type="monotone"
                dataKey="asistencias"
                stroke="#A4FF1A"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorAsistencias)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Recent Attendance Table */}
      <ChartCard title="Últimas Asistencias de Hoy" subtitle={`${asistenciasHoyCount} registros totales (mostrando últimos 20)`}>
        <DataTable columns={attendanceColumns} data={asistenciasData} />
      </ChartCard>

      {/* Success Toast */}
      <SuccessToast
        isVisible={showSuccessToast}
        message={successMessage}
        onClose={() => setShowSuccessToast(false)}
      />
    </DashboardLayout>
  )
}
