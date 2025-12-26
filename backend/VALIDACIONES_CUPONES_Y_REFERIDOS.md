# 🔒 Validaciones de Cupones y Referidos - Sistema de Membresías

## 📋 Resumen de Reglas Implementadas

Este documento detalla las validaciones de negocio implementadas para el sistema de cupones y referidos del gimnasio.

---

## 🚨 Reglas Críticas de Negocio

### 1. **Cupones deben estar disponibles para ser usados**

- ✅ El cupón debe existir en el sistema
- ✅ El cupón debe estar activo (`activo = True`)
- ✅ El cupón NO debe estar expirado (si tiene `fecha_expiracion`)
- ❌ Si el cupón no cumple alguna de estas condiciones, se rechaza

**Validación en código:**
```python
if not cupon.esta_vigente():
    if not cupon.activo:
        raise ValueError(f"Cupón '{codigo}' no está activo")
    elif cupon.fecha_expiracion and cupon.fecha_expiracion < datetime.utcnow():
        raise ValueError(f"Cupón '{codigo}' ha expirado")
```

---

### 2. **Cupones 3M y 6M solo para usuarios con Pase Mes activo**

Los cupones de upgrade (3M y 6M) están diseñados para incentivar a usuarios con **Pase Mes** a cambiar a planes más largos.

#### Reglas:

**Para cupones que contienen "3M" o "UPGRADE-3M" en su código:**
- ✅ Solo se pueden aplicar al **Plan de 3 Meses**
- ✅ El usuario DEBE tener una membresía activa de **Pase Mes** al momento de crear la nueva membresía
- ❌ Si el usuario no tiene Pase Mes activo o selecciona otro plan, se rechaza

**Para cupones que contienen "6M" o "UPGRADE-6M" en su código:**
- ✅ Solo se pueden aplicar al **Plan de 6 Meses**
- ✅ El usuario DEBE tener una membresía activa de **Pase Mes** al momento de crear la nueva membresía
- ❌ Si el usuario no tiene Pase Mes activo o selecciona otro plan, se rechaza

**Validación en código:**
```python
if "3M" in codigo_upper or "UPGRADE-3M" in codigo_upper:
    if membresia_simple.tipo_plan != TipoPlan.PLAN_3_MESES:
        raise ValueError("El cupón '3M' solo aplica al Plan de 3 Meses")

    # Verificar que el usuario tenga Pase Mes activo actualmente
    membresia_actual = get_membresia_activa_by_usuario(db, membresia_simple.usuario_id)
    if not membresia_actual or membresia_actual.tipo_plan != TipoPlan.MENSUAL:
        raise ValueError("El cupón '3M' solo aplica a usuarios que actualmente tienen Pase Mes activo")
```

**Ejemplos:**

✅ **Caso válido:**
- Usuario: Juan (tiene Pase Mes activo)
- Acción: Quiere cambiar a Plan 3 Meses
- Cupón: UPGRADE-3M (15% descuento)
- Resultado: ✅ Se aplica el cupón

❌ **Caso inválido 1:**
- Usuario: María (tiene Pase Flex activo)
- Acción: Quiere cambiar a Plan 3 Meses
- Cupón: UPGRADE-3M
- Resultado: ❌ Rechazado (no tiene Pase Mes activo)

❌ **Caso inválido 2:**
- Usuario: Pedro (tiene Pase Mes activo)
- Acción: Quiere cambiar a Plan Mensual
- Cupón: UPGRADE-3M
- Resultado: ❌ Rechazado (el cupón solo aplica a Plan 3 Meses)

---

### 3. **Pase Día y Pase Flex NO pueden recibir cupones ni referidos**

Los planes básicos (Pase Día y Pase Flex) están excluidos del sistema de descuentos.

#### Reglas:

- ❌ **NO pueden usar cupones** de ningún tipo
- ❌ **NO pueden recibir descuentos por referidos** (5%)
- ✅ Solo planes Mensual, Plan 3 Meses, Plan 6 Meses y Elite Anual son elegibles

**Validación en código:**
```python
if membresia_simple.tipo_plan in [TipoPlan.PASE_DIARIO, TipoPlan.PASE_FLEX]:
    if membresia_simple.cupon_codigo:
        raise ValueError("Pase Día y Pase Flex no pueden recibir cupones")
    if membresia_simple.referido_por_id:
        raise ValueError("Pase Día y Pase Flex no pueden recibir beneficios de referidos")
```

**Ejemplos:**

❌ **Intento de usar cupón en Pase Día:**
- Plan seleccionado: Pase Día
- Cupón: PRIMERA-VEZ (10% descuento)
- Resultado: ❌ Rechazado

❌ **Intento de usar referido en Pase Flex:**
- Plan seleccionado: Pase Flex
- Referido por: Carlos (Cédula: 123456)
- Resultado: ❌ Rechazado

✅ **Plan válido con cupón:**
- Plan seleccionado: Mensual
- Cupón: PRIMERA-VEZ (10% descuento)
- Resultado: ✅ Cupón aplicado

