# Funcionalidad de Referidos - Documentación

## ✅ Implementación Completada

### Resumen
Sistema de referidos que permite registrar qué cliente refirió a un nuevo cliente, con búsqueda en tiempo real y validación visual.

---

## 🎯 Características Implementadas

### 1. Backend

#### Modelo de Datos
**Archivo**: `backend/app/modules/usuarios/models/usuario.py`

```python
# Campo agregado a la tabla usuarios
referido_por_cedula = Column(String, nullable=True, index=True)
```

- **Tipo**: String (TEXT en SQLite)
- **Nullable**: Sí (campo opcional)
- **Indexado**: Sí (para búsquedas rápidas)

#### Schemas Pydantic
**Archivo**: `backend/app/schemas/usuario.py`

```python
class UsuarioBase(BaseModel):
    # ... otros campos
    referido_por_cedula: Optional[str] = None

class UsuarioBusqueda(BaseModel):
    """Schema para búsqueda de referido"""
    id: int
    nombre: str
    apellido: str
    telefono: Optional[str] = None
```

#### Endpoint de Búsqueda
**Archivo**: `backend/app/api/endpoints/usuarios.py`

```python
@router.get("/buscar-cedula/{cedula}", response_model=schemas.UsuarioBusqueda)
def buscar_usuario_por_cedula(cedula: str, db: Session = Depends(get_db)):
    """
    Busca un usuario por su cédula (campo telefono).
    Retorna información básica del usuario si existe.
    """
    db_usuario = crud.get_usuario_by_cedula(db, cedula=cedula)
    if db_usuario is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado con esa cédula"
        )
    return db_usuario
```

**URL**: `GET /api/usuarios/buscar-cedula/{cedula}`

**Respuesta exitosa (200)**:
```json
{
    "id": 1,
    "nombre": "Osne",
    "apellido": "montoya",
    "telefono": "3122502394"
}
```

**Respuesta error (404)**:
```json
{
    "detail": "Usuario no encontrado con esa cédula"
}
```

#### CRUD Function
**Archivo**: `backend/app/crud/usuarios.py`

```python
def get_usuario_by_cedula(db: Session, cedula: str) -> Optional[Usuario]:
    """Busca un usuario por su cédula (campo telefono)"""
    return db.query(Usuario).filter(Usuario.telefono == cedula).first()
```

---

### 2. Frontend

#### TypeScript Types
**Archivo**: `types/index.ts`

```typescript
export interface UsuarioBase {
  // ... otros campos
  referido_por_cedula?: string | null;
}

export interface UsuarioBusqueda {
  id: number;
  nombre: string;
  apellido: string;
  telefono?: string | null;
}
```

#### Servicio de API
**Archivo**: `lib/services/usuarios.ts`

```typescript
export const usuariosService = {
  // ... otros métodos

  /**
   * Buscar usuario por cédula para referidos
   */
  buscarPorCedula: async (cedula: string): Promise<UsuarioBusqueda> => {
    const response = await api.get<UsuarioBusqueda>(`${BASE_PATH}/buscar-cedula/${cedula}`);
    return response.data;
  },
};
```

#### Componente de Formulario
**Archivo**: `components/new-client-drawer.tsx`

**Estados agregados**:
```typescript
const [formData, setFormData] = useState({
  // ... otros campos
  referidoPorCedula: "",
})
const [referidoInfo, setReferidoInfo] = useState<{ nombre: string; apellido: string } | null>(null)
const [referidoError, setReferidoError] = useState<string | null>(null)
const [isSearchingReferido, setIsSearchingReferido] = useState(false)
```

**useEffect de búsqueda con debounce**:
```typescript
useEffect(() => {
  const searchReferido = async () => {
    if (!formData.referidoPorCedula || formData.referidoPorCedula.length < 3) {
      setReferidoInfo(null)
      setReferidoError(null)
      return
    }

    setIsSearchingReferido(true)
    setReferidoError(null)

    try {
      const usuario = await usuariosService.buscarPorCedula(formData.referidoPorCedula)
      setReferidoInfo({ nombre: usuario.nombre, apellido: usuario.apellido })
      setReferidoError(null)
    } catch (error) {
      setReferidoInfo(null)
      setReferidoError("No se encontró un cliente con esta cédula")
    } finally {
      setIsSearchingReferido(false)
    }
  }

  const timeoutId = setTimeout(() => {
    searchReferido()
  }, 500) // Debounce 500ms

  return () => clearTimeout(timeoutId)
}, [formData.referidoPorCedula])
```

---

## 🎨 Diseño del Campo en el Formulario

