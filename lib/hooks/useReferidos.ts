import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { referidosService } from '@/lib/services/referidos';
import { Referido, ReferidoCreate, ReferidoUpdate } from '@/types';

// Query keys
export const referidosKeys = {
  all: ['referidos'] as const,
  lists: () => [...referidosKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...referidosKeys.lists(), { filters }] as const,
  details: () => [...referidosKeys.all, 'detail'] as const,
  detail: (id: number) => [...referidosKeys.details(), id] as const,
  stats: () => [...referidosKeys.all, 'stats'] as const,
  detallados: () => [...referidosKeys.all, 'detallados'] as const,
  porUsuario: (usuarioId: number) => [...referidosKeys.all, 'usuario', usuarioId] as const,
};

// Hook para obtener todos los referidos con filtros opcionales
export function useReferidos(params?: {
  skip?: number;
  limit?: number;
  referidor_id?: number;
  referido_id?: number;
  cumple_condicion?: boolean;
}) {
  return useQuery({
    queryKey: referidosKeys.list(params),
    queryFn: () => referidosService.getAll(params),
  });
}

// Hook para obtener referidos con información detallada
export function useReferidosDetallados(params?: {
  skip?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: referidosKeys.detallados(),
    queryFn: () => referidosService.getDetallados(params),
  });
}

// Hook para obtener estadísticas de referidos
export function useReferidosStats() {
  return useQuery({
    queryKey: referidosKeys.stats(),
    queryFn: () => referidosService.getStats(),
  });
}

// Hook para obtener un referido por ID
export function useReferido(id: number) {
  return useQuery({
    queryKey: referidosKeys.detail(id),
    queryFn: () => referidosService.getById(id),
    enabled: !!id,
  });
}

// Hook para obtener referidos hechos por un usuario
export function useReferidosPorUsuario(usuarioId: number, params?: {
  skip?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: referidosKeys.porUsuario(usuarioId),
    queryFn: () => referidosService.getReferidosPorUsuario(usuarioId, params),
    enabled: !!usuarioId,
  });
}

// Hook para contar referidos activos de un usuario
export function useContarReferidosActivos(usuarioId: number) {
  return useQuery({
    queryKey: [...referidosKeys.porUsuario(usuarioId), 'count'],
    queryFn: () => referidosService.contarActivos(usuarioId),
    enabled: !!usuarioId,
  });
}

// Hook para crear un referido
export function useCreateReferido() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReferidoCreate) => referidosService.create(data),
    onSuccess: () => {
      // Invalidar la caché para refrescar listas y estadísticas
      queryClient.invalidateQueries({ queryKey: referidosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: referidosKeys.detallados() });
      queryClient.invalidateQueries({ queryKey: referidosKeys.stats() });
    },
  });
}

// Hook para actualizar un referido
export function useUpdateReferido() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ReferidoUpdate }) =>
      referidosService.update(id, data),
    onSuccess: (data) => {
      // Invalidar la caché para el referido específico, listas y estadísticas
      queryClient.invalidateQueries({ queryKey: referidosKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: referidosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: referidosKeys.detallados() });
      queryClient.invalidateQueries({ queryKey: referidosKeys.stats() });
    },
  });
}

// Hook para eliminar un referido
export function useDeleteReferido() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => referidosService.delete(id),
    onSuccess: () => {
      // Invalidar la caché para refrescar listas y estadísticas
      queryClient.invalidateQueries({ queryKey: referidosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: referidosKeys.detallados() });
      queryClient.invalidateQueries({ queryKey: referidosKeys.stats() });
    },
  });
}

// Hook para activar beneficio
export function useActivarBeneficio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, tipoBeneficio }: { id: number; tipoBeneficio: string }) =>
      referidosService.activarBeneficio(id, tipoBeneficio),
    onSuccess: (data) => {
      // Invalidar la caché para el referido específico, listas y estadísticas
      queryClient.invalidateQueries({ queryKey: referidosKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: referidosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: referidosKeys.detallados() });
      queryClient.invalidateQueries({ queryKey: referidosKeys.stats() });
    },
  });
}

// Hook para verificar condición
export function useVerificarCondicion(id: number) {
  return useQuery({
    queryKey: [...referidosKeys.detail(id), 'verificar'],
    queryFn: () => referidosService.verificarCondicion(id),
    enabled: !!id,
  });
}