---

### 4. **Cupones NO son acumulables con descuentos por referido**

Un cliente solo puede recibir **uno** de los dos descuentos, no ambos.

#### Lógica de priorización:

Si un cliente intenta usar **cupón Y referido** al mismo tiempo:
1. Se comparan los descuentos
2. Se aplica automáticamente el **mayor descuento**
3. El otro descuento se ignora

**Comparación:**
- Descuento por referido: **5%** (fijo)
- Descuento por cupón: **1% - 20%** (variable según el cupón)

**Validación en código:**
```python
if tiene_cupon and tiene_referido:
    # Comparar descuentos: cupón vs 5% referido
    descuento_cupon = cupon_aplicado.descuento
    descuento_referido = int(REFERIDOS_CONFIG["descuento_referido"] * 100)

    if descuento_cupon >= descuento_referido:
        # Usar cupón
        precio_con_descuento = int(precio_base * (1 - descuento_cupon / 100))
        descuento_aplicado_tipo = "cupon"
    else:
        # Usar referido
        precio_con_descuento = int(precio_base * (1 - descuento))
        descuento_aplicado_tipo = "referido"
```

**Ejemplos:**

**Ejemplo 1: Cupón gana (descuento mayor)**
- Plan: Mensual ($59,900)
- Cupón: BIENVENIDA-2025 (15% descuento)
- Referido por: Ana
- Resultado: Se aplica cupón (15%) ➜ Precio final: $50,915
- El descuento por referido (5%) se ignora

**Ejemplo 2: Referido gana (cupón tiene descuento menor)**
- Plan: Mensual ($59,900)
- Cupón: MINI-DESCUENTO (3% descuento)
- Referido por: Carlos
- Resultado: Se aplica referido (5%) ➜ Precio final: $56,905
- El cupón (3%) se ignora

**Ejemplo 3: Solo cupón (sin referido)**
- Plan: Plan 3 Meses ($149,900)
- Cupón: PRIMERA-VEZ (10% descuento)
- Resultado: Se aplica cupón ➜ Precio final: $134,910

**Ejemplo 4: Solo referido (sin cupón)**
- Plan: Plan 6 Meses ($269,900)
- Referido por: Luis
- Resultado: Se aplica referido (5%) ➜ Precio final: $256,405

---

## 🎯 Planes Elegibles para Descuentos

| Plan | Precio | Cupones | Referidos | Notas |
|------|--------|---------|-----------|-------|
| **Pase Día** | $5,000 | ❌ NO | ❌ NO | Plan básico sin descuentos |
| **Pase Flex** | $39,900 | ❌ NO | ❌ NO | Plan básico sin descuentos |
| **Mensual** | $59,900 | ✅ SÍ | ✅ SÍ | Elegible para todos los cupones (excepto 3M/6M) |
| **Plan 3 Meses** | $149,900 | ✅ SÍ | ✅ SÍ | Elegible + cupones 3M si viene de Pase Mes |
| **Plan 6 Meses** | $269,900 | ✅ SÍ | ✅ SÍ | Elegible + cupones 6M si viene de Pase Mes |
| **Elite Anual** | $479,900 | ✅ SÍ | ✅ SÍ | Elegible para todos los cupones |

---

## 🔄 Flujo de Validación (Backend)

```
1. Validar plan seleccionado
   └─ ¿Es Pase Día o Pase Flex?
      ├─ SÍ → Rechazar si tiene cupón o referido
      └─ NO → Continuar

2. Validar cupón (si se proporcionó)
   └─ ¿Existe el cupón?
      ├─ NO → Error: "Cupón no encontrado"
      └─ SÍ → Continuar
   └─ ¿Está activo?
      ├─ NO → Error: "Cupón no está activo"
      └─ SÍ → Continuar
   └─ ¿Está expirado?
      ├─ SÍ → Error: "Cupón expirado"
      └─ NO → Continuar
   └─ ¿Es cupón 3M o 6M?
      ├─ SÍ → Validar:
      │   └─ ¿Plan es 3M/6M respectivamente?
      │      ├─ NO → Error: "Cupón solo aplica a Plan X Meses"
      │      └─ SÍ → Continuar
      │   └─ ¿Usuario tiene Pase Mes activo?
      │      ├─ NO → Error: "Cupón solo para usuarios con Pase Mes activo"
      │      └─ SÍ → Cupón válido ✅
      └─ NO → Cupón válido ✅

3. Validar referido (si se proporcionó)
   └─ ¿Existe el referidor?
      ├─ NO → Error: "Referidor no existe"
      └─ SÍ → Continuar
   └─ ¿Referidor tiene membresía activa >= Mensual?
      ├─ NO → Error: "Referidor debe tener membresía Mensual o superior"
      └─ SÍ → Referido válido ✅

4. Aplicar descuento
   └─ ¿Tiene cupón Y referido?
      ├─ SÍ → Aplicar el mayor descuento
      └─ NO → Aplicar el que tenga (cupón o referido)

5. Crear membresía
   └─ Guardar precio_original, precio_final, descripción
   └─ Incrementar uso del cupón (si se aplicó)
```

