# Frontend Dockerfile - Next.js Static Export
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./
RUN npm ci

# Copiar el código fuente
COPY . .

# Deshabilitar telemetría durante el build
ENV NEXT_TELEMETRY_DISABLED=1

# Configurar URL del API
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build de Next.js (genera archivos estáticos en /out)
RUN npm run build

# Imagen de producción con nginx para servir archivos estáticos
FROM nginx:alpine AS runner

# Copiar los archivos estáticos generados
COPY --from=builder /app/out /usr/share/nginx/html

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
