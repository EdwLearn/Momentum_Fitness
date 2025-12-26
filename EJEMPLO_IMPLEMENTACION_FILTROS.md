# Ejemplo de Implementación de Filtros

Este documento muestra paso a paso cómo agregar filtros a tus tablas existentes.

## Ejemplo 1: Actualizar Página de Clientes

### Paso 1: Importar el nuevo componente

```tsx
// Antes
import { DataTable, StatusBadge } from "@/components/data-table"

// Después
import { FilterableDataTable } from "@/components/filterable-data-table"
import { StatusBadge } from "@/components/data-table"
```

### Paso 2: Actualizar la configuración de columnas

```tsx
// Antes
const clientColumns = [
  { key: "nombre", header: "Nombre" },
  { key: "cedula", header: "Documento Único" },
  { key: "plan", header: "Tipo de Plan" },
  {
    key: "estado",
    header: "Estado",
    render: (item: Client) => <StatusBadge status={item.estado} />,
  },
]

// Después
const clientColumns = [
  {
    key: "nombre",
    header: "Nombre",
    sortable: true,  // ✅ Agregar ordenamiento
    filter: {         // ✅ Agregar filtro
      type: "text" as const,
      placeholder: "Buscar por nombre..."
    }
  },
  {
    key: "cedula",
    header: "Documento Único",
    sortable: true,
    filter: {
      type: "text" as const,
      placeholder: "Buscar por cédula..."
    }
  },
  {
    key: "plan",
    header: "Tipo de Plan",
    sortable: true,
    filter: {
      type: "select" as const,
      options: [
        { label: "Pase Diario", value: "Pase Diario" },
        { label: "Pase Flex", value: "Pase Flex" },
        { label: "Mensual", value: "Mensual" },
        { label: "Plan 3 Meses", value: "Plan 3 Meses" },
        { label: "Plan 6 Meses", value: "Plan 6 Meses" },
        { label: "Elite Anual", value: "Elite Anual" },
      ],
      placeholder: "Filtrar por plan..."
    }
  },
  {
    key: "fechaInicio",
    header: "Fecha Registro",
    sortable: true,
    filter: {
      type: "date" as const
    }
  },
  {
    key: "fechaFin",
    header: "Fecha Fin",
    sortable: true,
    filter: {
      type: "date" as const
    }
  },
  {
    key: "estado",
    header: "Estado",
    sortable: true,
    filter: {
      type: "select" as const,
      options: [
        { label: "Activo", value: "Activo" },
        { label: "Sin membresía", value: "Sin membresía" },
      ],
      placeholder: "Filtrar por estado..."
    },
    render: (item: Client) => <StatusBadge status={item.estado} />,
  },
  {
    key: "referidoPor",
    header: "Referido Por",
    sortable: true,
    filter: {
      type: "text" as const,
      placeholder: "Buscar referidor..."
    }
  },
  {
    key: "ultimaAsistencia",
    header: "Última Asistencia",
    sortable: true,
    filter: {
      type: "date" as const
    }
  },
  {
    key: "diasEntrenados",
    header: "Días Entrenados",
    sortable: true,
    filter: {
      type: "number" as const,
      placeholder: "Ej: 10"
    }
  },
  {
    key: "acciones",
    header: "Acciones",
    render: (item: Client) => (
      <div className="flex gap-2">
        <Button onClick={() => handleEditClick(item.id)}>
          <Edit className="h-4 w-4 mr-1" />
          Editar
        </Button>
        <Button onClick={() => handleRenewClick(item.id)}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Renovar
        </Button>
      </div>
    ),
  },
]
```

### Paso 3: Reemplazar el componente en el render

```tsx
// Antes
<ChartCard title="Lista de Clientes" subtitle={`${filteredClients.length} clientes encontrados`}>
  {/* Barra de búsqueda manual */}
  <div className="flex items-center justify-between gap-4 mb-6">
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Buscar por nombre o teléfono"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-9 bg-secondary border-border focus:border-primary"
      />
    </div>
  </div>

  <DataTable
    columns={clientColumns}
    data={filteredClients}
  />
</ChartCard>

// Después
<ChartCard title="Lista de Clientes" subtitle="Administra y filtra tus clientes">
  {/* ✅ El componente incluye búsqueda y filtros integrados */}
  <FilterableDataTable
    columns={clientColumns}
    data={clients}  // ✅ Pasar datos sin filtrar, el componente se encarga
    searchPlaceholder="Buscar clientes por nombre, cédula, plan..."
    showGlobalSearch={true}
    emptyMessage="No se encontraron clientes que coincidan con los filtros"
  />
</ChartCard>
```

