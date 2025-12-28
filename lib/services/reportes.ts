import api from '@/lib/api';

const BASE_URL = '/api/reportes';

// Interfaces para las respuestas
export interface AsistenciasPorDiaItem {
  fecha: string;
  asistencias: number;
}

export interface AsistenciasPorPlanItem {
  plan: string;
  asistencias: number;
}

export interface NuevasVsRenovacionesItem {
  mes: string;
  nuevas: number;
  renovaciones: number;
}

export interface PlanesTopItem {
  plan: string;
  ventas: number;
}

export interface IngresosPorMesItem {
  mes: string;
  ingresos: number;
}

export interface IngresosPorCuponItem {
  nicho: string;
  ingresos: number;
}

export interface ReferidosImpacto {
  clientes_referidos: number;
  porcentaje: number;
  meses_gratis: number;
  ratio_conversion: number;
}

export interface ResumenIngresos {
  ingresos_totales: number;
  ticket_promedio: number;
  ingresos_por_cliente: number;
}

export interface ComparacionEmpleadosItem {
  mes: string;
  empleados: Array<{
    id: number;
    nombre: string;
    horas: number;
  }>;
}

export const reportesService = {
  // Obtener asistencias por día
  getAsistenciasPorDia: async (dias: number = 7): Promise<AsistenciasPorDiaItem[]> => {
    const response = await api.get<AsistenciasPorDiaItem[]>(`${BASE_URL}/asistencias-por-dia`, {
      params: { dias }
    });
    return response.data;
  },

  // Obtener asistencias por plan
  getAsistenciasPorPlan: async (dias: number = 30): Promise<AsistenciasPorPlanItem[]> => {
    const response = await api.get<AsistenciasPorPlanItem[]>(`${BASE_URL}/asistencias-por-plan`, {
      params: { dias }
    });
    return response.data;
  },

  // Obtener nuevas suscripciones vs renovaciones
  getNuevasVsRenovaciones: async (meses: number = 6): Promise<NuevasVsRenovacionesItem[]> => {
    const response = await api.get<NuevasVsRenovacionesItem[]>(`${BASE_URL}/nuevas-vs-renovaciones`, {
      params: { meses }
    });
    return response.data;
  },

  // Obtener planes más vendidos
  getPlanesTop: async (): Promise<PlanesTopItem[]> => {
    const response = await api.get<PlanesTopItem[]>(`${BASE_URL}/planes-top`);
    return response.data;
  },

  // Obtener ingresos por mes
  getIngresosPorMes: async (meses: number = 6): Promise<IngresosPorMesItem[]> => {
    const response = await api.get<IngresosPorMesItem[]>(`${BASE_URL}/ingresos-por-mes`, {
      params: { meses }
    });
    return response.data;
  },

  // Obtener ingresos por cupón
  getIngresosPorCupon: async (): Promise<IngresosPorCuponItem[]> => {
    const response = await api.get<IngresosPorCuponItem[]>(`${BASE_URL}/ingresos-por-cupon`);
    return response.data;
  },

  // Obtener impacto de referidos
  getReferidosImpacto: async (): Promise<ReferidosImpacto> => {
    const response = await api.get<ReferidosImpacto>(`${BASE_URL}/referidos-impacto`);
    return response.data;
  },

  // Obtener resumen de ingresos
  getResumenIngresos: async (): Promise<ResumenIngresos> => {
    const response = await api.get<ResumenIngresos>(`${BASE_URL}/resumen-ingresos`);
    return response.data;
  },

  // Obtener comparación de empleados
  getComparacionEmpleados: async (meses: number = 6): Promise<ComparacionEmpleadosItem[]> => {
    const response = await api.get<ComparacionEmpleadosItem[]>(`${BASE_URL}/comparacion-empleados`, {
      params: { meses }
    });
    return response.data;
  },
};
