import api from '@/lib/api';
import { Usuario, UsuarioCreate, UsuarioUpdate, UsuarioBusqueda } from '@/types';

const BASE_PATH = '/api/usuarios';

export const usuariosService = {
  /**
   * Obtener todos los usuarios
   */
  getAll: async (): Promise<Usuario[]> => {
    const response = await api.get<Usuario[]>(`${BASE_PATH}/`, {
      params: { skip: 0, limit: 10000 } // Límite alto para obtener todos los usuarios
    });
    return response.data;
  },

  /**
   * Obtener un usuario por ID
   */
  getById: async (id: number): Promise<Usuario> => {
    const response = await api.get<Usuario>(`${BASE_PATH}/${id}`);
    return response.data;
  },

  /**
   * Crear un nuevo usuario
   */
  create: async (data: UsuarioCreate): Promise<Usuario> => {
    const response = await api.post<Usuario>(`${BASE_PATH}/`, data);
    return response.data;
  },

  /**
   * Actualizar un usuario existente
   */
  update: async (id: number, data: UsuarioUpdate): Promise<Usuario> => {
    const response = await api.put<Usuario>(`${BASE_PATH}/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar un usuario
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`${BASE_PATH}/${id}`);
  },

  /**
   * Buscar usuarios por email
   */
  searchByEmail: async (email: string): Promise<Usuario[]> => {
    const response = await api.get<Usuario[]>(`${BASE_PATH}/`, {
      params: { email },
    });
    return response.data;
  },

  /**
   * Obtener usuarios activos
   */
  getActivos: async (): Promise<Usuario[]> => {
    const response = await api.get<Usuario[]>(`${BASE_PATH}/`, {
      params: { activo: true },
    });
    return response.data;
  },

  /**
   * Obtener usuarios por tipo
   */
  getByTipo: async (tipo: string): Promise<Usuario[]> => {
    const response = await api.get<Usuario[]>(`${BASE_PATH}/`, {
      params: { tipo },
    });
    return response.data;
  },

  /**
   * Buscar usuario por cédula para referidos
   */
  buscarPorCedula: async (cedula: string): Promise<UsuarioBusqueda> => {
    const response = await api.get<UsuarioBusqueda>(`${BASE_PATH}/buscar-cedula/${cedula}`);
    return response.data;
  },
};
