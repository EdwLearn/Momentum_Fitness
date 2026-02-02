import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000"

export interface ConfiguracionGimnasio {
  id: number
  nombre_gimnasio: string
  nit?: string
  direccion?: string
  telefono?: string
  email?: string
  horario_semana?: string
  horario_finde?: string
  instagram?: string
  facebook?: string
  tiktok?: string
  website?: string
  created_at: string
  updated_at?: string
}

export interface ConfiguracionGimnasioUpdate {
  nombre_gimnasio?: string
  nit?: string
  direccion?: string
  telefono?: string
  email?: string
  horario_semana?: string
  horario_finde?: string
  instagram?: string
  facebook?: string
  tiktok?: string
  website?: string
}

export const configuracionService = {
  // Obtener configuración
  async getConfiguracion(): Promise<ConfiguracionGimnasio> {
    const response = await axios.get(`${API_URL}/api/configuracion/`)
    return response.data
  },

  // Actualizar configuración
  async updateConfiguracion(data: ConfiguracionGimnasioUpdate): Promise<ConfiguracionGimnasio> {
    const response = await axios.put(`${API_URL}/api/configuracion/`, data)
    return response.data
  },
}
