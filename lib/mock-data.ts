// Mock data for the dashboard

export const dashboardMetrics = {
  clientesActivos: 847,
  asistenciasHoy: 124,
  planesPorVencer: 23,
  ingresosMes: 15420000,
}

export const weeklyAttendance = [
  { day: "Lun", asistencias: 145 },
  { day: "Mar", asistencias: 132 },
  { day: "Mié", asistencias: 158 },
  { day: "Jue", asistencias: 141 },
  { day: "Vie", asistencias: 167 },
  { day: "Sáb", asistencias: 189 },
  { day: "Dom", asistencias: 98 },
]

export const planDistribution = [
  { name: "Mensual", value: 412, color: "#A4FF1A" },
  { name: "Trimestral", value: 187, color: "#22D3EE" },
  { name: "Anual", value: 156, color: "#8B5CF6" },
  { name: "Diario", value: 45, color: "#F97316" },
  { name: "Ticketera", value: 32, color: "#EC4899" },
  { name: "Cortesía", value: 15, color: "#6366F1" },
]

export const upcomingRenewals = [
  { cliente: "María González", plan: "Mensual", fechaFin: "2024-12-15", estado: "Por vencer" },
  { cliente: "Carlos Rodríguez", plan: "Trimestral", fechaFin: "2024-12-18", estado: "Por vencer" },
  { cliente: "Ana Martínez", plan: "Mensual", fechaFin: "2024-12-20", estado: "Activo" },
  { cliente: "Juan Pérez", plan: "Anual", fechaFin: "2024-12-12", estado: "Por vencer" },
  { cliente: "Laura Sánchez", plan: "Mensual", fechaFin: "2024-12-25", estado: "Activo" },
]

export const recentAttendance = [
  { fecha: "2024-12-10 08:30", cliente: "María González", evento: "Entrada", tipoUsuario: "Cliente", plan: "Mensual" },
  {
    fecha: "2024-12-10 08:45",
    cliente: "Carlos Rodríguez",
    evento: "Entrada",
    tipoUsuario: "Cliente",
    plan: "Trimestral",
  },
  { fecha: "2024-12-10 09:00", cliente: "Pedro López", evento: "Entrada", tipoUsuario: "Empleado", plan: "N/A" },
  { fecha: "2024-12-10 09:15", cliente: "Ana Martínez", evento: "Entrada", tipoUsuario: "Cliente", plan: "Mensual" },
  { fecha: "2024-12-10 09:30", cliente: "María González", evento: "Salida", tipoUsuario: "Cliente", plan: "Mensual" },
]

export const hourlyAttendance = [
  { hora: "6am", asistencias: 23 },
  { hora: "7am", asistencias: 45 },
  { hora: "8am", asistencias: 67 },
  { hora: "9am", asistencias: 54 },
  { hora: "10am", asistencias: 38 },
  { hora: "11am", asistencias: 42 },
  { hora: "12pm", asistencias: 56 },
  { hora: "1pm", asistencias: 34 },
  { hora: "2pm", asistencias: 28 },
  { hora: "3pm", asistencias: 31 },
  { hora: "4pm", asistencias: 47 },
  { hora: "5pm", asistencias: 72 },
  { hora: "6pm", asistencias: 89 },
  { hora: "7pm", asistencias: 76 },
  { hora: "8pm", asistencias: 58 },
  { hora: "9pm", asistencias: 32 },
]

export const clients = [
  {
    id: 1,
    nombre: "María González",
    cedula: "12345678",
    plan: "Mensual",
    fechaInicio: "2024-01-15",
    fechaFin: "2024-12-15",
    estado: "Activo",
    ultimaAsistencia: "2024-12-10",
    diasEntrenados: 145,
  },
  {
    id: 2,
    nombre: "Carlos Rodríguez",
    cedula: "23456789",
    plan: "Trimestral",
    fechaInicio: "2024-09-01",
    fechaFin: "2024-12-01",
    estado: "Vencido",
    ultimaAsistencia: "2024-11-28",
    diasEntrenados: 67,
  },
  {
    id: 3,
    nombre: "Ana Martínez",
    cedula: "34567890",
    plan: "Anual",
    fechaInicio: "2024-03-01",
    fechaFin: "2025-03-01",
    estado: "Activo",
    ultimaAsistencia: "2024-12-09",
    diasEntrenados: 198,
  },
  {
    id: 4,
    nombre: "Juan Pérez",
    cedula: "45678901",
    plan: "Mensual",
    fechaInicio: "2024-11-12",
    fechaFin: "2024-12-12",
    estado: "Por vencer",
    ultimaAsistencia: "2024-12-08",
    diasEntrenados: 23,
  },
  {
    id: 5,
    nombre: "Laura Sánchez",
    cedula: "56789012",
    plan: "Mensual",
    fechaInicio: "2024-11-25",
    fechaFin: "2024-12-25",
    estado: "Activo",
    ultimaAsistencia: "2024-12-10",
    diasEntrenados: 12,
  },
]

