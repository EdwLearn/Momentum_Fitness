import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/lib/services/dashboard'

export const useDashboard = () => {
  const {
    data: clientesActivosStats,
    isLoading: isLoadingClientesActivos,
    error: errorClientesActivos,
    refetch: refetchClientesActivos
  } = useQuery({
    queryKey: ['dashboard', 'clientes-activos'],
    queryFn: dashboardService.getClientesActivos,
    refetchInterval: 30000, // Actualizar cada 30 segundos
  })

  const {
    data: asistenciasHoyStats,
    isLoading: isLoadingAsistenciasHoy,
    error: errorAsistenciasHoy,
    refetch: refetchAsistenciasHoy
  } = useQuery({
    queryKey: ['dashboard', 'asistencias-hoy'],
    queryFn: dashboardService.getAsistenciasHoy,
    refetchInterval: 30000, // Actualizar cada 30 segundos
  })

  const {
    data: planesPorVencerStats,
    isLoading: isLoadingPlanesPorVencer,
    error: errorPlanesPorVencer,
    refetch: refetchPlanesPorVencer
  } = useQuery({
    queryKey: ['dashboard', 'planes-por-vencer'],
    queryFn: dashboardService.getPlanesPorVencer,
    refetchInterval: 30000, // Actualizar cada 30 segundos
  })

  const {
    data: ingresosMesStats,
    isLoading: isLoadingIngresosMes,
    error: errorIngresosMes,
    refetch: refetchIngresosMes
  } = useQuery({
    queryKey: ['dashboard', 'ingresos-mes'],
    queryFn: dashboardService.getIngresosMes,
    refetchInterval: 30000, // Actualizar cada 30 segundos
  })

  const {
    data: asistenciaSemanal,
    isLoading: isLoadingAsistenciaSemanal,
    error: errorAsistenciaSemanal,
    refetch: refetchAsistenciaSemanal
  } = useQuery({
    queryKey: ['dashboard', 'asistencia-semanal'],
    queryFn: dashboardService.getAsistenciaSemanal,
    refetchInterval: 30000, // Actualizar cada 30 segundos
  })

  const {
    data: distribucionPlanes,
    isLoading: isLoadingDistribucionPlanes,
    error: errorDistribucionPlanes,
    refetch: refetchDistribucionPlanes
  } = useQuery({
    queryKey: ['dashboard', 'distribucion-planes'],
    queryFn: dashboardService.getDistribucionPlanes,
    refetchInterval: 30000, // Actualizar cada 30 segundos
  })

  return {
    clientesActivosStats,
    isLoadingClientesActivos,
    errorClientesActivos,
    refetchClientesActivos,
    asistenciasHoyStats,
    isLoadingAsistenciasHoy,
    errorAsistenciasHoy,
    refetchAsistenciasHoy,
    planesPorVencerStats,
    isLoadingPlanesPorVencer,
    errorPlanesPorVencer,
    refetchPlanesPorVencer,
    ingresosMesStats,
    isLoadingIngresosMes,
    errorIngresosMes,
    refetchIngresosMes,
    asistenciaSemanal,
    isLoadingAsistenciaSemanal,
    errorAsistenciaSemanal,
    refetchAsistenciaSemanal,
    distribucionPlanes,
    isLoadingDistribucionPlanes,
    errorDistribucionPlanes,
    refetchDistribucionPlanes
  }
}
