# Sistema de Filtros para Tablas

Este documento explica cómo usar el componente `FilterableDataTable` para agregar filtros avanzados a todas las tablas de la aplicación.

## Componente FilterableDataTable

### Características

✅ **Búsqueda global**: Busca en todas las columnas simultáneamente
✅ **Filtros por columna**: Cada columna puede tener su propio filtro
✅ **Tipos de filtro**: text, select, date, number, boolean
✅ **Ordenamiento**: Click en headers para ordenar (ascendente/descendente)
✅ **Limpieza de filtros**: Botón para limpiar todos los filtros
✅ **Contador de resultados**: Muestra cuántos registros coinciden
✅ **Badge de filtros activos**: Indica cuántos filtros están aplicados
✅ **Responsive**: Se adapta a diferentes tamaños de pantalla

### Tipos de Filtros Disponibles

| Tipo | Descripción | Ejemplo de Uso |
|------|-------------|----------------|
| `text` | Campo de texto libre | Nombre, email, descripción |
| `select` | Lista desplegable de opciones | Estado, tipo de plan, género |
| `date` | Selector de fecha | Fecha de registro, vencimiento |
| `number` | Campo numérico | Edad, precio, cantidad |
| `boolean` | Sí/No | Activo/Inactivo, completado |

## Ejemplos de Uso

### Ejemplo 1: Tabla de Clientes con Filtros

```tsx
import { FilterableDataTable } from "@/components/filterable-data-table"
import { StatusBadge } from "@/components/data-table"

const clientColumns = [
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
    key: "estado",
    header: "Estado",
    sortable: true,
    filter: {
      type: "select" as const,
      options: [
        { label: "Activo", value: "Activo" },
        { label: "Inactivo", value: "Inactivo" },
        { label: "Sin membresía", value: "Sin membresía" },
      ],
      placeholder: "Filtrar por estado..."
    },
    render: (item) => <StatusBadge status={item.estado} />
  },
  {
    key: "diasEntrenados",
    header: "Días Entrenados",
    sortable: true,
    filter: {
      type: "number" as const,
      placeholder: "Filtrar por días..."
    }
  },
  {
    key: "acciones",
    header: "Acciones",
    render: (item) => (
      <div className="flex gap-2">
        <Button onClick={() => handleEdit(item.id)}>Editar</Button>
      </div>
    )
  },
]

// Uso del componente
<FilterableDataTable
  columns={clientColumns}
  data={clientes}
  searchPlaceholder="Buscar clientes por nombre, cédula..."
  showGlobalSearch={true}
  emptyMessage="No se encontraron clientes"
/>
```

### Ejemplo 2: Tabla de Empleados

```tsx
const empleadoColumns = [
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
      type: "text" as const
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
    key: "estado",
    header: "Estado",
    filter: {
      type: "select" as const,
      options: [
        { label: "Activo", value: "Activo" },
        { label: "Inactivo", value: "Inactivo" },
      ]
    },
    render: (item) => <StatusBadge status={item.estado} />
  }
]

<FilterableDataTable
  columns={empleadoColumns}
  data={empleados}
  searchPlaceholder="Buscar empleados..."
/>
```

### Ejemplo 3: Tabla de Cupones

```tsx
const cuponColumns = [
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
    filter: {
      type: "select" as const,
      options: [
        { label: "Alimenticio", value: "Alimenticio" },
        { label: "Estético", value: "Estético" },
      ]
    },
    render: (item) => (
      <Badge variant="outline">{item.nicho}</Badge>
    )
  },
  {
    key: "descuento",
    header: "% Descuento",
    sortable: true,
    filter: {
      type: "number" as const,
      placeholder: "Filtrar por %..."
    },
    render: (item) => <span className="text-primary font-semibold">{item.descuento}%</span>
  },
  {
    key: "activo",
    header: "Activo",
    filter: {
      type: "boolean" as const
    },
    render: (item) => (
      <Switch checked={item.activo} />
    )
  }
]

<FilterableDataTable
  columns={cuponColumns}
  data={cupones}
/>
```

### Ejemplo 4: Tabla de Asistencias

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
  }
]

<FilterableDataTable
  columns={asistenciaColumns}
  data={asistencias}
  searchPlaceholder="Buscar asistencias..."
