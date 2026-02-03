@echo off
setlocal enabledelayedexpansion

REM Script de actualización para Momentum Fitness (Windows)
REM Descarga los archivos de configuración más recientes

echo ==================================
echo   Momentum Fitness - Actualizar
echo ==================================
echo.

REM Verificar que curl esté disponible
where curl >nul 2>nul
if !ERRORLEVEL! neq 0 (
    echo [ERROR] curl no esta instalado en este sistema.
    echo Por favor instala curl o actualiza Windows 10/11.
    echo.
    pause
    exit /b 1
)

REM URL base del repositorio
set "REPO_URL=https://raw.githubusercontent.com/EdwLearn/v0-dashboard-de-gimnasio/main"

REM Contadores
set SUCCESS=0
set ERRORS=0

echo Verificando conexion...
curl -sL --connect-timeout 10 --head "%REPO_URL%/docker-compose.yml" >nul 2>&1
if !ERRORLEVEL! neq 0 (
    echo [ERROR] No se puede conectar al servidor.
    echo Verifica tu conexion a internet.
    echo.
    pause
    exit /b 1
)
echo [OK] Conexion establecida
echo.

echo Descargando archivos...
echo.

REM Descargar docker-compose.yml
curl -sL --connect-timeout 10 -o docker-compose.yml.new "%REPO_URL%/docker-compose.yml"
if !ERRORLEVEL! equ 0 (
    if exist docker-compose.yml.new (
        move /Y docker-compose.yml.new docker-compose.yml >nul 2>&1
        echo   [OK] docker-compose.yml actualizado
        set /a SUCCESS+=1
    ) else (
        echo   [ERROR] docker-compose.yml - archivo no descargado
        set /a ERRORS+=1
    )
) else (
    echo   [ERROR] docker-compose.yml - fallo la descarga
    set /a ERRORS+=1
    if exist docker-compose.yml.new del docker-compose.yml.new >nul 2>&1
)

REM Descargar start.bat
curl -sL --connect-timeout 10 -o start.bat.new "%REPO_URL%/start.bat"
if !ERRORLEVEL! equ 0 (
    if exist start.bat.new (
        move /Y start.bat.new start.bat >nul 2>&1
        echo   [OK] start.bat actualizado
        set /a SUCCESS+=1
    ) else (
        echo   [ERROR] start.bat - archivo no descargado
        set /a ERRORS+=1
    )
) else (
    echo   [ERROR] start.bat - fallo la descarga
    set /a ERRORS+=1
    if exist start.bat.new del start.bat.new >nul 2>&1
)

REM Descargar .env.example (solo si no existe .env)
if not exist .env (
    curl -sL --connect-timeout 10 -o .env.example "%REPO_URL%/.env.example" 2>nul
    if exist .env.example (
        echo   [OK] .env.example descargado
        set /a SUCCESS+=1
    ) else (
        echo   [AVISO] .env.example no disponible
    )
)

echo.
echo ==================================
if !ERRORS! equ 0 (
    echo   [OK] Actualizacion completada
    echo   !SUCCESS! archivo(s) descargado(s)
) else (
    echo   [AVISO] Actualizacion con errores
    echo   !SUCCESS! exito(s), !ERRORS! error(es)
)
echo ==================================
echo.

REM Preguntar si quiere iniciar
if !ERRORS! equ 0 (
    if exist start.bat (
        echo Presiona cualquier tecla para iniciar Momentum Fitness...
        echo O cierra esta ventana si solo querias actualizar.
        pause >nul
        call start.bat
    ) else (
        pause
    )
) else (
    echo Revisa los errores antes de continuar.
    pause
)

endlocal
