import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { ApiError } from '@/types';

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    // You can add authorization headers here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ApiError>) => {
    // Handle common errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const errorMessage = error.response.data?.detail || 'Error en la solicitud';
      console.error('API Error:', errorMessage);

      // You can handle specific status codes here
      switch (error.response.status) {
        case 401:
          // Unauthorized - redirect to login
          console.error('No autorizado');
          break;
        case 404:
          console.error('Recurso no encontrado');
          break;
        case 500:
          console.error('Error interno del servidor');
          break;
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No se recibió respuesta del servidor');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error al configurar la solicitud:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;

// Helper function for making requests with proper typing
export const apiRequest = async <T>(
  config: AxiosRequestConfig
): Promise<T> => {
  const response = await api.request<T>(config);
  return response.data;
};
