import api from "@/lib/api"
import type { MovimientoFinanciero, MovimientoCreate, ResumenFinanciero } from "@/types"

const BASE_PATH = "/api/contabilidad"

export const contabilidadService = {
  getMovimientos: async (tipo?: string, categoria?: string): Promise<MovimientoFinanciero[]> => {
    const params: Record<string, string> = {}
    if (tipo) params.tipo = tipo
    if (categoria) params.categoria = categoria
    const { data } = await api.get(`${BASE_PATH}/`, { params })
    return data
  },

  getResumen: async (): Promise<ResumenFinanciero> => {
    const { data } = await api.get(`${BASE_PATH}/resumen`)
    return data
  },

  createMovimiento: async (movimiento: MovimientoCreate): Promise<MovimientoFinanciero> => {
    const { data } = await api.post(`${BASE_PATH}/`, movimiento)
    return data
  },

  deleteMovimiento: async (id: number): Promise<void> => {
    await api.delete(`${BASE_PATH}/${id}`)
  },
}
