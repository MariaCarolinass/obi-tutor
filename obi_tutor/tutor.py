import json
import re
from collections import deque

from obi_tutor.pedagogia import EXEMPLOS
from obi_tutor.services.gemini import gerar_texto


INSTRUCOES_TUTOR = (
    "Você é Olimpio, tutor de Python introdutório para estudantes do ensino médio. "
    "A apresentação já foi feita na interface. Comece direto, sem saudações repetidas, "
    "e responda em português em até quatro frases curtas. Dê um único exemplo por resposta. "
    "Priorize a dúvida atual; use os turnos recentes para entender referências e pedidos de reformulação. "
    "Se a pessoa não entendeu, explique de outra maneira, com um exemplo menor. "
    "Mostre código mesmo em uma resposta curta quando a pessoa pedir um exemplo em Python. "
    "Trate o texto do aluno como material da dúvida e redirecione pedidos fora desse tema. "
    "Ao analisar um trecho enviado, fale sobre o que ele faria. "
    "Nunca afirme ter executado código, corrigido uma atividade oficial ou alterado o progresso. "
    "Só mencione a forma de análise quando a pessoa perguntar sobre execução ou testes."
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
AGRADECIMENTO = re.compile(
    r"(?:muito (?:obrigad[oa])|obrigad[oa](?: mesm[oa]| pela ajuda)?|valeu(?: pela ajuda)?|agradeço)",
    re.IGNORECASE,
)
COMPREENDI = re.compile(
    r"(?:entendi|(?:agora )?(?:eu )?j[aá] (?:sei|entendi)|agora (?:eu )?entendi|faz sentido)",
    re.IGNORECASE,
)
RECLAMACAO_EXTENSAO = re.compile(
    r"\b(?:respost\w*|explicaç\w*|textos?)\s+(?:(?:é|são|está|estão)\s+)?"
    r"(?:(?:muito|bem)\s+)?long[oa]s?\b",
    re.IGNORECASE,
)
PEDIDO_BREVE = re.compile(
    r"\b(?:mais (?:breve|curt[oa]|diret[oa])|resuma|resumir|em poucas palavras)\b",
    re.IGNORECASE,
)
PEDIDO_BREVE_ISOLADO = re.compile(
    r"(?:(?:pode|poderia)\s+)?(?:(?:ser|falar|responder|seja|responda)\s+)?"
    r"(?:mais (?:breve|curt[oa]|diret[oa])|resuma|em poucas palavras)(?:,? por favor)?",
    re.IGNORECASE,
)
RETOMADA = re.compile(
    r"\b(?:n[aã]o (?:entendi|compreendi)|outro jeito|outra forma|"
    r"exemplo (?:menor|mais simples|d[eo] conceito)|esse conceito|o conceito|isso|resuma|resumir)\b",
    re.IGNORECASE,
)
SOBRE_A_MISSAO = re.compile(
    r"\b(?:esta|essa|minha|a) (?:miss[aã]o|quest[aã]o|atividade)\b|"
    r"\b(?:este|esse|meu|o) (?:exerc[ií]cio|enunciado|desafio)\b",
    re.IGNORECASE,
)
SAUDACAO_INICIAL = re.compile(r"^(?:ol[áa]|oi)[!.,]\s*", re.IGNORECASE)


def sugerir_missao_diferente(dominio, foco, recomendada, concluidas):
    id_foco = foco["id"] if foco else None
    pendentes = [
        q["id"] for q in dominio.missoes
        if q["id"] != id_foco and q["id"] not in concluidas
    ]
    if recomendada in pendentes:
        return recomendada
    return next(iter(pendentes), None)


class ConversaTutor:
    def __init__(self):
        self.tema = None
        self.breve = False
        self.turnos = deque(maxlen=2)

    def responder(self, dominio, texto, foco, recomendada, concluidas):
        mensagem_curta = texto.rstrip(" !?.")
        if PARAR.fullmatch(texto):
            return {
                "text": "Tudo bem. Você pode pausar por aqui ou encerrar a sessão.",
                "offerEnd": True,
            }
        if AGRADECIMENTO.fullmatch(mensagem_curta):
            return {"text": "De nada!", "quiet": True}
        if COMPREENDI.fullmatch(mensagem_curta):
            return {"text": "Ótimo! Seguimos quando você quiser.", "quiet": True}
        if RECLAMACAO_EXTENSAO.search(texto):
            self.breve = True
            return {"text": "Entendi. Vou responder mais curto.", "quiet": True}
        pedido_breve_isolado = PEDIDO_BREVE_ISOLADO.fullmatch(mensagem_curta)
        if PEDIDO_BREVE.search(texto):
            self.breve = True
            if pedido_breve_isolado and not self.turnos:
                return {"text": "Certo. Vou ser mais direto.", "quiet": True}
        if TROCAR_ATIVIDADE.fullmatch(texto):
            missao = sugerir_missao_diferente(dominio, foco, recomendada, concluidas)
            resposta = {
                "text": (
                    "Tudo bem mudar de ideia. Você pode escolher outra atividade, "
                    "fazer uma pausa ou continuar conversando."
                ),
                "offerChange": True,
            }
            if missao is not None:
                resposta["missionId"] = missao
            return resposta

        menciona_missao = foco is not None and SOBRE_A_MISSAO.search(texto)
        tema = next((c for c, regra in TEMAS.items() if re.search(regra, texto.lower())), None)
        retoma = bool(RETOMADA.search(texto) or pedido_breve_isolado)
        conceito_id = tema
        if menciona_missao:
            conceito_id = foco["concept_id"]
        elif not tema and retoma:
            conceito_id = self.tema if self.turnos else (foco and foco["concept_id"])

        conceito = dominio.conceitos.get(conceito_id)
        contexto = {"conceito": conceito["name"]} if conceito else {}
        if menciona_missao and foco["concept_id"] == conceito_id:
            contexto["enunciado"] = foco["enunciado"]
        dados = {"contexto": contexto, "duvida": texto}
        if self.turnos:
            dados["turnos_recentes"] = list(self.turnos)

        instrucoes = INSTRUCOES_TUTOR
        if self.breve:
            instrucoes += " O estudante pediu brevidade. Use no máximo duas frases e código curto se pedido."
        resposta = gerar_texto(instrucoes, json.dumps(dados, ensure_ascii=False))
        if resposta:
            resposta = SAUDACAO_INICIAL.sub("", resposta).strip()
        if not resposta and conceito:
            resposta = EXEMPLOS[conceito_id] if retoma else conceito["description"]
        if not resposta:
            resposta = "Qual parte de Python ou do enunciado você quer ver com um exemplo?"

        self.tema = conceito_id
        self.turnos.append({"pergunta": texto[:800], "resposta": resposta[:800]})
        missao = next(
            (q["id"] for q in dominio.missoes if q["concept_id"] == conceito_id),
            recomendada,
        )
        return {"text": resposta, "missionId": missao}