### Ubicación
- **Sección**: Información Personal
- **Posición**: Después del campo "Tipo de usuario"
- **Visibilidad**: Solo se muestra cuando `tipo_usuario === "Cliente"`

### Diseño Visual

```
┌─────────────────────────────────────────────────────┐
│ Referido por (Cédula del cliente) (Opcional)       │
│ ┌───────────────────────────────────────────────┐ │
│ │ Ingresa la cédula del cliente que lo refirió │🔍│
│ └───────────────────────────────────────────────┘ │
│ ✅ Cliente encontrado: Osne montoya                │
└─────────────────────────────────────────────────────┘
```

### Estados Visuales

#### 1. **Buscando** (isSearchingReferido = true)
- Icono: `Loader2` (spinning)
- Color: gris (`text-muted-foreground`)
- Posición: Esquina derecha del input

#### 2. **Encontrado** (referidoInfo !== null)
- Icono: `CheckCircle2`
- Color: verde (#A4FF1A)
- Mensaje: "✅ Cliente encontrado: [Nombre Apellido]"
- Posición icono: Esquina derecha del input
- Posición mensaje: Debajo del input

#### 3. **No encontrado** (referidoError !== null)
- Icono: `AlertCircle`
- Color: amarillo (`text-yellow-500`)
- Mensaje: "⚠️ No se encontró un cliente con esta cédula (puedes continuar sin referido)"
- Posición icono: Esquina derecha del input
- Posición mensaje: Debajo del input

#### 4. **Vacío o < 3 caracteres**
- Sin icono
- Sin mensaje
- Estado neutro

---

## 🧪 Cómo Probar

### Paso 1: Abrir el Formulario
1. Ir a http://localhost:3000/clientes
2. Click en "Nuevo cliente"
3. Verificar que el formulario se abre

### Paso 2: Verificar Visibilidad del Campo
1. Por defecto, "Tipo de usuario" está en "Cliente"
2. **Verificar**: Campo "Referido por" es visible
3. Cambiar a "Empleado"
4. **Verificar**: Campo "Referido por" se oculta
5. Cambiar de vuelta a "Cliente"
6. **Verificar**: Campo "Referido por" aparece nuevamente

### Paso 3: Probar Búsqueda Exitosa
1. Ingresar cédula existente: `3122502394`
2. **Esperar 500ms** (debounce)
3. **Verificar**: Icono de carga aparece brevemente
4. **Verificar**: Icono verde ✅ aparece
5. **Verificar**: Mensaje "Cliente encontrado: Osne montoya" aparece en verde

### Paso 4: Probar Búsqueda No Exitosa
1. Borrar el campo
2. Ingresar cédula no existente: `9999999999`
3. **Esperar 500ms** (debounce)
4. **Verificar**: Icono de carga aparece brevemente
5. **Verificar**: Icono amarillo ⚠️ aparece
6. **Verificar**: Mensaje de advertencia aparece en amarillo

### Paso 5: Probar Debounce
1. Escribir rápidamente varios números
2. **Verificar**: La búsqueda NO se ejecuta en cada tecla
3. **Verificar**: La búsqueda se ejecuta 500ms después de dejar de escribir

### Paso 6: Crear Cliente con Referido
1. Llenar todos los campos requeridos:
   - Nombre completo
   - Cédula
   - Email
   - Tipo de usuario: Cliente
   - Tipo de plan: Mensual
2. En "Referido por", ingresar: `3122502394`
3. **Verificar**: Aparece "Cliente encontrado: Osne montoya"
4. Click en "Guardar"
5. **Verificar**: Cliente se crea exitosamente

### Paso 7: Verificar en Base de Datos
```bash
sqlite3 ./gimnasio.db "SELECT nombre, apellido, telefono, referido_por_cedula FROM usuarios ORDER BY id DESC LIMIT 1;"
```

**Output esperado**:
```
[Nombre]|[Apellido]|[Telefono]|3122502394
```

---

## 🔍 Testing con cURL

### Buscar usuario existente
```bash
curl http://localhost:8000/api/usuarios/buscar-cedula/3122502394
```

**Respuesta**:
```json
{
    "id": 1,
    "nombre": "Osne",
    "apellido": "montoya",
    "telefono": "3122502394"
}
```

### Buscar usuario no existente
```bash
curl http://localhost:8000/api/usuarios/buscar-cedula/9999999999
```

**Respuesta**:
```json
{
    "detail": "Usuario no encontrado con esa cédula"
}
```

### Crear usuario con referido
```bash
curl -X POST http://localhost:8000/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Pedro",
    "apellido": "Nuevo",
    "email": "pedro@example.com",
    "telefono": "3001234567",
    "tipo": "cliente",
    "referido_por_cedula": "3122502394"
  }'
```

---

## 📋 Cédulas de Prueba

Usuarios existentes en la base de datos:

| ID | Nombre | Apellido | Cédula | Tipo |
|----|--------|----------|--------|------|
| 1 | Osne | montoya | 3122502394 | cliente |
| 2 | Juan | Pérez | +1234567890 | cliente |
| 3 | María | García | +1234567891 | cliente |

---

## 🎯 Características Destacadas

### ✅ Implementadas
- [x] Campo opcional en modelo de datos
- [x] Endpoint de búsqueda por cédula
- [x] Validación de existencia del referido
- [x] Búsqueda en tiempo real con debounce (500ms)
- [x] Indicadores visuales (loading, success, error)
- [x] Visibilidad condicional (solo para clientes)
- [x] Badge "Opcional" en el label
- [x] Mensaje de confirmación con nombre del referido
- [x] Permite continuar sin referido (warning, no error)
- [x] Integración con colores del sistema (#A4FF1A)
- [x] Iconos de estado (Loader2, CheckCircle2, AlertCircle)

### 🎁 Bonus Implementado
- [x] Búsqueda automática mientras escribe
- [x] Debounce para evitar requests excesivos
- [x] Muestra nombre completo del referidor
- [x] Validación visual inmediata
- [x] No bloquea el envío del formulario si no encuentra

---

## 🔧 Archivos Modificados/Creados

### Backend
1. ✅ `backend/app/modules/usuarios/models/usuario.py` - Modelo actualizado
2. ✅ `backend/app/schemas/usuario.py` - Schemas actualizados
3. ✅ `backend/app/api/endpoints/usuarios.py` - Endpoint agregado
4. ✅ `backend/app/crud/usuarios.py` - Función CRUD agregada
5. ✅ `gimnasio.db` - Columna agregada a tabla usuarios

### Frontend
6. ✅ `types/index.ts` - Types actualizados
7. ✅ `lib/services/usuarios.ts` - Servicio agregado
8. ✅ `components/new-client-drawer.tsx` - Campo implementado

### Documentación
9. ✅ `FUNCIONALIDAD_REFERIDOS.md` - Esta documentación

---

## 💡 Notas Técnicas

### ¿Por qué usar telefono como cédula?
En el modelo actual, el campo `telefono` se usa también como cédula. Esto es común en sistemas donde el teléfono es el identificador único del cliente.

### Debounce de 500ms
La búsqueda se retrasa 500ms después de la última tecla presionada para:
- Evitar requests excesivos al backend
- Mejorar la experiencia del usuario
- Reducir carga en el servidor

### Mínimo 3 caracteres
La búsqueda solo se ejecuta si se ingresan al menos 3 caracteres para:
- Evitar búsquedas muy amplias
- Mejorar el rendimiento
- Reducir falsos positivos

### Campo opcional
El campo es completamente opcional porque:
- No todos los clientes vienen referidos
- No queremos bloquear el registro
- La advertencia es informativa, no restrictiva

---

## 🐛 Troubleshooting

### Problema: No aparece el campo de referido
**Solución**: Verificar que "Tipo de usuario" esté en "Cliente"

### Problema: La búsqueda no funciona
**Solución**:
1. Verificar que el backend esté corriendo (puerto 8000)
2. Verificar que la cédula tenga al menos 3 caracteres
3. Esperar 500ms después de escribir (debounce)

### Problema: Error de TypeScript
**Solución**: Verificar que todos los types se hayan importado correctamente

### Problema: Campo siempre muestra "No encontrado"
**Solución**:
1. Verificar que existan usuarios en la base de datos
2. Verificar que el campo `telefono` tenga valores
3. Probar con cédulas conocidas

---

## 🚀 Próximas Mejoras (Opcional)

- [ ] Autocomplete dropdown con sugerencias
- [ ] Búsqueda fuzzy (tolerancia a errores)
- [ ] Estadísticas de referidos por cliente
- [ ] Dashboard de referidos
- [ ] Sistema de recompensas por referidos
- [ ] Notificación al cliente referidor
- [ ] Búsqueda por nombre además de cédula

---

## ✨ Conclusión

El sistema de referidos está completamente funcional y listo para usar. Permite registrar de manera opcional qué cliente refirió a un nuevo cliente, con validación en tiempo real y una excelente experiencia de usuario.

**Funciona en**: http://localhost:3000/clientes → "Nuevo cliente"
