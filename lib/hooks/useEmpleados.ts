import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { empleadosService } from '@/lib/services/empleados';
import { Empleado, EmpleadoCreate, EmpleadoUpdate } from '@/types';

// Query keys
export const empleadosKeys = {
  all: ['empleados'] as const,
  lists: () => [...empleadosKeys.all, 'list'] as const,
  list: (filters?: string) => [...empleadosKeys.lists(), { filters }] as const,
  details: () => [...empleadosKeys.all, 'detail'] as const,
  detail: (id: number) => [...empleadosKeys.details(), id] as const,
  activos: () => [...empleadosKeys.all, 'activos'] as const,
};

// Hook para obtener todos los empleados
export function useEmpleados() {
  return useQuery({
    queryKey: empleadosKeys.lists(),
    queryFn: () => empleadosService.getAll(),
  });
}

// Hook para obtener un empleado por ID
export function useEmpleado(id: number) {
  return useQuery({
    queryKey: empleadosKeys.detail(id),
    queryFn: () => empleadosService.getById(id),
    enabled: !!id,
  });
}

// Hook para crear un empleado
export function useCreateEmpleado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EmpleadoCreate) => empleadosService.create(data),
    onSuccess: () => {
      // Invalidar la caché para refrescar la lista
      queryClient.invalidateQueries({ queryKey: empleadosKeys.lists() });
    },
  });
}

// Hook para actualizar un empleado
export function useUpdateEmpleado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: EmpleadoUpdate }) =>
      empleadosService.update(id, data),
    onSuccess: (data) => {
      // Invalidar la caché para el empleado específico y la lista
      queryClient.invalidateQueries({ queryKey: empleadosKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: empleadosKeys.lists() });
    },
  });
}

// Hook para eliminar un empleado
export function useDeleteEmpleado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => empleadosService.delete(id),
    onSuccess: () => {
      // Invalidar la caché para refrescar la lista
      queryClient.invalidateQueries({ queryKey: empleadosKeys.lists() });
    },
  });
}

// Hook para obtener empleados activos
export function useEmpleadosActivos() {
  return useQuery({
    queryKey: empleadosKeys.activos(),
    queryFn: () => empleadosService.getActivos(),
  });
}
