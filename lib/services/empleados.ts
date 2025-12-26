import api from '@/lib/api';
import { Empleado, EmpleadoCreate, EmpleadoUpdate } from '@/types';

const BASE_PATH = '/api/empleados';

export const empleadosService = {
  /**
   * Obtener todos los empleados
   */
  getAll: async (): Promise<Empleado[]> => {
    const response = await api.get<Empleado[]>(`${BASE_PATH}/`, {
      params: { skip: 0, limit: 10000 } // Límite alto para obtener todos los empleados
    });
    return response.data;
  },

  /**
   * Obtener un empleado por ID
   */
  getById: async (id: number): Promise<Empleado> => {
    const response = await api.get<Empleado>(`${BASE_PATH}/${id}`);
    return response.data;
  },

  /**
   * Buscar empleado por cédula
   */
  getByCedula: async (cedula: string): Promise<Empleado> => {
    const response = await api.get<Empleado>(`${BASE_PATH}/cedula/${cedula}`);
    return response.data;
  },

  /**
   * Crear un nuevo empleado
   */
  create: async (data: EmpleadoCreate): Promise<Empleado> => {
    const response = await api.post<Empleado>(`${BASE_PATH}/`, data);
    return response.data;
  },

  /**
   * Actualizar un empleado existente
   */
  update: async (id: number, data: EmpleadoUpdate): Promise<Empleado> => {
    const response = await api.put<Empleado>(`${BASE_PATH}/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar un empleado
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`${BASE_PATH}/${id}`);
  },

  /**
   * Obtener empleados activos
   */
  getActivos: async (): Promise<Empleado[]> => {
    const response = await api.get<Empleado[]>(`${BASE_PATH}/activos/list`);
    return response.data;
  },

  /**
   * Obtener empleados por tipo
   */
  getByTipo: async (tipo: string): Promise<Empleado[]> => {
    const response = await api.get<Empleado[]>(`${BASE_PATH}/`, {
      params: { tipo_empleado: tipo },
    });
    return response.data;
  },
};
