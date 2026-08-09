import { legalSectionLabels, type LegalSection } from './LegalPage'

interface FooterProps {
  onNavigate: (target: string, anchor?: string) => void
}

interface FooterLink {
  label: string
  target?: string
  anchor?: string
  href?: string
  text?: boolean
}

const linkGroups: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Atendimento',
    links: [
      { label: 'Perguntas Frequentes', target: 'service', anchor: 'atendimento-faq' },
      { label: 'Envio de Encomendas', target: 'service', anchor: 'atendimento-envio' },
      { label: 'Livro de Reclamações', target: 'service', anchor: 'atendimento-reclamacoes' },
      { label: 'Contacte-nos', target: 'service', anchor: 'atendimento-contato' },
      { label: 'Seg-Sáb: 9h às 18h', text: true },
    ],
  },
  {
    title: 'Institucional',
    links: [{ label: 'Sobre Nós', target: 'about' }],
  },
  {
    title: 'Legal',
    links: [
      { label: legalSectionLabels['cookies-definitions'], target: 'cookies-definitions' },
      { label: legalSectionLabels.cookies, target: 'cookies' },
      { label: legalSectionLabels.privacy, target: 'privacy' },
      { label: legalSectionLabels.terms, target: 'terms' },
    ],
  },
  {
    title: 'Contato',
    links: [
      { label: 'b.brotelle@gmail.com', href: 'mailto:b.brotelle@gmail.com' },
      { label: '+351 211 203 637', href: 'tel:+351211203637' },
      { label: 'WhatsApp', href: 'https://wa.me/+351211203637' },
    ],
  },
]

const legalSections: LegalSection[] = ['cookies-definitions', 'cookies', 'privacy', 'terms']

function InstagramIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

function TwitterIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
      <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
    </svg>
  )
}

function FacebookIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function TikTokIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12a4 4 0 1 0 4 4V4h5a5 5 0 0 1-5 5" />
    </svg>
  )
}

const socialIcons = [
  { icon: InstagramIcon, label: 'Instagram', href: 'https://www.instagram.com' },
  { icon: TwitterIcon, label: 'Twitter', href: 'https://x.com' },
  { icon: FacebookIcon, label: 'Facebook', href: 'https://www.facebook.com' },
  { icon: TikTokIcon, label: 'TikTok', href: 'https://www.tiktok.com' },
]

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="w-full bg-primary px-4 md:px-10 py-6 md:py-8 flex flex-col gap-0">
      <div className="flex flex-col md:flex-row md:justify-between w-full gap-6 md:gap-0">
        <div className="flex flex-col">
          <span className="font-heading text-2xl font-bold text-white leading-tight">
            ARUA
          </span>
          <span className="font-body text-sm text-[#FFF5ED] leading-relaxed">
            Moda feminina com estilo e conforto
          </span>
        </div>

        <div className="flex flex-col">
          <span className="font-heading text-sm font-semibold text-white leading-tight">
            Siga-nos
          </span>
          <div className="flex items-center gap-2 mt-1">
            {socialIcons.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-10 h-10 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity bg-white/10 rounded-full text-white"
              >
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:flex md:justify-between w-full mt-[30px] gap-6 md:gap-0">
        {linkGroups.map((group) => (
          <div key={group.title} className="flex flex-col">
            <span className="font-heading text-sm font-semibold text-white leading-tight mb-1">
              {group.title}
            </span>
            {group.links.map((link) => {
              if (link.text) {
                return (
                  <span key={link.label} className="font-body text-[13px] text-[#FFF5ED] leading-relaxed">
                    {link.label}
                  </span>
                )
              }
              if (link.href) {
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="font-body text-[13px] text-[#FFF5ED] leading-relaxed text-left cursor-pointer hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                )
              }
              return (
                <button
                  key={link.label}
                  onClick={() => link.target && onNavigate(link.target, link.anchor)}
                  className="font-body text-[13px] text-[#FFF5ED] leading-relaxed text-left cursor-pointer hover:text-white transition-colors"
                >
                  {link.label}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full mt-[62px] border-t border-white/20 pt-4 md:pt-0 gap-4 md:gap-0">
        <span className="font-body text-xs text-[#FFE8D6] leading-relaxed">
          © 2026 ARUA. Todos os direitos reservados.
        </span>
        <div className="flex items-center gap-0">
          {legalSections.map((section, index) => (
            <button
              key={section}
              onClick={() => onNavigate(section)}
              className={`font-body text-xs text-[#FFE8D6] cursor-pointer hover:text-white transition-colors ${index > 0 ? 'ml-4' : ''}`}
            >
              {legalSectionLabels[section]}
            </button>
          ))}
        </div>
      </div>
    </footer>
  )
}
