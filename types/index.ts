// ==========================================
// ENUMS
// ==========================================

export enum TipoUsuario {
  ADMIN = "admin",
  ENTRENADOR = "entrenador",
  CLIENTE = "cliente",
}

export enum TipoPlan {
  PASE_DIARIO = "pase_diario",
  PASE_FLEX = "pase_flex",
  MENSUAL = "mensual",
  PLAN_3_MESES = "plan_3_meses",
  PLAN_6_MESES = "plan_6_meses",
  ELITE_ANUAL = "elite_anual",
}

// Mantener compatibilidad legacy
export enum TipoMembresia {
  MENSUAL = "mensual",
  TRIMESTRAL = "trimestral",
  SEMESTRAL = "semestral",
  ANUAL = "anual",
}

export enum EstadoMembresia {
  ACTIVA = "activa",
  VENCIDA = "vencida",
  SUSPENDIDA = "suspendida",
  CANCELADA = "cancelada",
}

export enum TipoPago {
  EFECTIVO = "efectivo",
  TARJETA = "tarjeta",
  TRANSFERENCIA = "transferencia",
  NEQUI = "nequi",
  DAVIPLATA = "daviplata",
  OTRO = "otro",
}

export enum Genero {
  MASCULINO = "masculino",
  FEMENINO = "femenino",
}

export const OBJETIVOS_FITNESS = [
  "Perder peso",
  "Ganar músculo",
  "Mantenimiento",
  "Resistencia",
  "Flexibilidad",
  "Tonificación",
] as const;

// ==========================================
// USUARIO TYPES
// ==========================================

export interface UsuarioBase {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string | null;
  tipo?: TipoUsuario;
  fecha_nacimiento?: string | null;
  // Campo de referido
  referido_por_cedula?: string | null;
  // Campos específicos del gimnasio
  peso_inicial?: number | null;
  peso_actual?: number | null;
  altura?: number | null;
  objetivo?: string | null;
  genero?: string | null;
  dias_entrenados?: number;
}

export interface UsuarioCreate extends UsuarioBase {}

export interface UsuarioUpdate {
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string | null;
  tipo?: TipoUsuario;
  activo?: boolean;
  fecha_nacimiento?: string | null;
  // Campo de referido
  referido_por_cedula?: string | null;
  // Campos del gimnasio
  peso_inicial?: number | null;
  peso_actual?: number | null;
  altura?: number | null;
  objetivo?: string | null;
  genero?: string | null;
  dias_entrenados?: number;
}

export interface Usuario extends UsuarioBase {
  id: number;
  activo: boolean;
  fecha_registro: string;
  ultima_asistencia?: string | null;
  dias_entrenados: number;
}

// Type para búsqueda de referido
export interface UsuarioBusqueda {
  id: number;
  nombre: string;
  apellido: string;
  telefono?: string | null;
}

// ==========================================
// MEMBRESÍA TYPES
// ==========================================

// Plan disponible para compra
export interface PlanDisponible {
  tipo: string;
  nombre: string;
  precio: number;
  duracion_dias: number;
}

// Schema simplificado para crear membresía
export interface MembresiaCreateSimple {
  usuario_id: number;
  tipo_plan: TipoPlan;
  tipo_pago?: TipoPago | null;
  descripcion?: string | null;
  referido_por_id?: number | null;
}

// Schema completo de membresía (respuesta del backend)
export interface Membresia {
  id: number;
  usuario_id: number;
  tipo_plan: TipoPlan;
  estado: EstadoMembresia;
  precio: number;
  precio_original?: number | null;
  precio_final?: number | null;
  duracion_dias: number;
  fecha_inicio: string;
  fecha_fin: string;
  tipo_pago?: TipoPago | null;
  descripcion?: string | null;
  activo: boolean;
  referido_por_id?: number | null;
}

// Legacy types (mantener compatibilidad)
export interface MembresiaBase {
  usuario_id: number;
  tipo: TipoMembresia;
  fecha_fin: string;
  precio: number;
  descripcion?: string | null;
}

export interface MembresiaCreate extends MembresiaBase {}

export interface MembresiaUpdate {
  estado?: EstadoMembresia;
  fecha_fin?: string;
  activo?: boolean;
  descripcion?: string | null;
}

// ==========================================
// ASISTENCIA TYPES
// ==========================================

export interface AsistenciaBase {
  usuario_id: number;
  hora_entrada: string; // time format: "HH:MM:SS"
  hora_salida?: string | null; // time format: "HH:MM:SS"
  notas?: string | null;
}

export interface AsistenciaCreate extends AsistenciaBase {}

export interface AsistenciaUpdate {
  hora_salida?: string | null;
  notas?: string | null;
}

export interface Asistencia extends AsistenciaBase {
  id: number;
  fecha: string;
}

// ==========================================
// API RESPONSE TYPES
// ==========================================

export interface ApiError {
  detail: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}
