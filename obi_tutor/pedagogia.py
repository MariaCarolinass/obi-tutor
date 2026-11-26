def recomendar(dominio, aluno, concluidas, diagnostico):
    pendentes = [q for q in dominio.missoes if q["id"] not in concluidas]
    precisa_praticar = [
        q for q in pendentes
        if aluno.obter_estado(q["concept_id"]) != "Dominado"
    ]
    dificuldades = {
        q["concept_id"] for q in dominio.diagnostico
        if diagnostico.get(q["id"]) is False
    }
    questao = next((q for q in precisa_praticar if q["concept_id"] in dificuldades), None)
    if questao is None:
        questao = next(iter(precisa_praticar or pendentes), None)
    if questao is None:
        return {
            "missionId": dominio.missoes[0]["id"],
            "message": "Você concluiu as missões disponíveis. Pode retomar um desafio para revisar.",
        }

    conceito = dominio.conceitos[questao["concept_id"]]
    requisitos = requisitos_fracos(dominio, aluno)[conceito["id"]]
    revisao = next((q for q in pendentes if q["concept_id"] in requisitos), None)
    if revisao:
        return {
            "missionId": revisao["id"],
            "message": f"Experimente revisar uma base de {conceito['name'].lower()} antes de avançar.",
        }
    if requisitos:
        nomes = ", ".join(dominio.conceitos[c]["short"].lower() for c in requisitos)
        mensagem = f"Considere revisar {nomes} na trilha. Você também pode praticar o desafio sugerido."
    elif conceito["id"] in dificuldades:
        mensagem = "Pratique um conceito que vale reforçar após o diagnóstico."
    elif aluno.obter_estado(conceito["id"]) == "Dominado":
        mensagem = "Experimente um desafio inédito para reforçar o conceito."
    elif conceito["prerequisites"]:
        mensagem = "Avance para outro conceito da trilha e experimente um desafio novo."
    else:
        mensagem = "Experimente um desafio para praticar este conceito."
    return {"missionId": questao["id"], "message": mensagem}


def requisitos_fracos(dominio, aluno):
    return {
        c["id"]: [r for r in c["prerequisites"] if aluno.obter_pontuacao(r) < 50]
        for c in dominio.conceitos.values()
    }


def orientar_erro(dominio, questao, erros, concluidas):
    if erros == 1:
        orientacoes = {
            "Detetive de Bugs": "Compare o comportamento pedido no enunciado com o que o código faria.",
            "Complete o Código": "Confira quais valores precisam estar disponíveis antes e depois da linha que falta.",
            "Preveja a Saída": "Anote o valor das variáveis a cada passo e confira o que chega ao print.",
        }
        return {"message": orientacoes[questao["formato"]], "alternativeId": None}
    outra = next((
        q["id"] for q in dominio.missoes
        if q["concept_id"] == questao["concept_id"]
        and q["id"] != questao["id"]
        and q["id"] not in concluidas
    ), None)
    return {
        "message": "Que tal mudar a abordagem? Você pode ver um exemplo menor, revisar o conceito ou pedir a explicação direta.",
        "alternativeId": outra,
    }


EXEMPLOS = {
    "C1": "Se o enunciado pede o dobro de um número, 3 é uma entrada possível e 6 é a saída esperada.",
    "C2": "Se a entrada é 3 e a regra pede somar 2, escreva 5 como saída esperada para testar.",
    "C3": "Se x vale 4, calcule primeiro x + 2. Depois use esse resultado em uma segunda operação.",
    "C4": "Considere a condição idade >= 16. Qual caminho seria escolhido se idade valesse exatamente 16?",
    "C5": "Liste os valores de i em range(2) e imagine um print(i) dentro do laço.",
    "C6": "Some os números de [3, 4] um por vez. O total começa em 0, passa por 3 e chega a 7.",
    "C7": "Na lista [4, 7], o índice 0 aponta para 4 e o índice 1 aponta para 7.",
    "C8": "Comece com x = 2 e anote o novo valor de x depois de cada uma de duas somas de 1.",
    "C9": "Se uma regra exige pelo menos 10 pontos, compare o comportamento com 9, 10 e 11.",
    "C10": "Na sequência [1, 1, 0], conte o trecho atual de 1s e guarde o maior valor antes de reiniciar a contagem.",
}


def oferecer_ajuda(dominio, questao, tipo, pistas_vistas):
    if tipo == "hint":
        dicas = questao["dicas"]
        if not dicas:
            return "Releia a pergunta e tente anotar o que você já sabe sobre o problema."
        return dicas[min(pistas_vistas, len(dicas) - 1)]
    if tipo == "direct":
        return questao["explicacao"]
    if tipo == "simple":
        return EXEMPLOS[questao["concept_id"]]
    return dominio.conceitos[questao["concept_id"]]["description"]
