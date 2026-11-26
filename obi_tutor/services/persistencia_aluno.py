import json
from pathlib import Path

from obi_tutor.models.modelo_aluno import ModeloAluno

CAMINHO_DADOS = Path(__file__).resolve().parent.parent / "dados" / "modelos_alunos.json"

def salvar_aluno(aluno):
    dados = {}

    if CAMINHO_DADOS.exists():
        with open(CAMINHO_DADOS, "r", encoding="utf-8") as arquivo:
            dados = json.load(arquivo)

    aluno_id = aluno.get_aluno_id()

    dados[aluno_id] = {
        "conceitos": aluno.get_conceitos(),
        "historico_atividades": aluno.obter_historico_atividades()
    }

    CAMINHO_DADOS.parent.mkdir(parents=True, exist_ok=True)

    with open(CAMINHO_DADOS, "w", encoding="utf-8") as arquivo:
        json.dump(dados, arquivo, indent=4, ensure_ascii=False)

def carregar_aluno(aluno_id):
    if not CAMINHO_DADOS.exists():
        return None

    with open(CAMINHO_DADOS, "r", encoding="utf-8") as arquivo:
        dados = json.load(arquivo)

    dados_aluno = dados.get(aluno_id)

    if dados_aluno is None:
        return None

    return ModeloAluno.from_dict(aluno_id, dados_aluno)
