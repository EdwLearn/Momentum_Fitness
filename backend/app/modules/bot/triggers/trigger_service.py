from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Dict
from datetime import datetime, timedelta, date
from app.modules.usuarios.models.usuario import Usuario
from app.modules.asistencia.models.asistencia import Asistencia
from app.modules.metricas.models.metrica import Metrica, TipoMetrica
from app.modules.bot.models.logro import Logro, TipoLogro

class TriggerService:
    """
    Servicio para detectar y gestionar triggers automáticos.
    Detecta rachas, cambios de peso, inactividad y logros.
    """

    # Umbrales configurables
    RACHA_DIAS = [7, 15, 30, 60, 90]  # Días para celebrar rachas
    CAMBIO_PESO_KG = [2, 5, 10]  # Cambios de peso significativos en kg
    DIAS_INACTIVIDAD = [3, 7, 14]  # Días sin asistir para notificar

    @staticmethod
    def calcular_racha_actual(db: Session, usuario_id: int) -> int:
        """
        Calcula la racha actual de días consecutivos de asistencia.
        """
        # Obtener asistencias ordenadas por fecha descendente
        asistencias = db.query(Asistencia).filter(
            Asistencia.usuario_id == usuario_id
        ).order_by(Asistencia.fecha.desc()).all()

        if not asistencias:
            return 0

        racha = 0
        fecha_esperada = date.today()

        for asistencia in asistencias:
            if asistencia.fecha == fecha_esperada:
                racha += 1
                fecha_esperada -= timedelta(days=1)
            elif asistencia.fecha < fecha_esperada:
                # Hay un hueco, se rompe la racha
                break

        return racha

    @staticmethod
    def detectar_triggers_racha(db: Session) -> List[Dict]:
        """
        Detecta usuarios que han alcanzado rachas significativas.
        """
        triggers = []
        usuarios = db.query(Usuario).filter(Usuario.activo == True).all()

        for usuario in usuarios:
            racha = TriggerService.calcular_racha_actual(db, usuario.id)

            # Verificar si la racha alcanza un hito
            if racha in TriggerService.RACHA_DIAS:
                # Verificar si ya se notificó este logro
                logro_existente = db.query(Logro).filter(
                    Logro.usuario_id == usuario.id,
                    Logro.tipo_logro == TipoLogro.RACHA,
                    Logro.valor == racha,
                    Logro.notificado == True
                ).first()

                if not logro_existente:
                    # Crear logro si no existe
                    nuevo_logro = Logro(
                        usuario_id=usuario.id,
                        tipo_logro=TipoLogro.RACHA,
                        titulo=f"¡{racha} días consecutivos!",
                        descripcion=f"Ha asistido {racha} días seguidos al gimnasio",
                        valor=racha,
                        notificado=False
                    )
                    db.add(nuevo_logro)
                    db.commit()

                    triggers.append({
                        "usuario_id": usuario.id,
                        "tipo": "racha",
                        "contexto": {"dias": racha}
                    })

        return triggers

    @staticmethod
    def detectar_triggers_peso(db: Session) -> List[Dict]:
        """
        Detecta cambios significativos de peso.
        """
        triggers = []
        usuarios = db.query(Usuario).filter(
            Usuario.activo == True,
            Usuario.peso_inicial.isnot(None),
            Usuario.peso_actual.isnot(None)
        ).all()

        for usuario in usuarios:
            cambio = abs(usuario.peso_actual - usuario.peso_inicial)

            # Verificar si el cambio es significativo
            for umbral in TriggerService.CAMBIO_PESO_KG:
                if cambio >= umbral:
                    # Verificar si ya se notificó
                    logro_existente = db.query(Logro).filter(
                        Logro.usuario_id == usuario.id,
                        Logro.tipo_logro == TipoLogro.PESO,
                        Logro.valor == umbral,
                        Logro.notificado == True
                    ).first()

                    if not logro_existente:
                        direccion = "perdido" if usuario.peso_actual < usuario.peso_inicial else "ganado"
                        nuevo_logro = Logro(
                            usuario_id=usuario.id,
                            tipo_logro=TipoLogro.PESO,
                            titulo=f"¡{direccion.capitalize()} {umbral}kg!",
                            descripcion=f"Ha {direccion} {cambio:.1f}kg desde que comenzó",
                            valor=umbral,
                            notificado=False
                        )
                        db.add(nuevo_logro)
                        db.commit()

                        triggers.append({
                            "usuario_id": usuario.id,
                            "tipo": "peso",
                            "contexto": {
                                "cambio_kg": usuario.peso_actual - usuario.peso_inicial
                            }
                        })
                    break  # Solo notificar el umbral más bajo alcanzado

        return triggers

    @staticmethod
    def detectar_triggers_inactividad(db: Session) -> List[Dict]:
        """
        Detecta usuarios inactivos que no han asistido en varios días.
        """
        triggers = []
        usuarios = db.query(Usuario).filter(Usuario.activo == True).all()

        for usuario in usuarios:
            if not usuario.ultima_asistencia:
                continue

            dias_sin_asistir = (datetime.utcnow() - usuario.ultima_asistencia).days

            # Verificar si alcanza un umbral de inactividad
            if dias_sin_asistir in TriggerService.DIAS_INACTIVIDAD:
                triggers.append({
                    "usuario_id": usuario.id,
                    "tipo": "inactividad",
                    "contexto": {"dias_sin_asistir": dias_sin_asistir}
                })

        return triggers

    @staticmethod
    def detectar_triggers_logros(db: Session) -> List[Dict]:
        """
        Detecta logros pendientes de notificar.
        """
        triggers = []

        # Buscar logros no notificados
        logros = db.query(Logro).filter(Logro.notificado == False).all()

        for logro in logros:
            triggers.append({
                "usuario_id": logro.usuario_id,
                "tipo": "logro",
                "contexto": {
                    "tipo_logro": logro.tipo_logro.value,
                    "titulo": logro.titulo,
                    "descripcion": logro.descripcion
                }
            })

        return triggers

    @staticmethod
    def obtener_todos_los_triggers(db: Session) -> List[Dict]:
        """
        Obtiene todos los triggers pendientes.
        """
        triggers = []

        triggers.extend(TriggerService.detectar_triggers_racha(db))
        triggers.extend(TriggerService.detectar_triggers_peso(db))
        triggers.extend(TriggerService.detectar_triggers_inactividad(db))
        triggers.extend(TriggerService.detectar_triggers_logros(db))

        return triggers

    @staticmethod
    def marcar_logro_notificado(db: Session, usuario_id: int, tipo_logro: str, valor: float):
        """
        Marca un logro como notificado.
        """
        logro = db.query(Logro).filter(
            Logro.usuario_id == usuario_id,
            Logro.tipo_logro == tipo_logro,
            Logro.valor == valor,
            Logro.notificado == False
        ).first()

        if logro:
            logro.notificado = True
            db.commit()
