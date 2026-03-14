// ==========================================
// ENUMS
// ==========================================

export enum TipoUsuario {
  ADMIN = "admin",
  ENTRENADOR = "entrenador",
  CLIENTE = "usuario",
}

export enum TipoPlan {
  PASE_DIARIO = "pase_diario",
  PASE_FLEX = "pase_flex",
  MENSUAL = "mensual",
  ESTUDIANTE = "estudiante",
  PLAN_3_MESES = "plan_3_meses",
  PLAN_6_MESES = "plan_6_meses",
  ELITE_ANUAL = "elite_anual",
  SOCIO = "socio",
  CORTESIA = "cortesia",
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

export enum TipoEmpleado {
  ENTRENADOR = "entrenador",
  RECEPCION = "recepcion",
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
  cedula: string;
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
  cedula?: string;
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
  cedula: string;
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
  cupon_codigo?: string | null;
  fecha_inicio?: string | null;
}

// Schema para crear cortesía flexible
export interface CortesiaCreate {
  usuario_id: number;
  duracion_dias: number; // 1-365 días
  visitas_disponibles?: number | null; // null = ilimitadas
  motivo?: string | null;
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

// ==========================================
// EMPLEADOS
// ==========================================

export interface Empleado {
  id: number;
  // Datos personales
  nombre: string;
  apellido: string | null;
  cedula: string;
  email: string | null;
  telefono: string | null;
  fecha_nacimiento: string | null;
  genero: string | null;
  direccion: string | null;

  // Datos laborales
  tipo_empleado: TipoEmpleado;
  fecha_contratacion: string | null;
  salario: number | null;
  horario: string | null;
  dias_laborales: string | null;

  // Contacto de emergencia
  emergencia_nombre: string | null;
  emergencia_telefono: string | null;
  emergencia_relacion: string | null;

  // Metadata
  fecha_registro: string;
  activo: number;
}

export interface EmpleadoCreate {
  // Datos personales
  nombre: string;
  apellido?: string;
  cedula: string;
  email?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  genero?: string;
  direccion?: string;

  // Datos laborales
  tipo_empleado: TipoEmpleado;
  fecha_contratacion?: string;
  salario?: number;
  horario?: string;
  dias_laborales?: string;

  // Contacto de emergencia
  emergencia_nombre?: string;
  emergencia_telefono?: string;
  emergencia_relacion?: string;
}

export interface EmpleadoUpdate {
  nombre?: string;
  apellido?: string;
  cedula?: string;
  email?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  genero?: string;
  direccion?: string;
  tipo_empleado?: TipoEmpleado;
  fecha_contratacion?: string;
  salario?: number;
  horario?: string;
  dias_laborales?: string;
  emergencia_nombre?: string;
  emergencia_telefono?: string;
  emergencia_relacion?: string;
  activo?: number;
}

// ==========================================
// ASISTENCIA EMPLEADOS
// ==========================================

export interface AsistenciaEmpleado {
  id: number;
  empleado_id: number;
  fecha: string;
  hora_entrada: string | null;
  hora_salida: string | null;
  horas_trabajadas: number | null;
  created_at: string;
  updated_at: string;
}

export interface MarcarEntrada {
  empleado_id: number;
  hora_entrada?: string;
}

export interface MarcarSalida {
  empleado_id: number;
  hora_salida?: string;
}

export interface EstadoAsistenciaEmpleado {
  empleado_id: number;
  fecha: string;
  estado: "sin_marcar" | "entrada_marcada" | "salida_marcada";
  hora_entrada: string | null;
  hora_salida: string | null;
  horas_trabajadas?: number | null;
}

// ==========================================
// CUPONES
// ==========================================

export enum NichoCupon {
  ALIMENTICIO = "Alimenticio",
  ESTETICO = "Estético",
}

export interface CuponBase {
  codigo: string;
  nicho: string;
  descuento: number;
  activo: boolean;
  fecha_expiracion?: string | null;
}

export interface CuponCreate extends CuponBase {}

export interface CuponUpdate {
  codigo?: string;
  nicho?: string;
  descuento?: number;
  activo?: boolean;
  fecha_expiracion?: string | null;
}

export interface Cupon extends CuponBase {
  id: number;
  usos_total: number;
  usos_anio: number;
  fecha_creacion: string;
}

export interface CuponStats {
  total_cupones: number;
  cupones_activos: number;
  cupones_inactivos: number;
  total_usos: number;
  total_usos_anio: number;
  cupones_por_nicho: Record<string, number>;
}

// ==========================================
// REFERIDOS
// ==========================================

export interface ReferidoBase {
  referidor_id: number;
  referido_id: number;
  membresia_id?: number | null;
}

export interface ReferidoCreate extends ReferidoBase {}

export interface ReferidoUpdate {
  cumple_condicion?: boolean;
  beneficio?: string | null;
  membresia_id?: number | null;
}

export interface Referido extends ReferidoBase {
  id: number;
  cumple_condicion: boolean;
  beneficio: string | null;
  fecha_referido: string;
  fecha_activacion: string | null;
}

export interface ReferidoDetallado {
  id: number;
  referidor: string;
  referidor_id: number;
  referidos_totales: number;
  referido: string;
  plan_comprado: string | null;
  cumple_condicion: boolean;
  beneficio: string | null;
  fecha_referido: string;
  fecha_activacion: string | null;
}

export interface ReferidoStats {
  total_referidos: number;
  referidos_activos: number;
  referidos_pendientes: number;
  beneficios_otorgados: number;
  referidos_ultimo_mes: number;
  referidos_ultimos_3_meses: number;
  top_referidores: Array<{
    id: number;
    nombre: string;
    total_referidos: number;
  }>;
}

// ==========================================
// HISTORIAL DE PESO
// ==========================================

export interface HistorialPeso {
  id: number;
  usuario_id: number;
  peso: number;
  fecha_pesaje: string;
  circunferencia_brazos: number | null;
  circunferencia_pecho: number | null;
  circunferencia_cintura: number | null;
  circunferencia_cadera: number | null;
  circunferencia_piernas: number | null;
  notas: string | null;
}
