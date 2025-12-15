from fastapi import APIRouter, HTTPException, status

router = APIRouter()

@router.get("/status")
def get_cv_status():
    """
    Endpoint placeholder para el estado del módulo de Computer Vision.
    """
    return {
        "module": "Computer Vision",
        "status": "planned",
        "message": "Este módulo estará disponible en futuras versiones",
        "features_planned": [
            "Reconocimiento facial para check-in",
            "Análisis de posturas en ejercicios",
            "Conteo automático de repeticiones",
            "Análisis de ocupación del gimnasio"
        ]
    }

# Endpoints futuros (comentados):
#
# @router.post("/face-recognition/register")
# async def register_face():
#     """Registrar rostro de un usuario"""
#     pass
#
# @router.post("/face-recognition/identify")
# async def identify_face():
#     """Identificar usuario por rostro"""
#     pass
#
# @router.post("/pose-detection/analyze")
# async def analyze_pose():
#     """Analizar postura en tiempo real"""
#     pass
#
# @router.post("/rep-counter/start")
# async def start_rep_counting():
#     """Iniciar conteo de repeticiones"""
#     pass
