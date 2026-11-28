import json
import re
from collections import deque

from obi_tutor.pedagogia import EXEMPLOS, oferecer_ajuda
from obi_tutor.services.gemini import gerar_texto


INSTRUCOES_TUTOR = (
    "Você é o Olimpio, tutor do OBI Tutor. Ajude estudantes do 1º e do 2º ano do "
    "Ensino Médio a se preparar para as provas de programação da OBI. "
    "A OBI é a Olimpíada Brasileira de Informática, uma competição estudantil. "
    "Nas provas de programação, o estudante interpreta enunciados e escreve programas "
    "que respeitam as restrições e produzem a saída esperada. "
    "Oriente a leitura de enunciados, a identificação de entradas e saídas, a criação de casos "
    "de teste e a construção de soluções em Python. Use os conceitos da trilha como referência, "
    "entre eles variáveis, condicionais, laços, estruturas de dados e teste de mesa. "
    "Diferencie a série escolar, a dificuldade das missões e os níveis oficiais da OBI. "
    "Use informações verificadas ao falar de níveis, inscrições ou regras da competição. "
    "Se elas não estiverem no contexto, oriente o estudante a consultar a organização da OBI. "
    "A apresentação já foi feita na interface. Comece direto, sem saudações repetidas, "
    "e responda em português em até quatro frases curtas. Dê um único exemplo por resposta. "
    "Priorize a dúvida atual; use os turnos recentes para entender referências e pedidos de reformulação. "
    "Respeite a decisão de recusar uma atividade ou de parar. Se o estudante recusar uma sugestão "
    "e fizer outra pergunta na mesma mensagem, responda à nova dúvida. "
    "Quando a dúvida combinar conceitos, explique como eles se encaixam. "
    "Use o assunto anterior para responder a pedidos curtos de continuação. "
    "Na primeira frase, dê a resposta concreta à pergunta. Em perguntas de confirmação, confirme "
    "ou corrija o valor logo no início. Para alterações, mostre primeiro o que deve mudar. "
    "Depois, explique brevemente o motivo. Faça uma pergunta de acompanhamento só se ela ajudar. "
    "Continue com os dados do exemplo em curso. "
    "Use a alteração mais recente descrita pelo estudante ou na explicação. Se modificar o exemplo, "
    "mostre em um bloco de código como ele fica depois da mudança. "
    "Se precisar esclarecer a dúvida, faça uma pergunta sobre o assunto em conversa. "
    "Quando houver um diagnóstico no contexto, use os resultados para orientar a revisão e "
    "identificar as questões pelo número, sem presumir qual alternativa foi escolhida. "
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
    "C8": r"\b(erros?|bugs?|teste de mesa|depura\w*)\b",
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
    r"(?:(?:(?:agora )?(?:eu )?(?:j[aá] )?entendi|(?:agora )?(?:eu )?j[aá] sei)"
    r"(?: (?:o|esse|este) (?:assunt\w*|conceito|exemplo|c[oó]digo))?|faz sentido)",
    re.IGNORECASE,
)
RECUSA = re.compile(
    r"(?:(?:agora )?n[aã]o|prefiro que n[aã]o|n[aã]o quero(?: mais| continuar)?"
    r"|(?:eu )?(?:j[aá] )?falei que n[aã]o (?:quero|queria)(?: isso)?)",
    re.IGNORECASE,
)
RECUSA_COM_DUVIDA = re.compile(
    r"^(?:agora )?n[aã]o[,;.!]\s*(?:mas\s+)?"
    r"(?=(?:quero|gostaria|como|qual|o que|e se|pode)\b)",
    re.IGNORECASE,
)
RECLAMACAO_EXTENSAO = re.compile(
    r"\b(?:respost\w*|explicaç\w*|textos?)\s+(?:(?:é|são|está|estão)\s+)?"
    r"(?:(?:muito|bem)\s+)?long[oa]s?\b",
    re.IGNORECASE,
)
CRITICA_CURTA = re.compile(r"(?:lixo|fei[oa]|ruim|péssim[oa])", re.IGNORECASE)
RECLAMACAO_CLAREZA = re.compile(
    r"\b(?:n[aã]o explica (?:nada )?direito|explica mal|"
    r"(?:a )?explicaç[aã]o (?:foi|ficou|est[aá]) confusa|n[aã]o (?:foi|ficou) clar[ao])\b",
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
    r"\b(?:n[aã]o (?:entendi|entendo|compreendi|compreendo)|outro jeito|outra forma|"
    r"explicar? melhor|me explique|como assim|como seria|pode (?:continuar|detalhar)|por qu[eê]|e se|"
    r"exemplos?|esse conceito|o conceito|isso|resuma|resumir)\b",
    re.IGNORECASE,
)
SOBRE_A_MISSAO = re.compile(
    r"\b(?:esta|essa|minha|a) (?:miss[aã]o|quest[aã]o|atividade)\b|"
    r"\b(?:este|esse|meu|o) (?:exerc[ií]cio|enunciado|desafio)\b",
    re.IGNORECASE,
)
ABERTURA_GENERICA = re.compile(
    r"^(?:(?:ol[áa]|oi|claro|boa pergunta|com certeza)[!.,]\s*)+", re.IGNORECASE,
)
NUMERO_QUESTAO = re.compile(r"\b(?:quest[aã]o|pergunta)\s+(\d{1,2})\b", re.IGNORECASE)
BLOCO_CODIGO = re.compile(r"```[^\n`]*\n(.+?)```", re.DOTALL)
PEDIDO_DIRETO = re.compile(
    r"\b(?:explicaç[aã]o direta|explique diretamente|"
    r"(?:me d[êeáa]|me diga|mostre|dar|mostrar|dizer|qual [ée]) "
    r"(?:a |o )?(?:resposta|solu[çc][aã]o|gabarito))\b",
    re.IGNORECASE,
)
PEDIDO_PISTA = re.compile(r"\b(?:pistas?|dicas?)\b", re.IGNORECASE)
PEDIDO_EXEMPLO = re.compile(r"\bexemplos?\b", re.IGNORECASE)
LINHA_CODIGO = re.compile(r"\blinha\s+(\d{1,3})\b", re.IGNORECASE)
REFERENCIA_CODIGO = re.compile(
    r"\b(?:(?:[dn]ess[ea]|[dn]est[ea]|ess[ea]|est[ea]) (?:c[oó]digo|exemplo|trecho|linha))\b",
    re.IGNORECASE,
)
ANALISA_CODIGO = re.compile(
    r"\b(?:linhas?|sa[ií]das?|resultados?|imprime|retorna|[ií]ndice|posi[çc][aã]o|valor)\b",
    re.IGNORECASE,
)
VARIAVEL = re.compile(r"\b(?:vari[aá]vel|valor d[eo])\s+`?([^\W\d]\w*)", re.IGNORECASE)
RELACAO_ENTRE_CONCEITOS = re.compile(r"\b(?:dentro d[aeo]|junto com|combinar)\b", re.IGNORECASE)
ANINHAMENTO = re.compile(
    r"\b(if|for|while)\b`?\s+dentro\s+(?:de|do|da)\s+(?:(?:um|uma)\s+)?`?(if|for|while)\b",
    re.IGNORECASE,
)


