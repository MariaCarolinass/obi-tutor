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
        f"C{i}": 3 if i in {4, 5, 6} else 2 for i in range(1, 11)
    }
    assert len({q["id"] for q in diagnostico + missoes}) == 33
    assert all(
        {"gabarito", "answer", "explicacao", "dicas"}.isdisjoint(q)
        for q in diagnostico + missoes
    )
    assert all(r["status"] == "Não avaliado" for r in sessao["state"]["records"].values())


@pytest.mark.parametrize("destino", ["C12", "C10"])
def test_rejeita_grafo_invalido(tmp_path, destino):
    conceitos = list(Dominio().conceitos.values())
    conceitos[0]["prerequisites"] = [destino]
    arquivo = tmp_path / "conceitos.json"
    arquivo.write_text(json.dumps(conceitos), encoding="utf-8")
    with pytest.raises(ValueError, match="Pré-requisito desconhecido|Ciclo no grafo"):
        Dominio(caminho_conceitos=arquivo)


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


def test_erro_ajuda_reenvio_e_revisao(api):
    sessao, agir = abrir(api)
    q = Dominio().questoes["MISS-C4-01"]
    corpo = {"requestId": 1, "action": "answer", "questionId": q["id"], "optionId": errada(q)}
    erro = agir("answer", questionId=q["id"], optionId=errada(q))
    assert erro["state"]["attempts"][q["id"]]["errors"] == 1
    assert erro["state"]["records"]["C4"]["evaluated"]
    assert api("POST", "/api/session/action", corpo, sessao["id"]) == (200, erro)
    assert "Compare" in erro["result"]["message"]
    segundo = agir("answer", questionId=q["id"], optionId=errada(q))
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
    resposta = agir("chat", text="Pode explicar o conceito?", questionId="MISS-C4-01")
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
