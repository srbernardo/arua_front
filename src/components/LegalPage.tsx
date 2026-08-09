import { Cookie, ShieldCheck, Scale } from 'lucide-react'
import InfoPage from './InfoPage'

export type LegalSection = 'cookies-definitions' | 'cookies' | 'privacy' | 'terms'

interface LegalPageProps {
  section: LegalSection
  onBack: () => void
  onNavigate: (target: string) => void
}

interface LegalBlock {
  heading?: string
  body?: string
  items?: string[]
}

const sections: Record<LegalSection, { title: string; icon: typeof Cookie; intro: string; blocks: LegalBlock[] }> = {
  'cookies-definitions': {
    title: 'Definições de Cookies',
    icon: Cookie,
    intro: 'Explicamos aqui o que são cookies, para que servem e que tipos existem.',
    blocks: [
      {
        heading: 'O que são cookies?',
        body: 'Cookies são pequenos ficheiros de texto guardados no teu dispositivo (computador, telemóvel ou tablet) quando visitas um site. Permitem que o site se lembre das tuas ações e preferências, como dados de carrinho de compras ou idioma, durante um período de tempo.',
      },
      {
        heading: 'Tipos de cookies',
        body: 'De acordo com a finalidade, distinguem-se os seguintes tipos de cookies:',
        items: [
          'Cookies estritamente necessários: essenciais para o funcionamento do site, como manter o carrinho de compras e a sessão do utilizador. Não podem ser desativados.',
          'Cookies de funcionalidade: permitem recordar preferências (como favoritos ou artigos vistos) para melhorar a experiência de navegação.',
          'Cookies analíticos: recolhem informação agregada e anónima sobre a utilização do site, para que possamos melhorar os nossos conteúdos e serviços.',
          'Cookies de publicidade: utilizados para apresentar publicidade mais relevante e medir o desempenho de campanhas.',
        ],
      },
      {
        heading: 'Cookies que utilizamos',
        body: 'Na ARUA utilizamos cookies estritamente necessários e cookies de funcionalidade, incluindo o armazenamento local do navegador (localStorage) para guardar o carrinho de compras, as preferências e os favoritos. Não utilizamos cookies de publicidade de terceiros.',
      },
    ],
  },
  cookies: {
    title: 'Aviso sobre Cookies',
    icon: Cookie,
    intro: 'Saiba como utilizamos cookies e como pode gerir as suas preferências.',
    blocks: [
      {
        heading: 'A nossa política de cookies',
        body: 'Este site utiliza cookies e tecnologias semelhantes para garantir o correto funcionamento da loja, recordar as tuas preferências e melhorar a tua experiência de navegação. Ao continuares a utilizar o site, aceitas a utilização de cookies de acordo com esta política.',
      },
      {
        heading: 'Dados guardados no teu dispositivo',
        body: 'Utilizamos o armazenamento local do navegador para guardar informação necessária ao funcionamento da loja, nomeadamente:',
        items: [
          'O conteúdo do carrinho de compras e os artigos selecionados.',
          'A sessão do utilizador autenticado.',
          'Os artigos marcados como favoritos.',
        ],
      },
      {
        heading: 'Como gerir ou desativar cookies',
        body: 'Podes controlar e eliminar cookies através das definições do teu navegador. Na maioria dos navegadores podes bloquear todos os cookies ou ser avisado sempre que um cookie for enviado. A desativação de cookies estritamente necessários pode impedir o funcionamento de funcionalidades essenciais, como o carrinho de compras.',
      },
      {
        heading: 'Contacto',
        body: 'Para qualquer questão relacionada com a utilização de cookies, contacta-nos por email: b.brotelle@gmail.com.',
      },
    ],
  },
  privacy: {
    title: 'Aviso de Privacidade',
    icon: ShieldCheck,
    intro: 'Como tratamos e protegemos os teus dados pessoais, em conformidade com o Regulamento Geral sobre a Proteção de Dados (RGPD).',
    blocks: [
      {
        heading: 'Responsável pelo tratamento',
        body: 'A ARUA é a responsável pelo tratamento dos dados pessoais recolhidos através desta loja online. Para qualquer questão relativa à privacidade, contacta-nos por email: b.brotelle@gmail.com.',
      },
      {
        heading: 'Que dados recolhemos',
        body: 'Recolhemos apenas os dados estritamente necessários à operação da loja online:',
        items: [
          'Dados de conta: nome e número de telefone, criados quando fazes o registo.',
          'Dados de morada: rua, bairro, cidade, código postal, necessários para a entrega das encomendas.',
          'Dados de encomenda: artigos comprados, quantidades, valores, método de pagamento e estado da encomenda.',
          'Preferências: artigos favoritos e conteúdo do carrinho, guardados no teu dispositivo.',
        ],
      },
      {
        heading: 'Para que finalidades utilizamos os dados',
        items: [
          'Processar, confirmar e entregar as tuas encomendas.',
          'Comunicar o estado do pedido por WhatsApp ou email.',
          'Responder a pedidos de apoio e atendimento ao cliente.',
          'Cumprir obrigações legais e fiscais.',
        ],
      },
      {
        heading: 'Fundamento jurídico',
        body: 'Tratamos os teus dados com base na execução do contrato de compra, no consentimento que nos prestas e no cumprimento de obrigações legais a que estamos sujeitos.',
      },
      {
        heading: 'Partilha de dados',
        body: 'Não vendemos nem alugamos os teus dados a terceiros. Os teus dados poderão ser partilhados com prestadores de serviços que nos ajudam a operar a loja, nomeadamente alojamento do site, serviços de email e WhatsApp, e transportadoras para efeitos de entrega.',
      },
      {
        heading: 'Conservação dos dados',
        body: 'Os dados são conservados pelo período necessário às finalidades para que foram recolhidos, designadamente a vigência da conta e os prazos legalmente exigidos para efeitos fiscais.',
      },
      {
        heading: 'Os teus direitos',
        body: 'Nos termos do RGPD, tens o direito de:',
        items: [
          'Aceder aos teus dados pessoais e pedir uma cópia.',
          'Solicitar a retificação de dados inexatos.',
          'Solicitar o apagamento dos teus dados.',
          'Solicitar a limitação do tratamento.',
          'Pedir a portabilidade dos teus dados.',
          'Opor-te ao tratamento, em certas circunstâncias.',
        ],
      },
      {
        heading: 'Como exercer os teus direitos',
        body: 'Podes exercer qualquer um destes direitos por email: b.brotelle@gmail.com. Tens também o direito de apresentar reclamação junto da Comissão Nacional de Proteção de Dados (CNPD), em www.cnpd.pt.',
      },
    ],
  },
  terms: {
    title: 'Termos e Condições',
    icon: Scale,
    intro: 'As condições gerais de utilização da loja online e de compra de produtos.',
    blocks: [
      {
        heading: '1. Objeto',
        body: 'Estes Termos e Condições regulam a utilização da loja online da ARUA e a compra dos produtos nela apresentados. Ao efetuares uma encomenda, aceitas estes termos na íntegra.',
      },
      {
        heading: '2. Produtos e preços',
        body: 'Os produtos são apresentados com descrição, imagem, tamanho e cor. Os preços são indicados em euros (€) e incluem o IVA à taxa legal em vigor. Os preços podem ser alterados a qualquer momento, sendo aplicável o preço indicado no momento da encomenda.',
      },
      {
        heading: '3. Encomendas e pagamento',
        items: [
          'Ao concluíres a encomenda, receberás uma confirmação com o número do pedido.',
          'Os métodos de pagamento disponíveis são: MB Way e dinheiro na entrega.',
          'A ARUA reserva-se o direito de recusar uma encomenda em caso de indisponibilidade de stock ou suspeita de fraude.',
        ],
      },
      {
        heading: '4. Entrega',
        body: 'As encomendas são entregues na morada indicada durante o checkout. O custo de envio é apresentado antes da confirmação da encomenda. Para informações detalhadas sobre envios, contacta-nos por email ou telefone.',
      },
      {
        heading: '5. Trocas e devoluções',
        body: 'Em conformidade com a lei portuguesa, tens o direito de resolver o contrato de compra no prazo de 14 dias após a receção dos produtos. Para trocas e devoluções, contacta o nosso atendimento ao cliente.',
      },
      {
        heading: '6. Responsabilidade',
        body: 'A ARUA não é responsável por atrasos na entrega causados por entidades de transporte ou por informações de morada incorretas fornecidas pelo cliente.',
      },
      {
        heading: '7. Propriedade intelectual',
        body: 'Todos os conteúdos do site, incluindo textos, imagens, logótipos e design, são propriedade da ARUA ou dos seus licenciantes, não podendo ser utilizados sem autorização.',
      },
      {
        heading: '8. Lei aplicável e reclamações',
        body: 'Estes termos regem-se pela lei portuguesa. Em caso de conflito, serão competentes os tribunais portugueses. O consumidor pode ainda recorrer ao Livro de Reclamações online e às entidades de resolução alternativa de litígios de consumo.',
      },
    ],
  },
}

