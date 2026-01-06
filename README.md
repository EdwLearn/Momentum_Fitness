# 🏋️ Momentum Fitness - Sistema de Gestión de Gimnasio

Sistema completo de gestión para gimnasios con backend FastAPI, frontend Next.js y base de datos SQLite.

---

## 🚀 Inicio Rápido

### ▶️ Iniciar la Aplicación (Un Solo Comando)

```bash
./start-momentum.sh
```

¡Eso es todo! El script:
- ✅ Activa el entorno virtual automáticamente
- ✅ Inicia el backend (FastAPI) en puerto 8000
- ✅ Inicia el frontend (Next.js) en puerto 3000
- ✅ Muestra las URLs y credenciales

### 🛑 Detener

Presiona `Ctrl+C` en la terminal donde corre el script.

---

## 📥 Configuración Inicial (Primera Vez)

### 1. Clonar el repositorio
```bash
git clone https://github.com/TU_USUARIO/momentum-fitness.git
cd momentum-fitness
```

### 2. Configurar Backend
```bash
cd backend
python3 -m venv ../momentum
source ../momentum/bin/activate
pip install -r requirements.txt
cp .env.example .env
cd ..
```

### 3. Configurar Frontend (en la raíz)
```bash
npm install
```

### 4. ¡Listo! Ahora usa:
```bash
./start-momentum.sh
```

---

## 💻 Requisitos

- ✅ **Python 3.8+**
- ✅ **Node.js 16+**
- ✅ **npm**
- ✅ **Git** (para clonar)
- ✅ **4 GB RAM mínimo**
- ✅ **500 MB espacio en disco**

---

## 🔑 Credenciales de Acceso

Una vez que la aplicación esté corriendo en `http://localhost:3000`:

### 👑 Administrador
- **Email:** `admin@momentum.com`
- **Contraseña:** `admin123`

### 👤 Usuarios Demo (si usaste BD precargada)
- **Email:** `juan@example.com` / `maria@example.com` / `carlos@example.com`
- **Contraseña:** `demo123`

---

## 📁 Estructura del Proyecto

```
momentum-fitness/
│
├── start-momentum.sh          ← Script de inicio (¡solo esto necesitas!)
│
├── backend/                   → API FastAPI (Python)
│   ├── main.py
│   ├── app/
│   ├── requirements.txt
│   └── .env.example
│
├── app/                       → Frontend Next.js (React) - raíz
├── components/                → Componentes React
├── pages/                     → Páginas Next.js
├── package.json               → Dependencias frontend
│
└── momentum/                  → Entorno virtual Python (se crea al setup)
```

---

## 🎯 Características

### ✅ Módulos Implementados

- 👤 **Gestión de Usuarios/Clientes**
- 💳 **Gestión de Membresías**
- 📋 **Control de Asistencia**
- 📊 **Métricas y Progreso**
- 👔 **Gestión de Empleados**
- 🎟️ **Cupones y Descuentos**
- 👥 **Programa de Referidos**
- 📈 **Dashboard y Reportes**
- ⚙️ **Configuración del Gimnasio**
- 🎫 **Soporte y Tickets**

---

## 🆘 Solución de Problemas

### Problema: "Python no encontrado"
**Solución:** Instala Python desde https://www.python.org/downloads/
- ⚠️ Marca "Add Python to PATH" durante la instalación

### Problema: "npm no encontrado" o "Node no encontrado"
**Solución:** Instala Node.js desde https://nodejs.org/

### Problema: La aplicación no se abre en el navegador
**Solución:**
1. Espera 10-15 segundos después de ejecutar `./start-momentum.sh`
2. Abre manualmente: http://localhost:3000

### Problema: Error "Port already in use"
**Solución:**
1. Detén el script con `Ctrl+C`
2. Vuelve a ejecutar `./start-momentum.sh`

---

## ⚡ Resumen Ultra-Rápido

```bash
# Primera vez (solo una vez):
git clone https://github.com/TU_USUARIO/momentum-fitness.git
cd momentum-fitness
cd backend && python3 -m venv ../momentum && source ../momentum/bin/activate && pip install -r requirements.txt && cp .env.example .env && cd ..
npm install

# Cada vez que quieras usar la app:
./start-momentum.sh

# Para detener:
Ctrl+C
```

¡Así de fácil! 🚀

---

**Versión:** 2.0.0 | **Licencia:** MIT