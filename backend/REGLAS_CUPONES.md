# 📋 Reglas de Negocio - Sistema de Cupones

## 🚨 Reglas Críticas

### 1. No Acumulación de Descuentos
- **Los cupones NO son acumulables con descuentos por referido (5%)**
- Si un cliente tiene referido, debe elegir: usar cupón O recibir descuento por referido
- Sistema debe validar que solo se aplique uno de los dos descuentos

### 2. Descuento Máximo Permitido
- **Máximo: 20%** (validado en backend y frontend)
- Cualquier cupón con descuento > 20% será rechazado
- Esta regla aplica tanto para creación como actualización de cupones

### 3. Planes Elegibles
- **Pase Diario y Pase Flex NO son elegibles para cupones**
- Solo se pueden aplicar cupones a:
  - ✅ Plan Mensual
  - ✅ Plan 3 Meses
  - ✅ Plan 6 Meses
  - ✅ Membresía Platinum (Anual)

### 4. Validación de Expiración
- Los cupones pueden tener fecha de expiración (opcional)
- Cupones expirados NO se pueden aplicar (incluso si están activos)
- Sistema verifica automáticamente la vigencia antes de aplicar

### 5. Control de Uso
- Cada cupón rastrea:
  - `usos_total`: Total histórico de usos
  - `usos_anio`: Usos en el año actual (se resetea cada enero)
- Los contadores se resetean automáticamente cada año

---

## 📝 Tipos de Cupones Recomendados

### 🎯 Cupones de Conversión (Adquisición de Nuevos Clientes)

#### PRIMERA_VEZ
```
Código: PRIMERA-VEZ
Nicho: Alimenticio o Estético
Descuento: 10%
Planes elegibles: Plan 3 Meses o superior
Uso: Solo nuevos clientes, uso único por cédula
Duración: Sin expiración o 3 meses
Objetivo: Convertir leads de alianzas estratégicas
```

#### BIENVENIDA-2025
```
Código: BIENVENIDA-2025
Nicho: Estético
Descuento: 15%
Planes elegibles: Plan 6 Meses o Platinum
Uso: Campaña de enero-febrero
Duración: 2 meses
Objetivo: Aprovechar propósitos de año nuevo
```

---

### 🔄 Cupones de Retención (Mantener Clientes Actuales)

#### RENUEVA-AHORA
```
Código: RENUEVA-AHORA
Nicho: Ambos
Descuento: 10%
Condición: Renovar 7+ días antes de vencimiento
Planes elegibles: Mensual, 3M, 6M, Platinum
Uso: Ilimitado durante vigencia
Duración: Todo el año
Objetivo: Reducir churn y asegurar continuidad
```

#### FIDELIDAD-PLATINUM
```
Código: FIDELIDAD-PLATINUM
Nicho: Ambos
Descuento: 15%
Condición: Clientes con 2+ renovaciones previas
Planes elegibles: Platinum
Uso: 1 vez por cliente al año
Duración: Sin expiración
Objetivo: Premiar lealtad y upgradear a plan anual
```

---

### ⬆️ Cupones de Upgrade (Impulsar Planes Largos)

#### UPGRADE-3M
```
Código: UPGRADE-3M
Nicho: Ambos
Descuento: 15%
Condición: Upgrade de Mensual a Plan 3 Meses
Planes elegibles: Solo Plan 3 Meses
Uso: 1 vez por cliente
Duración: 6 meses
Objetivo: Aumentar commitment y reducir costos de adquisición
```

#### UPGRADE-6M
```
Código: UPGRADE-6M
Nicho: Ambos
Descuento: 20%
Condición: Upgrade de Mensual a Plan 6 Meses
Planes elegibles: Solo Plan 6 Meses
Uso: 1 vez por cliente
Duración: 6 meses
Objetivo: Maximizar LTV (Lifetime Value)
```

#### ELITE-UPGRADE
```
Código: ELITE-UPGRADE
Nicho: Ambos
Descuento: 20%
Condición: Upgrade de cualquier plan a Platinum
Planes elegibles: Solo Platinum
Uso: 1 vez por cliente
Duración: Todo el año
Objetivo: Convertir a membresía premium
```

---

### 🎉 Cupones Estacionales/Campaña

#### VERANO-FIT
```
Código: VERANO-FIT
Nicho: Ambos
Descuento: 15%
Planes elegibles: Plan 3 Meses o superior
Uso: Campaña de verano
Duración: Diciembre - Febrero
Objetivo: Aprovechar temporada alta
```