/>
```

## Propiedades del Componente

### FilterableDataTableProps

| Prop | Tipo | Requerido | Default | Descripción |
|------|------|-----------|---------|-------------|
| `columns` | `Column<T>[]` | ✅ | - | Configuración de columnas |
| `data` | `T[]` | ✅ | - | Array de datos a mostrar |
| `onRowAction` | `(item: T) => void` | ❌ | - | Callback al hacer click en fila |
| `actionLabel` | `string` | ❌ | "Ver" | Texto del botón de acción |
| `searchPlaceholder` | `string` | ❌ | "Buscar..." | Placeholder de búsqueda global |
| `showGlobalSearch` | `boolean` | ❌ | `true` | Mostrar búsqueda global |
| `emptyMessage` | `string` | ❌ | "No se encontraron resultados" | Mensaje cuando no hay datos |

### Column Interface

```typescript
interface Column<T> {
  key: keyof T | string          // Clave de la propiedad
  header: string                  // Texto del encabezado
  render?: (item: T) => ReactNode // Función custom para renderizar
  filter?: ColumnFilter          // Configuración del filtro
  sortable?: boolean             // Si permite ordenamiento
}
```

### ColumnFilter Interface

```typescript
interface ColumnFilter {
  type: "text" | "select" | "date" | "number" | "boolean"
  options?: Array<{ label: string; value: string }> // Para tipo select
  placeholder?: string                               // Texto placeholder
}
```

## Características Avanzadas

### 1. Propiedades Anidadas

Puedes filtrar/ordenar por propiedades anidadas usando notación de punto:

```tsx
{
  key: "usuario.nombre",  // Accede a item.usuario.nombre
  header: "Usuario",
  sortable: true
}
```

### 2. Renderizado Custom

Usa la función `render` para personalizar cómo se muestra cada celda:

```tsx
{
  key: "precio",
  header: "Precio",
  render: (item) => (
    <span className="font-bold text-primary">
      ${item.precio.toLocaleString()}
    </span>
  )
}
```

### 3. Múltiples Filtros Simultáneos

Todos los filtros se aplican en conjunto (AND lógico):
- Búsqueda global: "Juan"
- Filtro Estado: "Activo"
- Filtro Plan: "Mensual"

Resultado: Solo clientes llamados Juan, con estado Activo y plan Mensual.

### 4. Ordenamiento

Click en headers marcados como `sortable: true`:
- 1er click: Orden ascendente ⬆️
- 2do click: Orden descendente ⬇️
- 3er click: Sin orden (vuelve al original)

### 5. Limpieza de Filtros

- Botón "Limpiar" global: Limpia búsqueda global + todos los filtros
- Botón "X" individual: Limpia solo ese filtro
- Badge numérico: Muestra cantidad de filtros activos

## Migración desde DataTable

Para migrar de `DataTable` a `FilterableDataTable`:

### Antes:
```tsx
<DataTable
  columns={columns}
  data={data}
  onRowAction={handleAction}
/>
```

### Después:
```tsx
<FilterableDataTable
  columns={columnsConFiltros}  // Agregar config de filtros
  data={data}
  onRowAction={handleAction}
  showGlobalSearch={true}      // Habilitar búsqueda global
/>
```

## Tips y Best Practices

1. **Filtros Select**: Usa para campos con opciones limitadas (estado, tipo, categoría)
2. **Filtros Text**: Usa para campos de texto libre (nombre, email, descripción)
3. **Filtros Date**: Usa para fechas (registro, vencimiento)
4. **Filtros Number**: Usa para números (edad, precio, cantidad)
5. **Sortable**: Marca como `true` las columnas que tiene sentido ordenar
6. **Placeholders**: Añade placeholders descriptivos para mejorar UX
7. **EmptyMessage**: Personaliza el mensaje cuando no hay resultados
8. **Renderizado**: Usa `render` para badges, iconos, botones, etc.

## Estilos y Personalización

El componente usa Tailwind CSS y las clases del design system:

- `bg-secondary`: Fondo de inputs
- `border-border`: Bordes
- `text-muted-foreground`: Texto secundario
- `text-primary`: Color primario
- `hover:bg-secondary/30`: Hover en filas

Puedes personalizar los estilos modificando el componente o sobrescribiendo las clases.

## Ejemplo Completo

Ver archivos de ejemplo:
- [Clientes con Filtros](app/clientes/page.tsx)
- [Empleados con Filtros](app/empleados/page.tsx)
- [Cupones con Filtros](app/cupones/page.tsx)

## Soporte

Para dudas o problemas con los filtros, contacta al equipo de desarrollo.
