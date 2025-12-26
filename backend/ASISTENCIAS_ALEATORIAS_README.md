# Script de Asistencias Aleatorias

Script para marcar asistencias aleatorias de clientes, útil para simular la actividad diaria del gimnasio.

## Archivo

**marcar_asistencia_aleatoria.py**: Script para marcar asistencias de forma automática y aleatoria

## Características

### Distribución Realista

El script simula patrones de asistencia realistas:

**Probabilidad de asistencia diaria por plan:**
- Pase Diario: 100% (usan su pase único)
- Pase Flex: 50%
- Mensual: 40%
- Plan 3 Meses: 50%
- Plan 6 Meses: 60%
- Platinum (Elite Anual): 70%

**Distribución de horarios:**
- 06:00-09:00: 30% (hora pico mañana)
- 09:00-12:00: 10%
- 12:00-15:00: 5%
- 15:00-18:00: 10%
- 18:00-22:00: 35% (hora pico noche)
- 22:00-23:00: 10%

**Duración de sesiones:**
- Tiempo de entrenamiento: 60-150 minutos (1-2.5 horas)
- Se calcula automáticamente hora de entrada y salida

### Funcionalidades

✅ Marca solo clientes con membresías activas
✅ Evita duplicados (no marca dos veces el mismo día)
✅ Actualiza contador de días entrenados del cliente
✅ Actualiza fecha de última asistencia
✅ Menos asistencias en fines de semana
✅ Distribución realista por horarios

## Uso

### 1. Marcar asistencias para hoy (automático)

Marca asistencias según probabilidad de cada plan:

```bash
source venv/bin/activate
python marcar_asistencia_aleatoria.py
```

**Salida:**
```
============================================================
🏋️  MARCANDO ASISTENCIAS ALEATORIAS - 2025-12-25
============================================================

📊 Clientes con membresías activas: 500

✅ Asistencias marcadas: 245

⏰ Distribución por horario:
  Mañana (06:00-09:00): 74 (30.2%)
  Media mañana (09:00-12:00): 25 (10.2%)
  Mediodía (12:00-15:00): 12 (4.9%)
  Tarde (15:00-18:00): 24 (9.8%)
  Noche (18:00-22:00): 86 (35.1%)
  Noche tardía (22:00-23:00): 24 (9.8%)

👥 Ejemplos de asistencias marcadas (mostrando primeras 10):
  1. Carlos García Martínez (mensual) - 07:15
  2. Laura Rodríguez Pérez (plan_6_meses) - 19:45
  3. Diego Hernández López (mensual) - 08:30
  ...
```

### 2. Marcar número específico de clientes

```bash
python marcar_asistencia_aleatoria.py --num-clientes 50
```

Marca exactamente 50 clientes aleatorios (útil para simular días específicos).

### 3. Marcar asistencias para fecha específica

```bash
python marcar_asistencia_aleatoria.py --fecha 2024-12-20
```

### 4. Marcar asistencias para múltiples días

```bash
# Últimos 7 días
python marcar_asistencia_aleatoria.py --dias 7

# Últimos 30 días
python marcar_asistencia_aleatoria.py --dias 30
```

**Salida:**
```
============================================================
🗓️  MARCANDO ASISTENCIAS PARA 7 DÍAS
============================================================

📅 Día 1/7: 2025-12-19 (Friday)
  ✅ 247 asistencias marcadas

📅 Día 2/7: 2025-12-20 (Saturday)
  ✅ 28 asistencias marcadas

📅 Día 3/7: 2025-12-21 (Sunday)
  ✅ 22 asistencias marcadas

📅 Día 4/7: 2025-12-22 (Monday)
  ✅ 253 asistencias marcadas

...

============================================================
✅ COMPLETADO: 1,542 asistencias en 7 días
📊 Promedio diario: 220.3
============================================================
```

### 5. Ver estadísticas del día actual

```bash
python marcar_asistencia_aleatoria.py --stats
```

**Salida:**
```
============================================================
📊 ESTADÍSTICAS DE HOY - 2025-12-25
============================================================

✅ Total asistencias: 245

📋 Por tipo de plan:
  - pase_diario: 45
  - pase_flex: 38
  - mensual: 72
  - plan_3_meses: 50
  - plan_6_meses: 28
  - elite_anual: 12

============================================================
```

## Opciones Disponibles

| Opción | Descripción | Ejemplo |
|--------|-------------|---------|
| `--fecha YYYY-MM-DD` | Marca para fecha específica | `--fecha 2024-12-20` |
| `--num-clientes N` | Marca N clientes aleatorios | `--num-clientes 50` |
| `--dias N` | Marca para N días hacia atrás | `--dias 7` |
| `--stats` | Muestra estadísticas del día | `--stats` |

## Ejemplos de Uso Combinado

### Simular un día tranquilo (lunes)
```bash
python marcar_asistencia_aleatoria.py --num-clientes 30
```

### Simular un día concurrido (hora pico)
```bash
python marcar_asistencia_aleatoria.py --num-clientes 80
```

### Llenar datos históricos
```bash
# Últimos 30 días con asistencias realistas
python marcar_asistencia_aleatoria.py --dias 30
```

### Marcar para un día festivo específico
```bash
# Menos asistencias en días festivos
python marcar_asistencia_aleatoria.py --fecha 2024-12-25 --num-clientes 15
```

## Lógica del Algoritmo

1. **Consulta clientes activos**: Obtiene todos los clientes con membresías vigentes
2. **Filtra duplicados**: Verifica que no tengan asistencia marcada para esa fecha
3. **Aplica probabilidad**: Cada plan tiene su probabilidad de asistencia
4. **Genera horarios**: Distribuye según horarios pico y normales
5. **Calcula duración**: Sesiones de 1-2.5 horas
6. **Actualiza registros**: Marca asistencia y actualiza contadores del cliente

## Ventajas

✅ **Datos realistas**: Simula patrones reales de asistencia
✅ **Flexible**: Múltiples opciones para diferentes escenarios
✅ **Seguro**: No crea duplicados ni datos inválidos
✅ **Completo**: Actualiza todos los campos relacionados
✅ **Eficiente**: Procesa cientos de clientes rápidamente

## Casos de Uso

### Desarrollo
- Probar dashboards con datos realistas
- Validar reportes de asistencia
- Verificar cálculos de métricas

### Demostración
- Mostrar sistema con datos del día
- Simular actividad histórica
- Presentar estadísticas realistas

### Testing
- Probar rendimiento con alta carga
- Validar edge cases
- Verificar integridad de datos

## Notas Importantes

⚠️ **Consideraciones:**
- El script solo marca clientes con membresías ACTIVAS
- No sobrescribe asistencias existentes del mismo día
- En fines de semana genera menos asistencias automáticamente
- Los horarios siguen distribución realista (más en mañana y noche)

💡 **Tips:**
- Usa `--stats` para verificar antes de marcar más asistencias
- Combina con `--num-clientes` para control preciso
- Para datos históricos, usa `--dias` con el rango deseado

## Integración con Otros Scripts

Este script complementa el generador de datos de prueba:

1. **seed_data_generator.py**: Genera clientes base (nov-dic 2024)
2. **marcar_asistencia_aleatoria.py**: Añade asistencias actuales (dic 2025+)
3. **verify_seed_data.py**: Verifica integridad de todos los datos

## Soporte

Para problemas o preguntas, contacta al equipo de desarrollo.
