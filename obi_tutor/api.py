import argparse
import json
import secrets
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Lock
from time import monotonic
from urllib.parse import urlsplit

from obi_tutor.dominio import Dominio, RAIZ
from obi_tutor.sessao import Sessao
from obi_tutor.tutor import responder


class ServidorTutor(ThreadingHTTPServer):
    def __init__(self, endereco, pasta_frontend=RAIZ / "frontend/dist"):
        self.dominio = Dominio()
        self.catalogo = self.dominio.catalogo_publico()
        self.sessoes = {}
        self.lock = Lock()
        super().__init__(endereco, partial(Handler, directory=pasta_frontend))

    def nova_sessao(self):
        with self.lock:
            agora = monotonic()
            self.sessoes = {
                id_: (sessao, ultimo_acesso)
                for id_, (sessao, ultimo_acesso) in self.sessoes.items()
                if agora - ultimo_acesso < 7200
            }
            if len(self.sessoes) >= 256:
                return None, None
            id_ = secrets.token_urlsafe(32)
            sessao = Sessao(id_, self.dominio)
            self.sessoes[id_] = (sessao, agora)
            return id_, sessao

    def buscar_sessao(self, id_):
        with self.lock:
            sessao, ultimo_acesso = self.sessoes.get(id_, (None, 0))
            agora = monotonic()
            if sessao is None or agora - ultimo_acesso >= 7200:
                self.sessoes.pop(id_, None)
                return None
            self.sessoes[id_] = (sessao, agora)
            return sessao


class Handler(SimpleHTTPRequestHandler):
    def _json(self, status, dados):
        corpo = json.dumps(dados, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(corpo)))
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(corpo)

    def _ler_json(self):
        tamanho = int(self.headers.get("Content-Length", 0))
        if not 0 < tamanho <= 24576:
            raise ValueError("Tamanho da solicitação inválido.")
        dados = json.loads(self.rfile.read(tamanho))
        if not isinstance(dados, dict):
            raise ValueError("A solicitação deve ser um objeto JSON.")
        return dados

    def _frontend(self, metodo):
        caminho = urlsplit(self.path).path
        if caminho == "/api" or caminho.startswith("/api/"):
            self._json(404, {"error": "Rota inexistente."})
            return
        if caminho in {"/", "/diagnostico", "/trilha", "/tutor", "/progresso", "/missoes", "/missoes/"} or caminho.startswith("/missoes/"):
            if not (Path(self.directory) / "index.html").is_file():
                self.send_error(503, "Execute o Vite ou gere frontend/dist.")
                return
            self.path = "/index.html"
        arquivo = Path(self.translate_path(self.path)).resolve()
        if not arquivo.is_relative_to(Path(self.directory).resolve()) or not arquivo.is_file():
            self.send_error(404)
            return
        metodo()

    def do_GET(self):
        self._frontend(super().do_GET)

    def do_HEAD(self):
        self._frontend(super().do_HEAD)

    def do_DELETE(self):
        if self.path != "/api/session":
            self._json(404, {"error": "Rota inexistente."})
            return
        id_ = self.headers.get("X-Study-Session")
        with self.server.lock:
            self.server.sessoes.pop(id_, None)
        self._json(200, {})

    def do_POST(self):
        if self.path == "/api/session":
            id_, sessao = self.server.nova_sessao()
            if sessao is None:
                self._json(503, {"error": "O tutor atingiu o limite de sessões ativas."})
                return
            self._json(201, {"id": id_, "catalog": self.server.catalogo, "state": sessao.estado()})
            return
        if self.path != "/api/session/action":
            self._json(404, {"error": "Rota inexistente."})
            return

        sessao = self.server.buscar_sessao(self.headers.get("X-Study-Session"))
        if sessao is None:
            self._json(410, {"error": "A sessão expirou. Recarregue a página para começar outra."})
            return
        try:
            dados = self._ler_json()
            pedido = dados.get("requestId")
            if type(pedido) is not int or pedido < 1:
                raise ValueError("Identificador da solicitação inválido.")
            with sessao.lock:
                anterior = sessao.ultimo_pedido
                if anterior and pedido == anterior[0]:
                    if dados != anterior[1]:
                        raise ValueError("Identificador já utilizado.")
                    resposta = anterior[2]
                elif anterior and pedido < anterior[0]:
                    raise ValueError("Solicitação anterior à última ação registrada.")
                else:
                    resultado = self._agir(sessao, dados)
                    resposta = {"state": sessao.estado(), "result": resultado}
                    sessao.ultimo_pedido = (pedido, dados, resposta)
        except (ValueError, KeyError, TypeError) as exc:
            mensagem = str(exc) if type(exc) is ValueError else "Dados da solicitação inválidos."
            self._json(400, {"error": mensagem})
            return
        self._json(200, resposta)

    def _agir(self, sessao, dados):
        dominio = sessao.dominio
        acao = dados.get("action")
        if acao == "chat":
            texto = dados.get("text")
            if not isinstance(texto, str) or not 0 < len(texto.strip()) <= 2000:
                raise ValueError("Digite uma pergunta de até 2000 caracteres.")
            foco = dominio.questoes.get(dados.get("questionId"))
            estado = sessao.estado()
            resposta, sessao.tema_chat = responder(
                dominio, texto.strip(), foco, estado["recommendation"], sessao.tema_chat
            )
            return resposta

        questao = dominio.questoes.get(dados.get("questionId"))
        if questao is None:
            raise ValueError("Atividade desconhecida.")
        if acao == "answer":
            return sessao.responder(questao, dados.get("optionId"))
        if acao == "help":
            return sessao.ajudar(questao, dados.get("kind"))
        raise ValueError("Ação desconhecida.")


def main():
    parser = argparse.ArgumentParser(description="Servidor local do OBI Tutor")
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()
    with ServidorTutor(("127.0.0.1", args.port)) as servidor:
        print(f"OBI Tutor em http://127.0.0.1:{servidor.server_port}", flush=True)
        try:
            servidor.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
