def __init__(self, aluno_id):

    self.__aluno_id = aluno_id
    # guarda o estado de aprendizagem dos conceitos C1 até C10.
    self.__conceitos = self.criar_conceitos()
    self.__historico_atividades = []
    # registram as atividades realizadas e o andamento da sessão atual.

    self.__sessao = {
        "conceito_atual": None,
        "modo_ativo": None,
        "tentativas": 0,
        "dicas_utilizadas": 0,
        "respostas": [],
        "historico_conversa": []
    }

def criar_conceitos(self):
    conceitos = {}

    for i in range(1, 11):
        conceitos[f"C{i}"] = {
            "avaliado": False,
            "pontuacao": 0,
            "acertos_independentes": 0,
            "itens_pontuados": []
        }

    return conceitos