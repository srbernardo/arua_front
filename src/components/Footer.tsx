const linkGroups = [
  {
    title: 'Atendimento',
    links: ['Central de Ajuda', 'Trocas e Devoluções', 'Perguntas Frequentes', 'Seg-Sex: 9h às 18h', 'Sáb: 9h às 14h'],
  },
  {
    title: 'Institucional',
    links: ['Sobre Nós'],
  },
  {
    title: 'Legal',
    links: ['Avisos Legais', 'Política de Privacidade', 'Termos de Uso', 'Cookies'],
  },
  {
    title: 'Contato',
    links: ['contato@bikinistore.com.br', '(11) 99999-9999'],
  },
]

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
  { icon: InstagramIcon, label: 'Instagram' },
  { icon: TwitterIcon, label: 'Twitter' },
  { icon: FacebookIcon, label: 'Facebook' },
  { icon: TikTokIcon, label: 'TikTok' },
]

export default function Footer() {
  return (
    <footer className="w-full bg-primary px-4 md:px-10 py-6 md:py-8 flex flex-col gap-0">
      <div className="flex flex-col md:flex-row md:justify-between w-full gap-6 md:gap-0">
        <div className="flex flex-col">
          <span className="font-heading text-2xl font-bold text-white leading-tight">
            Bikini Store
          </span>
          <span className="font-body text-sm text-[#FFF5ED] leading-relaxed">
            Biquínis feitos para o seu verão
          </span>
        </div>

        <div className="flex flex-col">
          <span className="font-heading text-sm font-semibold text-white leading-tight">
            Siga-nos
          </span>
          <div className="flex items-center gap-2 mt-1">
            {socialIcons.map(({ icon: Icon, label }) => (
              <button key={label} className="w-10 h-10 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity bg-white/10 rounded-full text-white">
                <Icon size={20} />
              </button>
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
            {group.links.map((link) => (
              <button
                key={link}
                className="font-body text-[13px] text-[#FFF5ED] leading-relaxed text-left cursor-pointer hover:text-white transition-colors"
              >
                {link}
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full mt-[62px] border-t border-white/20 pt-4 md:pt-0 gap-4 md:gap-0">
        <span className="font-body text-xs text-[#FFE8D6] leading-relaxed">
          © 2024 Bikini Store. Todos os direitos reservados.
        </span>
        <div className="flex items-center gap-0">
          <button className="font-body text-xs text-[#FFE8D6] cursor-pointer hover:text-white transition-colors">Política de Privacidade</button>
          <button className="font-body text-xs text-[#FFE8D6] ml-4 cursor-pointer hover:text-white transition-colors">Termos de Serviço</button>
          <button className="font-body text-xs text-[#FFE8D6] ml-4 cursor-pointer hover:text-white transition-colors">Configurar Cookies</button>
        </div>
      </div>
    </footer>
  )
}
