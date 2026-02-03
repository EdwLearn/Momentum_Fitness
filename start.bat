@echo off
setlocal enabledelayedexpansion

REM Script de inicio para Momentum Fitness (Windows)

echo ==================================
echo   Momentum Fitness - Inicio
echo ==================================
echo.

REM Verificar que Docker esté instalado
docker --version >nul 2>&1
if !ERRORLEVEL! neq 0 (
    echo [ERROR] Docker no esta instalado.
    echo Por favor instala Docker Desktop desde: https://www.docker.com/products/docker-desktop
    echo.
    pause
    exit /b 1
)

REM Verificar que Docker esté corriendo
docker info >nul 2>&1
if !ERRORLEVEL! neq 0 (
    echo [ERROR] Docker no esta corriendo.
    echo Por favor inicia Docker Desktop y vuelve a intentar.
    echo.
    pause
    exit /b 1
)

echo [OK] Docker esta corriendo
echo.

REM Verificar si existe .env, si no, copiar desde .env.example
if not exist .env (
    if exist .env.example (
        echo Creando archivo .env desde .env.example...
        copy .env.example .env >nul
        echo [OK] Archivo .env creado. Puedes editarlo si necesitas configurar API keys.
        echo.
    )
)

REM Descargar imágenes actualizadas e iniciar los contenedores
echo Descargando imagenes actualizadas...
echo Esto puede tomar unos minutos la primera vez...
echo.

docker-compose pull
set PULL_ERROR=!ERRORLEVEL!

docker-compose up -d
set UP_ERROR=!ERRORLEVEL!

echo.
if !UP_ERROR! equ 0 (
    echo ==================================
    echo [OK] Momentum Fitness esta corriendo!
    echo ==================================
    echo.
    echo Frontend: http://localhost:3000
    echo Backend API: http://localhost:8000
    echo Documentacion: http://localhost:8000/docs
    echo.
    echo Para ver los logs:
    echo   docker-compose logs -f
    echo.
    echo Para detener:
    echo   docker-compose down
    echo.
) else (
    echo ==================================
    echo [ERROR] Hubo un error al iniciar los contenedores.
    echo ==================================
    echo.
    echo Revisa los logs con: docker-compose logs
    echo.
)

echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul
endlocal
