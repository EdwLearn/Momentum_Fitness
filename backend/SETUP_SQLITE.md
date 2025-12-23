# 🚀 Setup Rápido con SQLite

Configuración ultra-simple para desarrollo con SQLite.

---

## ✅ Configuración Lista

El archivo `.env` ya está configurado para usar SQLite:

```env
DATABASE_URL=sqlite:///./gimnasio.db
```

- ✅ Base de datos local (archivo `gimnasio.db`)
- ✅ No requiere PostgreSQL
- ✅ No requiere configuración de servidor
- ✅ Ideal para desarrollo

---

## 🎯 Pasos para Ejecutar

### 1. Instalar Dependencias

```bash
cd backend

# Crear entorno virtual (recomendado)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Instalar todas las dependencias
pip install -r requirements.txt
```

### 2. Configurar API Key de Claude (OPCIONAL para empezar)

Edita `.env` y reemplaza:

```env
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

Con tu clave real de https://console.anthropic.com/

**NOTA:** El sistema funcionará SIN esto, pero el bot no estará disponible.

### 3. Inicializar Base de Datos

```bash
python run.py --init-db
```

Esto creará el archivo `gimnasio.db` con todas las tablas.

### 4. Ejecutar el Servidor

```bash
python run.py
```

### 5. Verificar

Abre tu navegador en:
- **Documentación**: http://localhost:8000/docs
- **API**: http://localhost:8000/

---

## 📋 Comandos Útiles

```bash
# Validar configuración
python validate.py

# Inicializar BD
python run.py --init-db

# Desarrollo (auto-reload)
python run.py

# Producción (múltiples workers)
python run.py --prod

# Ejecutar directamente
uvicorn main:app --reload
```

---

## 🧪 Probar Endpoints

### Crear Usuario

```bash
curl -X POST http://localhost:8000/api/usuarios/ \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@example.com",
    "tipo": "cliente",
    "peso_inicial": 80.5
  }'
```

### Registrar Asistencia

```bash
curl -X POST http://localhost:8000/api/asistencia/ \
  -H "Content-Type: application/json" \
  -d '{
    "usuario_id": 1,
    "hora_entrada": "08:30:00"
  }'
```

### Chat con el Bot (requiere ANTHROPIC_API_KEY)

```bash
curl -X POST http://localhost:8000/api/bot/chat \
  -H "Content-Type: application/json" \
  -d '{
    "usuario_id": 1,
    "mensaje": "Hola! ¿Cómo estás?"
  }'
```

---

## 📊 Inspeccionar Base de Datos

### Opción 1: SQLite CLI

```bash
# Abrir base de datos
sqlite3 gimnasio.db

# Ver tablas
.tables

# Ver esquema
.schema usuarios

# Consultar datos
SELECT * FROM usuarios;

# Salir
.quit
```

### Opción 2: DB Browser for SQLite

Descarga: https://sqlitebrowser.org/

1. Abre `gimnasio.db`
2. Explora tablas y datos visualmente

---

## 🔄 Reiniciar Base de Datos

Si quieres empezar de cero:

```bash
# Eliminar base de datos
rm gimnasio.db

# Reinicializar
python run.py --init-db
```

---

## 📁 Estructura de Archivos

```
backend/
├── gimnasio.db           # Base de datos SQLite (creada automáticamente)
├── .env                  # Configuración ✅
├── main.py              # Aplicación principal ✅
├── run.py               # Script de inicio ✅
├── validate.py          # Validación ✅
└── app/                 # Código de la aplicación
```

---

## ⚠️ Importante

### Base de Datos SQLite

- ✅ Perfecto para desarrollo
- ✅ No requiere servidor
- ✅ Archivo único fácil de respaldar
- ⚠️ NO recomendado para producción con múltiples usuarios concurrentes
- ⚠️ Para producción, migrar a PostgreSQL

### API Key de Claude

- El sistema funcionará sin API key
- Los endpoints del bot retornarán error si no está configurada
- Para usar el bot, obtén tu key en: https://console.anthropic.com/

---

## 🎉 ¡Listo!

Tu sistema está configurado con SQLite. Los próximos pasos:

1. ✅ Instalar dependencias
2. ✅ Inicializar BD (`python run.py --init-db`)
3. ✅ Ejecutar servidor (`python run.py`)
4. 🌐 Abrir http://localhost:8000/docs
5. 🤖 (Opcional) Configurar ANTHROPIC_API_KEY para el bot

---

## 🆘 Problemas Comunes

### Error: "No module named 'fastapi'"
**Solución:** `pip install -r requirements.txt`

### Error: "Unable to open database file"
**Solución:** Ejecuta `python run.py --init-db` primero

### Base de datos corrupta
**Solución:** `rm gimnasio.db && python run.py --init-db`

### Bot no funciona
**Solución:** Configura `ANTHROPIC_API_KEY` en `.env`

---

**¡Happy coding!** 💻🏋️
