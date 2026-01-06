# Guía de Build - Frontend Next.js Estático

Esta guía documenta el proceso de compilación del frontend de Next.js a archivos estáticos HTML/CSS/JS.

## Configuración Aplicada

### next.config.mjs

Se configuró Next.js para exportación estática:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Genera HTML/CSS/JS estáticos
  distDir: 'out',    // Carpeta de salida

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true,  // Necesario para export estático
  },

  trailingSlash: true,  // Añade / al final de las URLs
}
```

**Características clave**:
- ✅ `output: 'export'` - Habilita la exportación estática
- ✅ `distDir: 'out'` - Archivos se generan en carpeta `/out`
- ✅ `images: { unoptimized: true }` - Imágenes sin optimización dinámica
- ✅ `trailingSlash: true` - Mejor compatibilidad con servidores estáticos

## Proceso de Build

### Comando

```bash
npm run build
```

### Salida del Build

```
✓ Compiled successfully in 4.8s
✓ Generating static pages using 3 workers (15/15) in 656.1ms
✓ Finalizing page optimization
```

### Páginas Generadas

El build generó **15 páginas estáticas**:

```
Route (app)
┌ ○ /                          - Página principal
├ ○ /_not-found                - Página 404 personalizada
├ ○ /asistencia                - Control de asistencia
├ ○ /clientes                  - Gestión de clientes
├ ○ /configuracion             - Configuración del sistema
├ ○ /cupones                   - Gestión de cupones
├ ○ /dashboard                 - Dashboard principal
├ ○ /empleados                 - Gestión de empleados
├ ○ /notificaciones            - Sistema de notificaciones
├ ○ /reportes                  - Generación de reportes
├ ○ /soporte                   - Tickets de soporte
├ ○ /suscripciones             - Gestión de membresías
├ ○ /test-datepicker           - Página de prueba
└ ○ /test-datepicker-position  - Página de prueba

○  (Static)  prerendered as static content
```

## Estructura de Archivos Generados

```
out/
├── 404/                       # Página de error 404
├── _next/                     # Recursos de Next.js
│   ├── static/
│   │   ├── chunks/           # JavaScript compilado
│   │   ├── media/            # Archivos de medios
│   │   └── zK-AU9xk2lAh0zXl6n4W2/  # Build ID
├── _not-found/               # Página not found
├── asistencia/               # Página de asistencia
├── clientes/                 # Página de clientes
├── configuracion/            # Página de configuración
├── cupones/                  # Página de cupones
├── dashboard/                # Dashboard
├── empleados/                # Página de empleados
├── notificaciones/           # Notificaciones
├── reportes/                 # Reportes
├── soporte/                  # Soporte
├── suscripciones/            # Suscripciones
├── test-datepicker/          # Prueba
├── test-datepicker-position/ # Prueba
├── 404.html                  # HTML de error 404
├── admin-avatar.png          # Avatar de admin (687KB)
├── apple-icon.png            # Icono de Apple
├── icon-dark-32x32.png       # Icono modo oscuro
└── icon-light-32x32.png      # Icono modo claro
```

### Estadísticas

- **Total de archivos HTML**: 16 archivos
- **Tamaño total**: 5.5 MB
- **Directorios**: 17 carpetas
- **Build time**: ~5 segundos

## Verificación del Build

### Listar archivos generados

```bash
ls -lh out/
```

### Ver estructura de directorios

```bash
tree out/ -L 2
```

### Contar archivos HTML

```bash
find out/ -name "*.html" | wc -l
```

### Tamaño total

```bash
du -sh out/
```

## Servir los Archivos Estáticos

### Opción 1: Python HTTP Server

```bash
cd out
python3 -m http.server 3000
```

Luego abre: http://localhost:3000

### Opción 2: Node.js serve

```bash
npx serve out -p 3000
```

### Opción 3: Nginx (Producción)

Configuración de ejemplo:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    root /ruta/a/proyecto/out;
    index index.html;

    location / {
        try_files $uri $uri/ $uri.html /index.html;
    }

    # Cache para assets estáticos
    location /_next/static {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Cache para imágenes
    location ~* \.(jpg|jpeg|png|gif|ico|svg)$ {
        add_header Cache-Control "public, max-age=31536000";
    }
}
```

