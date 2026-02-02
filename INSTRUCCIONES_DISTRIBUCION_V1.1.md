# Instrucciones para Distribuir Momentum Fitness v1.1.0

**Fecha de Release:** 2026-01-09
**Versión:** 1.1.0

---

## Estado Actual: ✅ TODO LISTO PARA DISTRIBUCIÓN

### Componentes Preparados

1. **Imágenes Docker en Docker Hub**
   - ✅ Backend v1.1 publicado
   - ✅ Frontend v1.1 publicado
   - ✅ Tags `latest` actualizados
   - ✅ Verificado y accesible públicamente

2. **Paquetes de Distribución**
   - ✅ `momentum-fitness-v1.1.0.zip` (Windows)
   - ✅ `momentum-fitness-v1.1.0.tar.gz` (Linux/Mac)
   - ✅ Checksums SHA256 generados
   - ✅ Ubicación: `dist/`

3. **Scripts de Actualización**
   - ✅ `update.bat` para Windows
   - ✅ `update.sh` para Linux/Mac
   - ✅ Incluidos en los paquetes

4. **Documentación**
   - ✅ Notas de versión actualizadas
   - ✅ Guías de instalación
   - ✅ Instrucciones de actualización

---

## Opciones de Distribución

### Opción 1: Clientes Existentes (Actualización)

**Los clientes con v1.0 pueden actualizar ejecutando:**

**Windows:**
```batch
cd momentum-fitness
update.bat
```

**Linux/Mac:**
```bash
cd momentum-fitness
./update.sh
```

**Qué hace el script:**
1. Descarga las nuevas imágenes v1.1 desde Docker Hub
2. Detiene los contenedores actuales
3. Inicia los nuevos contenedores con v1.1
4. Mantiene todos los datos intactos (volúmenes persistentes)

**Tiempo estimado:** 2-5 minutos (depende de la conexión)

---

### Opción 2: Nuevos Clientes (Instalación Limpia)

**Distribuir los paquetes v1.1.0:**

#### Archivos a Compartir

**Para usuarios Windows:**
```
dist/momentum-fitness-v1.1.0.zip
dist/momentum-fitness-v1.1.0.zip.sha256
```

**Para usuarios Linux/Mac:**
```
dist/momentum-fitness-v1.1.0.tar.gz
dist/momentum-fitness-v1.1.0.tar.gz.sha256
```

#### Instrucciones para el Cliente

1. **Descargar el paquete apropiado**
   - Windows: `momentum-fitness-v1.1.0.zip`
   - Linux/Mac: `momentum-fitness-v1.1.0.tar.gz`

2. **Verificar integridad (opcional pero recomendado)**
   ```bash
   # Windows (PowerShell)
   Get-FileHash momentum-fitness-v1.1.0.zip -Algorithm SHA256

   # Linux/Mac
   sha256sum -c momentum-fitness-v1.1.0.tar.gz.sha256
   ```

3. **Extraer el contenido**
   - Windows: Clic derecho → "Extraer todo"
   - Linux/Mac: `tar -xzf momentum-fitness-v1.1.0.tar.gz`

4. **Ejecutar el instalador**
   - Windows: Doble clic en `start.bat`
   - Linux/Mac: `./start.sh` en la terminal

5. **Acceder a la aplicación**
   - Abrir navegador en: `http://localhost:3000`

---

## Canales de Distribución Recomendados

### 1. GitHub Releases (Recomendado)

Si tienes un repositorio de GitHub:

```bash
# Crear un release en GitHub con los archivos
gh release create v1.1.0 \
  dist/momentum-fitness-v1.1.0.zip \
  dist/momentum-fitness-v1.1.0.zip.sha256 \
  dist/momentum-fitness-v1.1.0.tar.gz \
  dist/momentum-fitness-v1.1.0.tar.gz.sha256 \
  --title "Momentum Fitness v1.1.0" \
  --notes-file ACTUALIZACION_V1.1.md
```

### 2. Servidor Web/FTP

Subir a un servidor web para descarga directa:

```
https://tu-dominio.com/downloads/
  ├── momentum-fitness-v1.1.0.zip
  ├── momentum-fitness-v1.1.0.zip.sha256
  ├── momentum-fitness-v1.1.0.tar.gz
  └── momentum-fitness-v1.1.0.tar.gz.sha256
```

### 3. Google Drive / Dropbox

Para distribución privada o limitada:
1. Subir los archivos a tu carpeta
2. Crear un link compartido
3. Enviar el link a los clientes

### 4. Email Directo

Para clientes específicos:
- Adjuntar el ZIP/TAR.GZ apropiado
- Incluir el archivo SHA256 para verificación
- Incluir instrucciones de instalación

---