#### BLACK-FRIDAY
```
Código: BLACK-FRIDAY
Nicho: Ambos
Descuento: 20%
Planes elegibles: Plan 6 Meses y Platinum solamente
Uso: Solo en Black Friday
Duración: 1 día
Objetivo: Promoción especial con máximo descuento
```

---

### 🤝 Cupones de Alianzas (Nichos Específicos)

#### RESTO-FIT-10
```
Código: RESTO-FIT-10
Nicho: Alimenticio
Descuento: 10%
Condición: Presentar factura de restaurante aliado
Planes elegibles: Todos (excepto Pase Diario/Flex)
Uso: 1 vez por cliente
Duración: Según acuerdo con restaurante
Objetivo: Cross-marketing con aliados gastronómicos
```

#### SPA-GYM-15
```
Código: SPA-GYM-15
Nicho: Estético
Descuento: 15%
Condición: Cliente activo de spa/barbería aliada
Planes elegibles: Plan 3 Meses o superior
Uso: 1 vez por cliente
Duración: Según acuerdo con establecimiento
Objetivo: Crear ecosistema wellness
```

---

## 🔒 Validaciones del Sistema

### Backend (FastAPI)
- ✅ Descuento máximo 20% (validado en Pydantic schema)
- ✅ Constraint en base de datos (`CHECK descuento <= 20`)
- ✅ Verificación de vigencia antes de aplicar
- ✅ Código único (constraint UNIQUE)
- ✅ Solo letras, números, guiones y guiones bajos en código

### Frontend (Next.js)
- ✅ Input limitado a máximo 20
- ✅ Mensaje de ayuda sobre no acumulación
- ✅ DatePicker para fecha de expiración
- ✅ Validación de campos requeridos
- ✅ Código automáticamente en mayúsculas

---

## 📊 Métricas a Rastrear

Para cada cupón, el sistema registra:
- **usos_total**: Total histórico de aplicaciones
- **usos_anio**: Aplicaciones este año (resetea en enero)
- **fecha_creacion**: Cuándo se creó el cupón
- **fecha_expiracion**: Cuándo expira (opcional)
- **activo**: Si está disponible para usar

---

## 🎯 Mejores Prácticas

1. **Códigos Claros**: Usar nombres descriptivos (ej: UPGRADE-6M, VERANO-FIT)
2. **Duraciones Definidas**: Establecer fechas de expiración para cupones de campaña
3. **Monitoreo**: Revisar estadísticas de uso regularmente
4. **Segmentación**: Usar nichos para tracking de alianzas
5. **Comunicación**: Informar claramente que cupones NO son acumulables con referidos

---

## ⚠️ Casos Especiales

### ¿Qué pasa si un cliente tiene referido Y quiere usar cupón?
- El sistema debe permitir al cliente elegir UNO de los dos
- Recomendación: El mayor descuento
  - Descuento referido: 5%
  - Cupones: hasta 20%
  - Por lo tanto, generalmente conviene usar cupón

### ¿Se pueden crear cupones con descuento > 20%?
- **NO**. El backend rechazará cualquier intento
- Mensaje de error: "El descuento máximo permitido es 20%. Los cupones no son acumulables con descuentos por referido."

### ¿Los cupones aplican a Pase Diario o Pase Flex?
- **NO**. Estos planes están excluidos del sistema de cupones
- Solo planes de compromiso largo son elegibles

---

## 🚀 Próximos Pasos Recomendados

1. **Implementar validación de planes elegibles** en backend
   - Verificar que cupones solo se apliquen a planes Mensual+
   - Rechazar aplicación en Pase Diario/Flex

2. **Sistema de límite de usos** (opcional)
   - Agregar campo `max_usos` al modelo
   - Validar antes de aplicar que no se exceda el límite

3. **Tracking de uso por usuario** (opcional)
   - Tabla intermedia `usuario_cupones` para rastrear quién usó qué
   - Implementar "uso único por cédula" para cupones específicos

4. **Dashboard de analytics**
   - Tasa de conversión por cupón
   - ROI de cada campaña
   - Cupones más efectivos por nicho

---

## 📚 Referencias

- Modelo: `/backend/app/models/cupon.py`
- Schema: `/backend/app/schemas/cupon.py`
- CRUD: `/backend/app/crud/cupones.py`
- Endpoints: `/backend/app/api/endpoints/cupones.py`
- Frontend: `/components/new-coupon-drawer.tsx`
- Hooks: `/lib/hooks/useCupones.ts`
