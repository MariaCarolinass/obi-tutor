import json
from collections import Counter
from io import BytesIO
from threading import Thread
from urllib.error import HTTPError
from urllib.request import Request, urlopen

import pytest

from obi_tutor.api import ServidorTutor
from obi_tutor.dominio import Dominio


@pytest.fixture
def api(monkeypatch):
    monkeypatch.setenv("OLIMPIO_TUTOR_OBI", "")
    with ServidorTutor(("127.0.0.1", 0)) as servidor:
        thread = Thread(target=servidor.serve_forever, kwargs={"poll_interval": 0.01})
        thread.start()

        def chamar(method, path, body=None, session_id=None):
            headers = {"Content-Type": "application/json"}
            if session_id:
                headers["X-Study-Session"] = session_id
            pedido = Request(
                f"http://127.0.0.1:{servidor.server_port}{path}",
                method=method,
                headers=headers,
                data=json.dumps(body).encode() if body is not None else None,
            )
            try:
                with urlopen(pedido, timeout=3) as resposta:
                    return resposta.status, json.load(resposta)
            except HTTPError as erro:
                return erro.code, json.load(erro)

        try:
            yield chamar
        finally:
            servidor.shutdown()
            thread.join()


def abrir(api):
    status, sessao = api("POST", "/api/session")
    assert status == 201
    numero = 0

    def agir(acao, **dados):
        nonlocal numero
        numero += 1
        status, resposta = api(
            "POST", "/api/session/action",
            {"requestId": numero, "action": acao, **dados},
            sessao["id"],
        )
        assert status == 200
        return resposta

    return sessao, agir


def test_catalogo_contem_grafo_e_distribuicao_sem_gabaritos(api):
    sessao, _ = abrir(api)
    catalogo = sessao["catalog"]
    assert {c["id"]: c["prerequisites"] for c in catalogo["concepts"]} == {
        "C1": [], "C2": ["C1"], "C3": ["C2"], "C4": ["C3"], "C5": ["C3"],
        "C6": ["C4", "C5"], "C7": ["C5"], "C8": ["C4", "C5"],
        "C9": ["C2", "C8"], "C10": ["C6", "C7", "C9"],
    }
    diagnostico = catalogo["diagnosticQuestions"]
    missoes = catalogo["trainingMissions"]
    assert Counter(q["concept"] for q in diagnostico) == {f"C{i}": 1 for i in range(1, 11)}
    assert Counter(q["concept"] for q in missoes) == {
        "C1": 2, "C2": 2, "C3": 2, "C4": 3, "C5": 3,
        "C6": 3, "C7": 4, "C8": 2, "C9": 3, "C10": 5,
    }
    ordem_conceitos = {c["id"]: i for i, c in enumerate(catalogo["concepts"])}
    ordem_dificuldades = {"Fácil": 0, "Médio": 1, "Difícil": 2}
    ordem_missoes = [
        (ordem_conceitos[q["concept"]], ordem_dificuldades[q["difficulty"]]) for q in missoes
    ]
    assert ordem_missoes == sorted(ordem_missoes)
    assert len({q["id"] for q in diagnostico + missoes}) == 39
    assert all(
        {"gabarito", "answer", "explicacao", "dicas", "feedback_por_alternativa"}.isdisjoint(q)
        for q in diagnostico + missoes
    )
    assert all(r["status"] == "Não avaliado" for r in sessao["state"]["records"].values())


def test_catalogo_tem_feedback_para_todas_as_alternativas_incorretas():
    for questao in Dominio().questoes.values():
        incorretas = {opcao["id"] for opcao in questao["alternativas"]} - {questao["gabarito"]}
        assert set(questao["feedback_por_alternativa"]) == incorretas, questao["id"]
        assert len(set(questao["feedback_por_alternativa"].values())) == len(incorretas)