### Paso 4: Eliminar código de filtrado manual (opcional)

Ya que el componente maneja el filtrado, puedes eliminar:

```tsx
// ❌ Ya no necesitas esto
const [searchTerm, setSearchTerm] = useState("")

const filteredClients = clients.filter(
  (client) =>
    client.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.cedula.includes(searchTerm),
)
```

## Ejemplo 2: Actualizar Página de Empleados

### Configuración de columnas con filtros

```tsx
const employeeColumns = [
  {
    key: "nombre",
    header: "Nombre",
    sortable: true,
    filter: {
      type: "text" as const,
      placeholder: "Buscar por nombre..."
    }
  },
  {
    key: "cedula",
    header: "Cédula",
    sortable: true,
    filter: {
      type: "text" as const,
      placeholder: "Buscar por cédula..."
    }
  },
  {
    key: "tipo",
    header: "Tipo",
    sortable: true,
    filter: {
      type: "select" as const,
      options: [
        { label: "Entrenador", value: "Entrenador" },
        { label: "Recepción", value: "Recepción" },
      ],
      placeholder: "Filtrar por tipo..."
    }
  },
  {
    key: "telefono",
    header: "Teléfono",
    filter: {
      type: "text" as const,
      placeholder: "Buscar teléfono..."
    }
  },
  {
    key: "fechaContratacion",
    header: "Fecha Contratación",
    sortable: true,
    filter: {
      type: "date" as const
    }
  },
  {
    key: "estado",
    header: "Estado",
    filter: {
      type: "select" as const,
      options: [
        { label: "Activo", value: "Activo" },
        { label: "Inactivo", value: "Inactivo" },
      ]
    },
    render: (item: EmpleadoDisplay) => (
      <StatusBadge status={item.estado} />
    ),
  },
  {
    key: "acciones",
    header: "Acciones",
    render: (item: EmpleadoDisplay) => (
      <Button onClick={() => handleEditClick(item.id)}>
        <Edit className="h-4 w-4 mr-1" />
        Editar
      </Button>
    ),
  },
]
```

### Implementación

```tsx
<FilterableDataTable
  columns={employeeColumns}
  data={empleadosDisplay}
  searchPlaceholder="Buscar empleados por nombre o cédula..."
  emptyMessage="No se encontraron empleados"
/>
```

## Ejemplo 3: Página de Asistencias

### Preparar los datos

```tsx
// Transformar asistencias para incluir nombre del cliente
const asistenciasDisplay = useMemo(() => {
  if (!asistenciasHoy || !usuarios) return []

  return asistenciasHoy.map(asistencia => {
    const usuario = usuarios.find(u => u.id === asistencia.usuario_id)
    const membresia = membresias?.find(m =>
      m.usuario_id === asistencia.usuario_id && m.activo && m.estado === "activa"
    )

    return {
      id: asistencia.id,
      cliente: usuario ? `${usuario.nombre} ${usuario.apellido}` : "Desconocido",
      cedula: usuario?.telefono || "N/A",
      plan: membresia ? planMap[membresia.tipo_plan] || membresia.tipo_plan : "N/A",
      fecha: asistencia.fecha,
      horaEntrada: asistencia.hora_entrada,
      horaSalida: asistencia.hora_salida || "En curso",
    }
  })
}, [asistenciasHoy, usuarios, membresias])
```

### Configuración de columnas

```tsx
const asistenciaColumns = [
  {
    key: "cliente",
    header: "Cliente",
    sortable: true,
    filter: {
      type: "text" as const,
      placeholder: "Buscar cliente..."
    }
  },
  {
    key: "cedula",
    header: "Cédula",
    filter: {
      type: "text" as const,
      placeholder: "Buscar cédula..."
    }
  },
  {
    key: "plan",
    header: "Plan",
    sortable: true,
    filter: {
      type: "select" as const,
      options: [
        { label: "Pase Diario", value: "Pase Diario" },
        { label: "Pase Flex", value: "Pase Flex" },
        { label: "Mensual", value: "Mensual" },
        { label: "Plan 3 Meses", value: "Plan 3 Meses" },
        { label: "Plan 6 Meses", value: "Plan 6 Meses" },
        { label: "Elite Anual", value: "Elite Anual" },
      ],
      placeholder: "Filtrar por plan..."
    }
  },
  {
    key: "fecha",
    header: "Fecha",
    sortable: true,
    filter: {
      type: "date" as const
    }
  },
  {
    key: "horaEntrada",
    header: "Hora Entrada",
    sortable: true,
    filter: {
      type: "text" as const,
      placeholder: "Ej: 08:30"
    }
  },
  {
    key: "horaSalida",
    header: "Hora Salida",
    sortable: true
  },
]
```

