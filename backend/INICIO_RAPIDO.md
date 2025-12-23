# 🚀 Inicio Rápido - Sistema de Gestión de Gimnasio

## Pasos para Ejecutar el Backend

### 1️⃣ Instalar Dependencias

```bash
cd backend
python -m venv momentum
source momentum/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2️⃣ Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar el archivo .env
nano .env  # o usa tu editor preferido
```

**Variables OBLIGATORIAS a configurar:**

```env
# Claude API (obtener en: https://console.anthropic.com/)
ANTHROPIC_API_KEY=sk-ant-api03-tu-clave-aqui

# Base de datos (elegir una opción)
# Opción 1: PostgreSQL (recomendado para producción)
DATABASE_URL=postgresql://gimnasio_user:gimnasio_pass@localhost:5432/gimnasio_db

# Opción 2: SQLite (para desarrollo rápido)
# DATABASE_URL=sqlite:///./gimnasio.db
```

### 3️⃣ Configurar Base de Datos

#### Opción A: PostgreSQL

```bash
# Entrar a PostgreSQL
psql -U postgres

# Ejecutar estos comandos:
CREATE DATABASE gimnasio_db;
CREATE USER gimnasio_user WITH PASSWORD 'gimnasio_pass';
GRANT ALL PRIVILEGES ON DATABASE gimnasio_db TO gimnasio_user;
\q
```

#### Opción B: SQLite (más simple)

No requiere configuración, se crea automáticamente.

### 4️⃣ Inicializar Base de Datos

```bash
# Opción 1: Usando el script de inicio
python run.py --init-db

# Opción 2: Manualmente
python -c "from app.core.database import init_db; init_db()"
```

### 5️⃣ Ejecutar el Servidor

```bash
# Desarrollo (con auto-reload)
python run.py

# O usando uvicorn directamente
uvicorn main:app --reload --port 8000

# Producción (múltiples workers)
python run.py --prod
```

### 6️⃣ Verificar que Funciona

Abre tu navegador en:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **API Root**: http://localhost:8000/

---

## ✅ Verificación Rápida

Ejecuta estos comandos para verificar que todo está bien:

```bash
# 1. Verificar que el servidor arranca
curl http://localhost:8000/

# 2. Verificar salud del sistema
curl http://localhost:8000/health

# 3. Verificar estadísticas
curl http://localhost:8000/stats

# 4. Probar el bot (después de configurar ANTHROPIC_API_KEY)
curl -X POST http://localhost:8000/api/bot/chat \
  -H "Content-Type: application/json" \
  -d '{
    "usuario_id": 1,
    "mensaje": "Hola! ¿Cómo estás?"
  }'
```

---

## 🎯 Endpoints Principales

### Usuarios
```bash
# Crear usuario
curl -X POST http://localhost:8000/api/usuarios/ \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@example.com",
    "tipo": "cliente",
    "peso_inicial": 80.5
  }'

# Listar usuarios
curl http://localhost:8000/api/usuarios/
```

### Asistencia
```bash
# Registrar asistencia
curl -X POST http://localhost:8000/api/asistencia/ \
  -H "Content-Type: application/json" \
  -d '{
    "usuario_id": 1,
    "hora_entrada": "08:30:00"
  }'
```

### Bot
```bash
# Chat con el bot
curl -X POST http://localhost:8000/api/bot/chat \
  -H "Content-Type: application/json" \
  -d '{
    "usuario_id": 1,
    "mensaje": "¿Qué ejercicios me recomiendas para pecho?"
  }'

# Ver triggers pendientes
curl http://localhost:8000/api/bot/triggers
```

---

## 🔧 Solución de Problemas

### Error: "ANTHROPIC_API_KEY not found"
**Solución**: Configura tu API key en el archivo `.env`

### Error: "could not connect to database"
**Solución**: Verifica que PostgreSQL esté corriendo o usa SQLite

### Error: "ModuleNotFoundError"
**Solución**: Instala las dependencias con `pip install -r requirements.txt`

### Error: "Port 8000 already in use"
**Solución**: Cambia el puerto con `uvicorn main:app --port 8001`

---

## 📚 Documentación Completa

Para más información, consulta:
- [README.md](./README.md) - Documentación completa
- [.env.example](./.env.example) - Variables de entorno
- http://localhost:8000/docs - Documentación interactiva

---

## 🆘 Soporte

Si tienes problemas:
1. Revisa los logs del servidor
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate de que la base de datos esté corriendo
4. Consulta la documentación en `/docs`

---

**¡Listo para usar!** 🎉
