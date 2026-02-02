@echo off
REM Script de actualización para Momentum Fitness (Windows)
REM Descarga los archivos de configuración más recientes

echo ==================================
echo   Momentum Fitness - Actualizar
echo ==================================
echo.

REM URL base del repositorio (cambiar por tu repo)
set REPO_URL=https://raw.githubusercontent.com/EdwLearn/v0-dashboard-de-gimnasio/main

echo Descargando archivos actualizados...

REM Descargar docker-compose.yml
curl -sL "%REPO_URL%/docker-compose.yml" -o docker-compose.yml.new
if exist docker-compose.yml.new (
    move /Y docker-compose.yml.new docker-compose.yml >nul
    echo   docker-compose.yml actualizado
) else (
    echo   Error descargando docker-compose.yml
)

REM Descargar start.bat
curl -sL "%REPO_URL%/start.bat" -o start.bat.new
if exist start.bat.new (
    move /Y start.bat.new start.bat >nul
    echo   start.bat actualizado
) else (
    echo   Error descargando start.bat
)

REM Descargar .env.example (solo si no existe .env)
if not exist .env (
    curl -sL "%REPO_URL%/.env.example" -o .env.example
    echo   .env.example descargado
)

echo.
echo Archivos actualizados. Ejecutando start.bat...
echo.

call start.bat