export const subscriptions = [
  {
    cliente: "María González",
    plan: "Mensual",
    fechaInicio: "2024-11-15",
    fechaFin: "2024-12-15",
    estado: "Activo",
    metodoPago: "Tarjeta",
    origen: "Normal",
  },
  {
    cliente: "Carlos Rodríguez",
    plan: "Trimestral",
    fechaInicio: "2024-09-01",
    fechaFin: "2024-12-01",
    estado: "Vencido",
    metodoPago: "Efectivo",
    origen: "Referido",
  },
  {
    cliente: "Ana Martínez",
    plan: "Anual",
    fechaInicio: "2024-03-01",
    fechaFin: "2025-03-01",
    estado: "Activo",
    metodoPago: "Transferencia",
    origen: "Cupón",
  },
  {
    cliente: "Juan Pérez",
    plan: "Mensual",
    fechaInicio: "2024-11-12",
    fechaFin: "2024-12-12",
    estado: "Por vencer",
    metodoPago: "Tarjeta",
    origen: "Normal",
  },
  {
    cliente: "Laura Sánchez",
    plan: "Mensual",
    fechaInicio: "2024-11-25",
    fechaFin: "2024-12-25",
    estado: "Activo",
    metodoPago: "Efectivo",
    origen: "Normal",
  },
]

export const subscriptionsByPlan = [
  { plan: "Diario", cantidad: 45 },
  { plan: "Ticketera", cantidad: 32 },
  { plan: "Mensual", cantidad: 412 },
  { plan: "Trimestral", cantidad: 187 },
  { plan: "Anual", cantidad: 156 },
  { plan: "Cortesía", cantidad: 15 },
]

export const coupons = [
  { codigo: "GYM2024", nicho: "Alimenticio", descuento: 15, usosTotal: 89, usosAnio: 45, activo: true },
  { codigo: "FIT30", nicho: "Estético", descuento: 30, usosTotal: 156, usosAnio: 78, activo: true },
  { codigo: "VERANO", nicho: "Alimenticio", descuento: 20, usosTotal: 234, usosAnio: 0, activo: false },
  { codigo: "MOMENTUM10", nicho: "Estético", descuento: 10, usosTotal: 312, usosAnio: 112, activo: true },
]

export const referrals = [
  {
    referidor: "María González",
    referido: "Pedro López",
    planComprado: "Mensual",
    cumpleCondicion: true,
    beneficio: "1 mes gratis",
  },
  {
    referidor: "Carlos Rodríguez",
    referido: "Ana Torres",
    planComprado: "Trimestral",
    cumpleCondicion: true,
    beneficio: "15% descuento",
  },
  {
    referidor: "Juan Pérez",
    referido: "Laura Gómez",
    planComprado: "Mensual",
    cumpleCondicion: false,
    beneficio: "Pendiente",
  },
]

export const notificationRules = [
  {
    id: 1,
    titulo: "Bienvenida",
    descripcion: "Mensaje de bienvenida al nuevo cliente",
    trigger: "Registro",
    activo: true,
  },
  {
    id: 2,
    titulo: "Inactividad 3 días",
    descripcion: "Recordatorio después de 3 días sin asistir",
    trigger: "Inactividad",
    activo: true,
  },
  {
    id: 3,
    titulo: "Inactividad 15 días",
    descripcion: "Mensaje de seguimiento tras 15 días de inactividad",
    trigger: "Inactividad",
    activo: true,
  },
  {
    id: 4,
    titulo: "Motivación 3 días",
    descripcion: "Felicitación por entrenar 3 días seguidos",
    trigger: "Logro",
    activo: true,
  },
  {
    id: 5,
    titulo: "Motivación 15 días",
    descripcion: "Reconocimiento por 15 días de constancia",
    trigger: "Logro",
    activo: true,
  },
  {
    id: 6,
    titulo: "Renovación 5 días",
    descripcion: "Aviso de renovación próxima (5 días)",
    trigger: "Renovación",
    activo: true,
  },
  {
    id: 7,
    titulo: "Renovación 24h",
    descripcion: "Recordatorio urgente de renovación",
    trigger: "Renovación",
    activo: true,
  },
  {
    id: 8,
    titulo: "Cumpleaños",
    descripcion: "Felicitación de cumpleaños personalizada",
    trigger: "Fecha especial",
    activo: true,
  },
  {
    id: 9,
    titulo: "Aniversario",
    descripcion: "Celebración del aniversario como miembro",
    trigger: "Fecha especial",
    activo: false,
  },
]

