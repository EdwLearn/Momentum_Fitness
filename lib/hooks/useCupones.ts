import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cuponesService } from '@/lib/services/cupones';
import { Cupon, CuponCreate, CuponUpdate } from '@/types';

// Query keys
export const cuponesKeys = {
  all: ['cupones'] as const,
  lists: () => [...cuponesKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...cuponesKeys.lists(), { filters }] as const,
  details: () => [...cuponesKeys.all, 'detail'] as const,
  detail: (id: number) => [...cuponesKeys.details(), id] as const,
  stats: () => [...cuponesKeys.all, 'stats'] as const,
  byCodigo: (codigo: string) => [...cuponesKeys.all, 'codigo', codigo] as const,
};

// Hook para obtener todos los cupones con filtros opcionales
export function useCupones(params?: {
  skip?: number;
  limit?: number;
  nicho?: string;
  activo?: boolean;
  search?: string;
}) {
  return useQuery({
    queryKey: cuponesKeys.list(params),
    queryFn: () => cuponesService.getAll(params),
  });
}

// Hook para obtener estadísticas de cupones
export function useCuponesStats() {
  return useQuery({
    queryKey: cuponesKeys.stats(),
    queryFn: () => cuponesService.getStats(),
  });
}

// Hook para obtener un cupón por ID
export function useCupon(id: number) {
  return useQuery({
    queryKey: cuponesKeys.detail(id),
    queryFn: () => cuponesService.getById(id),
    enabled: !!id,
  });
}

// Hook para obtener un cupón por código
export function useCuponByCodigo(codigo: string) {
  return useQuery({
    queryKey: cuponesKeys.byCodigo(codigo),
    queryFn: () => cuponesService.getByCodigo(codigo),
    enabled: !!codigo,
  });
}

// Hook para crear un cupón
export function useCreateCupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CuponCreate) => cuponesService.create(data),
    onSuccess: () => {
      // Invalidar la caché para refrescar la lista y estadísticas
      queryClient.invalidateQueries({ queryKey: cuponesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: cuponesKeys.stats() });
    },
  });
}

// Hook para actualizar un cupón
export function useUpdateCupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CuponUpdate }) =>
      cuponesService.update(id, data),
    onSuccess: (data) => {
      // Invalidar la caché para el cupón específico, la lista y estadísticas
      queryClient.invalidateQueries({ queryKey: cuponesKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: cuponesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: cuponesKeys.stats() });
    },
  });
}

// Hook para eliminar un cupón
export function useDeleteCupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => cuponesService.delete(id),
    onSuccess: () => {
      // Invalidar la caché para refrescar la lista y estadísticas
      queryClient.invalidateQueries({ queryKey: cuponesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: cuponesKeys.stats() });
    },
  });
}

// Hook para alternar estado activo/inactivo
export function useToggleCuponActivo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => cuponesService.toggleActivo(id),
    onSuccess: (data) => {
      // Invalidar la caché para el cupón específico, la lista y estadísticas
      queryClient.invalidateQueries({ queryKey: cuponesKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: cuponesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: cuponesKeys.stats() });
    },
  });
}

// Hook para aplicar un cupón
export function useAplicarCupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (codigo: string) => cuponesService.aplicar(codigo),
    onSuccess: (data) => {
      // Invalidar la caché para el cupón específico, la lista y estadísticas
      queryClient.invalidateQueries({ queryKey: cuponesKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: cuponesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: cuponesKeys.stats() });
    },
  });
}

// Hook para resetear usos anuales
export function useResetUsosAnuales() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cuponesService.resetUsos(),
    onSuccess: () => {
      // Invalidar toda la caché de cupones
      queryClient.invalidateQueries({ queryKey: cuponesKeys.all });
    },
  });
}
