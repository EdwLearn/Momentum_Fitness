import api from '@/lib/api';
import { AsistenciaEmpleado, MarcarEntrada, MarcarSalida, EstadoAsistenciaEmpleado } from '@/types';

const BASE_PATH = '/api/asistencia-empleados';

export const asistenciaEmpleadosService = {
  /**
   * Marcar entrada de un empleado
   */
  marcarEntrada: async (data: MarcarEntrada): Promise<AsistenciaEmpleado> => {
    const response = await api.post<AsistenciaEmpleado>(`${BASE_PATH}/entrada`, data);
    return response.data;
  },

  /**
   * Marcar salida de un empleado
   */
  marcarSalida: async (data: MarcarSalida): Promise<AsistenciaEmpleado> => {
    const response = await api.post<AsistenciaEmpleado>(`${BASE_PATH}/salida`, data);
    return response.data;
  },

  /**
   * Obtener asistencias por fecha
   */
  getByFecha: async (fecha: string): Promise<AsistenciaEmpleado[]> => {
    const response = await api.get<AsistenciaEmpleado[]>(`${BASE_PATH}/fecha/${fecha}`);
    return response.data;
  },

  /**
   * Obtener asistencias de un empleado
   */
  getByEmpleado: async (
    empleadoId: number,
    fechaInicio?: string,
    fechaFin?: string
  ): Promise<AsistenciaEmpleado[]> => {
    const response = await api.get<AsistenciaEmpleado[]>(`${BASE_PATH}/empleado/${empleadoId}`, {
      params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin },
    });
    return response.data;
  },

  /**
   * Obtener horas semanales de un empleado
   */
  getHorasSemanales: async (empleadoId: number): Promise<{ empleado_id: number; horas_semanales: number }> => {
    const response = await api.get<{ empleado_id: number; horas_semanales: number }>(
      `${BASE_PATH}/empleado/${empleadoId}/horas-semanales`
    );
    return response.data;
  },

  /**
   * Obtener empleados trabajando hoy
   */
  getTrabajandoHoy: async (): Promise<any[]> => {
    const response = await api.get<any[]>(`${BASE_PATH}/trabajando-hoy/list`);
    return response.data;
  },

  /**
   * Obtener estado de asistencia de un empleado para hoy
   */
  getEstadoHoy: async (empleadoId: number): Promise<EstadoAsistenciaEmpleado> => {
    const response = await api.get<EstadoAsistenciaEmpleado>(`${BASE_PATH}/empleado/${empleadoId}/estado-hoy`);
    return response.data;
  },
};
