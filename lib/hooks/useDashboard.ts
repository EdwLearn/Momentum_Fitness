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

  return {
    clientesActivosStats,
    isLoadingClientesActivos,
    errorClientesActivos,
    refetchClientesActivos
  }
}
