from threading import Lock

from obi_tutor.models.modelo_aluno import ModeloAluno
from obi_tutor.pedagogia import oferecer_ajuda, orientar_erro, recomendar, requisitos_fracos
from obi_tutor.tutor import ConversaTutor


class Sessao:
    def __init__(self, sessao_id, dominio):
        self.aluno = ModeloAluno(sessao_id)
        self.dominio = dominio
        self.tentativas = {}
        self.concluidas = []
        self.respostas_diagnostico = {}
        self.ultimo_pedido = None
        self.conversas = {"geral": ConversaTutor()}
        self.lock = Lock()

    def conversar(self, texto, contexto="geral", question_id=None):
        foco = self.dominio.questoes.get(question_id)
        diagnostico = self._resultado_diagnostico()
        if contexto == "diagnostico":
            if len(diagnostico) != len(self.dominio.diagnostico):
                raise ValueError("Conclua o diagnóstico antes de conversar sobre o resultado.")
            foco = None
        elif contexto != "geral":
            foco = self.dominio.questoes.get(contexto)
            if not foco or foco["tipo"] == "diagnostico":
                raise ValueError("Contexto de conversa desconhecido.")

        if contexto not in self.conversas:
            self.conversas[contexto] = ConversaTutor()
        recomendada = recomendar(self.dominio, self.aluno, self.concluidas, diagnostico)["missionId"]
        return self.conversas[contexto].responder(
            self.dominio, texto, foco, recomendada, self.concluidas,
            diagnostico=diagnostico if contexto == "diagnostico" else None,
            contextualizar_missao=contexto not in {"geral", "diagnostico"},
        )

    def _resultado_diagnostico(self):
        return {
            id_: alternativa == self.dominio.questoes[id_]["gabarito"]
            for id_, alternativa in self.respostas_diagnostico.items()
        }

    def estado(self):
        diagnostico = self._resultado_diagnostico()
        registros = {
            id_: {
                "evaluated": conceito["avaliado"],
                "score": conceito["pontuacao"],
                "independent": conceito["acertos_independentes"],
                "status": self.aluno.obter_estado(id_),
            }
            for id_, conceito in self.aluno.get_conceitos().items()
        }
        return {
            "records": registros,
            "attempts": {
                id_: {
                    "errors": tentativa["errors"],
                    "hinted": tentativa["ajudas"] > 0,
                    "points": tentativa["points"],
                }
                for id_, tentativa in self.tentativas.items()
            },
            "completed": self.concluidas.copy(),
            "diagnosticAnswers": diagnostico,
            "diagnosticReview": self._revisao_diagnostico(),
            "recommendation": recomendar(self.dominio, self.aluno, self.concluidas, diagnostico),
            "weakPrerequisites": requisitos_fracos(self.dominio, self.aluno),
        }

    def _revisao_diagnostico(self):
        if len(self.respostas_diagnostico) != len(self.dominio.diagnostico):
            return {}

        revisao = {}
        for questao in self.dominio.diagnostico:
            id_ = questao["id"]
            alternativa = self.respostas_diagnostico[id_]
            revisao[id_] = {
                "selectedId": alternativa,
                "correctId": questao["gabarito"],
                "explanation": questao["explicacao"],
                "feedback": questao.get("feedback_por_alternativa", {}).get(alternativa),
            }
        return revisao

    def _tentativa(self, id_):
        return self.tentativas.setdefault(
            id_, {"errors": 0, "ajudas": 0, "pistas": 0, "points": 0}
        )

    def responder(self, questao, alternativa):
        id_ = questao["id"]
        if alternativa not in {opcao["id"] for opcao in questao["alternativas"]}:
            raise ValueError("Alternativa inválida.")
        diagnostico = questao["tipo"] == "diagnostico"
        if diagnostico and id_ in self.respostas_diagnostico:
            return {
                "correct": self.respostas_diagnostico[id_] == questao["gabarito"],
                "points": 0,
                "review": True,
            }

        tentativa = self._tentativa(id_)
        correta = alternativa == questao["gabarito"]
        revisao = id_ in self.concluidas
        pontos = 0
        if not revisao:
            pontos = self.aluno.registrar_atividade(
                id_, questao["concept_id"], correta,
                tentativa["errors"] + 1, tentativa["ajudas"], questao["tipo"],
            )
            if correta:
                tentativa["points"] = pontos
                self.concluidas.append(id_)
            else:
                tentativa["errors"] += 1
            if diagnostico:
                self.respostas_diagnostico[id_] = alternativa

        resultado = {"correct": correta, "points": pontos, "review": revisao}
        if correta and not diagnostico:
            resultado["message"] = questao["explicacao"]
        elif not correta and not diagnostico:
            erros = max(tentativa["errors"], 1)
            resultado.update(
                orientar_erro(self.dominio, questao, alternativa, erros, self.concluidas)
            )
        return resultado

    def ajudar(self, questao, tipo):
        if questao["tipo"] == "diagnostico" or tipo not in {"hint", "simple", "concept", "direct"}:
            raise ValueError("Ajuda indisponível para a atividade.")
        tentativa = self._tentativa(questao["id"])
        mensagem = oferecer_ajuda(self.dominio, questao, tipo, tentativa["pistas"])
        if questao["id"] not in self.concluidas:
            tentativa["ajudas"] += 1
            if tipo == "hint":
                tentativa["pistas"] += 1
        return {"message": mensagem}
