from copy import deepcopy


LIMITE_PONTUACAO = 100
PONTOS_ACERTO_INDEPENDENTE_MISSAO = 25


class ModeloAluno:

    def __init__(self, aluno_id):

        self.__aluno_id = aluno_id
        self.__conceitos = self.criar_conceitos()
        self.__historico_atividades = []

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

    def get_aluno_id(self):
        return self.__aluno_id

    def get_conceitos(self):
        return deepcopy(self.__conceitos)

    def obter_pontuacao(self, conceito_id):
        if conceito_id not in self.__conceitos:
            raise ValueError("Conceito inválido.")

        return self.__conceitos[conceito_id]["pontuacao"]

    def obter_estado(self, conceito_id):
        if conceito_id not in self.__conceitos:
            raise ValueError("Conceito inválido.")

        conceito = self.__conceitos[conceito_id]

        if not conceito["avaliado"]:
            return "Não avaliado"

        pontuacao = conceito["pontuacao"]
        acertos = conceito["acertos_independentes"]

        if pontuacao < 35:
            return "Inicial"

        elif pontuacao < 70 or acertos < 2:
            return "Em progresso"

        else: 
            return "Dominado"

    def registrar_atividade(self, questao_id, conceito_id, resultado, tentativas, dicas_utilizadas, tipo_atividade):

        if not isinstance(questao_id, str) or not questao_id.strip():
            raise ValueError("Identificador da questão inválido.")
        
        if not isinstance(conceito_id, str) or conceito_id not in self.__conceitos:
            raise ValueError("Conceito inválido.")
        
        if type(resultado) is not bool:
            raise ValueError("O resultado deve ser verdadeiro ou falso.")

        if not isinstance(tipo_atividade, str) or tipo_atividade not in ["diagnostico", "missao", "reforco"]:
            raise ValueError("Tipo de atividade inválido.")
        
        if type(tentativas) is not int or tentativas < 1:
            raise ValueError("O número de tentativas deve ser um inteiro maior ou igual a 1.")

        if type(dicas_utilizadas) is not int or dicas_utilizadas < 0:
            raise ValueError("A quantidade de dicas deve ser um inteiro maior ou igual a zero.")

        atividade = {
            "questao_id": questao_id,
            "conceito_id": conceito_id,
            "resultado": resultado,
            "tentativas": tentativas,
            "dicas_utilizadas": dicas_utilizadas,
            "tipo_atividade": tipo_atividade
        }

        # Registra a atividade no histórico
        self.__historico_atividades.append(atividade)

        # Atualiza automaticamente o conceito
        pontos = self.atualizar_conceito(atividade)

        return pontos
    
    def calcular_pontuacao(self, atividade):
        if not atividade["resultado"]:
            return 0

        if atividade["tipo_atividade"] == "diagnostico":
            return 30

        if atividade["dicas_utilizadas"] > 0:
            return 15

        if atividade["tentativas"] > 1:
            return 10

        return PONTOS_ACERTO_INDEPENDENTE_MISSAO

    def atualizar_conceito(self, atividade):
        conceito_id = atividade["conceito_id"]
        questao_id = atividade["questao_id"]

        if conceito_id not in self.__conceitos:
            raise ValueError("Conceito inválido.")

        conceito = self.__conceitos[conceito_id]

        # Impede pontuação duplicada
        if questao_id in conceito["itens_pontuados"]:
            return 0

        # Indica que o conceito já foi avaliado
        conceito["avaliado"] = True
        if not atividade["resultado"]:
            return 0

        conceito["itens_pontuados"].append(questao_id)

        # Calcula os pontos recebidos
        pontos = self.calcular_pontuacao(atividade)
        
        # Atualiza a pontuação, respeitando o limite de 100
        pontuacao_atual = conceito["pontuacao"]
        nova_pontuacao = min(LIMITE_PONTUACAO, pontuacao_atual + pontos)

        conceito["pontuacao"] = nova_pontuacao

        # Identifica acertos independentes
        if (
            atividade["resultado"]
            and atividade["tentativas"] == 1
            and atividade["dicas_utilizadas"] == 0
        ):
            conceito["acertos_independentes"] += 1

        return nova_pontuacao - pontuacao_atual

    
    # Método público para o modelo pedagógico consultar informações
    def obter_historico_atividades(self):
        return deepcopy(self.__historico_atividades)

    @classmethod
    # permite criar uma instância da classe a partir de informações recebidas.
    def from_dict(cls, aluno_id, dados):
        aluno = cls(aluno_id)

        aluno.__conceitos = dados["conceitos"]
        aluno.__historico_atividades = dados["historico_atividades"]

        return aluno