## Mensaje de Anuncio para Clientes

### Para Clientes Existentes

```
¡Nueva actualización disponible! 🎉

Momentum Fitness v1.1.0 ya está disponible con las siguientes mejoras:

✨ Mejoras en el sistema de cupones
✅ Correcciones en registro de asistencia
🎨 Interfaz más pulida y responsiva
⚡ Optimizaciones de rendimiento

Para actualizar (tus datos se mantendrán intactos):
1. Abre una terminal en la carpeta momentum-fitness
2. Ejecuta: update.bat (Windows) o ./update.sh (Linux/Mac)
3. Espera 2-5 minutos
4. ¡Listo!

La aplicación se reiniciará automáticamente con la nueva versión.
```

### Para Nuevos Clientes

```
¡Momentum Fitness v1.1.0 disponible! 🚀

Sistema completo de gestión de gimnasio con:
- Gestión de clientes y membresías
- Control de asistencia
- Sistema de cupones y descuentos
- Panel de empleados
- Reportes y estadísticas
- Interfaz web moderna

Instalación en 3 pasos:
1. Descargar el paquete para tu sistema operativo
2. Extraer y ejecutar start.bat (Windows) o start.sh (Linux/Mac)
3. Abrir http://localhost:3000

Requisitos:
- Docker Desktop instalado
- 4GB RAM mínimo
- 2GB espacio en disco

Descargar en: [TU LINK DE DISTRIBUCIÓN]
```

---

## Verificación de Distribución

### Antes de Distribuir

Verifica que todo funcione:

```bash
# 1. Verificar que las imágenes estén en Docker Hub
docker pull edwlearn/momentum-fitness:backend-latest
docker pull edwlearn/momentum-fitness:frontend-latest

# 2. Verificar los checksums
cd dist
sha256sum -c momentum-fitness-v1.1.0.zip.sha256
sha256sum -c momentum-fitness-v1.1.0.tar.gz.sha256

# 3. Probar instalación limpia
cd /tmp
unzip ~/momentum/dist/momentum-fitness-v1.1.0.zip
cd momentum-fitness
./start.sh

# 4. Verificar que funcione
curl http://localhost:3000
curl http://localhost:8000/health

# 5. Limpiar
./stop.sh
cd ..
rm -rf momentum-fitness
```

---

## Soporte Post-Distribución

### Preguntas Frecuentes Esperadas

**Q: ¿Perderé mis datos al actualizar?**
A: No, todos los datos se mantienen en volúmenes Docker persistentes.

**Q: ¿Cuánto tiempo tarda la actualización?**
A: Entre 2-5 minutos, dependiendo de tu conexión a internet.

**Q: ¿Puedo volver a la versión anterior?**
A: Sí, edita docker-compose.yml y cambia los tags a `v1.0`.

**Q: ¿Qué hago si algo sale mal?**
A: Ejecuta `stop.bat`/`stop.sh` y luego `start.bat`/`start.sh`.

### Logs para Debugging

Si un cliente reporta problemas:

```bash
# Ver logs del backend
docker logs momentum-backend

# Ver logs del frontend
docker logs momentum-frontend

# Ver estado de contenedores
docker ps -a
```

---

## Checklist Final

Antes de distribuir, verifica:

- [ ] Imágenes v1.1 publicadas en Docker Hub
- [ ] Paquetes ZIP y TAR.GZ creados
- [ ] Checksums SHA256 generados
- [ ] Documentación actualizada
- [ ] Probado instalación limpia en Windows
- [ ] Probado instalación limpia en Linux/Mac
- [ ] Probado actualización desde v1.0
- [ ] Canal de distribución preparado
- [ ] Mensaje de anuncio preparado

---

## Próximos Pasos

1. **Distribuir:**
   - Subir archivos a tu canal preferido
   - Enviar anuncio a clientes

2. **Monitorear:**
   - Estar atento a reportes de problemas
   - Recopilar feedback

3. **Planificar v1.2:**
   - Documentar ideas para mejoras futuras
   - Priorizar features basado en feedback

---

## Comandos Rápidos de Referencia

### Reconstruir imágenes (si es necesario)
```bash
docker build -t edwlearn/momentum-fitness:backend-latest -f backend/Dockerfile backend/
docker build -t edwlearn/momentum-fitness:frontend-latest -f Dockerfile .
```

### Re-publicar en Docker Hub
```bash
docker push edwlearn/momentum-fitness:backend-latest
docker push edwlearn/momentum-fitness:frontend-latest
```

### Recrear paquetes
```bash
./create-release.sh
```

---

**¡Listo para distribuir!** 🚀

Todos los componentes están preparados y verificados.
Momentum Fitness v1.1.0 está listo para llegar a tus clientes.