## Integración con Backend

Para servir el frontend junto con el backend FastAPI:

### Opción 1: Copiar archivos a carpeta static del backend

```bash
# Crear carpeta static en backend
mkdir -p backend/static

# Copiar archivos del build
cp -r out/* backend/static/
```

### Opción 2: Configurar FastAPI para servir archivos estáticos

Agregar al `main.py` del backend:

```python
from fastapi.staticfiles import StaticFiles

# Servir archivos estáticos del frontend
app.mount("/", StaticFiles(directory="static", html=True), name="static")
```

**Nota**: Las rutas de la API deben ir antes del mount de archivos estáticos.

## Configuración del Frontend para Conectar al Backend

Asegúrate de que el frontend apunte al backend correcto. En desarrollo:

```javascript
// lib/api.ts o similar
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
```

En el archivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Para producción, crear `.env.production`:

```env
NEXT_PUBLIC_API_URL=/api
```

Esto hará que el frontend use URLs relativas cuando se sirva desde el mismo servidor que el backend.

## Rebuild del Frontend

Si haces cambios en el código:

```bash
# 1. Limpiar build anterior (opcional)
rm -rf out/

# 2. Rebuild
npm run build

# 3. Verificar
ls -lh out/
```

## Problemas Comunes y Soluciones

### Error: Image Optimization incompatible with `output: 'export'`

**Solución**: Agregar `images: { unoptimized: true }` en `next.config.mjs`

### Error: API Routes not supported with `output: 'export'`

**Solución**: Mover las API routes al backend FastAPI. El export estático no soporta API routes de Next.js.

### Páginas dinámicas `[id]`

**Problema**: Las rutas dinámicas requieren configuración especial.

**Solución**: Usar `generateStaticParams` para pre-renderizar las rutas:

```typescript
export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    // ...
  ]
}
```

### Enlaces rotos después del build

**Problema**: Enlaces no funcionan correctamente.

**Solución**: Usar `Link` de Next.js y asegurar que `trailingSlash: true` esté configurado.

## Optimizaciones

### 1. Reducir tamaño del bundle

```bash
# Analizar el bundle
npm install -D @next/bundle-analyzer

# Actualizar next.config.mjs
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)

# Ejecutar análisis
ANALYZE=true npm run build
```

### 2. Minificación

Next.js ya minifica automáticamente en modo producción.

### 3. Compresión

Habilitar gzip/brotli en el servidor:

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

## Distribución

### Preparar para distribución

```bash
# Crear archivo comprimido
tar -czf frontend-build.tar.gz out/

# O ZIP
zip -r frontend-build.zip out/
```

### Estructura de distribución recomendada

```
momentum-frontend/
├── out/              # Archivos compilados
├── .env.production   # Variables de entorno de producción
└── README.md         # Instrucciones de despliegue
```

## Próximos Pasos

1. ✅ Frontend compilado a archivos estáticos
2. ✅ Backend compilado a ejecutable
3. ⏳ Combinar frontend y backend en un solo paquete
4. ⏳ Crear instalador/script de despliegue
5. ⏳ Configurar como servicio del sistema

## Notas Técnicas

- **Next.js Version**: 16.0.3
- **React Version**: 19.2.0
- **Build Tool**: Turbopack
- **Output Size**: 5.5 MB
- **Total Pages**: 15 páginas estáticas
- **HTML Files**: 16 archivos

---

**Fecha de Build**: 2026-01-05
**Estado**: ✅ Build exitoso - Archivos estáticos listos para distribución