export default function LegalPage({ section, onBack, onNavigate }: LegalPageProps) {
  const data = sections[section]
  const Icon = data.icon

  return (
    <InfoPage title={data.title} onBack={onBack} onNavigate={onNavigate}>
      <div className="flex items-center gap-3">
        <Icon size={26} className="text-primary" />
        <h1 className="font-heading text-2xl font-bold text-black">{data.title}</h1>
      </div>
      <p className="font-body text-[15px] text-neutral-600 leading-relaxed mt-4">
        {data.intro}
      </p>
      <p className="font-body text-sm text-neutral-500 mt-1">
        Última atualização: agosto de 2026
      </p>

      <div className="flex flex-col gap-6 mt-8">
        {data.blocks.map((block) => (
          <div key={block.heading ?? block.body}>
            {block.heading && (
              <h2 className="font-heading text-lg font-semibold text-black">{block.heading}</h2>
            )}
            {block.body && (
              <p className="font-body text-[15px] text-neutral-600 leading-relaxed mt-1">{block.body}</p>
            )}
            {block.items && (
              <ul className="flex flex-col gap-2 mt-2">
                {block.items.map((item) => (
                  <li key={item} className="font-body text-[15px] text-neutral-600 leading-relaxed flex gap-2">
                    <span className="text-primary mt-[9px]">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </InfoPage>
  )
}

export const legalSectionLabels: Record<LegalSection, string> = {
  'cookies-definitions': 'Definições de Cookies',
  cookies: 'Aviso sobre Cookies',
  privacy: 'Aviso de Privacidade',
  terms: 'Termos e Condições',
}
