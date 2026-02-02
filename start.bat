@echo off
REM Script de inicio para Momentum Fitness (Windows)

echo ==================================
echo 🏋️  Momentum Fitness - Inicio
echo ==================================
echo.

REM Verificar que Docker esté instalado
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker no está instalado.
    echo Por favor instala Docker Desktop desde: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Verificar que Docker esté corriendo
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker no está corriendo.
    echo Por favor inicia Docker Desktop y vuelve a intentar.
    pause
    exit /b 1
)

echo ✅ Docker está corriendo
echo.

REM Verificar si existe .env, si no, copiar desde .env.example
if not exist .env (
    if exist .env.example (
        echo 📄 Creando archivo .env desde .env.example...
        copy .env.example .env >nul
        echo ✅ Archivo .env creado. Puedes editarlo si necesitas configurar API keys.
        echo.
    )
)

REM Descargar imágenes actualizadas e iniciar los contenedores
echo 🔄 Descargando imágenes actualizadas...
echo Esto puede tomar unos minutos la primera vez...
echo.

docker-compose pull
docker-compose up -d

if errorlevel 0 (
    echo.
    echo ==================================
    echo ✅ Momentum Fitness está corriendo!
    echo ==================================
    echo.
    echo 📱 Frontend: http://localhost:3000
    echo 🔧 Backend API: http://localhost:8000
    echo 📚 Documentación: http://localhost:8000/docs
    echo.
    echo Para ver los logs:
    echo   docker-compose logs -f
    echo.
    echo Para detener:
    echo   docker-compose down
    echo.
) else (
    echo.
    echo ❌ Hubo un error al iniciar los contenedores.
    echo Revisa los logs con: docker-compose logs
    pause
    exit /b 1
)

pause
