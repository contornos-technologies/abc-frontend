import LegalLayout from '../../components/public/LegalLayout'

export default function Terms() {
  const sections = [
    {
      id: 'ambito',
      eyebrow: 'Âmbito',
      title: 'Aplicação destes termos',
      node: (
        <p>
          Estes Termos e Condições regulam a inscrição e utilização dos serviços
          do Centro Preparatório da Academia Berço do Conhecimento (ABC), centro
          presencial sediado em Huambo, Angola, incluindo o site abchuambo.com e
          os canais de comunicação associados (WhatsApp e email). Ao
          inscrever-se ou utilizar os nossos serviços, aceita estes termos.
        </p>
      ),
    },
    {
      id: 'servico',
      eyebrow: 'Serviço',
      title: 'O que o ABC oferece',
      node: (
        <p>
          A ABC prepara estudantes para os exames de acesso ao ensino superior
          angolano, em regime presencial, em nove disciplinas: Matemática,
          Física, Química, Biologia, Língua Portuguesa, História Universal,
          HESA, Inglês e Desenho Técnico.
        </p>
      ),
    },
    {
      id: 'inscricao',
      eyebrow: 'Inscrição e preços',
      title: 'Como funciona a inscrição',
      node: (
        <>
          <p>
            A inscrição é feita por pacote de disciplinas — nunca por disciplina
            isolada — de acordo com a seguinte tabela de preços:
          </p>
          <div className="overflow-x-auto mt-3">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#F4F8FC] text-left">
                  <th className="px-4 py-2 border border-[#E7EDF5] font-semibold text-[#071C35]">
                    Nº de Disciplinas
                  </th>
                  <th className="px-4 py-2 border border-[#E7EDF5] font-semibold text-[#071C35]">
                    Preço Total
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 border border-[#E7EDF5]">1</td>
                  <td className="px-4 py-2 border border-[#E7EDF5]">
                    10.000 Kz
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border border-[#E7EDF5]">2</td>
                  <td className="px-4 py-2 border border-[#E7EDF5]">
                    13.000 Kz
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border border-[#E7EDF5]">3</td>
                  <td className="px-4 py-2 border border-[#E7EDF5]">
                    16.000 Kz
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border border-[#E7EDF5]">
                    4 ou mais
                  </td>
                  <td className="px-4 py-2 border border-[#E7EDF5]">
                    18.000 Kz
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3">
            Cada estudante pode ter apenas uma inscrição activa por ano lectivo.
          </p>
        </>
      ),
    },
    {
      id: 'pagamento',
      eyebrow: 'Pagamento',
      title: 'Pagamento e prestações',
      node: (
        <>
          <p>
            O pagamento pode ser feito em prestações, sendo exigido um mínimo de
            70% do valor total na primeira prestação. Os valores são declarados
            pelo estudante e confirmados pela administração do academia após
            verificação.
          </p>

          <p className="mt-3">
            A ABC oferece um período de adaptação de sete dias úteis a contar da
            data de início das aulas. Durante este período, o estudante pode
            cancelar a sua inscrição sem qualquer penalização e receberá o
            reembolso integral do valor pago.
          </p>
          <p className="mt-2">
            Após o término deste período, a inscrição considera-se confirmada e
            não serão efectuados reembolsos, salvo por decisão fundamentada da
            direcção da academia.
          </p>
          <p className="mt-2">
            Para solicitar o cancelamento, o estudante deve contactar a
            administração pessoalmente ou através dos canais oficiais (email ou
            WhatsApp) dentro do prazo indicado.
          </p>
        </>
      ),
    },
    {
      id: 'bolsas',
      eyebrow: 'Bolsas de estudo',
      title: 'Bolsas de estudo',
      node: (
        <p>
          A ABC pode atribuir bolsas de estudo parciais (50% ou 75% de desconto
          sobre o valor total) ou bolsas completas, por decisão da direcção da
          academia. As condições de atribuição são avaliadas caso a caso e
          comunicadas individualmente ao estudante.
        </p>
      ),
    },
    {
      id: 'conduta',
      eyebrow: 'Conduta',
      title: 'Conduta do estudante',
      node: (
        <p>
          Espera-se que os estudantes mantenham um comportamento respeitoso para
          com colegas, professores e restante equipa da ABC, e que cumpram as
          regras internas da academia relativas a horários, assiduidade e
          utilização das instalações.
        </p>
      ),
    },
    {
      id: 'propriedade',
      eyebrow: 'Propriedade intelectual',
      title: 'Materiais e propriedade intelectual',
      node: (
        <p>
          Os materiais didácticos, exercícios e simulados disponibilizados pela
          ABC destinam-se exclusivamente ao uso pessoal dos estudantes
          inscritos, não podendo ser reproduzidos ou redistribuídos sem
          autorização.
        </p>
      ),
    },
    {
      id: 'comunicacoes',
      eyebrow: 'Comunicações',
      title: 'Comunicações sobre a sua inscrição',
      node: (
        <p>
          Ao inscrever-se, aceita receber comunicações relacionadas com a sua
          inscrição por email e/ou WhatsApp, incluindo avisos, lembretes de
          pagamento e resultados de simulados. Para mais detalhes sobre o
          tratamento destes dados, consulte a nossa{' '}
          <a href="/privacy">Política de Privacidade</a>.
        </p>
      ),
    },
    {
      id: 'responsabilidade',
      eyebrow: 'Responsabilidade',
      title: 'Limitação de responsabilidade',
      node: (
        <p>
          A ABC esforça-se por garantir a qualidade do ensino e da preparação
          fornecida, mas não garante resultados específicos em exames de acesso
          ao ensino superior, que dependem também do desempenho individual de
          cada estudante.
        </p>
      ),
    },
    {
      id: 'alteracoes',
      eyebrow: 'Alterações',
      title: 'Alterações a estes termos',
      node: (
        <p>
          Podemos actualizar estes Termos e Condições periodicamente. A data da
          última actualização está sempre indicada no topo desta página.
        </p>
      ),
    },
    {
      id: 'lei',
      eyebrow: 'Lei aplicável',
      title: 'Lei e foro aplicável',
      node: (
        <p>
          Estes termos regem-se pela lei angolana. Quaisquer litígios serão
          submetidos ao foro da comarca de Huambo, Angola.
        </p>
      ),
    },
    {
      id: 'contacto',
      eyebrow: 'Contacto',
      title: 'Como nos contactar',
      node: (
        <p>
          Centro Preparatório — Academia Berço do Conhecimento (ABC)
          <br />
          Cidade Alta, Escola do Ensino Especial, Huambo, Angola
          <br />
          Email: <a href="mailto:info@abchuambo.com">info@abchuambo.com</a>
          <br />
          WhatsApp: +244 942 082 678
        </p>
      ),
    },
  ]

  return (
    <LegalLayout
      title="Termos e Condições"
      intro="Estes termos explicam as condições de inscrição, pagamento e utilização dos serviços da ABC."
      lastUpdated="Junho 2026"
      sections={sections}
    />
  )
}
