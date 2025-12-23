import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { asistenciaService } from '@/lib/services/asistencia';
import { AsistenciaCreate, AsistenciaUpdate } from '@/types';

// Query keys
export const asistenciaKeys = {
  all: ['asistencia'] as const,
  lists: () => [...asistenciaKeys.all, 'list'] as const,
  list: (filters?: string) => [...asistenciaKeys.lists(), { filters }] as const,
  details: () => [...asistenciaKeys.all, 'detail'] as const,
  detail: (id: number) => [...asistenciaKeys.details(), id] as const,
  byUsuario: (usuarioId: number) => [...asistenciaKeys.all, 'usuario', usuarioId] as const,
  byFecha: (fecha: string) => [...asistenciaKeys.all, 'fecha', fecha] as const,
};

// Hook para obtener todas las asistencias
export function useAsistencias(skip = 0, limit = 100) {
  return useQuery({
    queryKey: asistenciaKeys.list(`skip=${skip}&limit=${limit}`),
    queryFn: () => asistenciaService.getAll(skip, limit),
  });
}

// Hook para obtener una asistencia por ID
export function useAsistencia(id: number) {
  return useQuery({
    queryKey: asistenciaKeys.detail(id),
    queryFn: () => asistenciaService.getById(id),
    enabled: !!id,
  });
}

// Hook para obtener asistencias de un usuario
export function useAsistenciasByUsuario(usuarioId: number) {
  return useQuery({
    queryKey: asistenciaKeys.byUsuario(usuarioId),
    queryFn: () => asistenciaService.getByUsuario(usuarioId),
    enabled: !!usuarioId,
  });
}

// Hook para obtener asistencias de una fecha
export function useAsistenciasByFecha(fecha: string) {
  return useQuery({
    queryKey: asistenciaKeys.byFecha(fecha),
    queryFn: () => asistenciaService.getByFecha(fecha),
    enabled: !!fecha,
  });
}

// Hook para crear una asistencia (check-in)
export function useCreateAsistencia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AsistenciaCreate) => asistenciaService.create(data),
    onSuccess: (data) => {
      console.log('🔄 useCreateAsistencia - onSuccess triggered with data:', data);

      // Invalidar las cachés relevantes
      console.log('🔄 Invalidando queryKey:', asistenciaKeys.lists());
      queryClient.invalidateQueries({ queryKey: asistenciaKeys.lists() });

      console.log('🔄 Invalidando queryKey:', asistenciaKeys.byUsuario(data.usuario_id));
      queryClient.invalidateQueries({ queryKey: asistenciaKeys.byUsuario(data.usuario_id) });

      // Invalidar asistencias de hoy
      const today = new Date().toISOString().split('T')[0];
      console.log('🔄 Invalidando queryKey:', asistenciaKeys.byFecha(today));
      queryClient.invalidateQueries({ queryKey: asistenciaKeys.byFecha(today) });

      console.log('✅ Todas las queries invalidadas exitosamente');
    },
    onError: (error) => {
      console.error('❌ useCreateAsistencia - onError triggered:', error);
    },
  });
}

// Hook para actualizar una asistencia (check-out)
export function useUpdateAsistencia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AsistenciaUpdate }) =>
      asistenciaService.update(id, data),
    onSuccess: (data) => {
      // Invalidar las cachés relevantes
      queryClient.invalidateQueries({ queryKey: asistenciaKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: asistenciaKeys.lists() });
      queryClient.invalidateQueries({ queryKey: asistenciaKeys.byUsuario(data.usuario_id) });
      const today = new Date().toISOString().split('T')[0];
      queryClient.invalidateQueries({ queryKey: asistenciaKeys.byFecha(today) });
    },
  });
}

// Hook para eliminar una asistencia
export function useDeleteAsistencia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => asistenciaService.delete(id),
    onSuccess: () => {
      // Invalidar la caché para refrescar la lista
      queryClient.invalidateQueries({ queryKey: asistenciaKeys.lists() });
    },
  });
}
