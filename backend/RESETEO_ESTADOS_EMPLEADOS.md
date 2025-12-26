# Sistema de Estados de Empleados

## Estados Disponibles

El sistema de asistencia de empleados utiliza tres estados:

- **-1**: `sin entrada` - Estado inicial del día, antes de que el empleado marque entrada
- **0**: `inactivo` - Después de que el empleado marca salida
- **1**: `activo` - Después de que el empleado marca entrada

## Flujo de Estados

1. **Inicio del día** (automático): Todos los empleados pasan a estado `-1` (sin entrada)
2. **Marcar entrada**: El empleado pasa a estado `1` (activo)
3. **Marcar salida**: El empleado pasa a estado `0` (inactivo)

## Reseteo Automático de Estados

Para que todos los empleados empiecen el día con estado "sin entrada", se debe ejecutar el reseteo diariamente.

### Opción 1: Script Manual

Ejecutar manualmente el script cuando sea necesario:

```bash
cd backend
python resetear_estados_diario.py
```

### Opción 2: Endpoint API

Llamar al endpoint API para resetear estados:

```bash
curl -X POST http://localhost:8000/api/asistencias-empleados/resetear-estados
```

### Opción 3: Tarea Programada (Cron) - Linux/Mac

Configurar cron para ejecutar el script automáticamente a las 00:00 cada día:

1. Abrir el editor de cron:
   ```bash
   crontab -e
   ```

2. Agregar la siguiente línea (ajustar la ruta según tu instalación):
   ```
   0 0 * * * cd /home/edwlearn/v0-dashboard-de-gimnasio/backend && /usr/bin/python3 resetear_estados_diario.py >> /tmp/reseteo_empleados.log 2>&1
   ```

3. Guardar y cerrar el editor.

### Opción 4: Task Scheduler - Windows

1. Abrir "Programador de tareas" (Task Scheduler)
2. Crear tarea básica
3. Nombre: "Resetear Estados Empleados"
4. Desencadenador: Diariamente a las 00:00
5. Acción: Iniciar un programa
   - Programa: `python`
   - Argumentos: `resetear_estados_diario.py`
   - Iniciar en: Ruta completa a la carpeta `backend`

### Opción 5: Scheduler de Python (APScheduler)

Si prefieres mantener el scheduler dentro de la aplicación FastAPI, puedes usar APScheduler:

```python
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime

def job_resetear_estados():
    # Código para resetear estados
    pass

scheduler = BackgroundScheduler()
scheduler.add_job(job_resetear_estados, 'cron', hour=0, minute=0)
scheduler.start()
```

## Verificación

Para verificar que el reseteo funcionó correctamente:

```bash
# Ver el log (si usaste cron)
tail -f /tmp/reseteo_empleados.log

# O consultar el estado de un empleado
curl http://localhost:8000/api/asistencias-empleados/empleado/1/estado-hoy
```

## Notas Importantes

- El reseteo debe ejecutarse **antes** de que los empleados empiecen a marcar asistencia
- Se recomienda configurarlo a las 00:00 (medianoche)
- El script registra un log con timestamp para auditoría
- Si se ejecuta manualmente durante el día, **todos** los empleados perderán su estado actual y volverán a "sin entrada"
