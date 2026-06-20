import LegalLayout from '../../components/public/LegalLayout'

export default function Privacy() {
  const sections = [
    {
      id: 'quem-somos',
      eyebrow: 'Quem somos',
      title: 'Responsável pelo tratamento de dados',
      node: (
        // ⚠️ Confirmar morada real — "Commercial Street" parece um placeholder genérico
        <p>
          O ABC Centro Preparatório (Academia Berço do Conhecimento), com
          funcionamento presencial no Huambo, Escola do Ensino Especial, Huambo,
          Angola, é responsável pelo tratamento dos dados pessoais recolhidos
          através dos seus sistemas de inscrição, plataforma de simulações e
          canais de comunicação (incluindo WhatsApp e email). Para questões
          relacionadas com esta política, pode contactar-nos através de{' '}
          <a href="mailto:info@abchuambo.com">info@abchuambo.com</a> ou pelo
          WhatsApp +244 942 082 678.
        </p>
      ),
    },
    {
      id: 'dados-recolhidos',
      eyebrow: 'Dados recolhidos',
      title: 'Que dados pessoais recolhemos',
      node: (
        <>
          <p>
            Dependendo da forma como interage com os nossos serviços, podemos
            recolher:
          </p>
          <ul className="list-disc">
            <li>
              Dados de identificação: nome completo, número de bilhete de
              identidade e data de nascimento;
            </li>
            <li>
              Dados de contacto: número de telefone (incluindo WhatsApp),
              endereço de email e morada;
            </li>
            <li>
              Dados de inscrição: disciplinas escolhidas, ano de inscrição,
              candidaturas a universidades e bolsas de estudo atribuídas;
            </li>
            <li>
              Dados de pagamento: valores declarados e confirmados, métodos de
              pagamento e estado da prestação (não recolhemos dados de cartões
              bancários);
            </li>
            <li>
              Dados académicos: respostas e resultados em simulações de exames;
            </li>
            <li>
              Dados de utilização: informação técnica básica gerada pelo acesso
              ao site e à plataforma de simulações.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'finalidades',
      eyebrow: 'Finalidades',
      title: 'Para que usamos os seus dados',
      node: (
        <>
          <p>Utilizamos os dados recolhidos para:</p>
          <ul className="list-disc">
            <li>
              Gerir a inscrição anual do estudante e o respectivo pacote de
              disciplinas;
            </li>
            <li>
              Processar e acompanhar pagamentos, incluindo prestações, bolsas de
              estudo e emissão de cartões de estudante;
            </li>
            <li>
              Enviar notificações sobre o estado da inscrição e dos pagamentos,
              por WhatsApp e/ou email;
            </li>
            <li>
              Disponibilizar simulações de exames e apresentar os respectivos
              resultados;
            </li>
            <li>Responder a mensagens de contacto e pedidos de informação;</li>
            <li>Cumprir obrigações legais e administrativas do centro.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'whatsapp',
      eyebrow: 'Comunicações por WhatsApp',
      title: 'Notificações via WhatsApp',
      node: (
        <p>
          Utilizamos a WhatsApp Business Platform (Meta) para enviar
          notificações relacionadas com a inscrição (confirmação de inscrição),
          pagamentos (confirmação de pagamento aprovado e lembretes de pagamento
          pendente). Estas mensagens são enviadas apenas para o número de
          telefone associado à conta do estudante e têm carácter informativo
          sobre o estado da sua inscrição. O envio destas mensagens é feito
          através da infraestrutura da Meta Platforms, Inc., sujeita às
          respectivas políticas de privacidade.
        </p>
      ),
    },
    {
      id: 'partilha',
      eyebrow: 'Partilha de dados',
      title: 'Com quem partilhamos os seus dados',
      node: (
        <>
          <p>
            Os dados pessoais não são vendidos. Podem ser partilhados apenas
            com:
          </p>
          <ul className="list-disc">
            <li>
              Fornecedores de infraestrutura técnica que alojam a nossa base de
              dados e plataforma (alojamento em servidores na nuvem);
            </li>
            <li>
              Fornecedores de serviços de comunicação utilizados para enviar
              notificações por WhatsApp (Meta) e email;
            </li>
            <li>
              Universidades, exclusivamente quando o estudante regista uma
              candidatura através da plataforma e essa partilha é necessária
              para o processo de candidatura;
            </li>
            <li>Autoridades competentes, quando exigido por lei.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'retencao',
      eyebrow: 'Conservação de dados',
      title: 'Por quanto tempo guardamos os seus dados',
      node: (
        <p>
          Os dados são conservados enquanto o estudante mantiver uma inscrição
          activa no centro e, após o término da relação, pelo período necessário
          para cumprir obrigações administrativas, contabilísticas e legais
          aplicáveis em Angola. Os registos de pagamento, em particular, são
          mantidos como histórico permanente e não são eliminados, garantindo a
          integridade do histórico financeiro do estudante.
        </p>
      ),
    },
    {
      id: 'direitos',
      eyebrow: 'Os seus direitos',
      title: 'Direitos do titular dos dados',
      node: (
        <>
          <p>Pode, em qualquer momento, solicitar:</p>
          <ul className="list-disc">
            <li>Acesso aos dados pessoais que detemos sobre si;</li>
            <li>Correcção de dados incorrectos ou incompletos;</li>
            <li>
              Eliminação de dados, sempre que tal não conflitue com obrigações
              legais ou financeiras em curso;
            </li>
            <li>Esclarecimentos sobre o tratamento dos seus dados.</li>
          </ul>
          <p>
            Para exercer estes direitos, contacte-nos através de{' '}
            <a href="mailto:info@abchuambo.com">info@abchuambo.com</a>.
          </p>
        </>
      ),
    },
    {
      id: 'seguranca',
      eyebrow: 'Segurança',
      title: 'Como protegemos os seus dados',
      node: (
        <p>
          Adoptamos medidas técnicas e organizativas adequadas para proteger os
          dados pessoais contra acesso não autorizado, perda ou alteração,
          incluindo encriptação de palavras-passe, ligações seguras (HTTPS) e
          controlo de acesso baseado em perfis de utilizador (estudante,
          administrador).
        </p>
      ),
    },
    {
      id: 'simulacoes',
      eyebrow: 'Plataforma de simulações',
      title: 'Utilização anónima e armazenamento local',
      node: (
        <p>
          A plataforma de simulações de exames pode ser utilizada de forma
          anónima, sem necessidade de criar uma conta. Nestes casos, o progresso
          da simulação é guardado temporariamente no dispositivo do utilizador
          (armazenamento local do navegador), permitindo associar os resultados
          a uma conta caso o utilizador se registe posteriormente.
        </p>
      ),
    },
    {
      id: 'alteracoes',
      eyebrow: 'Alterações',
      title: 'Alterações a esta política',
      node: (
        <p>
          Esta política pode ser actualizada periodicamente para reflectir
          alterações nos nossos serviços ou requisitos legais. A data da última
          actualização é sempre indicada no topo desta página.
        </p>
      ),
    },
    {
      id: 'contacto',
      eyebrow: 'Contacto',
      title: 'Como nos contactar',
      node: (
        <p>
          ABC Centro Preparatório — Academia Berço do Conhecimento
          <br />
          Huambo, Commercial Street, Huambo, Angola
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
      title="Política de Privacidade"
      intro="Esta política explica como o ABC Centro Preparatório recolhe, usa e protege os dados pessoais dos estudantes e visitantes."
      lastUpdated="Junho 2026"
      sections={sections}
    />
  )
}