export const recentNotifications = [
  {
    fecha: "2024-12-10 10:30",
    cliente: "María González",
    regla: "Renovación 5 días",
    canal: "WhatsApp",
    estado: "Enviado",
  },
  {
    fecha: "2024-12-10 09:15",
    cliente: "Carlos Rodríguez",
    regla: "Inactividad 3 días",
    canal: "Email",
    estado: "Enviado",
  },
  {
    fecha: "2024-12-10 08:00",
    cliente: "Ana Martínez",
    regla: "Motivación 15 días",
    canal: "WhatsApp",
    estado: "Enviado",
  },
  { fecha: "2024-12-09 18:30", cliente: "Juan Pérez", regla: "Renovación 24h", canal: "WhatsApp", estado: "Pendiente" },
  { fecha: "2024-12-09 12:00", cliente: "Laura Sánchez", regla: "Bienvenida", canal: "Email", estado: "Fallido" },
]

export const employees = [
  {
    id: 1,
    nombre: "Pedro Ramírez",
    rol: "Entrenador",
    estado: "Activo",
    ultimaEntrada: "2024-12-10 07:00",
    horasEstaSemana: 42,
    horasPorDia: [
      { fecha: "2024-12-04", horaEntrada: "07:00", horaSalida: "15:00", horas: 8 },
      { fecha: "2024-12-05", horaEntrada: "07:00", horaSalida: "15:00", horas: 8 },
      { fecha: "2024-12-06", horaEntrada: "07:00", horaSalida: "13:00", horas: 6 },
      { fecha: "2024-12-07", horaEntrada: "07:00", horaSalida: "15:00", horas: 8 },
      { fecha: "2024-12-08", horaEntrada: "07:00", horaSalida: "13:00", horas: 6 },
      { fecha: "2024-12-09", horaEntrada: "07:00", horaSalida: "13:00", horas: 6 },
      { fecha: "2024-12-10", horaEntrada: "07:00", horaSalida: "15:00", horas: 8 },
    ],
  },
  {
    id: 2,
    nombre: "Sofía Castro",
    rol: "Recepción",
    estado: "Activo",
    ultimaEntrada: "2024-12-10 08:30",
    horasEstaSemana: 35,
    horasPorDia: [
      { fecha: "2024-12-04", horaEntrada: "08:30", horaSalida: "17:00", horas: 8.5 },
      { fecha: "2024-12-05", horaEntrada: "08:30", horaSalida: "13:00", horas: 4.5 },
      { fecha: "2024-12-06", horaEntrada: "08:30", horaSalida: "17:00", horas: 8.5 },
      { fecha: "2024-12-07", horaEntrada: "08:30", horaSalida: "13:00", horas: 4.5 },
      { fecha: "2024-12-08", horaEntrada: "08:30", horaSalida: "13:00", horas: 4.5 },
      { fecha: "2024-12-09", horaEntrada: "08:30", horaSalida: "13:00", horas: 4.5 },
      { fecha: "2024-12-10", horaEntrada: "08:30", horaSalida: "17:00", horas: 8.5 },
    ],
  },
  {
    id: 3,
    nombre: "Miguel Torres",
    rol: "Entrenador",
    estado: "Activo",
    ultimaEntrada: "2024-12-10 14:00",
    horasEstaSemana: 38,
    horasPorDia: [
      { fecha: "2024-12-04", horaEntrada: "14:00", horaSalida: "22:00", horas: 8 },
      { fecha: "2024-12-05", horaEntrada: "14:00", horaSalida: "20:00", horas: 6 },
      { fecha: "2024-12-06", horaEntrada: "14:00", horaSalida: "22:00", horas: 8 },
      { fecha: "2024-12-07", horaEntrada: "14:00", horaSalida: "20:00", horas: 6 },
      { fecha: "2024-12-08", horaEntrada: "14:00", horaSalida: "18:00", horas: 4 },
      { fecha: "2024-12-09", horaEntrada: "14:00", horaSalida: "20:00", horas: 6 },
      { fecha: "2024-12-10", horaEntrada: "14:00", horaSalida: "22:00", horas: 8 },
    ],
  },
  {
    id: 4,
    nombre: "Daniela López",
    rol: "Admin",
    estado: "Activo",
    ultimaEntrada: "2024-12-10 09:00",
    horasEstaSemana: 40,
    horasPorDia: [
      { fecha: "2024-12-04", horaEntrada: "09:00", horaSalida: "17:00", horas: 8 },
      { fecha: "2024-12-05", horaEntrada: "09:00", horaSalida: "17:00", horas: 8 },
      { fecha: "2024-12-06", horaEntrada: "09:00", horaSalida: "17:00", horas: 8 },
      { fecha: "2024-12-07", horaEntrada: "09:00", horaSalida: "17:00", horas: 8 },
      { fecha: "2024-12-08", horaEntrada: "09:00", horaSalida: "17:00", horas: 8 },
      { fecha: "2024-12-09", horaEntrada: "09:00", horaSalida: "17:00", horas: 8 },
      { fecha: "2024-12-10", horaEntrada: "09:00", horaSalida: "17:00", horas: 8 },
    ],
  },
  {
    id: 5,
    nombre: "Roberto Méndez",
    rol: "Mantenimiento",
    estado: "Inactivo",
    ultimaEntrada: "2024-12-04 10:00",
    horasEstaSemana: 16,
    horasPorDia: [
      { fecha: "2024-12-04", horaEntrada: "10:00", horaSalida: "14:00", horas: 4 },
      { fecha: "2024-12-05", horaEntrada: "10:00", horaSalida: "14:00", horas: 4 },
      { fecha: "2024-12-06", horaEntrada: "10:00", horaSalida: "14:00", horas: 4 },
      { fecha: "2024-12-07", horaEntrada: "10:00", horaSalida: "14:00", horas: 4 },
    ],
  },
]