@pytest.mark.parametrize("destino", ["C12", "C10"])
def test_rejeita_grafo_invalido(tmp_path, destino):
    conceitos = list(Dominio().conceitos.values())
    conceitos[0]["prerequisites"] = [destino]
    arquivo = tmp_path / "conceitos.json"
    arquivo.write_text(json.dumps(conceitos), encoding="utf-8")
    with pytest.raises(ValueError, match="Pré-requisito desconhecido|Ciclo no grafo"):
        Dominio(caminho_conceitos=arquivo)


@pytest.mark.parametrize("feedback", [
    {"B": "Mensagem para o gabarito."},
    {"Z": "Alternativa inexistente."},
    {"A": "  "},
    ["Mensagem sem ID da alternativa."],
])
def test_rejeita_feedback_por_alternativa_invalido(tmp_path, feedback):
    dominio = Dominio()
    dominio.questoes["MISS-C4-02"]["feedback_por_alternativa"] = feedback
    catalogo = {
        "questoes": list(dominio.questoes.values()),
        "distribuicao": Counter(q["tipo"] for q in dominio.questoes.values()),
        "total_questoes": len(dominio.questoes),
    }
    arquivo = tmp_path / "questoes.json"
    arquivo.write_text(json.dumps(catalogo), encoding="utf-8")
    with pytest.raises(ValueError, match="Feedback por alternativa inválido: MISS-C4-02"):
        Dominio(caminho_catalogo=arquivo)


def errada(q):
    return next(opcao["id"] for opcao in q["alternativas"] if opcao["id"] != q["gabarito"])


@pytest.mark.parametrize("perfil", ["acerta", "erra", "misto"])
def test_perfis_atualizam_modelo_e_recomendacao(api, perfil):
    _, agir = abrir(api)
    dominio = Dominio()
    for q in dominio.diagnostico:
        resposta = agir("answer", questionId=q["id"], optionId=q["gabarito"] if perfil == "acerta" else errada(q))
        assert resposta["result"]["points"] == (30 if perfil == "acerta" else 0)

    q = dominio.questoes["DIAG-C4-01"]
    repetida = agir("answer", questionId=q["id"], optionId=q["gabarito"])
    assert repetida["result"] == {"correct": perfil == "acerta", "points": 0, "review": True}
    registro = repetida["state"]
    assert registro["weakPrerequisites"]["C4"] == ["C3"]

    for q in dominio.missoes:
        if perfil == "misto" and q["concept_id"] not in {"C4", "C5"}:
            continue
        if perfil == "misto" and q["concept_id"] == "C5":
            agir("answer", questionId=q["id"], optionId=errada(q))
            agir("help", questionId=q["id"], kind="hint")
        resposta = agir("answer", questionId=q["id"], optionId=errada(q) if perfil == "erra" else q["gabarito"])
        registro = resposta["state"]

    c4 = registro["records"]["C4"]
    assert (c4["score"], c4["independent"], c4["status"]) == {
        "acerta": (100, 4, "Dominado"),
        "erra": (0, 0, "Inicial"),
        "misto": (75, 3, "Dominado"),
    }[perfil]
    if perfil == "misto":
        assert registro["records"]["C5"]["score"] == 45
        assert registro["records"]["C5"]["independent"] == 0
    assert all(0 <= r["score"] <= 100 for r in registro["records"].values())
    assert registro["recommendation"]["missionId"] in dominio.questoes


@pytest.mark.parametrize("conceito", ["C7", "C9", "C10"])
def test_missoes_adicionais_permitem_dominio_apos_erro_no_diagnostico(api, conceito):
    _, agir = abrir(api)
    dominio = Dominio()
    diagnostico = next(q for q in dominio.diagnostico if q["concept_id"] == conceito)
    agir("answer", questionId=diagnostico["id"], optionId=errada(diagnostico))

    missoes = [q for q in dominio.missoes if q["concept_id"] == conceito]
    for questao in missoes[:3]:
        resposta = agir("answer", questionId=questao["id"], optionId=questao["gabarito"])
        assert resposta["result"]["points"] == 25

    registro = resposta["state"]["records"][conceito]
    assert (registro["score"], registro["independent"], registro["status"]) == (75, 3, "Dominado")