def codigo_do_exemplo(texto):
    blocos = BLOCO_CODIGO.findall(texto)
    return blocos[-1].strip()[:800] if blocos else None


def orientar_trecho(codigo, pergunta):
    linhas = codigo.splitlines()
    numero = LINHA_CODIGO.search(pergunta)
    passo = "Anote os valores iniciais e acompanhe cada mudança até a instrução que produz o resultado."
    if numero and 1 <= int(numero[1]) <= len(linhas):
        passo = f"Na linha {int(numero[1])}, anote os valores antes da instrução e veja o que muda depois dela."
    elif variavel := VARIAVEL.search(pergunta):
        nome = variavel[1]
        if re.search(rf"\b{re.escape(nome)}\b", codigo):
            passo = f"Acompanhe `{nome}` desde o valor inicial. Anote o novo valor cada vez que essa variável mudar."
    return f"{passo}\n\n```python\n{codigo}\n```"


def orientar_combinacao(pergunta, codigo):
    blocos = ANINHAMENTO.search(pergunta)
    if not blocos:
        if codigo:
            return orientar_trecho(codigo, pergunta)
        return "Separe o papel de cada parte. Qual delas precisa acontecer primeiro no seu exemplo?"

    interno, externo = (bloco.lower() for bloco in blocos.groups())
    cabecalhos = {
        "if": "if condicao_{parte}:",
        "while": "while condicao_{parte}:",
        "for": "for item_{parte} in valores_{parte}:",
    }
    linha_externa = cabecalhos[externo].format(parte="externa")
    linha_interna = cabecalhos[interno].format(parte="interna")
    return (
        f"Coloque o `{interno}` dentro do `{externo}` com mais um nível de recuo. "
        "O esqueleto dos dois blocos fica assim.\n\n"
        f"```python\n{linha_externa}\n    {linha_interna}\n        ...\n```\n\n"
        f"Recue sob o `{interno}` só o que deve acontecer nele. "
        f"As instruções do `{externo}` mantêm o recuo que já tinham."
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


class ConversaTutor:
    def __init__(self):
        self.tema = None
        self.breve = False
        self.turnos = deque(maxlen=2)
        self.ultimo_exemplo = None
        self.duvida_composta = None

    def responder(
        self, dominio, texto, foco, recomendada, concluidas,
        *, diagnostico=None, contextualizar_missao=False,
    ):
        texto = RECUSA_COM_DUVIDA.sub("", texto, count=1)
        mensagem_curta = texto.rstrip(" !?.")
        if PARAR.fullmatch(texto):
            return {
                "text": "Tudo bem. Você pode pausar por aqui ou encerrar a sessão.",
                "offerEnd": True,
            }
        if AGRADECIMENTO.fullmatch(mensagem_curta):
            return {"text": "De nada!", "quiet": True}
        if COMPREENDI.fullmatch(mensagem_curta):
            return {"text": "Tudo bem. Pode mandar outra dúvida quando quiser.", "quiet": True}
        if RECUSA.fullmatch(mensagem_curta):
            return {"text": "Tudo bem. A gente segue quando você quiser.", "quiet": True}
        if CRITICA_CURTA.fullmatch(mensagem_curta):
            return {
                "text": "Quer que eu explique de outro jeito ou prefere mudar de assunto?",
                "quiet": True,
            }
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
        temas = [c for c, regra in TEMAS.items() if re.search(regra, texto, re.IGNORECASE)]
        tema = next(iter(temas), None)
        reclama_clareza = bool(RECLAMACAO_CLAREZA.search(texto))
        referencia_ao_trecho = bool(REFERENCIA_CODIGO.search(texto) or LINHA_CODIGO.search(texto))
        retoma = bool(
            RETOMADA.search(texto) or pedido_breve_isolado or reclama_clareza or referencia_ao_trecho
        )
        combina_conceitos = ANINHAMENTO.search(texto) or (
            len(temas) > 1 and RELACAO_ENTRE_CONCEITOS.search(texto)
        )
        if combina_conceitos:
            self.duvida_composta = texto[:800]
        elif tema and (tema != self.tema or not retoma):
            self.duvida_composta = None
        duvida_composta = self.duvida_composta if combina_conceitos or retoma else None
        conceito_id = tema
        if menciona_missao:
            conceito_id = foco["concept_id"]
        elif referencia_ao_trecho and self.ultimo_exemplo:
            conceito_id = self.tema
        elif not tema and (retoma or contextualizar_missao):
            conceito_id = self.tema or (foco and foco["concept_id"])

        revisao = None
        questao_diagnostico = None
        if diagnostico is not None:
            numero_questao = NUMERO_QUESTAO.search(texto)
            if numero_questao:
                numero = int(numero_questao[1])
                if 1 <= numero <= len(dominio.diagnostico):
                    questao_diagnostico = dominio.diagnostico[numero - 1]
            revisao = next(
                (q["concept_id"] for q in dominio.diagnostico if not diagnostico[q["id"]]),
                None,
            )
            if questao_diagnostico:
                conceito_id = questao_diagnostico["concept_id"]
            else:
                conceito_id = conceito_id or revisao

        if conceito_id and conceito_id != self.tema:
            self.ultimo_exemplo = None
        self.ultimo_exemplo = codigo_do_exemplo(texto) or self.ultimo_exemplo

        conceito = dominio.conceitos.get(conceito_id)
        conceito_anterior = dominio.conceitos.get(self.tema)
        contexto = {"conceito": conceito["name"]} if conceito else {}
        if not conceito and conceito_anterior:
            contexto["conceito_anterior"] = conceito_anterior["name"]
        if self.ultimo_exemplo:
            contexto["exemplo_atual"] = self.ultimo_exemplo
        if duvida_composta:
            contexto["duvida_em_foco"] = duvida_composta
        sobre_missao_em_foco = (
            (menciona_missao or contextualizar_missao) and foco["concept_id"] == conceito_id
        )
        if sobre_missao_em_foco:
            contexto["enunciado"] = foco["enunciado"]
            if contextualizar_missao and foco["codigo_python"]:
                contexto["codigo_python"] = foco["codigo_python"]
        if diagnostico is not None:
            contexto["diagnostico"] = [
                {
                    "numero": numero,
                    "conceito": dominio.conceitos[q["concept_id"]]["name"],
                    "enunciado": q["enunciado"],
                    "acertou": diagnostico[q["id"]],
                }
                for numero, q in enumerate(dominio.diagnostico, start=1)
            ]
            if questao_diagnostico and questao_diagnostico["codigo_python"]:
                contexto["codigo_da_questao"] = questao_diagnostico["codigo_python"]
        dados = {"contexto": contexto, "duvida": texto}
        if self.turnos:
            dados["turnos_recentes"] = list(self.turnos)

        instrucoes = INSTRUCOES_TUTOR
        if self.breve or reclama_clareza:
            instrucoes += " O estudante pediu brevidade. Use no máximo duas frases e código curto se pedido."
        resposta = gerar_texto(instrucoes, json.dumps(dados, ensure_ascii=False))
        if resposta:
            resposta = ABERTURA_GENERICA.sub("", resposta.strip()).strip()
            self.ultimo_exemplo = codigo_do_exemplo(resposta) or self.ultimo_exemplo
        if not resposta and questao_diagnostico:
            resposta = questao_diagnostico["explicacao"]
        if not resposta and diagnostico is not None and not tema and not retoma:
            resposta = f"Você acertou {sum(diagnostico.values())} de {len(diagnostico)} questões."
            if revisao:
                assunto = dominio.conceitos[revisao]["name"]
                resposta += f" Podemos começar revisando {assunto.lower()}. Qual parte ficou em dúvida?"
            else:
                resposta += " Qual assunto você quer praticar a seguir?"
        if not resposta and sobre_missao_em_foco:
            if PEDIDO_DIRETO.search(texto):
                resposta = oferecer_ajuda(dominio, foco, "direct", 0)
            elif PEDIDO_PISTA.search(texto):
                resposta = oferecer_ajuda(dominio, foco, "hint", 0)
        if not resposta and duvida_composta:
            resposta = orientar_combinacao(duvida_composta, self.ultimo_exemplo)
        if not resposta and conceito and PEDIDO_EXEMPLO.search(texto) and not referencia_ao_trecho:
            resposta = EXEMPLOS[conceito_id]
        analisa_codigo = referencia_ao_trecho or ANALISA_CODIGO.search(texto)
        if not resposta and self.ultimo_exemplo and (analisa_codigo or retoma or not tema):
            resposta = orientar_trecho(self.ultimo_exemplo, texto)
        if not resposta and sobre_missao_em_foco:
            if analisa_codigo and foco["codigo_python"]:
                resposta = orientar_trecho(foco["codigo_python"], texto)
            else:
                resposta = oferecer_ajuda(dominio, foco, "hint", 0)
        if not resposta and conceito:
            resposta = EXEMPLOS[conceito_id] if retoma else conceito["description"]
        if not resposta and conceito_anterior:
            assunto = conceito_anterior["short"].lower()
            resposta = f"Estávamos falando de {assunto}. Qual parte você quer rever?"
        if not resposta:
            resposta = "Qual parte de Python ou do enunciado você quer ver com um exemplo?"

        if conceito_id:
            self.tema = conceito_id
        self.turnos.append({"pergunta": texto[:800], "resposta": resposta[:800]})
        missao = foco["id"] if contextualizar_missao and sobre_missao_em_foco else next(
            (q["id"] for q in dominio.missoes if q["concept_id"] == conceito_id),
            recomendada,
        )
        return {"text": resposta, "missionId": missao}