export const reportAttendanceByDay = [
  { fecha: "04/12", asistencias: 145 },
  { fecha: "05/12", asistencias: 132 },
  { fecha: "06/12", asistencias: 158 },
  { fecha: "07/12", asistencias: 141 },
  { fecha: "08/12", asistencias: 167 },
  { fecha: "09/12", asistencias: 189 },
  { fecha: "10/12", asistencias: 124 },
]

export const reportAttendanceByPlan = [
  { plan: "Diario", asistencias: 234 },
  { plan: "Ticketera", asistencias: 189 },
  { plan: "Mensual", asistencias: 567 },
  { plan: "Trimestral", asistencias: 345 },
  { plan: "Anual", asistencias: 289 },
]

export const reportNewVsRenewals = [
  { mes: "Ene", nuevas: 45, renovaciones: 78 },
  { mes: "Feb", nuevas: 52, renovaciones: 82 },
  { mes: "Mar", nuevas: 61, renovaciones: 91 },
  { mes: "Abr", nuevas: 48, renovaciones: 86 },
  { mes: "May", nuevas: 55, renovaciones: 94 },
  { mes: "Jun", nuevas: 67, renovaciones: 102 },
]

export const reportTopPlans = [
  { plan: "Mensual", ventas: 412 },
  { plan: "Trimestral", ventas: 187 },
  { plan: "Anual", ventas: 156 },
  { plan: "Diario", ventas: 45 },
  { plan: "Ticketera", ventas: 32 },
]

export const reportIncomeByMonth = [
  { mes: "Ene", ingresos: 7.2 },
  { mes: "Feb", ingresos: 7.8 },
  { mes: "Mar", ingresos: 8.1 },
  { mes: "Abr", ingresos: 7.5 },
  { mes: "May", ingresos: 8.4 },
  { mes: "Jun", ingresos: 9.2 },
]

export const reportIncomeByCoupon = [
  { nicho: "Alimenticio", ingresos: 5.2 },
  { nicho: "Estético", ingresos: 3.8 },
]

export const reportReferralsImpact = {
  clientesReferidos: 127,
  porcentaje: 15,
  mesesGratis: 89,
  ratioConversion: 68,
}
