import api from '@/lib/api';
import { Referido, ReferidoCreate, ReferidoUpdate, ReferidoDetallado, ReferidoStats } from '@/types';

const BASE_PATH = '/api/referidos';

export const referidosService = {
  /**
   * Obtener todos los referidos con filtros opcionales
   */
  getAll: async (params?: {
    skip?: number;
    limit?: number;
    referidor_id?: number;
    referido_id?: number;
    cumple_condicion?: boolean;
  }): Promise<Referido[]> => {
    const response = await api.get<Referido[]>(`${BASE_PATH}/`, { params });
    return response.data;
  },

  /**
   * Obtener referidos con información detallada
   */
  getDetallados: async (params?: {
    skip?: number;
    limit?: number;
  }): Promise<ReferidoDetallado[]> => {
    const response = await api.get<ReferidoDetallado[]>(`${BASE_PATH}/detallados`, { params });
    return response.data;
  },

  /**
   * Obtener estadísticas del programa de referidos
   */
  getStats: async (): Promise<ReferidoStats> => {
    const response = await api.get<ReferidoStats>(`${BASE_PATH}/stats`);
    return response.data;
  },

  /**
   * Obtener un referido por ID
   */
  getById: async (id: number): Promise<Referido> => {
    const response = await api.get<Referido>(`${BASE_PATH}/${id}`);
    return response.data;
  },

  /**
   * Obtener referidos hechos por un usuario
   */
  getReferidosPorUsuario: async (usuarioId: number, params?: {
    skip?: number;
    limit?: number;
  }): Promise<Referido[]> => {
    const response = await api.get<Referido[]>(
      `${BASE_PATH}/usuario/${usuarioId}/referidos-hechos`,
      { params }
    );
    return response.data;
  },

  /**
   * Contar referidos activos de un usuario
   */
  contarActivos: async (usuarioId: number): Promise<{ usuario_id: number; referidos_activos: number }> => {
    const response = await api.get<{ usuario_id: number; referidos_activos: number }>(
      `${BASE_PATH}/usuario/${usuarioId}/conteo-activos`
    );
    return response.data;
  },

  /**
   * Crear un nuevo referido
   */
  create: async (data: ReferidoCreate): Promise<Referido> => {
    const response = await api.post<Referido>(`${BASE_PATH}/`, data);
    return response.data;
  },

  /**
   * Actualizar un referido existente
   */
  update: async (id: number, data: ReferidoUpdate): Promise<Referido> => {
    const response = await api.put<Referido>(`${BASE_PATH}/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar un referido
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`${BASE_PATH}/${id}`);
  },

  /**
   * Activar beneficio para un referido
   */
  activarBeneficio: async (id: number, tipoBeneficio: string): Promise<Referido> => {
    const response = await api.post<Referido>(
      `${BASE_PATH}/${id}/activar`,
      null,
      { params: { tipo_beneficio: tipoBeneficio } }
    );
    return response.data;
  },

  /**
   * Verificar si el referido cumple la condición
   */
  verificarCondicion: async (id: number): Promise<{ referido_id: number; cumple_condicion: boolean }> => {
    const response = await api.get<{ referido_id: number; cumple_condicion: boolean }>(
      `${BASE_PATH}/${id}/verificar-condicion`
    );
    return response.data;
  },
};