def test_erro_ajuda_reenvio_e_revisao(api):
    sessao, agir = abrir(api)
    q = Dominio().questoes["MISS-C4-01"]
    corpo = {"requestId": 1, "action": "answer", "questionId": q["id"], "optionId": errada(q)}
    erro = agir("answer", questionId=q["id"], optionId=errada(q))
    assert erro["state"]["attempts"][q["id"]]["errors"] == 1
    assert erro["state"]["records"]["C4"]["evaluated"]
    assert api("POST", "/api/session/action", corpo, sessao["id"]) == (200, erro)
    assert "nota 85" in erro["result"]["message"]
    segundo = agir("answer", questionId=q["id"], optionId=errada(q))
    assert segundo["result"]["message"] == erro["result"]["message"]
    assert segundo["result"]["alternativeId"] == "MISS-C4-02"
    acerto = agir("answer", questionId=q["id"], optionId=q["gabarito"])
    assert acerto["result"]["points"] == 10
    revisao = agir("answer", questionId=q["id"], optionId=q["gabarito"])
    assert revisao["result"]["review"] and revisao["result"]["points"] == 0
    outra = Dominio().questoes["MISS-C4-02"]
    for dica in outra["dicas"]:
        ajuda = agir("help", questionId=outra["id"], kind="hint")
        assert ajuda["result"]["message"] == dica
        assert ajuda["state"]["records"]["C4"]["score"] == 10
    assert agir("answer", questionId=outra["id"], optionId=outra["gabarito"])["result"]["points"] == 15


@pytest.mark.parametrize(("questao_id", "alternativa", "trecho"), [
    ("MISS-C4-02", "A", "mesmo quando um lado falha"),
    ("MISS-C4-02", "C", "os dois valores sejam iguais"),
    ("MISS-C7-03", "A", "append() coloca a letra D"),
    ("MISS-C9-03", "B", "tipo do código 101"),
])
def test_erro_orienta_pela_alternativa_sem_contar_ajuda(api, questao_id, alternativa, trecho):
    _, agir = abrir(api)
    questao = Dominio().questoes[questao_id]
    erro = agir("answer", questionId=questao_id, optionId=alternativa)
    assert trecho in erro["result"]["message"]
    assert erro["result"]["points"] == 0
    assert erro["state"]["attempts"][questao_id]["hinted"] is False

    segundo_erro = agir("answer", questionId=questao_id, optionId=alternativa)
    assert trecho in segundo_erro["result"]["message"]
    outra_missao = segundo_erro["result"]["alternativeId"]
    assert outra_missao and outra_missao != questao_id

    acerto = agir("answer", questionId=questao_id, optionId=questao["gabarito"])
    assert acerto["result"]["points"] == 10


def test_diagnostico_libera_feedback_so_apos_a_ultima_resposta(api):
    sessao, agir = abrir(api)
    questoes = Dominio().diagnostico
    primeira = questoes[0]
    escolha = errada(primeira)
    assert sessao["state"]["diagnosticReview"] == {}

    for q in questoes[:-1]:
        alternativa = escolha if q is primeira else q["gabarito"]
        resposta = agir("answer", questionId=q["id"], optionId=alternativa)
        assert resposta["state"]["diagnosticReview"] == {}
        assert "message" not in resposta["result"]

    ultima = questoes[-1]
    resposta = agir("answer", questionId=ultima["id"], optionId=ultima["gabarito"])
    revisao = resposta["state"]["diagnosticReview"]
    assert len(revisao) == 10
    assert revisao[primeira["id"]] == {
        "selectedId": escolha,
        "correctId": primeira["gabarito"],
        "explanation": primeira["explicacao"],
        "feedback": primeira["feedback_por_alternativa"][escolha],
    }
    assert revisao[ultima["id"]]["feedback"] is None
    assert resposta["result"]["points"] == 30

    repetida = agir("answer", questionId=primeira["id"], optionId=primeira["gabarito"])
    assert repetida["result"] == {"correct": False, "points": 0, "review": True}
    assert repetida["state"]["diagnosticReview"] == revisao


