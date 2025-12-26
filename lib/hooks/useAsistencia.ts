import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { asistenciaService } from '@/lib/services/asistencia';
import { AsistenciaCreate, AsistenciaUpdate } from '@/types';

// Helper para obtener fecha local en formato YYYY-MM-DD
const getLocalDate = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Query keys
export const asistenciaKeys = {
  all: ['asistencia'] as const,
  lists: () => [...asistenciaKeys.all, 'list'] as const,
  list: (filters?: string) => [...asistenciaKeys.lists(), { filters }] as const,
  details: () => [...asistenciaKeys.all, 'detail'] as const,
  detail: (id: number) => [...asistenciaKeys.details(), id] as const,
  byUsuario: (usuarioId: number) => [...asistenciaKeys.all, 'usuario', usuarioId] as const,
  byFecha: (fecha: string) => [...asistenciaKeys.all, 'fecha', fecha] as const,
  promedioDiario: () => [...asistenciaKeys.all, 'promedio-diario'] as const,
  usuariosInactivos: () => [...asistenciaKeys.all, 'usuarios-inactivos'] as const,
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

      // Invalidar asistencias de hoy (usar fecha local, no UTC)
      const today = getLocalDate();
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

      // Invalidar asistencias de hoy (usar fecha local, no UTC)
      const today = getLocalDate();
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

// Hook para obtener el promedio diario de asistencias (últimos 30 días)
export function usePromedioDiario() {
  return useQuery({
    queryKey: asistenciaKeys.promedioDiario(),
    queryFn: () => asistenciaService.getPromedioDiario(),
    refetchInterval: 60000, // Refetch cada minuto
  });
}

// Hook para obtener usuarios inactivos (4+ días sin asistir)
export function useUsuariosInactivos() {
  return useQuery({
    queryKey: asistenciaKeys.usuariosInactivos(),
    queryFn: () => asistenciaService.getUsuariosInactivos(),
    refetchInterval: 300000, // Refetch cada 5 minutos
  });
}
