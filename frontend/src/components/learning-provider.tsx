import { useState, type ReactNode } from "react";
import {
  initialState,
  registerAnswer,
  registerDiagnosticAnswer,
  registerHint,
  type Mission,
} from "@/lib/learning";
import { LearningContext, tutorName, type Message } from "./learning-context";

const welcome: Message = {
  role: "tutor",
  text: `Oi! Sou o ${tutorName}, seu tutor para a OBI. Estou aqui para ajudar você a se preparar para a modalidade Programação. Me conte o que você quer aprender ou em que parte travou. Podemos começar com um exemplo pequeno e pensar juntos no próximo passo.`,
};
function tutorReply(text: string): Message {
  const question = text.toLowerCase();
  if (/lista/.test(question))
    return {
      role: "tutor",
      text: "Uma lista guarda vários valores em uma única variável. Os índices começam em zero. Você pode percorrer cada elemento com um for.",
      code: "notas = [7, 8, 10]\nprint(notas[0])  # 7\nfor nota in notas:\n    print(nota)",
    };
  if (/for|while|laço|repet/.test(question))
    return {
      role: "tutor",
      text: "O for percorre uma sequência. O while repete enquanto uma condição for verdadeira. No while, lembre-se de atualizar a condição para evitar uma repetição infinita.",
      code: "for n in range(3):\n    print(n)\n\nn = 0\nwhile n < 3:\n    print(n)\n    n += 1",
    };
  if (/erro|bug|código/.test(question))
    return {
      role: "tutor",
      text: "Leia o código linha por linha e anote o valor de cada variável. Confira a indentação, os dois-pontos e os operadores: = atribui, enquanto == compara. Não executo nem avalio oficialmente seu código; podemos raciocinar sobre exemplos juntos.",
      code: 'senha = 1234\nif senha == 1234:\n    print("Acesso permitido")',
    };
  if (/simples|outro jeito/.test(question))
    return {
      role: "tutor",
      text: "Pense no if como uma escolha: se estiver chovendo, leve um guarda-chuva; caso contrário, saia sem ele. Só um dos caminhos é escolhido.",
      code: 'chovendo = True\nif chovendo:\n    print("Levar guarda-chuva")\nelse:\n    print("Sair sem guarda-chuva")',
    };
  if (/if|condi|exemplo/.test(question))
    return {
      role: "tutor",
      text: "O if executa um bloco quando uma condição é verdadeira. O else é o caminho alternativo, quando ela é falsa. Aqui, 15 é menor que 18. Qual caminho você acha que será escolhido?",
      code: 'idade = 15\nif idade >= 18:\n    print("Maior de idade")\nelse:\n    print("Menor de idade")',
    };
  return {
    role: "tutor",
    text: "Nesta demonstração, posso ajudar com condicionais, for e while, listas e identificação de erros. Qual desses assuntos se aproxima da sua dúvida? Podemos começar com um exemplo simples, sem pressa.",
  };
}
export function LearningProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initialState);
  const [messages, setMessages] = useState<Message[]>([welcome]);
  const answer = (mission: Mission, correct: boolean) =>
    setState((previous) => registerAnswer(previous, mission, correct).state);
  const hint = (id: string) => setState((previous) => registerHint(previous, id));
  const diagnose = (question: Mission, selected: number) =>
    setState((previous) => registerDiagnosticAnswer(previous, question, selected));
  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((previous) => [
      ...previous,
      { role: "student", text: text.trim() },
      tutorReply(text),
    ]);
  };
  const reset = () => {
    setState(initialState());
    setMessages([welcome]);
  };
  return (
    <LearningContext.Provider value={{ state, answer, diagnose, hint, reset, messages, send }}>
      {children}
    </LearningContext.Provider>
  );
}
