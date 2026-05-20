import csv
import io
import os
import zipfile
from datetime import datetime

from fastapi import APIRouter, Depends, File, Header, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session

from app.core.database import engine, get_db

router = APIRouter()

BACKUP_SECRET = os.getenv("BACKUP_SECRET", "")


def verify_backup_token(x_backup_token: str = Header(...)):
    if not BACKUP_SECRET or x_backup_token != BACKUP_SECRET:
        raise HTTPException(status_code=403, detail="Token inválido")

# Orden de importación respetando FK constraints (nombres reales de tablas en SQLite)
TABLE_IMPORT_ORDER = [
    "configuracion_gimnasio",
    "config_sistema",
    "config_notificaciones",
    "cupones",
    "tickets_soporte",
    "usuarios",
    "empleados",
    "membresias",
    "asistencias",
    "metricas",
    "metricas_usuario",
    "historial_peso",
    "mediciones_bascula",
    "referidos",
    "asistencias_empleados",
    "logros",
    "hitos",
    "conversaciones",
    "mensajes_bot",
    "mensajes_whatsapp",
    "alertas_osne",
    "alertas_intervencion",
    "historial_analisis",
]


@router.get("/export")
def export_backup(db: Session = Depends(get_db)):
    """Exporta todas las tablas de la base de datos como archivos CSV dentro de un ZIP."""
    inspector = inspect(engine)
    table_names = inspector.get_table_names()

    zip_buffer = io.BytesIO()

    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for table_name in table_names:
            columns = [col["name"] for col in inspector.get_columns(table_name)]

            result = db.execute(text(f'SELECT * FROM "{table_name}"'))
            rows = result.fetchall()

            csv_buffer = io.StringIO()
            writer = csv.writer(csv_buffer)
            writer.writerow(columns)
            for row in rows:
                writer.writerow(row)

            zip_file.writestr(f"{table_name}.csv", csv_buffer.getvalue())

    zip_buffer.seek(0)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"momentum_backup_{timestamp}.zip"

    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.post("/import")
async def import_backup(file: UploadFile = File(...), db: Session = Depends(get_db), _: None = Depends(verify_backup_token)):
    """Restaura la base de datos desde archivos CSV dentro de un ZIP."""
    if not file.filename.endswith(".zip"):
        raise HTTPException(status_code=400, detail="El archivo debe ser un .zip")

    content = await file.read()

    try:
        zip_buffer = io.BytesIO(content)

        with zipfile.ZipFile(zip_buffer, "r") as zip_file:
            csv_files = {
                name.replace(".csv", ""): zip_file.read(name).decode("utf-8")
                for name in zip_file.namelist()
                if name.endswith(".csv")
            }

        inspector = inspect(engine)

        # Eliminar datos en orden inverso para respetar FK constraints
        delete_order = list(reversed(TABLE_IMPORT_ORDER))
        for table_name in delete_order:
            if inspector.has_table(table_name):
                try:
                    db.execute(text(f'DELETE FROM "{table_name}"'))
                except Exception:
                    pass

        # También eliminar tablas que no están en el orden definido
        for table_name in inspector.get_table_names():
            if table_name not in TABLE_IMPORT_ORDER:
                try:
                    db.execute(text(f'DELETE FROM "{table_name}"'))
                except Exception:
                    pass

        db.commit()

        tables_restored = []

        # Insertar en orden FK-safe
        insert_order = TABLE_IMPORT_ORDER + [
            t for t in inspector.get_table_names() if t not in TABLE_IMPORT_ORDER
        ]

        for table_name in insert_order:
            if table_name not in csv_files:
                continue
            if not inspector.has_table(table_name):
                continue

            db_columns = {col["name"] for col in inspector.get_columns(table_name)}
            csv_content = csv_files[table_name]
            reader = csv.DictReader(io.StringIO(csv_content))

            rows_inserted = 0
            for row in reader:
                filtered_row = {
                    k: (v if v != "" else None)
                    for k, v in row.items()
                    if k in db_columns
                }

                if not filtered_row:
                    continue

                cols = ", ".join(f'"{k}"' for k in filtered_row.keys())
                placeholders = ", ".join(f":{k}" for k in filtered_row.keys())
                db.execute(
                    text(f'INSERT INTO "{table_name}" ({cols}) VALUES ({placeholders})'),
                    filtered_row,
                )
                rows_inserted += 1

            db.commit()
            tables_restored.append({"tabla": table_name, "filas": rows_inserted})

        return {
            "mensaje": "Backup restaurado exitosamente",
            "tablas_restauradas": tables_restored,
        }

    except zipfile.BadZipFile:
        raise HTTPException(status_code=400, detail="El archivo ZIP es inválido")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al restaurar: {str(e)}")