---

## 📍 Archivos Modificados

### Backend:
- `/backend/app/crud/membresias.py` - Lógica de validación de cupones y referidos
- `/backend/app/crud/cupones.py` - Funciones de gestión de cupones (sin cambios)
- `/backend/app/models/cupon.py` - Modelo de cupón (sin cambios)

### Frontend:
- `/components/new-client-drawer.tsx` - Validaciones en interfaz de usuario

---

## 🧪 Casos de Prueba Recomendados

### Test 1: Validar rechazo de cupón en Pase Día
```
Plan: Pase Día
Cupón: PRIMERA-VEZ
Esperado: ❌ Error "Pase Día y Pase Flex no pueden recibir cupones"
```

### Test 2: Validar rechazo de referido en Pase Flex
```
Plan: Pase Flex
Referido: Usuario con cédula 123456
Esperado: ❌ Error "Pase Día y Pase Flex no pueden recibir beneficios de referidos"
```

### Test 3: Validar cupón 3M sin Pase Mes activo
```
Usuario: Nuevo cliente (sin membresía activa)
Plan: Plan 3 Meses
Cupón: UPGRADE-3M
Esperado: ❌ Error "El cupón '3M' solo aplica a usuarios que actualmente tienen Pase Mes activo"
```

### Test 4: Validar cupón 3M con Pase Mes activo
```
Usuario: Cliente con Pase Mes activo
Plan: Plan 3 Meses
Cupón: UPGRADE-3M (15% descuento)
Esperado: ✅ Cupón aplicado correctamente
```

### Test 5: Validar cupón inactivo
```
Plan: Mensual
Cupón: CUPON-INACTIVO (activo = False)
Esperado: ❌ Error "Cupón 'CUPON-INACTIVO' no está activo"
```

### Test 6: Validar cupón expirado
```
Plan: Mensual
Cupón: CUPON-VENCIDO (fecha_expiracion = 2024-01-01)
Esperado: ❌ Error "Cupón 'CUPON-VENCIDO' ha expirado"
```

### Test 7: Validar priorización de descuentos (cupón gana)
```
Plan: Plan 6 Meses ($269,900)
Cupón: BLACK-FRIDAY (20% descuento)
Referido: Usuario activo
Esperado: ✅ Se aplica cupón (20%) ➜ Precio: $215,920
```

### Test 8: Validar priorización de descuentos (referido gana)
```
Plan: Mensual ($59,900)
Cupón: MINI-CUPON (2% descuento)
Referido: Usuario activo
Esperado: ✅ Se aplica referido (5%) ➜ Precio: $56,905
```

### Test 9: Validar incremento de uso de cupón
```
Plan: Mensual
Cupón: PRIMERA-VEZ (usos_total = 10, usos_anio = 5)
Acción: Crear membresía con este cupón
Esperado: ✅ Cupón aplicado Y usos_total = 11, usos_anio = 6
```

### Test 10: Validar cupón válido en plan elegible
```
Plan: Elite Anual
Cupón: ELITE-UPGRADE (20% descuento)
Esperado: ✅ Cupón aplicado correctamente
```

---

## 🛡️ Seguridad y Validación

- ✅ Todas las validaciones se hacen en **backend** (no solo frontend)
- ✅ Frontend solo muestra validaciones para mejor UX
- ✅ Validaciones en base de datos (constraints)
- ✅ Mensajes de error claros y específicos
- ✅ Transacciones atómicas (si falla algo, todo se revierte)

---

## 📝 Notas Importantes

1. **Las validaciones son ESTRICTAS**: Si un cupón no cumple alguna regla, se rechaza completamente.

2. **El backend es la fuente de verdad**: Aunque el frontend valida, el backend siempre tiene la última palabra.

3. **Los cupones 3M/6M son especiales**: Están diseñados específicamente para upgrades desde Pase Mes.

4. **El sistema prioriza automáticamente**: Si hay conflicto entre cupón y referido, usa el mayor descuento sin intervención del usuario.

5. **Pase Día y Pase Flex están completamente excluidos**: No hay excepciones para estos planes.

---

## 🚀 Próximos Pasos Sugeridos

1. **Implementar tracking de uso por usuario**
   - Tabla `usuario_cupones` para rastrear quién usó qué cupón
   - Limitar uso de cupones a 1 vez por usuario (según tipo)

2. **Dashboard de analytics**
   - Tasa de conversión por cupón
   - Cupones más efectivos
   - ROI de cada campaña

3. **Sistema de límite de usos**
   - Campo `max_usos` en modelo Cupon
   - Validar que no se exceda el límite

4. **Notificaciones automáticas**
   - Alertar cuando cupones están por expirar
   - Notificar cuando cupones alcanzan cierto número de usos

---

**Última actualización:** 2025-12-25
**Versión del sistema:** V3
