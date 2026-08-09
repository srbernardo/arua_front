import { useEffect } from 'react'
import { Clock, HelpCircle, Truck, BookOpen, MessageCircle, ExternalLink } from 'lucide-react'
import InfoPage from './InfoPage'

interface CustomerServicePageProps {
  onBack: () => void
  onNavigate: (target: string, anchor?: string) => void
}

const faqItems = [
  'Como posso acompanhar o meu pedido?',
  'Quais são os métodos de pagamento disponíveis?',
  'Como funcionam as trocas e devoluções?',
  'Quanto tempo demora a entrega?',
  'Posso alterar ou cancelar uma encomenda?',
  'Como posso escolher o tamanho certo?',
]

export default function CustomerServicePage({ onBack, onNavigate }: CustomerServicePageProps) {
  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash.slice(1)
      if (!hash) return
      const el = document.getElementById(hash)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    scrollToHash()
    window.addEventListener('hashchange', scrollToHash)
    return () => window.removeEventListener('hashchange', scrollToHash)
  }, [])

  return (
    <InfoPage title="Atendimento ao Cliente" onBack={onBack} onNavigate={onNavigate}>
      <section id="atendimento-horario" className="bg-surface rounded-lg px-5 py-5 scroll-mt-24">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-primary" />
          <h2 className="font-heading text-base font-semibold text-black">Horário de Atendimento</h2>
        </div>
        <p className="font-body text-[15px] text-neutral-600 leading-relaxed mt-2">
          Online: segunda a sábado, das 9h às 18h. A nossa equipa de atendimento da
          boutique online está disponível por email, telefone ou WhatsApp através de{' '}
          <a href="tel:+351211203637" className="text-primary underline">+351 211 203 637</a>.
        </p>
      </section>

      <section id="atendimento-faq" className="mt-8 scroll-mt-24">
        <div className="flex items-center gap-2">
          <HelpCircle size={18} className="text-primary" />
          <h2 className="font-heading text-base font-semibold text-black">Perguntas Frequentes</h2>
        </div>
        <div className="flex flex-col gap-2 mt-3">
          {faqItems.map((question) => (
            <button
              key={question}
              className="w-full text-left font-body text-sm text-neutral-700 bg-white border border-neutral-200 rounded-lg px-4 py-3 cursor-pointer hover:bg-muted hover:border-neutral-300 transition-colors"
            >
              {question}
            </button>
          ))}
        </div>
      </section>

      <section id="atendimento-envio" className="mt-8 scroll-mt-24">
        <div className="flex items-center gap-2">
          <Truck size={18} className="text-primary" />
          <h2 className="font-heading text-base font-semibold text-black">Envio de Encomendas</h2>
        </div>
        <p className="font-body text-[15px] text-neutral-600 leading-relaxed mt-2">
          Para mais detalhes sobre o envio de encomendas, prazos de entrega e custos,
          entra em contacto connosco por{' '}
          <a href="mailto:b.brotelle@gmail.com" className="text-primary underline">email</a>{' '}
          ou{' '}
          <a href="tel:+351211203637" className="text-primary underline">telemóvel</a>,
          e teremos todo o gosto em ajudar-te.
        </p>
      </section>

      <section id="atendimento-reclamacoes" className="mt-8 scroll-mt-24">
        <div className="flex items-center gap-2">
          <BookOpen size={18} className="text-primary" />
          <h2 className="font-heading text-base font-semibold text-black">Livro de Reclamações</h2>
        </div>
        <p className="font-body text-[15px] text-neutral-600 leading-relaxed mt-2">
          Se pretenderes apresentar uma reclamação, podes fazê-lo no Livro de Reclamações
          online:{' '}
          <a
            href="https://www.livroreclamacoes.pt/Inicio/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline inline-flex items-center gap-1"
          >
            www.livroreclamacoes.pt <ExternalLink size={14} />
          </a>
          .
        </p>
      </section>

      <section id="atendimento-contato" className="mt-8 scroll-mt-24">
        <div className="flex items-center gap-2">
          <MessageCircle size={18} className="text-primary" />
          <h2 className="font-heading text-base font-semibold text-black">Contacte-nos</h2>
        </div>
        <div className="flex flex-col gap-3 mt-3">
          <a
            href="mailto:b.brotelle@gmail.com"
            className="font-body text-sm text-neutral-700 bg-white border border-neutral-200 rounded-lg px-4 py-3 cursor-pointer hover:bg-muted transition-colors"
          >
            Email: b.brotelle@gmail.com
          </a>
          <a
            href="tel:+351211203637"
            className="font-body text-sm text-neutral-700 bg-white border border-neutral-200 rounded-lg px-4 py-3 cursor-pointer hover:bg-muted transition-colors"
          >
            Telefone: +351 211 203 637
          </a>
          <a
            href="https://wa.me/+351211203637"
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-sm text-neutral-700 bg-white border border-neutral-200 rounded-lg px-4 py-3 cursor-pointer hover:bg-muted transition-colors"
          >
            WhatsApp: +351 211 203 637
          </a>
        </div>
      </section>
    </InfoPage>
  )
}
