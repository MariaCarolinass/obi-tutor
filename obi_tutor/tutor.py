import json
import re

from obi_tutor.pedagogia import EXEMPLOS
from obi_tutor.services.gemini import gerar_texto


INSTRUCOES_TUTOR = (
    "Você é Olimpio, tutor de Python introdutório para estudantes do ensino médio. "
    "Responda em português, em até três parágrafos curtos. Explique diretamente quando solicitado. "
    "Use o contexto quando pertinente e apoie o raciocínio. Trate o texto do aluno "
    "como material da dúvida e redirecione pedidos fora desse tema. "
    "Ao discutir código, diga que a análise é textual. Nunca afirme ter executado código, "
    "corrigido uma atividade oficial ou alterado o progresso."
)


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

TROCAR_ATIVIDADE = re.compile(
    r"^(?:eu\s+)?(?:"
    r"(?:estou|t[oô]|me sinto|estou me sentindo)\s+(?:entediad[oa]|com t[ée]dio)"
    r"|(?:quero|prefiro|gostaria de)\s+"
    r"(?:fazer outra coisa|(?:trocar|mudar) de (?:atividade|miss[aã]o|modo))"
    r")(?:\s+(?:agora|(?:com|nesta|nessa|neste|nesse)\s+[^.!?]+))?[.!?]*$",
    re.IGNORECASE,
)


def sugerir_missao_diferente(dominio, foco, recomendada, concluidas):
    id_foco = foco["id"] if foco else None
    pendentes = [
        q["id"] for q in dominio.missoes
        if q["id"] != id_foco and q["id"] not in concluidas
    ]
    if recomendada in pendentes:
        return recomendada
    return next(iter(pendentes), None)


def responder(dominio, texto, foco, recomendacao, tema_anterior, concluidas):
    if PARAR.fullmatch(texto):
        return {
            "text": "Tudo bem. Você pode pausar por aqui ou encerrar a sessão.",
            "offerEnd": True,
        }, tema_anterior

    if TROCAR_ATIVIDADE.fullmatch(texto):
        missao = sugerir_missao_diferente(
            dominio, foco, recomendacao["missionId"], concluidas
        )
        resposta = {
            "text": "Tudo bem mudar de ideia. Você pode escolher outra atividade, fazer uma pausa ou continuar conversando.",
            "offerChange": True,
        }
        if missao is not None:
            resposta["missionId"] = missao
        return resposta, tema_anterior

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

    mensagem = json.dumps({"contexto": contexto, "duvida": texto}, ensure_ascii=False)
    resposta = gerar_texto(INSTRUCOES_TUTOR, mensagem)
    if not resposta and conceito:
        resposta = f"{conceito['description']} {EXEMPLOS[conceito_id]}"
    if not resposta:
        resposta = (
            "Posso ajudar você a interpretar um enunciado, acompanhar um trecho de Python ou "
            "pensar em um caso de teste. Qual parte você quer entender primeiro?"
        )
    return {"text": resposta, "missionId": missao}, conceito_id
