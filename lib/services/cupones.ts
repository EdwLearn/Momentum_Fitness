import api from '@/lib/api';
import { Cupon, CuponCreate, CuponUpdate, CuponStats } from '@/types';

const BASE_PATH = '/api/cupones';

export const cuponesService = {
  /**
   * Obtener todos los cupones con filtros opcionales
   */
  getAll: async (params?: {
    skip?: number;
    limit?: number;
    nicho?: string;
    activo?: boolean;
    search?: string;
  }): Promise<Cupon[]> => {
    const response = await api.get<Cupon[]>(`${BASE_PATH}/`, { params });
    return response.data;
  },

  /**
   * Obtener estadísticas de cupones
   */
  getStats: async (): Promise<CuponStats> => {
    const response = await api.get<CuponStats>(`${BASE_PATH}/stats`);
    return response.data;
  },

  /**
   * Obtener un cupón por ID
   */
  getById: async (id: number): Promise<Cupon> => {
    const response = await api.get<Cupon>(`${BASE_PATH}/${id}`);
    return response.data;
  },

  /**
   * Obtener un cupón por código
   */
  getByCodigo: async (codigo: string): Promise<Cupon> => {
    const response = await api.get<Cupon>(`${BASE_PATH}/codigo/${codigo}`);
    return response.data;
  },

  /**
   * Crear un nuevo cupón
   */
  create: async (data: CuponCreate): Promise<Cupon> => {
    const response = await api.post<Cupon>(`${BASE_PATH}/`, data);
    return response.data;
  },

  /**
   * Actualizar un cupón existente
   */
  update: async (id: number, data: CuponUpdate): Promise<Cupon> => {
    const response = await api.put<Cupon>(`${BASE_PATH}/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar un cupón
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`${BASE_PATH}/${id}`);
  },

  /**
   * Alternar estado activo/inactivo de un cupón
   */
  toggleActivo: async (id: number): Promise<Cupon> => {
    const response = await api.post<Cupon>(`${BASE_PATH}/${id}/toggle`);
    return response.data;
  },

  /**
   * Aplicar un cupón (verificar validez e incrementar contador)
   */
  aplicar: async (codigo: string): Promise<Cupon> => {
    const response = await api.post<Cupon>(`${BASE_PATH}/aplicar/${codigo}`);
    return response.data;
  },

  /**
   * Resetear contadores anuales de todos los cupones
   */
  resetUsos: async (): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(`${BASE_PATH}/reset-anuales`);
    return response.data;
  },
};
