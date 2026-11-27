import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { TutorIcon } from "@/components/app-shell";

function SourceLink({ href, children }: { href: string; children: string }) {
  return (
    <a className="home-obi-source" href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <ArrowUpRight size={15} aria-hidden="true" />
      <span className="sr-only"> (abre em nova aba)</span>
    </a>
  );
}

export function ObiTutorIntro() {
  return (
    <section className="home-obi-project" aria-labelledby="home-obi-project-title">
      <TutorIcon />
      <div>
        <h2 id="home-obi-project-title">Onde o OBI Tutor entra?</h2>
        <p>
          O OBI Tutor tem dois modos para você se preparar para a OBI com Python. Em{" "}
          <strong>Treinar para a OBI</strong>, a trilha reúne missões por assunto e indica o que
          vale estudar antes de cada tema. Você pode escolher por onde começar ou fazer o
          diagnóstico para receber uma sugestão de missão. Durante os desafios, você recebe a
          correção da sua resposta e pode pedir uma pista antes de tentar de novo. Em{" "}
          <strong>Pergunte ao Tutor</strong>, você conversa com o Olimpio para tirar dúvidas de
          Python e pedir explicações. Você pode alternar entre os dois modos na mesma sessão e
          acompanhar em <strong>Meu Progresso</strong> o que já domina, o que vale revisar e qual é
          o próximo desafio recomendado.
        </p>
        <Link to="/trilha" className="home-obi-project-link">
          Explorar a trilha de estudos <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

export function ObiGuide() {
  return (
    <section className="home-obi" id="sobre-a-obi" aria-labelledby="home-obi-title" tabIndex={-1}>
      <header className="home-obi-heading">
        <h2 id="home-obi-title">Como funciona a OBI para quem programa?</h2>
        <p>
          A Olimpíada Brasileira de Informática é uma competição estudantil da Sociedade Brasileira
          de Computação, organizada pelo Instituto de Computação da Unicamp. Na Iniciação, os
          estudantes resolvem problemas de lógica em papel. Em Programação, eles escrevem código
          para resolver os problemas.
        </p>
        <SourceLink href="https://olimpiada.ic.unicamp.br/info/apresentacao/">
          Apresentação oficial da OBI
        </SourceLink>
      </header>

      <div className="home-obi-topics">
        <article className="home-obi-topic">
          <h3>Por que estudar para a OBI?</h3>
          <p>
            Os desafios são uma forma de explorar a computação na prática. Ao resolver um problema,
            você exercita a leitura de enunciados, organiza o raciocínio em passos e testa suas
            ideias. A OBI oferece cursos gratuitos para iniciantes e uma área onde você pode enviar
            soluções para questões de provas anteriores.
          </p>
          <div className="home-obi-links">
            <SourceLink href="https://olimpiada.ic.unicamp.br/prepare/estude/">
              Cursos e materiais da OBI
            </SourceLink>
            <SourceLink href="https://olimpiada.ic.unicamp.br/pratique/">
              Pratique com provas anteriores
            </SourceLink>
          </div>
        </article>

        <article className="home-obi-topic">
          <h3>Como são as provas?</h3>
          <p>
            A prova é individual e feita no computador. Você lê o enunciado, escreve um programa e
            envia sua solução. A correção é automática e verifica se o programa produz as saídas
            esperadas para diferentes entradas. Python é uma das linguagens aceitas nas fases da
            OBI.
          </p>
          <div className="home-obi-links">
            <SourceLink href="https://olimpiada.ic.unicamp.br/ambiente_prova">
              Guia do ambiente de prova
            </SourceLink>
            <SourceLink href="https://olimpiada.ic.unicamp.br/info/regulamento/">
              Regulamento da OBI
            </SourceLink>
          </div>
        </article>

        <article className="home-obi-topic">
          <h3>Níveis, fases e inscrição</h3>
          <p>
            Nas provas de programação, o Nível 1 aceita estudantes até o 1º ano do Ensino Médio, e o
            Nível 2, até o 3º. A competição tem fases Local, Estadual e Nacional. As duas primeiras
            acontecem na escola da inscrição. Procure o responsável pela OBI na sua escola para
            confirmar em qual nível pode participar.
          </p>
          <div className="home-obi-links">
            <SourceLink href="https://olimpiada.ic.unicamp.br/info/como_participar_aluno/">
              Como participar
            </SourceLink>
            <SourceLink href="https://olimpiada.ic.unicamp.br/info/apresentacao/">
              Modalidades e níveis da OBI
            </SourceLink>
          </div>
        </article>
      </div>
    </section>
  );
}