### Implementación

```tsx
<ChartCard title="Asistencias de Hoy" subtitle="Registro en tiempo real">
  <FilterableDataTable
    columns={asistenciaColumns}
    data={asistenciasDisplay}
    searchPlaceholder="Buscar por cliente, cédula o plan..."
    emptyMessage="No hay asistencias registradas hoy"
  />
</ChartCard>
```

## Ejemplo 4: Tabla de Cupones (Ya implementado)

La página de cupones ya tiene filtros, pero podemos mejorarla con el nuevo componente:

### Configuración

```tsx
const couponColumns = [
  {
    key: "codigo",
    header: "Código",
    sortable: true,
    filter: {
      type: "text" as const,
      placeholder: "Buscar código..."
    }
  },
  {
    key: "nicho",
    header: "Nicho",
    sortable: true,
    filter: {
      type: "select" as const,
      options: [
        { label: "Alimenticio", value: "Alimenticio" },
        { label: "Estético", value: "Estético" },
      ],
      placeholder: "Filtrar por nicho..."
    },
    render: (item: Cupon) => (
      <Badge variant="outline">{item.nicho}</Badge>
    ),
  },
  {
    key: "descuento",
    header: "% Descuento",
    sortable: true,
    filter: {
      type: "number" as const,
      placeholder: "Ej: 10"
    },
    render: (item: Cupon) => (
      <span className="text-primary font-semibold">{item.descuento}%</span>
    ),
  },
  {
    key: "usos_total",
    header: "Usos Totales",
    sortable: true,
    filter: {
      type: "number" as const,
      placeholder: "Ej: 50"
    }
  },
  {
    key: "usos_anio",
    header: "Usos Este Año",
    sortable: true,
    filter: {
      type: "number" as const
    }
  },
  {
    key: "activo",
    header: "Estado",
    filter: {
      type: "boolean" as const
    },
    render: (item: Cupon) => (
      <Switch
        checked={item.activo}
        onCheckedChange={() => handleToggleCupon(item.id)}
      />
    ),
  },
]
```

### Uso

```tsx
// ❌ Eliminar filtros manuales
<div className="mb-4 flex gap-3">
  <Input value={searchTerm} onChange={...} />
  <Select value={nichoFilter} onValueChange={...}>...</Select>
  <Select value={statusFilter} onValueChange={...}>...</Select>
</div>

// ✅ Usar componente integrado
<FilterableDataTable
  columns={couponColumns}
  data={cupones}
  searchPlaceholder="Buscar cupones por código..."
  emptyMessage="No se encontraron cupones"
/>
```

## Checklist de Implementación

Para cada tabla que quieras actualizar:

- [ ] Importar `FilterableDataTable` en lugar de `DataTable`
- [ ] Agregar `sortable: true` a columnas que quieras ordenar
- [ ] Agregar `filter` config a columnas que quieras filtrar
  - [ ] Elegir `type` correcto (text, select, date, number, boolean)
  - [ ] Para `select`: definir array de `options`
  - [ ] Agregar `placeholder` descriptivo
- [ ] Reemplazar `<DataTable>` con `<FilterableDataTable>`
- [ ] Pasar datos SIN filtrar al componente
- [ ] Eliminar código de filtrado manual (useState, filter, etc.)
- [ ] Probar búsqueda global
- [ ] Probar filtros individuales
- [ ] Probar ordenamiento
- [ ] Probar limpieza de filtros

## Beneficios

✅ **Menos código**: Eliminas lógica de filtrado manual
✅ **Más funcionalidad**: Filtros + ordenamiento + búsqueda
✅ **Mejor UX**: Interfaz consistente en todas las tablas
✅ **Mantenible**: Un solo componente para actualizar
✅ **Performante**: Memoización y optimizaciones integradas

## Siguiente Paso

Empieza por una tabla sencilla (ej: empleados) y luego replica el patrón en las demás.

¡Éxito con la implementación! 🚀