def test_recomendacao_revisa_base_abaixo_do_limiar(api):
    _, agir = abrir(api)
    for q in Dominio().missoes[:2]:
        resposta = agir("answer", questionId=q["id"], optionId=q["gabarito"])
    assert resposta["state"]["recommendation"]["missionId"] == "MISS-C2-01"
    assert resposta["state"]["weakPrerequisites"]["C2"] == []
    q = Dominio().questoes["DIAG-C10-01"]
    resposta = agir("answer", questionId=q["id"], optionId=errada(q))
    recomendacao = resposta["state"]["recommendation"]
    assert recomendacao["missionId"] == "MISS-C6-01"
    assert "revisar" in recomendacao["message"]


@pytest.mark.parametrize("status_gemini", [None, 429])
def test_chat_contexto_contingencia_e_encerramento(api, monkeypatch, status_gemini):
    def indisponivel(pedido, timeout):
        if status_gemini:
            raise HTTPError(pedido.full_url, status_gemini, "cota esgotada", {}, None)
        raise TimeoutError

    monkeypatch.setenv("OLIMPIO_TUTOR_OBI", "chave-de-teste")
    monkeypatch.setattr("obi_tutor.services.gemini.urlopen", indisponivel)
    sessao, agir = abrir(api)
    resposta = agir("chat", text="Mostre um exemplo mais simples", questionId="MISS-C4-01")
    assert "idade >= 16" in resposta["result"]["text"]
    assert resposta["state"] == sessao["state"]
    resposta = agir("chat", text="Quero encerrar a sessão")
    assert resposta["result"]["offerEnd"]
    assert api("DELETE", "/api/session", session_id=sessao["id"])[0] == 200
    assert api(
        "POST", "/api/session/action", {"requestId": 3, "action": "chat", "text": "Oi"},
        sessao["id"],
    )[0] == 410
    nova, _ = abrir(api)
    assert nova["state"] == sessao["state"]
    assert nova["id"] != sessao["id"]


def test_gemini_le_chave_do_env_e_recebe_apenas_contexto_e_duvida(api, monkeypatch, tmp_path):
    arquivo = tmp_path / ".env"
    arquivo.write_text('OLIMPIO_TUTOR_OBI="chave-de-teste"\n', encoding="utf-8")
    monkeypatch.setattr("obi_tutor.services.gemini.ARQUIVO_ENV", arquivo)
    monkeypatch.delenv("OLIMPIO_TUTOR_OBI")

    def simular(pedido, timeout):
        assert pedido.full_url == (
            "https://generativelanguage.googleapis.com/v1beta/models/"
            "gemini-3.1-flash-lite:generateContent"
        )
        assert pedido.get_header("X-goog-api-key") == "chave-de-teste"
        assert timeout == 6
        corpo = json.loads(pedido.data)
        assert "tools" not in corpo
        prompt = json.loads(corpo["contents"][0]["parts"][0]["text"])
        assert set(prompt) == {"contexto", "duvida"}
        assert set(prompt["contexto"]) == {"conceito", "enunciado"}
        return BytesIO(json.dumps({
            "candidates": [{
                "finishReason": "STOP",
                "content": {"role": "model", "parts": [
                    {"thought": True, "text": "Raciocínio interno"},
                    {"text": "Compare os dois limites da condição."},
                ]},
            }],
        }).encode())

    monkeypatch.setattr("obi_tutor.services.gemini.urlopen", simular)
    sessao, agir = abrir(api)
    resposta = agir("chat", text="Pode explicar esta missão?", questionId="MISS-C4-01")
    assert resposta["result"]["text"] == "Compare os dois limites da condição."
    assert resposta["state"] == sessao["state"]


