import unittest
import json
import tempfile

from pathlib import Path
from unittest.mock import patch

from obi_tutor.models.modelo_aluno import ModeloAluno
from obi_tutor.services import persistencia_aluno


class TestPersistenciaAluno(unittest.TestCase):

    def setUp(self):
        self.aluno = ModeloAluno("aluno_001")
        self.diretorio_temporario = tempfile.TemporaryDirectory()

        self.caminho_original = persistencia_aluno.CAMINHO_DADOS
        persistencia_aluno.CAMINHO_DADOS = (
            Path(self.diretorio_temporario.name) / "modelos_alunos.json"
        )

    def tearDown(self):
        persistencia_aluno.CAMINHO_DADOS = self.caminho_original
        self.diretorio_temporario.cleanup()

    def test_salvar_aluno(self):
        persistencia_aluno.salvar_aluno(self.aluno)

        with open(persistencia_aluno.CAMINHO_DADOS, "r", encoding="utf-8") as arquivo:
            dados = json.load(arquivo)

        self.assertIn("aluno_001", dados)
        self.assertIn("conceitos", dados["aluno_001"])
        self.assertIn("historico_atividades", dados["aluno_001"])

    def test_salvar_multiplos_alunos(self):
        outro_aluno = ModeloAluno("aluno_002")

        persistencia_aluno.salvar_aluno(self.aluno)
        persistencia_aluno.salvar_aluno(outro_aluno)

        with open(persistencia_aluno.CAMINHO_DADOS, "r", encoding="utf-8") as arquivo:
            dados = json.load(arquivo)

        self.assertIn("aluno_001", dados)
        self.assertIn("aluno_002", dados)

    def test_atualizar_aluno_salvo(self):
        persistencia_aluno.salvar_aluno(self.aluno)

        self.aluno.registrar_atividade(
            questao_id="Q1",
            conceito_id="C1",
            resultado=True,
            tentativas=1,
            dicas_utilizadas=0,
            tipo_atividade="missao"
    )

        persistencia_aluno.salvar_aluno(self.aluno)

        with open(persistencia_aluno.CAMINHO_DADOS, "r", encoding="utf-8") as arquivo:
            dados = json.load(arquivo)

        self.assertEqual(dados["aluno_001"]["conceitos"]["C1"]["pontuacao"], 25)
        self.assertEqual(len(dados), 1)

    def test_carregar_aluno(self):
        self.aluno.registrar_atividade(
            questao_id="Q1",
            conceito_id="C1",
            resultado=True,
            tentativas=1,
            dicas_utilizadas=0,
            tipo_atividade="missao"
        )

        persistencia_aluno.salvar_aluno(self.aluno)

        aluno_carregado = persistencia_aluno.carregar_aluno("aluno_001")

        self.assertIsInstance(aluno_carregado, ModeloAluno)
        self.assertEqual(aluno_carregado.get_aluno_id(), "aluno_001")
        self.assertEqual(aluno_carregado.obter_pontuacao("C1"), 25)
        self.assertEqual(aluno_carregado.obter_estado("C1"), "Inicial")

        # Verifica se a atividade que registramos antes de salvar continua existindo depois de carregar o estudante.
        self.assertEqual(len(aluno_carregado.obter_historico_atividades()), 1)
    
    def test_carregar_aluno_inexistente(self):
        persistencia_aluno.salvar_aluno(self.aluno)

        dados = persistencia_aluno.carregar_aluno("aluno_999")

        self.assertIsNone(dados)

    def test_continuar_atividades_apos_carregar(self):
        persistencia_aluno.salvar_aluno(self.aluno)

        aluno_carregado = persistencia_aluno.carregar_aluno("aluno_001")

        aluno_carregado.registrar_atividade(
            questao_id="Q1",
            conceito_id="C1",
            resultado=True,
            tentativas=1,
            dicas_utilizadas=0,
            tipo_atividade="missao"
        )

        self.assertEqual(aluno_carregado.obter_pontuacao("C1"), 25)

    def test_salvar_aluno_apos_carregar(self):
        persistencia_aluno.salvar_aluno(self.aluno)

        aluno_carregado = persistencia_aluno.carregar_aluno("aluno_001")

        aluno_carregado.registrar_atividade(
            questao_id="Q1",
            conceito_id="C1",
            resultado=True,
            tentativas=1,
            dicas_utilizadas=0,
            tipo_atividade="missao"
        )

        persistencia_aluno.salvar_aluno(aluno_carregado)

        dados = persistencia_aluno.carregar_aluno("aluno_001")

        self.assertEqual(dados.obter_pontuacao("C1"), 25)
        self.assertEqual(len(dados.obter_historico_atividades()), 1)

    def test_carregar_alunos_diferentes(self):
        outro_aluno = ModeloAluno("aluno_002")

        persistencia_aluno.salvar_aluno(self.aluno)
        persistencia_aluno.salvar_aluno(outro_aluno)

        aluno_1 = persistencia_aluno.carregar_aluno("aluno_001")
        aluno_2 = persistencia_aluno.carregar_aluno("aluno_002")

        self.assertEqual(aluno_1.get_aluno_id(), "aluno_001")
        self.assertEqual(aluno_2.get_aluno_id(), "aluno_002")

    def test_pontuacoes_independentes_entre_alunos(self):
        outro_aluno = ModeloAluno("aluno_002")

        self.aluno.registrar_atividade(
            questao_id="Q1",
            conceito_id="C1",
            resultado=True,
            tentativas=1,
            dicas_utilizadas=0,
            tipo_atividade="missao"
        )

        persistencia_aluno.salvar_aluno(self.aluno)
        persistencia_aluno.salvar_aluno(outro_aluno)

        aluno_1 = persistencia_aluno.carregar_aluno("aluno_001")
        aluno_2 = persistencia_aluno.carregar_aluno("aluno_002")

        self.assertEqual(aluno_1.obter_pontuacao("C1"), 25)
        self.assertEqual(aluno_2.obter_pontuacao("C1"), 0)


if __name__ == "__main__":
    unittest.main()