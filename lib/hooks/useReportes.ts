import { useQuery } from '@tanstack/react-query';
import { reportesService } from '@/lib/services/reportes';

// Query keys
export const reportesKeys = {
  all: ['reportes'] as const,
  asistenciasPorDia: (dias: number) => [...reportesKeys.all, 'asistencias-dia', dias] as const,
  asistenciasPorPlan: (dias: number) => [...reportesKeys.all, 'asistencias-plan', dias] as const,
  nuevasVsRenovaciones: (meses: number) => [...reportesKeys.all, 'nuevas-renovaciones', meses] as const,
  planesTop: () => [...reportesKeys.all, 'planes-top'] as const,
  ingresosPorMes: (meses: number) => [...reportesKeys.all, 'ingresos-mes', meses] as const,
  ingresosPorCupon: () => [...reportesKeys.all, 'ingresos-cupon'] as const,
  referidosImpacto: () => [...reportesKeys.all, 'referidos-impacto'] as const,
  resumenIngresos: () => [...reportesKeys.all, 'resumen-ingresos'] as const,
};

// Hook para obtener asistencias por día
export function useAsistenciasPorDia(dias: number = 7) {
  return useQuery({
    queryKey: reportesKeys.asistenciasPorDia(dias),
    queryFn: () => reportesService.getAsistenciasPorDia(dias),
  });
}

// Hook para obtener asistencias por plan
export function useAsistenciasPorPlan(dias: number = 30) {
  return useQuery({
    queryKey: reportesKeys.asistenciasPorPlan(dias),
    queryFn: () => reportesService.getAsistenciasPorPlan(dias),
  });
}

// Hook para obtener nuevas suscripciones vs renovaciones
export function useNuevasVsRenovaciones(meses: number = 6) {
  return useQuery({
    queryKey: reportesKeys.nuevasVsRenovaciones(meses),
    queryFn: () => reportesService.getNuevasVsRenovaciones(meses),
  });
}

// Hook para obtener planes más vendidos
export function usePlanesTop() {
  return useQuery({
    queryKey: reportesKeys.planesTop(),
    queryFn: () => reportesService.getPlanesTop(),
  });
}

// Hook para obtener ingresos por mes
export function useIngresosPorMes(meses: number = 6) {
  return useQuery({
    queryKey: reportesKeys.ingresosPorMes(meses),
    queryFn: () => reportesService.getIngresosPorMes(meses),
  });
}

// Hook para obtener ingresos por cupón
export function useIngresosPorCupon() {
  return useQuery({
    queryKey: reportesKeys.ingresosPorCupon(),
    queryFn: () => reportesService.getIngresosPorCupon(),
  });
}

// Hook para obtener impacto de referidos
export function useReferidosImpacto() {
  return useQuery({
    queryKey: reportesKeys.referidosImpacto(),
    queryFn: () => reportesService.getReferidosImpacto(),
  });
}

// Hook para obtener resumen de ingresos
export function useResumenIngresos() {
  return useQuery({
    queryKey: reportesKeys.resumenIngresos(),
    queryFn: () => reportesService.getResumenIngresos(),
  });
}