def test_diagnostico_aplica_so_os_pontos_ate_o_limite(api):
    _, agir = abrir(api)
    dominio = Dominio()
    for q in dominio.missoes:
        if q["concept_id"] == "C4":
            resposta = agir("answer", questionId=q["id"], optionId=q["gabarito"])
    assert resposta["state"]["records"]["C4"]["score"] == 75

    q = dominio.questoes["DIAG-C4-01"]
    resposta = agir("answer", questionId=q["id"], optionId=q["gabarito"])
    assert resposta["result"]["points"] == 25
    assert resposta["state"]["attempts"][q["id"]]["points"] == 25
    assert resposta["state"]["records"]["C4"]["score"] == 100


def test_ajuda_sem_resposta_deixa_conceito_nao_avaliado(api):
    sessao, agir = abrir(api)
    ajuda = agir("help", questionId="MISS-C4-01", kind="direct")
    assert ajuda["state"]["records"] == sessao["state"]["records"]
    assert ajuda["state"]["attempts"]["MISS-C4-01"]["hinted"]
    status, _ = api(
        "POST", "/api/session/action",
        {"requestId": 2, "action": "help", "questionId": "DIAG-C4-01", "kind": "hint"},
        sessao["id"],
    )
    assert status == 400


@pytest.mark.parametrize("texto", [
    "Estou entediado.",
    "Tô com tédio nessa missão!",
    "Quero fazer outra coisa",
    "Prefiro trocar de modo agora.",
])
def test_chat_oferece_outra_atividade_sem_alterar_progresso(api, monkeypatch, texto):
    def falhar_se_chamar_gemini(*args):
        pytest.fail("A troca de atividade deve ser tratada pelas regras locais.")

    monkeypatch.setattr("obi_tutor.tutor.gerar_texto", falhar_se_chamar_gemini)
    _, agir = abrir(api)
    q = Dominio().questoes["MISS-C1-01"]
    respondida = agir("answer", questionId=q["id"], optionId=q["gabarito"])
    foco = respondida["state"]["recommendation"]["missionId"]
    assert foco == "MISS-C1-02"

    resposta = agir("chat", text=texto, questionId=foco)
    assert resposta["result"]["offerChange"]
    assert resposta["result"]["missionId"] == "MISS-C2-01"
    assert resposta["state"] == respondida["state"]


def test_chat_nao_confunde_negacao_com_pedido_de_troca(api):
    sessao, agir = abrir(api)
    resposta = agir("chat", text="Não estou entediada, quero outra explicação sobre listas.")
    assert "offerChange" not in resposta["result"]
    assert resposta["result"]["missionId"] == "MISS-C7-01"
    assert resposta["state"] == sessao["state"]


def test_chat_oferece_trilha_quando_todas_as_missoes_estao_concluidas(api):
    _, agir = abrir(api)
    for q in Dominio().missoes:
        agir("answer", questionId=q["id"], optionId=q["gabarito"])
    resposta = agir("chat", text="Estou entediada")
    assert resposta["result"]["offerChange"]
    assert "missionId" not in resposta["result"]


def test_chat_retem_o_assunto_sem_voltar_para_a_missao_anterior(api, monkeypatch):
    perguntas = []

    def simular(instrucoes, mensagem):
        perguntas.append((instrucoes, json.loads(mensagem)))
        return "Olá! Use um exemplo pequeno."

    monkeypatch.setattr("obi_tutor.tutor.gerar_texto", simular)
    sessao, agir = abrir(api)
    foco = "MISS-C4-01"

    primeira = agir("chat", text="Como funciona um if?", questionId=foco)
    assert primeira["result"]["text"] == "Use um exemplo pequeno."
    agir("chat", text="Pode explicar de outro jeito?", questionId=foco)
    agir("chat", text="Eu não sei nada sobre laços de repetição", questionId=foco)
    curta = agir("chat", text="Você me dá respostas muito longas, que chato", questionId=foco)
    retomada = agir("chat", text="Não entendi", questionId=foco)
    compreendeu = agir("chat", text="Agora eu já sei", questionId=foco)
    agradeceu = agir("chat", text="Obrigado!", questionId=foco)

    assert len(perguntas) == 4
    assert curta["result"] == {"text": "Entendi. Vou responder mais curto.", "quiet": True}
    assert compreendeu["result"]["quiet"]
    assert agradeceu["result"] == {"text": "De nada!", "quiet": True}
    assert perguntas[1][1]["turnos_recentes"][0]["pergunta"] == "Como funciona um if?"
    instrucoes, ultima = perguntas[-1]
    assert "no máximo duas frases" in instrucoes
    assert ultima["contexto"] == {"conceito": "Laços de repetição"}
    assert [t["pergunta"] for t in ultima["turnos_recentes"]] == [
        "Pode explicar de outro jeito?", "Eu não sei nada sobre laços de repetição",
    ]
    assert retomada["result"]["missionId"] == "MISS-C5-01"
    assert agradeceu["state"] == sessao["state"]


