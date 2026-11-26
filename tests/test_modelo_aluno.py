import unittest

from obi_tutor.models.modelo_aluno import ModeloAluno

class TestModeloAluno(unittest.TestCase):

    def setUp(self):
        self.aluno = ModeloAluno("aluno_1")

    def criar_atividade(
            self,
            questao_id,
            resultado,
            tentativas=1,
            dicas_utilizadas=0,
            tipo_atividade="missao"
    ):
        return {
            "questao_id": questao_id,
            "conceito_id": "C1",
            "resultado": resultado,
            "tentativas": tentativas,
            "dicas_utilizadas": dicas_utilizadas,
            "tipo_atividade": tipo_atividade
        }

    def test_estado_inicial_nao_avaliado(self):
        self.assertEqual(
            self.aluno.obter_estado("C1"),
            "Não avaliado"
        )

        self.assertEqual(
            self.aluno.obter_pontuacao("C1"),
            0
        )

    def test_erro_nao_reduz_pontuacao(self):
        atividade = self.criar_atividade("Q1", False)

        self.aluno.atualizar_conceito(atividade)

        self.assertEqual(self.aluno.obter_pontuacao("C1"), 0)
        self.assertEqual(self.aluno.obter_estado("C1"), "Inicial")
    
    def test_acerto_no_diagnostico_recebe_30_pontos(self):
        atividade = self.criar_atividade(
            "Q1", True, tipo_atividade="diagnostico"
        )

        self.aluno.atualizar_conceito(atividade)

        self.assertEqual(self.aluno.obter_pontuacao("C1"), 30)

    def test_acerto_na_primeira_tentativa_recebe_25_pontos(self):
        atividade = self.criar_atividade("Q1", True)

        self.aluno.atualizar_conceito(atividade)

        self.assertEqual(self.aluno.obter_pontuacao("C1"), 25)

    def test_acerto_apos_dica_recebe_15_pontos(self):
        atividade = self.criar_atividade(
            "Q1", True, dicas_utilizadas=1
        )

        self.aluno.atualizar_conceito(atividade)

        self.assertEqual(self.aluno.obter_pontuacao("C1"), 15)

    def test_acerto_apos_nova_tentativa_recebe_10_pontos(self):
        atividade = self.criar_atividade(
            "Q1", True, tentativas=2
        )

        self.aluno.atualizar_conceito(atividade)

        self.assertEqual(self.aluno.obter_pontuacao("C1"), 10)

    def test_questao_nao_pontua_mais_de_uma_vez(self):
        atividade = self.criar_atividade("Q1", True)

        self.aluno.atualizar_conceito(atividade)
        self.aluno.atualizar_conceito(atividade)

        self.assertEqual(self.aluno.obter_pontuacao("C1"), 25)

    def test_dois_acertos_independentes_permitem_dominio(self):
        self.aluno.atualizar_conceito(
            self.criar_atividade("Q1", True, tipo_atividade="diagnostico")
        )
        self.aluno.atualizar_conceito(
            self.criar_atividade("Q2", True)
        )
        self.aluno.atualizar_conceito(
            self.criar_atividade("Q3", True, dicas_utilizadas=1)
        )

        self.assertEqual(self.aluno.obter_pontuacao("C1"), 70)
        self.assertEqual(self.aluno.obter_estado("C1"), "Dominado")

    def test_recuperacao_apos_erro_no_diagnostico(self):
        erro = self.criar_atividade(
            "Q1", False, tipo_atividade="diagnostico"
        )
        acerto = self.criar_atividade("Q2", True)

        self.aluno.atualizar_conceito(erro)
        self.aluno.atualizar_conceito(acerto)

        self.assertEqual(self.aluno.obter_pontuacao("C1"), 25)

    def test_pontuacao_nao_ultrapassa_100(self):
        for i in range(5):
            atividade = self.criar_atividade(f"Q{i}", True)
            self.aluno.atualizar_conceito(atividade)

        self.assertEqual(self.aluno.obter_pontuacao("C1"), 100)

    def test_70_pontos_com_apenas_um_acerto_independente(self):
        self.aluno.atualizar_conceito(
            self.criar_atividade("Q1", True)
        )

        self.aluno.atualizar_conceito(
            self.criar_atividade(
                "Q2", True,
                tentativas=2,
                tipo_atividade="diagnostico"
            )
        )

        self.aluno.atualizar_conceito(
            self.criar_atividade("Q3", True, dicas_utilizadas=1)
        )

        self.assertEqual(self.aluno.obter_pontuacao("C1"), 70)
        self.assertEqual(self.aluno.obter_estado("C1"), "Em progresso")

    def test_get_conceitos_nao_permite_alteracao_externa(self):
        conceitos = self.aluno.get_conceitos()

        conceitos["C1"]["pontuacao"] = 100

        self.assertEqual(self.aluno.obter_pontuacao("C1"), 0)

    def test_acerto_com_dica_nao_conta_como_independente(self):
        atividade = self.criar_atividade(
            "Q1", True, dicas_utilizadas=1
        )

        self.aluno.atualizar_conceito(atividade)

        conceito = self.aluno.get_conceitos()["C1"]

        self.assertEqual(conceito["acertos_independentes"], 0)

    def test_acerto_apos_nova_tentativa_nao_e_independente(self):
        atividade = self.criar_atividade(
            "Q1", True, tentativas=2
        )

        self.aluno.atualizar_conceito(atividade)

        conceito = self.aluno.get_conceitos()["C1"]

        self.assertEqual(conceito["acertos_independentes"], 0)

    def test_registrar_atividade_atualiza_pontuacao(self):
        self.aluno.registrar_atividade(
            questao_id="Q1",
            conceito_id="C1",
            resultado=True,
            tentativas=1,
            dicas_utilizadas=0,
            tipo_atividade="missao"
        )

        self.assertEqual(self.aluno.obter_pontuacao("C1"), 25)

    def test_registrar_atividade_duplicada_nao_concede_pontos(self):

        for _ in range(2):
            self.aluno.registrar_atividade(
                questao_id="Q1",
                conceito_id="C1",
                resultado=True,
                tentativas=1,
                dicas_utilizadas=0,
                tipo_atividade="missao"
            )

        self.assertEqual(self.aluno.obter_pontuacao("C1"), 25)
        self.assertEqual(len(self.aluno._ModeloAluno__historico_atividades), 2)

    def test_rejeita_identificador_de_questao_vazio(self):
        with self.assertRaises(ValueError):
            self.aluno.registrar_atividade(
                questao_id="",
                conceito_id="C1",
                resultado=True,
                tentativas=1,
                dicas_utilizadas=0,
                tipo_atividade="missao"
            )

    def test_rejeita_resultado_invalido(self):
        with self.assertRaises(ValueError):
            self.aluno.registrar_atividade(
                questao_id="Q1",
                conceito_id="C1",
                resultado="sim",
                tentativas=1,
                dicas_utilizadas=0,
                tipo_atividade="missao"
            )

    def test_rejeita_numero_de_tentativas_invalido(self):
        with self.assertRaises(ValueError):
            self.aluno.registrar_atividade(
                questao_id="Q1",
                conceito_id="C1",
                resultado=True,
                tentativas=0,
                dicas_utilizadas=0,
                tipo_atividade="missao"
            )

    def test_rejeita_quantidade_de_dicas_invalida(self):
        with self.assertRaises(ValueError):
            self.aluno.registrar_atividade(
                questao_id="Q1",
                conceito_id="C1",
                resultado=True,
                tentativas=1,
                dicas_utilizadas=-1,
                tipo_atividade="missao"
            )

    def test_rejeita_conceito_inexistente(self):
        with self.assertRaises(ValueError):
            self.aluno.registrar_atividade(
                questao_id="Q1",
                conceito_id="C11",
                resultado=True,
                tentativas=1,
                dicas_utilizadas=0,
                tipo_atividade="missao"
            )

    def test_rejeita_tipo_de_atividade_invalido(self):
        with self.assertRaises(ValueError):
            self.aluno.registrar_atividade(
                questao_id="Q1",
                conceito_id="C1",
                resultado=True,
                tentativas=1,
                dicas_utilizadas=0,
                tipo_atividade="prova"
            )

    def test_obter_historico_atividades(self):
        self.aluno.registrar_atividade(
            questao_id="Q1",
            conceito_id="C1",
            resultado=True,
            tentativas=1,
            dicas_utilizadas=0,
            tipo_atividade="missao"
        )

        historico = self.aluno.obter_historico_atividades()

        self.assertEqual(len(historico), 1)
        self.assertEqual(historico[0]["questao_id"], "Q1")

    def test_modificar_historico_consultado_nao_altera_original(self):
        self.aluno.registrar_atividade(
            questao_id="Q1",
            conceito_id="C1",
            resultado=True,
            tentativas=1,
            dicas_utilizadas=0,
            tipo_atividade="missao"
        )

        historico = self.aluno.obter_historico_atividades()
        historico.clear()

        self.assertEqual(len(self.aluno.obter_historico_atividades()), 1)

    def test_acerto_no_reforco_recebe_25_pontos(self):
        self.aluno.registrar_atividade(
            questao_id="Q1",
            conceito_id="C1",
            resultado=True,
            tentativas=1,
            dicas_utilizadas=0,
            tipo_atividade="reforco"
        )

        self.assertEqual(self.aluno.obter_pontuacao("C1"), 25)

if __name__ == "__main__":
    unittest.main()
