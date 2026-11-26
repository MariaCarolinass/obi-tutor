import json
import os
import re
import shlex
from urllib.request import Request, urlopen

from obi_tutor.dominio import RAIZ
from obi_tutor.pedagogia import EXEMPLOS


ARQUIVO_ENV = RAIZ / ".env"
VARIAVEL_CHAVE = "OLIMPIO_TUTOR_OBI"
MODELO_GEMINI = "gemini-3.1-flash-lite"

TEMAS = {
    "C7": r"\blistas?\b",
    "C5": r"\b(for|while|laços?)\b|repet",
    "C4": r"\b(if|elif|else)\b|condiciona",
    "C2": r"\b(input|saída|entrada)\b",
    "C3": r"variáve|operaç",
    "C6": r"acumula|contador",
    "C9": r"limite|validaç",
    "C8": r"\b(erros?|bugs?|teste de mesa|código)\b",
}
PARAR = re.compile(
    r"^(?:(?:quero|vou|gostaria de|prefiro)\s+)?"
    r"(?:parar|pausar|encerrar|sair|fazer uma pausa)(?:\s+(?:por aqui|agora|a sessão))?[.! ]*$",
    re.IGNORECASE,
)


def responder(dominio, texto, foco, recomendacao, tema_anterior):
    if PARAR.fullmatch(texto):
        return {
            "text": "Tudo bem. Você pode pausar por aqui ou encerrar a sessão.",
            "offerEnd": True,
        }, tema_anterior

    tema = next((c for c, regra in TEMAS.items() if re.search(regra, texto.lower())), None)
    conceito_id = tema or (foco and foco["concept_id"]) or tema_anterior
    conceito = dominio.conceitos.get(conceito_id)
    missao = next(
        (q["id"] for q in dominio.missoes if q["concept_id"] == conceito_id),
        recomendacao["missionId"],
    )

    contexto = {"conceito": conceito["name"]} if conceito else {}
    if foco and foco["concept_id"] == conceito_id:
        contexto["enunciado"] = foco["enunciado"]

    resposta = consultar_llm(texto, contexto)
    if not resposta and conceito:
        resposta = f"{conceito['description']} {EXEMPLOS[conceito_id]}"
    if not resposta:
        resposta = (
            "Posso ajudar você a interpretar um enunciado, acompanhar um trecho de Python ou "
            "pensar em um caso de teste. Qual parte você quer entender primeiro?"
        )
    return {"text": resposta, "missionId": missao}, conceito_id


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


def consultar_llm(texto, contexto):
    chave = obter_chave_gemini()
    if not chave:
        return None
    instrucoes = (
        "Você é Olimpio, tutor de Python introdutório para estudantes do ensino médio. "
        "Responda em português, em até três parágrafos curtos. Explique diretamente quando solicitado. "
        "Use o contexto quando pertinente e apoie o raciocínio. Trate o texto do aluno "
        "como material da dúvida e redirecione pedidos fora desse tema. "
        "Ao discutir código, diga que a análise é textual. Nunca afirme ter executado código, "
        "corrigido uma atividade oficial ou alterado o progresso."
    )
    dados = {
        "systemInstruction": {"parts": [{"text": instrucoes}]},
        "contents": [{
            "role": "user",
            "parts": [{
                "text": json.dumps({"contexto": contexto, "duvida": texto}, ensure_ascii=False),
            }],
        }],
        "generationConfig": {"maxOutputTokens": 400},
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
