# Generador de Datos de Prueba - Momentum Fitness

Este directorio contiene scripts para generar y verificar datos de prueba realistas para el sistema de gestión de gimnasio.

## Archivos

- **seed_data_generator.py**: Script principal que genera todos los datos de prueba
- **verify_seed_data.py**: Script de verificación para validar la integridad de los datos generados

## Datos Generados

### 1. Cupones (3 cupones)
- **PRIMERA_VEZ**: 10% descuento, válido para planes 3M/6M/Platinum
- **RENUEVA_AHORA**: 10% descuento, válido para planes Mensual/3M/6M/Platinum
- **UPGRADE_6M**: 15% descuento, válido para plan 6 meses

Todos los cupones tienen fecha de expiración feb-mar 2026 y están activos.

### 2. Empleados (4 empleados)

**Entrenadores:**
- Carlos Ramírez: turno 06:00-14:00, lun-sáb
- Laura Gómez: turno 14:00-22:00, lun-sáb

**Recepción:**
- Andrés Torres: turno 06:00-14:00, lun-sáb
- María Henao: turno 14:00-22:00, lun-sáb

### 3. Clientes (500 clientes)

**Distribución de planes:**
- Pase Diario: 50 (10%)
- Pase Flex: 75 (15%)
- Mensual: 175 (35%)
- Plan 3 Meses: 100 (20%)
- Plan 6 Meses: 70 (14%)
- Platinum (Elite Anual): 30 (6%)

**Características:**
- Nombres colombianos realistas
- Cédulas únicas de 10 dígitos
- Edad: 18-40 años
- Distribución de género: ~60% hombres, ~40% mujeres
- Fechas de membresía: entre nov 25 - dic 25, 2024
- Precios con descuentos aplicados correctamente

**Referidos y Cupones:**
- 30% de clientes son referidos (reciben 5% descuento)
- Solo clientes con plan Mensual o superior pueden referir
- Los cupones y referidos NO se aplican juntos
- Distribución de cupones:
  - 15% usan "PRIMERA_VEZ"
  - 8% usan "RENUEVA_AHORA"
  - 5% usan "UPGRADE_6M"

### 4. Asistencias de Clientes

**Período:** nov 25 - dic 25, 2024 (1 mes)

**Frecuencia por plan:**
- Pase Diario: 1 vez
- Pase Flex: 10-14 veces
- Mensual: 12-20 veces
- Plan 3 Meses: 15-25 veces
- Plan 6 Meses: 18-28 veces
- Platinum: 20-30 veces

**Características:**
- Horarios realistas:
  - 30% entre 06:00-09:00
  - 25% entre 18:00-22:00
  - Resto distribuido durante el día
- Más asistencias lun-vie que fin de semana
- Duración de sesión: 1-2 horas

### 5. Asistencias de Empleados

**Período:** nov 25 - dic 25, 2024 (1 mes, lun-sáb)

**Características realistas:**
- Entrada con variación ±10 min de hora programada
- Salida similar
- 2-4 llegadas tarde ocasionales (+20-30 min) por empleado
- 2-3 días sin registro (permisos/ausencias)
- Horas trabajadas calculadas automáticamente

## Uso

### Generar Datos de Prueba

```bash
# Activar entorno virtual
source venv/bin/activate

# Ejecutar generador
python seed_data_generator.py
```

**Salida esperada:**
```
============================================================
🏋️  GENERADOR DE DATOS DE PRUEBA - MOMENTUM FITNESS
============================================================

🗄️  Creando tablas en la base de datos...
✅ Tablas creadas

📋 Creando cupones...
✅ Creados 3 cupones

👥 Creando empleados...
✅ Creados 4 empleados

⏰ Generando asistencias de empleados...
✅ Creadas ~100 asistencias de empleados

👤 Creando 500 clientes con membresías...
  Creados 100/500 clientes...
  Creados 200/500 clientes...
  Creados 300/500 clientes...
  Creados 400/500 clientes...
  Creados 500/500 clientes...
✅ Creados 500 clientes con membresías

🤝 Creando relaciones de referidos...
✅ Creadas ~150 relaciones de referidos

📅 Generando asistencias de clientes (nov 25 - dic 25)...
  Generadas asistencias para 100/500 clientes...
  Generadas asistencias para 200/500 clientes...
  Generadas asistencias para 300/500 clientes...
  Generadas asistencias para 400/500 clientes...
  Generadas asistencias para 500/500 clientes...
✅ Creadas ~5000 asistencias de clientes

============================================================
✅ GENERACIÓN DE DATOS COMPLETADA EXITOSAMENTE
============================================================
```

