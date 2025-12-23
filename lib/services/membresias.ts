import api from '@/lib/api';
import { PlanDisponible, Membresia, MembresiaCreateSimple, MembresiaUpdate } from '@/types';

const BASE_URL = '/api/membresias';

export const membresiasService = {
  // Obtener todos los planes disponibles
  getPlanes: async (): Promise<PlanDisponible[]> => {
    const response = await api.get<PlanDisponible[]>(`${BASE_URL}/planes`);
    return response.data;
  },

  // Obtener todas las membresías
  getAll: async (): Promise<Membresia[]> => {
    const response = await api.get<Membresia[]>(BASE_URL);
    return response.data;
  },

  // Obtener membresía activa de un usuario
  getMembresiaActiva: async (usuarioId: number): Promise<Membresia> => {
    const response = await api.get<Membresia>(`${BASE_URL}/usuario/${usuarioId}`);
    return response.data;
  },

  // Obtener todas las membresías de un usuario (activas e inactivas)
  getTodasMembresias: async (usuarioId: number): Promise<Membresia[]> => {
    const response = await api.get<Membresia[]>(`${BASE_URL}/usuario/${usuarioId}/todas`);
    return response.data;
  },

  // Obtener una membresía por ID
  getById: async (id: number): Promise<Membresia> => {
    const response = await api.get<Membresia>(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Crear una nueva membresía (auto-calcula precio y fechas)
  create: async (data: MembresiaCreateSimple): Promise<Membresia> => {
    const response = await api.post<Membresia>(BASE_URL, data);
    return response.data;
  },

  // Actualizar una membresía
  update: async (id: number, data: MembresiaUpdate): Promise<Membresia> => {
    const response = await api.put<Membresia>(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  // Eliminar una membresía
  delete: async (id: number): Promise<void> => {
    await api.delete(`${BASE_URL}/${id}`);
  },
};
