import api from '@/lib/api'

export interface ClientesActivosStats {
  total: number
  cambio_porcentual: number
}

const BASE_PATH = '/api/dashboard'

export const dashboardService = {
  getClientesActivos: async (): Promise<ClientesActivosStats> => {
    const response = await api.get<ClientesActivosStats>(`${BASE_PATH}/clientes-activos`)
    return response.data
  }
}
