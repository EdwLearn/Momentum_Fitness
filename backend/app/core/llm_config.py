"""
Configuración centralizada de LLM.
Soporta tanto Ollama (local, gratis) como Claude (API, pago).
"""
from langchain_ollama import ChatOllama
from langchain_anthropic import ChatAnthropic
import os
from typing import Optional


def get_llm(temperature: float = 0.7, use_local: bool = True, max_tokens: Optional[int] = None):
    """
    Factory para obtener LLM configurado.

    Args:
        temperature: 0.0 (determinístico) a 1.0 (creativo)
        use_local: True = Ollama local (gratis), False = Claude API (pago)
        max_tokens: Máximo de tokens en respuesta (solo para Claude)

    Returns:
        Instancia de LLM configurado

    Examples:
        # Para bot conversacional (creativo)
        llm = get_llm(temperature=0.7, use_local=True)

        # Para análisis (más determinístico)
        llm = get_llm(temperature=0.3, use_local=True)
    """

    # Leer configuración de .env
    use_local_env = os.getenv("USE_LOCAL_LLM", "true").lower() == "true"

    # Override con parámetro si se especifica
    use_local = use_local if use_local is not None else use_local_env

    if use_local:
        # Ollama (local, gratis)
        model = os.getenv("LOCAL_LLM_MODEL", "qwen2.5:7b")
        base_url = os.getenv("LOCAL_LLM_BASE_URL", "http://localhost:11434")

        print(f"🤖 Usando LLM local: {model} (temperatura: {temperature})")

        return ChatOllama(
            model=model,
            temperature=temperature,
            base_url=base_url,
            # num_ctx=2048,  # Contexto (opcional, descomenta si necesitas más)
        )

    else:
        # Claude API (pago)
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise ValueError(
                "ANTHROPIC_API_KEY no configurada en .env. "
                "Para usar Claude, configura la API key o cambia USE_LOCAL_LLM=true"
            )

        model = os.getenv("BOT_MODEL", "claude-3-5-sonnet-20241022")
        max_tokens = max_tokens or int(os.getenv("BOT_MAX_TOKENS", "1024"))

        print(f"🤖 Usando Claude API: {model} (temperatura: {temperature})")

        return ChatAnthropic(
            model=model,
            anthropic_api_key=api_key,
            temperature=temperature,
            max_tokens=max_tokens
        )


# Funciones de conveniencia
def get_conversational_llm(use_local: bool = True):
    """LLM optimizado para conversaciones (temperatura 0.7)"""
    return get_llm(temperature=0.7, use_local=use_local)


def get_analytical_llm(use_local: bool = True):
    """LLM optimizado para análisis (temperatura 0.3)"""
    return get_llm(temperature=0.3, use_local=use_local)
