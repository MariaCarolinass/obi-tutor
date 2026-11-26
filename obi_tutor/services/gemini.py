import json
import os
import shlex
from pathlib import Path
from urllib.request import Request, urlopen


ARQUIVO_ENV = Path(__file__).resolve().parents[2] / ".env"
VARIAVEL_CHAVE = "OLIMPIO_TUTOR_OBI"
MODELO_GEMINI = "gemini-3.1-flash-lite"


def obter_chave_gemini():
    chave = os.getenv(VARIAVEL_CHAVE)
    if chave is not None:
        return chave.strip()
    try:
        for linha in ARQUIVO_ENV.read_text(encoding="utf-8").splitlines():
            nome, separador, valor = linha.strip().removeprefix("export ").partition("=")
            if separador and nome.strip() == VARIAVEL_CHAVE:
                valores = shlex.split(valor, comments=True)
                return valores[0].strip() if len(valores) == 1 else None
    except (OSError, ValueError):
        return None
    return None


def gerar_texto(instrucoes, mensagem):
    chave = obter_chave_gemini()
    if not chave:
        return None
    dados = {
        "systemInstruction": {"parts": [{"text": instrucoes}]},
        "contents": [{"role": "user", "parts": [{"text": mensagem}]}],
        "generationConfig": {"maxOutputTokens": 256},
    }
    try:
        pedido = Request(
            f"https://generativelanguage.googleapis.com/v1beta/models/{MODELO_GEMINI}:generateContent",
            data=json.dumps(dados).encode("utf-8"),
            headers={"x-goog-api-key": chave, "Content-Type": "application/json"},
        )
        with urlopen(pedido, timeout=6) as resposta:
            resultado = json.load(resposta)
        candidato = resultado["candidates"][0]
        if candidato.get("finishReason") != "STOP":
            return None
        blocos = (
            parte["text"] for parte in candidato["content"]["parts"]
            if isinstance(parte.get("text"), str) and not parte.get("thought")
        )
        return "\n".join(blocos).strip() or None
    except (OSError, ValueError, KeyError, IndexError, TypeError, AttributeError):
        return None
