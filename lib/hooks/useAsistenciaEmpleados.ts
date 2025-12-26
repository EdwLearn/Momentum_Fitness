import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { asistenciaEmpleadosService } from '@/lib/services/asistencia-empleados';
import { empleadosKeys } from '@/lib/hooks/useEmpleados';
import { MarcarEntrada, MarcarSalida } from '@/types';

// Helper para obtener fecha local en formato YYYY-MM-DD
const getLocalDate = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Query keys
export const asistenciaEmpleadosKeys = {
  all: ['asistencia-empleados'] as const,
  byFecha: (fecha: string) => [...asistenciaEmpleadosKeys.all, 'fecha', fecha] as const,
  byEmpleado: (empleadoId: number) => [...asistenciaEmpleadosKeys.all, 'empleado', empleadoId] as const,
  horasSemanales: (empleadoId: number) => [...asistenciaEmpleadosKeys.all, 'horas-semanales', empleadoId] as const,
  trabajandoHoy: () => [...asistenciaEmpleadosKeys.all, 'trabajando-hoy'] as const,
  estadoHoy: (empleadoId: number) => [...asistenciaEmpleadosKeys.all, 'estado-hoy', empleadoId] as const,
};

// Hook para marcar entrada
export function useMarcarEntrada() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MarcarEntrada) => asistenciaEmpleadosService.marcarEntrada(data),
    onSuccess: (_, variables) => {
      // Invalidar cachés relacionadas
      queryClient.invalidateQueries({ queryKey: asistenciaEmpleadosKeys.trabajandoHoy() });
      queryClient.invalidateQueries({ queryKey: asistenciaEmpleadosKeys.estadoHoy(variables.empleado_id) });
      queryClient.invalidateQueries({ queryKey: asistenciaEmpleadosKeys.byEmpleado(variables.empleado_id) });

      const today = getLocalDate();
      queryClient.invalidateQueries({ queryKey: asistenciaEmpleadosKeys.byFecha(today) });

      // Invalidar lista de empleados para actualizar el estado activo
      queryClient.invalidateQueries({ queryKey: empleadosKeys.lists() });
    },
  });
}

// Hook para marcar salida
export function useMarcarSalida() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MarcarSalida) => asistenciaEmpleadosService.marcarSalida(data),
    onSuccess: (_, variables) => {
      // Invalidar cachés relacionadas
      queryClient.invalidateQueries({ queryKey: asistenciaEmpleadosKeys.trabajandoHoy() });
      queryClient.invalidateQueries({ queryKey: asistenciaEmpleadosKeys.estadoHoy(variables.empleado_id) });
      queryClient.invalidateQueries({ queryKey: asistenciaEmpleadosKeys.byEmpleado(variables.empleado_id) });
      queryClient.invalidateQueries({ queryKey: asistenciaEmpleadosKeys.horasSemanales(variables.empleado_id) });

      const today = getLocalDate();
      queryClient.invalidateQueries({ queryKey: asistenciaEmpleadosKeys.byFecha(today) });

      // Invalidar lista de empleados para actualizar el estado inactivo
      queryClient.invalidateQueries({ queryKey: empleadosKeys.lists() });
    },
  });
}

// Hook para obtener asistencias por fecha
export function useAsistenciasPorFecha(fecha: string) {
  return useQuery({
    queryKey: asistenciaEmpleadosKeys.byFecha(fecha),
    queryFn: () => asistenciaEmpleadosService.getByFecha(fecha),
  });
}

// Hook para obtener asistencias de un empleado
export function useAsistenciasEmpleado(empleadoId: number, fechaInicio?: string, fechaFin?: string) {
  return useQuery({
    queryKey: [...asistenciaEmpleadosKeys.byEmpleado(empleadoId), { fechaInicio, fechaFin }],
    queryFn: () => asistenciaEmpleadosService.getByEmpleado(empleadoId, fechaInicio, fechaFin),
    enabled: !!empleadoId,
  });
}

// Hook para obtener horas semanales
export function useHorasSemanales(empleadoId: number) {
  return useQuery({
    queryKey: asistenciaEmpleadosKeys.horasSemanales(empleadoId),
    queryFn: () => asistenciaEmpleadosService.getHorasSemanales(empleadoId),
    enabled: !!empleadoId,
  });
}

// Hook para obtener empleados trabajando hoy
export function useEmpleadosTrabajandoHoy() {
  return useQuery({
    queryKey: asistenciaEmpleadosKeys.trabajandoHoy(),
    queryFn: () => asistenciaEmpleadosService.getTrabajandoHoy(),
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });
}

// Hook para obtener estado de hoy de un empleado
export function useEstadoEmpleadoHoy(empleadoId: number) {
  return useQuery({
    queryKey: asistenciaEmpleadosKeys.estadoHoy(empleadoId),
    queryFn: () => asistenciaEmpleadosService.getEstadoHoy(empleadoId),
    enabled: !!empleadoId,
  });
}
