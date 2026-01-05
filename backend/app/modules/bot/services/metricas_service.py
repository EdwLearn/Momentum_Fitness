from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from datetime import datetime, timedelta, date

from app.modules.usuarios.models.usuario import Usuario
from app.modules.asistencia.models.asistencia import Asistencia
from app.modules.bot.models.conversacion import Conversacion
from app.modules.bot.models.logro import Logro
from app.modules.bot.models.alerta_osne import AlertaOsne
from app.modules.bot.models.metricas_usuario import MetricasUsuario


class MetricasService:
    """
    Servicio para actualizar y calcular métricas de usuarios.
    """

    @staticmethod
    def marcar_respuesta(
        db: Session,
        conversacion_id: int,
        usuario_id: int
    ) -> bool:
        """
        Marca una conversación como respondida cuando el usuario responde.
        """
        # Buscar la última conversación del bot antes de la respuesta del usuario
        conversacion = db.query(Conversacion).filter(
            Conversacion.id == conversacion_id
        ).first()

        if conversacion and not conversacion.fue_respondido:
            conversacion.fue_respondido = True
            conversacion.fecha_respuesta = datetime.utcnow()
            db.commit()

            # Actualizar métricas del usuario
            MetricasService.actualizar_metricas_engagement(db, usuario_id)
            return True

        return False

    @staticmethod
    def actualizar_metricas_engagement(db: Session, usuario_id: int):
        """
        Actualiza las métricas de engagement con el bot.
        """
        metricas = db.query(MetricasUsuario).filter(
            MetricasUsuario.usuario_id == usuario_id
        ).first()

        if not metricas:
            metricas = MetricasUsuario(usuario_id=usuario_id)
            db.add(metricas)

        # Total de mensajes recibidos (triggers y respuestas del bot)
        total_mensajes = db.query(Conversacion).filter(
            Conversacion.usuario_id == usuario_id,
            Conversacion.es_trigger == True
        ).count()

        # Total de mensajes respondidos
        total_respondidos = db.query(Conversacion).filter(
            Conversacion.usuario_id == usuario_id,
            Conversacion.fue_respondido == True
        ).count()

        # Última respuesta
        ultima_respuesta = db.query(Conversacion).filter(
            Conversacion.usuario_id == usuario_id,
            Conversacion.fue_respondido == True
        ).order_by(Conversacion.fecha_respuesta.desc()).first()

        metricas.total_mensajes_recibidos = total_mensajes
        metricas.total_mensajes_respondidos = total_respondidos
        metricas.tasa_respuesta = total_respondidos / total_mensajes if total_mensajes > 0 else 0
        metricas.ultima_respuesta = ultima_respuesta.fecha_respuesta.date() if ultima_respuesta else None

        db.commit()

    @staticmethod
    def calcular_racha_actual(db: Session, usuario_id: int) -> int:
        """
        Calcula la racha actual de días consecutivos.
        """
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
                break

        return racha

    @staticmethod
    def actualizar_metricas_asistencia(db: Session, usuario_id: int):
        """
        Actualiza las métricas de asistencia de un usuario.
        """
        metricas = db.query(MetricasUsuario).filter(
            MetricasUsuario.usuario_id == usuario_id
        ).first()

        if not metricas:
            metricas = MetricasUsuario(usuario_id=usuario_id)
            db.add(metricas)

        usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()

        # Racha actual
        racha_actual = MetricasService.calcular_racha_actual(db, usuario_id)
        metricas.racha_actual = racha_actual

        # Racha máxima (actualizar si la actual es mayor)
        if racha_actual > metricas.racha_maxima:
            metricas.racha_maxima = racha_actual

        # Total de asistencias
        total_asistencias = db.query(Asistencia).filter(
            Asistencia.usuario_id == usuario_id
        ).count()
        metricas.total_asistencias = total_asistencias

        # Asistencias del mes actual
        inicio_mes = date.today().replace(day=1)
        asistencias_mes = db.query(Asistencia).filter(
            Asistencia.usuario_id == usuario_id,
            Asistencia.fecha >= inicio_mes
        ).count()
        metricas.asistencias_mes = asistencias_mes

        # Última asistencia y días desde última visita
        ultima_asistencia = db.query(Asistencia).filter(
            Asistencia.usuario_id == usuario_id
        ).order_by(Asistencia.fecha.desc()).first()

        if ultima_asistencia:
            metricas.ultima_asistencia = ultima_asistencia.fecha
            metricas.dias_desde_ultima_visita = (date.today() - ultima_asistencia.fecha).days
        else:
            metricas.dias_desde_ultima_visita = None

        db.commit()

    @staticmethod
    def actualizar_metricas_peso(db: Session, usuario_id: int):
        """
        Actualiza las métricas de peso de un usuario.
        """
        metricas = db.query(MetricasUsuario).filter(
            MetricasUsuario.usuario_id == usuario_id
        ).first()

        if not metricas:
            metricas = MetricasUsuario(usuario_id=usuario_id)
            db.add(metricas)

        usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()

        if usuario.peso_inicial and usuario.peso_actual:
            metricas.peso_inicial = usuario.peso_inicial
            metricas.cambio_peso_total = usuario.peso_actual - usuario.peso_inicial

            # Cambio de peso del mes (se podría calcular desde historial_peso)
            # Por ahora lo dejamos como el cambio total
            metricas.cambio_peso_mes = usuario.peso_actual - usuario.peso_inicial

        db.commit()

    @staticmethod
    def actualizar_metricas_completas(db: Session, usuario_id: int):
        """
        Actualiza todas las métricas de un usuario.
        """
        MetricasService.actualizar_metricas_asistencia(db, usuario_id)
        MetricasService.actualizar_metricas_peso(db, usuario_id)
        MetricasService.actualizar_metricas_engagement(db, usuario_id)

    @staticmethod
    def registrar_intervencion_osne(db: Session, usuario_id: int, alerta_id: int):
        """
        Registra que Osne atendió una alerta.
        """
        metricas = db.query(MetricasUsuario).filter(
            MetricasUsuario.usuario_id == usuario_id
        ).first()

        if metricas:
            metricas.ultima_intervencion_osne = date.today()
            db.commit()

        # Actualizar la alerta
        alerta = db.query(AlertaOsne).filter(AlertaOsne.id == alerta_id).first()
        if alerta:
            alerta.estado = 'atendida'
            alerta.fecha_atencion = datetime.utcnow()
            db.commit()