def test_chat_separa_conversas_e_usa_contexto_do_catalogo_e_do_diagnostico(api, monkeypatch):
    prompts = []

    def simular(_, mensagem):
        prompts.append(json.loads(mensagem))
        return "Vamos pensar juntos."

    monkeypatch.setattr("obi_tutor.tutor.gerar_texto", simular)
    _, agir = abrir(api)
    dominio = Dominio()
    missao = dominio.questoes["MISS-C4-02"]
    for indice, questao in enumerate(dominio.diagnostico):
        alternativa = questao["gabarito"] if indice else next(
            opcao["id"] for opcao in questao["alternativas"] if opcao["id"] != questao["gabarito"]
        )
        estado = agir("answer", questionId=questao["id"], optionId=alternativa)["state"]

    diagnostico = agir("chat", text="Por onde começo a revisar?", context="diagnostico")
    assert diagnostico["state"] == estado
    resultados = prompts[-1]["contexto"]["diagnostico"]
    assert len(resultados) == len(dominio.diagnostico)
    assert resultados[0] == {
        "numero": 1,
        "conceito": dominio.conceitos[dominio.diagnostico[0]["concept_id"]]["name"],
        "enunciado": dominio.diagnostico[0]["enunciado"],
        "acertou": False,
    }
    assert all(resultado["acertou"] for resultado in resultados[1:])

    exercicio = agir("chat", text="Onde começo?", context=missao["id"])
    assert exercicio["state"] == estado
    assert exercicio["result"]["missionId"] == missao["id"]
    assert prompts[-1]["contexto"]["enunciado"] == missao["enunciado"]
    assert prompts[-1]["contexto"]["codigo_python"] == missao["codigo_python"]
    assert "turnos_recentes" not in prompts[-1]
    assert "diagnostico" not in prompts[-1]["contexto"]

    agir("chat", text="Como funciona um for?", context="geral")
    assert prompts[-1]["contexto"] == {"conceito": "Laços de repetição"}
    assert "turnos_recentes" not in prompts[-1]
    agir("chat", text="Pode explicar de outro jeito?", context=missao["id"])
    assert prompts[-1]["turnos_recentes"][0]["pergunta"] == "Onde começo?"

    monkeypatch.setattr("obi_tutor.tutor.gerar_texto", lambda *_: None)
    duvida_diagnostico = agir("chat", text="Pode explicar a questão 2?", context="diagnostico")
    assert duvida_diagnostico["result"]["text"] == dominio.diagnostico[1]["explicacao"]
    assert duvida_diagnostico["state"] == estado


@pytest.mark.parametrize("contexto", ["diagnostico", "atividade-inexistente", []])
def test_chat_recusa_contextos_indisponiveis(api, contexto):
    sessao, _ = abrir(api)
    status, _ = api(
        "POST", "/api/session/action",
        {"requestId": 1, "action": "chat", "text": "Olá", "context": contexto},
        sessao["id"],
    )
    assert status == 400


def test_chat_em_contingencia_explica_com_exemplo_do_ultimo_assunto(api):
    _, agir = abrir(api)
    agir("chat", text="Como funciona um for?", questionId="MISS-C4-01")
    resposta = agir("chat", text="Não entendi", questionId="MISS-C4-01")
    assert "range(2)" in resposta["result"]["text"]
    assert resposta["result"]["missionId"] == "MISS-C5-01"
