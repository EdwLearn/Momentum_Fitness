import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { membresiasService } from '@/lib/services/membresias';
import { MembresiaCreateSimple, MembresiaUpdate } from '@/types';

// Query keys
export const membresiasKeys = {
  all: ['membresias'] as const,
  planes: () => [...membresiasKeys.all, 'planes'] as const,
  lists: () => [...membresiasKeys.all, 'list'] as const,
  list: (filters?: string) => [...membresiasKeys.lists(), { filters }] as const,
  details: () => [...membresiasKeys.all, 'detail'] as const,
  detail: (id: number) => [...membresiasKeys.details(), id] as const,
  byUsuario: (usuarioId: number) => [...membresiasKeys.all, 'usuario', usuarioId] as const,
  activa: (usuarioId: number) => [...membresiasKeys.all, 'activa', usuarioId] as const,
};

// Hook para obtener planes disponibles
export function usePlanes() {
  return useQuery({
    queryKey: membresiasKeys.planes(),
    queryFn: () => membresiasService.getPlanes(),
  });
}

// Hook para obtener todas las membresías
export function useMembresias() {
  return useQuery({
    queryKey: membresiasKeys.lists(),
    queryFn: () => membresiasService.getAll(),
  });
}

// Hook para obtener membresía activa de un usuario
export function useMembresiaActiva(usuarioId: number) {
  return useQuery({
    queryKey: membresiasKeys.activa(usuarioId),
    queryFn: () => membresiasService.getMembresiaActiva(usuarioId),
    enabled: !!usuarioId,
    retry: false, // No reintentar si no tiene membresía activa (404)
  });
}

// Hook para obtener todas las membresías de un usuario
export function useMembresiasUsuario(usuarioId: number) {
  return useQuery({
    queryKey: membresiasKeys.byUsuario(usuarioId),
    queryFn: () => membresiasService.getTodasMembresias(usuarioId),
    enabled: !!usuarioId,
  });
}

// Hook para obtener una membresía por ID
export function useMembresia(id: number) {
  return useQuery({
    queryKey: membresiasKeys.detail(id),
    queryFn: () => membresiasService.getById(id),
    enabled: !!id,
  });
}

// Hook para crear una membresía
export function useCreateMembresia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MembresiaCreateSimple) => membresiasService.create(data),
    onSuccess: (data) => {
      // Invalidar cachés relevantes
      queryClient.invalidateQueries({ queryKey: membresiasKeys.lists() });
      queryClient.invalidateQueries({ queryKey: membresiasKeys.byUsuario(data.usuario_id) });
      queryClient.invalidateQueries({ queryKey: membresiasKeys.activa(data.usuario_id) });
    },
  });
}

// Hook para actualizar una membresía
export function useUpdateMembresia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: MembresiaUpdate }) =>
      membresiasService.update(id, data),
    onSuccess: (data) => {
      // Invalidar cachés relevantes
      queryClient.invalidateQueries({ queryKey: membresiasKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: membresiasKeys.lists() });
      queryClient.invalidateQueries({ queryKey: membresiasKeys.byUsuario(data.usuario_id) });
      queryClient.invalidateQueries({ queryKey: membresiasKeys.activa(data.usuario_id) });
    },
  });
}

// Hook para eliminar una membresía
export function useDeleteMembresia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => membresiasService.delete(id),
    onSuccess: () => {
      // Invalidar la caché para refrescar la lista
      queryClient.invalidateQueries({ queryKey: membresiasKeys.lists() });
    },
  });
}

// Hook para renovar una membresía
export function useRenovarMembresia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MembresiaCreateSimple & { usuario_id: number }) =>
      membresiasService.renovar(data.usuario_id, data),
    onSuccess: (data) => {
      // Invalidar cachés relevantes
      queryClient.invalidateQueries({ queryKey: membresiasKeys.lists() });
      queryClient.invalidateQueries({ queryKey: membresiasKeys.byUsuario(data.usuario_id) });
      queryClient.invalidateQueries({ queryKey: membresiasKeys.activa(data.usuario_id) });
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });
}
