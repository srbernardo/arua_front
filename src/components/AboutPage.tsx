import InfoPage from './InfoPage'

interface AboutPageProps {
  onBack: () => void
  onNavigate: (target: string) => void
}

const sections = [
  {
    title: 'A nossa história',
    body: 'A ARUA nasceu da paixão pela moda feminina e pelo desejo de levar a cada mulher peças que a façam sentir confiante, elegante e confortável. Somos uma boutique online que seleciona cuidadosamente cada coleção, apostando em materiais de qualidade, design atual e preços justos.',
  },
  {
    title: 'A nossa missão',
    body: 'A nossa missão é simples: tornar a moda acessível a todas as mulheres. Queremos que cada encomenda seja uma experiência de compra simples, segura e agradável — do momento em que escolhes as tuas peças até à entrega à tua porta.',
  },
  {
    title: 'Qualidade e cuidado em cada peça',
    body: 'Trabalhamos com fornecedores selecionados e verificamos cada peça antes de a enviarmos. Acreditamos que moda e qualidade podem andar de mãos dadas com preços acessíveis, sem nunca comprometer o conforto e o acabamento.',
  },
  {
    title: 'Um atendimento perto de ti',
    body: 'A nossa equipa está disponível de segunda a sábado, das 9h às 18h, por email, telefone ou WhatsApp. Seja para ajudar a escolher a peça perfeita ou para acompanhar uma encomenda, estamos aqui para ti.',
  },
]

export default function AboutPage({ onBack, onNavigate }: AboutPageProps) {
  return (
    <InfoPage title="Sobre Nós" onBack={onBack} onNavigate={onNavigate}>
      <h1 className="font-heading text-3xl font-bold text-black">
        Sobre a ARUA
      </h1>
      <p className="font-body text-[15px] text-neutral-600 leading-relaxed mt-4">
        A ARUA é uma loja online de roupa feminina dedicada a mulheres que procuram
        estilo, qualidade e versatilidade. As nossas coleções são pensadas para o dia
        a dia e para os momentos especiais, sempre com um toque atual e intemporal.
      </p>

      <div className="flex flex-col gap-6 mt-8">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="font-heading text-lg font-semibold text-black">
              {section.title}
            </h2>
            <p className="font-body text-[15px] text-neutral-600 leading-relaxed mt-1">
              {section.body}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-surface rounded-lg px-5 py-6 mt-10">
        <h2 className="font-heading text-base font-semibold text-black">
          Fala connosco
        </h2>
        <p className="font-body text-sm text-neutral-600 leading-relaxed mt-1">
          Segunda a sábado, das 9h às 18h, por email, telefone ou WhatsApp:
          b.brotelle@gmail.com · +351 211 203 637
        </p>
      </div>
    </InfoPage>
  )
}