### Verificar Datos

```bash
# Activar entorno virtual
source venv/bin/activate

# Ejecutar verificador
python verify_seed_data.py
```

**Salida esperada:**
```
============================================================
🔍 VERIFICACIÓN DE DATOS DE PRUEBA
============================================================

📋 CUPONES:
  - PRIMERA_VEZ: 10% descuento, ~75 usos
  - RENUEVA_AHORA: 10% descuento, ~40 usos
  - UPGRADE_6M: 15% descuento, ~25 usos

👥 EMPLEADOS:
  - Carlos Ramírez: entrenador, 06:00-14:00
  - Laura Gómez: entrenador, 14:00-22:00
  - Andrés Torres: recepcion, 06:00-14:00
  - María Henao: recepcion, 14:00-22:00

⏰ ASISTENCIAS DE EMPLEADOS:
  Total: ~100 registros

👤 CLIENTES:
  Total: 500

📊 DISTRIBUCIÓN DE PLANES:
  - elite_anual: 30 (6.0%)
  - mensual: 175 (35.0%)
  - pase_diario: 50 (10.0%)
  - pase_flex: 75 (15.0%)
  - plan_3_meses: 100 (20.0%)
  - plan_6_meses: 70 (14.0%)

🤝 REFERIDOS:
  Total: ~150 (30.0%)

📅 ASISTENCIAS DE CLIENTES:
  Total: ~5000 registros
  Promedio por cliente: ~10

📈 ASISTENCIAS POR PLAN:
  - pase_diario: 1-1 (promedio: 1.0)
  - pase_flex: 10-14 (promedio: 12.0)
  - mensual: 12-20 (promedio: 16.0)
  - plan_3_meses: 15-25 (promedio: 20.0)
  - plan_6_meses: 18-28 (promedio: 23.0)
  - elite_anual: 20-30 (promedio: 25.0)

💰 VERIFICACIÓN DE DESCUENTOS:
  Membresías con descuento: ~220

⚧ DISTRIBUCIÓN DE GÉNERO:
  - Femenino: ~200 (40.0%)
  - Masculino: ~300 (60.0%)

🆔 VERIFICACIÓN DE INTEGRIDAD:
  Total usuarios: 504
  Emails únicos: 504
  ✅ Todos los emails son únicos

============================================================
✅ VERIFICACIÓN COMPLETADA
============================================================
```

## Reglas de Negocio Implementadas

1. **Cupones y Referidos NO son acumulables**: Un cliente solo puede tener uno u otro, nunca ambos
2. **Referidos solo para planes largos**: Solo clientes con Mensual, 3 Meses, 6 Meses o Platinum pueden referir
3. **Descuento por referido**: 5% fijo
4. **Cupones con restricciones**:
   - PRIMERA_VEZ: Solo para planes 3M/6M/Platinum
   - RENUEVA_AHORA: Para Mensual/3M/6M/Platinum
   - UPGRADE_6M: Solo para plan 6 meses
5. **Asistencias realistas**:
   - Horarios pico (mañana y tarde)
   - Más frecuencia en días laborales
   - Frecuencia según tipo de plan
6. **Empleados con variación natural**:
   - Pequeñas variaciones en horarios
   - Llegadas tarde ocasionales
   - Días de ausencia

## Notas Importantes

- El script crea todas las tablas automáticamente si no existen
- Los datos se generan de forma aleatoria pero siguiendo distribuciones realistas
- Cada ejecución genera datos diferentes (aleatorios)
- Si se ejecuta múltiples veces, se acumularán los datos (no se limpian automáticamente)
- Para limpiar la base de datos, eliminar el archivo SQLite o usar herramientas de migración

## Limpieza de Datos

Si necesitas limpiar la base de datos antes de generar nuevos datos:

```bash
# Si usas SQLite
rm momentum_fitness.db

# Si usas PostgreSQL, desde psql:
# DROP SCHEMA public CASCADE;
# CREATE SCHEMA public;
```

## Soporte

Para problemas o preguntas sobre los datos de prueba, contacta al equipo de desarrollo.
