# Sistema de Beneficios de Referidos

## Resumen

El sistema de referidos tiene dos tipos de beneficios:

### 1. Beneficio para el REFERIDO (quien compra)
- **5% de descuento** en su membresía
- Se aplica automáticamente al momento de la compra
- Válido para planes largos (Mensual, 3 Meses, 6 Meses, Elite Anual)

### 2. Beneficio para el REFERIDOR (quien refiere)
- **Acumulación de días gratis** basada en referidos activos
- **Cada 3 referidos activos = 30 días gratis** (1 mes)
- Los días se acumulan mientras los referidos mantengan sus membresías activas

## Cálculo de Beneficios del Referidor

### Fórmula
```
Referidos activos ÷ 3 = Meses ganados
Meses ganados × 30 = Días totales gratis
```

### Ejemplos

| Referidos Activos | Meses Ganados | Días Totales | Estado |
|-------------------|---------------|--------------|--------|
| 1 | 0 | 0 | Faltan 2 para 1 mes gratis |
| 2 | 0 | 0 | Falta 1 para 1 mes gratis |
| 3 | 1 | 30 días | ¡1 mes gratis ganado! |
| 4 | 1 | 30 días | Faltan 2 para el próximo mes |
| 5 | 1 | 30 días | Falta 1 para el próximo mes |
| 6 | 2 | 60 días | ¡2 meses gratis ganados! |
| 9 | 3 | 90 días | ¡3 meses gratis ganados! |
| 12 | 4 | 120 días | ¡4 meses gratis ganados! |

## Condiciones para que un Referido Cuente como "Activo"

Un referido se cuenta como activo cuando:

1. ✅ Tiene una membresía registrada en el sistema
2. ✅ La membresía es de un plan largo válido:
   - Mensual
   - Plan 3 Meses
   - Plan 6 Meses
   - Elite Anual
3. ✅ La membresía está activa (`activo = True`)
4. ✅ La membresía no ha expirado (`fecha_fin >= ahora`)
5. ✅ El campo `cumple_condicion = True` en la tabla de referidos

### Planes NO válidos para referidos
- Pase Diario (muy corto)
- Pase Flex (muy corto)

## Tabla de Referidos

### Columnas

#### 1. Referidor
Nombre del cliente que hizo el referido.

#### 2. Referido
Nombre del cliente que fue referido y compró.

#### 3. Plan Comprado
El tipo de plan que compró el referido:
- `pase_diario`
- `pase_flex`
- `mensual`
- `plan_3_meses`
- `plan_6_meses`
- `elite_anual`

#### 4. Cumple Condición
- ✅ **Sí**: El referido tiene membresía activa válida
- ❌ **No**: La membresía está inactiva o el plan no es válido

#### 5. Beneficio Otorgado
Muestra el beneficio **acumulado** del referidor (no del referido individual):

**Posibles valores:**
- `"Pendiente"` - El referido aún no ha activado su membresía
- `"Membresía inactiva"` - La membresía del referido expiró
- `"Pendiente de activación"` - El referido compró pero no cumple condiciones
- `"0 días (faltan X referidos para 1 mes gratis)"` - Tiene menos de 3 referidos activos
- `"1 mes(es) gratis (30 días) - Faltan X para el próximo mes"` - Ha ganado meses, muestra progreso
- `"2 mes(es) gratis (60 días)"` - Ha ganado 2+ meses

## Actualización del Cálculo

### Archivo Modificado
`backend/app/crud/referidos.py` - Función `get_referidos_detallados()`

### Lógica Implementada
```python
# Contar referidos activos del referidor
referidos_activos = contar_referidos_activos(db, ref.referidor_id)

# Cada 3 referidos activos = 30 días gratis
meses_ganados = referidos_activos // 3
dias_totales = meses_ganados * 30
referidos_para_proximo = 3 - (referidos_activos % 3)
```

## Verificación

### Script de Prueba
```bash
cd backend
source venv/bin/activate
python test_beneficios_referidos.py
```

Este script muestra los primeros 10 referidos con sus beneficios calculados correctamente.

### Endpoint API
```bash
GET http://localhost:8000/api/referidos/detallados
```

Retorna la lista completa de referidos con beneficios calculados en tiempo real.

## Ejemplo de Respuesta API

```json
[
  {
    "id": 1,
    "referidor": "Osne montoy",
    "referido": "eddy eddy",
    "plan_comprado": "mensual",
    "cumple_condicion": true,
    "beneficio": "1 mes(es) gratis (30 días) - Faltan 2 para el próximo mes",
    "fecha_referido": "2025-12-24T20:44:23.419556",
    "fecha_activacion": null
  },
  {
    "id": 5,
    "referidor": "Rocío Guerrero Ramírez",
    "referido": "Beatriz Rojas Herrera",
    "plan_comprado": "plan_3_meses",
    "cumple_condicion": true,
    "beneficio": "0 días (faltan 3 referidos para 1 mes gratis)",
    "fecha_referido": "2024-12-23T13:08:00",
    "fecha_activacion": null
  }
]
```

## Frontend

### Componente
`app/cupones/page.tsx` - Sección "Lista de Referidos"

### Tabla
La tabla muestra:
- **Referidor**: Filtrable por texto
- **Referido**: Filtrable por texto
- **Plan Comprado**: Filtrable por texto
- **Cumple Condición**: Filtrable por Sí/No
- **Beneficio Otorgado**: Muestra días gratis acumulados del referidor

### Filtros y Ordenamiento
- Todas las columnas son ordenables (ASC/DESC)
- Búsqueda global disponible
- Filtros individuales por columna
- Badge visual para "Pendiente" vs beneficios ganados

## Notas Importantes

1. **El beneficio se calcula en tiempo real**: No está almacenado en la base de datos, se calcula cada vez que se consulta la tabla.

2. **El mismo referidor aparece múltiples veces**: Una fila por cada persona que refirió, pero el beneficio mostrado es el acumulado total.

3. **Los días se acumulan automáticamente**: No requiere activación manual, se calculan basándose en los referidos activos.

4. **Si un referido cancela su membresía**: Los días del referidor se recalculan automáticamente (disminuyen).

## Mantenimiento

Si necesitas actualizar la lógica de cálculo, edita:
```
backend/app/crud/referidos.py
Función: get_referidos_detallados()
Líneas: 56-88
```

La fórmula actual es:
- 3 referidos = 30 días
- Puedes cambiarla editando `meses_ganados = referidos_activos // 3`
