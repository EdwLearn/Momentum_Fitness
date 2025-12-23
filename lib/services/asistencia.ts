import api from '@/lib/api';
import { Asistencia, AsistenciaCreate, AsistenciaUpdate } from '@/types';

const BASE_PATH = '/api/asistencia';

export const asistenciaService = {
  /**
   * Obtener todas las asistencias
   */
  getAll: async (skip = 0, limit = 100): Promise<Asistencia[]> => {
    const response = await api.get<Asistencia[]>(BASE_PATH, {
      params: { skip, limit },
    });
    return response.data;
  },

  /**
   * Obtener una asistencia por ID
   */
  getById: async (id: number): Promise<Asistencia> => {
    const response = await api.get<Asistencia>(`${BASE_PATH}/${id}`);
    return response.data;
  },

  /**
   * Obtener asistencias de un usuario
   */
  getByUsuario: async (usuarioId: number): Promise<Asistencia[]> => {
    const response = await api.get<Asistencia[]>(`${BASE_PATH}/usuario/${usuarioId}`);
    return response.data;
  },

  /**
   * Obtener asistencias de una fecha específica
   */
  getByFecha: async (fecha: string): Promise<Asistencia[]> => {
    const response = await api.get<Asistencia[]>(`${BASE_PATH}/fecha/${fecha}`);
    return response.data;
  },

  /**
   * Crear nueva asistencia (check-in)
   */
  create: async (data: AsistenciaCreate): Promise<Asistencia> => {
    console.log('🚀 AsistenciaService.create - Enviando:', data);
    console.log('🌐 URL:', `${api.defaults.baseURL}${BASE_PATH}`);

    const response = await api.post<Asistencia>(BASE_PATH, data);

    console.log('✅ AsistenciaService.create - Response status:', response.status);
    console.log('✅ AsistenciaService.create - Response data:', response.data);

    return response.data;
  },

  /**
   * Actualizar asistencia (check-out)
   */
  update: async (id: number, data: AsistenciaUpdate): Promise<Asistencia> => {
    const response = await api.put<Asistencia>(`${BASE_PATH}/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar asistencia
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`${BASE_PATH}/${id}`);
  },
};
