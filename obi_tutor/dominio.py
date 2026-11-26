import json
from collections import Counter
from pathlib import Path


RAIZ = Path(__file__).resolve().parent.parent
FORMATOS_MISSAO = {"Detetive de Bugs", "Preveja a Saída", "Complete o Código"}
DIFICULDADES = {"facil": "Fácil", "medio": "Médio", "dificil": "Difícil"}


class Dominio:
    def __init__(
        self,
        caminho_conceitos=RAIZ / "obi_tutor/dados/conceitos.json",
        caminho_catalogo=RAIZ / "moddominio.json",
    ):
        self.conceitos = self._indexar(self._ler(caminho_conceitos))
        self._validar_grafo()

        catalogo = self._ler(caminho_catalogo)
        self.questoes = self._indexar(catalogo["questoes"])
        distribuicao = Counter()
        for questao in self.questoes.values():
            self._validar_questao(questao)
            distribuicao[questao["tipo"]] += 1
        if (
            distribuicao != catalogo["distribuicao"]
            or len(self.questoes) != catalogo["total_questoes"]
        ):
            raise ValueError("A distribuição e o total devem corresponder ao catálogo.")

        self.diagnostico = [
            q for q in self.questoes.values() if q["tipo"] == "diagnostico"
        ]
        self.missoes = [
            q for q in self.questoes.values() if q["tipo"] != "diagnostico"
        ]

    @staticmethod
    def _ler(caminho):
        return json.loads(caminho.read_text(encoding="utf-8"))

    @staticmethod
    def _indexar(itens):
        por_id = {}
        for item in itens:
            item_id = item["id"]
            if not isinstance(item_id, str) or not item_id.strip() or item_id in por_id:
                raise ValueError(f"ID inválido ou repetido: {item_id}")
            por_id[item_id] = item
        return por_id

    def _validar_grafo(self):
        if self.conceitos.keys() != {f"C{i}" for i in range(1, 11)}:
            raise ValueError("O grafo deve conter C1 a C10.")

        visitados = set()

        def visitar(conceito_id, caminho):
            if conceito_id not in self.conceitos:
                raise ValueError(f"Pré-requisito desconhecido: {conceito_id}")
            if conceito_id in caminho:
                raise ValueError(f"Ciclo no grafo: {conceito_id}")
            if conceito_id not in visitados:
                for requisito in self.conceitos[conceito_id]["prerequisites"]:
                    visitar(requisito, caminho | {conceito_id})
                visitados.add(conceito_id)

        for conceito_id in self.conceitos:
            visitar(conceito_id, set())

    def _validar_questao(self, questao):
        alternativas = self._indexar(questao["alternativas"])
        if (
            questao["concept_id"] not in self.conceitos
            or questao["tipo"] not in {"diagnostico", "missao", "reforco"}
            or len(alternativas) < 2
            or questao["gabarito"] not in alternativas
            or len(questao["dicas"]) > 2
            or questao["dificuldade"] not in DIFICULDADES
            or (
                questao["tipo"] != "diagnostico"
                and questao["formato"] not in FORMATOS_MISSAO
            )
        ):
            raise ValueError(f"Questão inválida: {questao['id']}")

    def catalogo_publico(self):
        ordinais = Counter()

        def atividade(q):
            conceito = self.conceitos[q["concept_id"]]
            formato = q["formato"]
            if formato == "Diagnostico Conceitual":
                formato = "Diagnóstico conceitual"
            titulo = f"{formato} · {conceito['short']}"
            if q["tipo"] == "reforco":
                titulo += " · Reforço"
            elif q["tipo"] == "missao":
                ordinais[conceito["id"]] += 1
                titulo += f" · {ordinais[conceito['id']]}"
            return {
                "id": q["id"],
                "concept": q["concept_id"],
                "type": formato,
                "difficulty": DIFICULDADES[q["dificuldade"]],
                "title": titulo,
                "prompt": q["enunciado"],
                "code": q["codigo_python"],
                "options": q["alternativas"],
            }

        return {
            "concepts": list(self.conceitos.values()),
            "trainingMissions": [atividade(q) for q in self.missoes],
            "diagnosticQuestions": [atividade(q) for q in self.diagnostico],
        }
