import api from '@/lib/api'

export interface ClientesActivosStats {
  total: number
  cambio_porcentual: number
}

export interface AsistenciasHoyStats {
  total: number
  cambio_porcentual: number
}

export interface PlanesPorVencerStats {
  total: number
}

export interface IngresosMesStats {
  total: number
  cambio_porcentual: number
}

export interface AsistenciaSemanalItem {
  day: string
  asistencias: number
}

export interface PlanDistributionItem {
  name: string
  value: number
  color: string
}

export interface ProximaRenovacionItem {
  id: number
  cliente: string
  plan: string
  fecha_fin: string
  estado: string
}

export interface HistorialClienteStats {
  total_dias_activo: number
  fecha_primera_inscripcion: string
  membresias: Array<{
    id: number
    tipo_plan: string
    estado: string
    fecha_inicio: string
    fecha_fin: string
    duracion_dias: number
    precio: number
  }>
}

const BASE_PATH = '/api/dashboard'

export const dashboardService = {
  getClientesActivos: async (): Promise<ClientesActivosStats> => {
    const response = await api.get<ClientesActivosStats>(`${BASE_PATH}/clientes-activos`)
    return response.data
  },

  getAsistenciasHoy: async (): Promise<AsistenciasHoyStats> => {
    const response = await api.get<AsistenciasHoyStats>(`${BASE_PATH}/asistencias-hoy`)
    return response.data
  },

  getPlanesPorVencer: async (): Promise<PlanesPorVencerStats> => {
    const response = await api.get<PlanesPorVencerStats>(`${BASE_PATH}/planes-por-vencer`)
    return response.data
  },

  getIngresosMes: async (): Promise<IngresosMesStats> => {
    const response = await api.get<IngresosMesStats>(`${BASE_PATH}/ingresos-mes`)
    return response.data
  },

  getAsistenciaSemanal: async (): Promise<AsistenciaSemanalItem[]> => {
    const response = await api.get<AsistenciaSemanalItem[]>(`${BASE_PATH}/asistencia-semanal`)
    return response.data
  },

  getDistribucionPlanes: async (): Promise<PlanDistributionItem[]> => {
    const response = await api.get<PlanDistributionItem[]>(`${BASE_PATH}/distribucion-planes`)
    return response.data
  },

  getProximasRenovaciones: async (): Promise<ProximaRenovacionItem[]> => {
    const response = await api.get<ProximaRenovacionItem[]>(`${BASE_PATH}/proximas-renovaciones`)
    return response.data
  },

  getHistorialCliente: async (clienteId: number): Promise<HistorialClienteStats> => {
    const response = await api.get<HistorialClienteStats>(`${BASE_PATH}/clientes/${clienteId}/historial`)
    return response.data
  }
}
