import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usuariosService } from '@/lib/services/usuarios';
import { Usuario, UsuarioCreate, UsuarioUpdate } from '@/types';

// Query keys
export const usuariosKeys = {
  all: ['usuarios'] as const,
  lists: () => [...usuariosKeys.all, 'list'] as const,
  list: (filters?: string) => [...usuariosKeys.lists(), { filters }] as const,
  details: () => [...usuariosKeys.all, 'detail'] as const,
  detail: (id: number) => [...usuariosKeys.details(), id] as const,
};

// Hook para obtener todos los usuarios
export function useUsuarios() {
  return useQuery({
    queryKey: usuariosKeys.lists(),
    queryFn: () => usuariosService.getAll(),
  });
}

// Hook para obtener un usuario por ID
export function useUsuario(id: number) {
  return useQuery({
    queryKey: usuariosKeys.detail(id),
    queryFn: () => usuariosService.getById(id),
    enabled: !!id,
  });
}

// Hook para crear un usuario
export function useCreateUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UsuarioCreate) => usuariosService.create(data),
    onSuccess: () => {
      // Invalidar la caché para refrescar la lista
      queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() });
    },
  });
}

// Hook para actualizar un usuario
export function useUpdateUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UsuarioUpdate }) =>
      usuariosService.update(id, data),
    onSuccess: (data) => {
      // Invalidar la caché para el usuario específico y la lista
      queryClient.invalidateQueries({ queryKey: usuariosKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() });
    },
  });
}

// Hook para eliminar un usuario
export function useDeleteUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => usuariosService.delete(id),
    onSuccess: () => {
      // Invalidar la caché para refrescar la lista
      queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() });
    },
  });
}

// Hook para obtener usuarios activos
export function useUsuariosActivos() {
  return useQuery({
    queryKey: [...usuariosKeys.lists(), 'activos'],
    queryFn: () => usuariosService.getActivos(),
  });
}
