import { X, Home, Mail, ShoppingBag, LifeBuoy } from 'lucide-react'

interface SidebarProps {
  open: boolean
  onClose: () => void
  onHome: () => void
}

const menuItems = [
  { label: 'Home', icon: Home },
  { label: 'Contatos', icon: Mail },
  { label: 'Ver Produtos', icon: ShoppingBag },
  { label: 'Customer Service', icon: LifeBuoy },
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

function WhatsAppIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
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

function PinterestIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 7a4 4 0 0 0-4 4c0 1.5.8 2.8 2 3.5l-1-4.5" />
      <path d="M12 7a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.5l1-4.5" />
    </svg>
  )
}

const socialLinks = [
  { label: 'Instagram', icon: InstagramIcon },
  { label: 'WhatsApp', icon: WhatsAppIcon },
  { label: 'TikTok', icon: TikTokIcon },
  { label: 'Pinterest', icon: PinterestIcon },
]

export default function Sidebar({ open, onClose, onHome }: SidebarProps) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-80 bg-card shadow-xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <span className="font-heading text-lg font-semibold text-foreground-primary">Menu</span>
          <button onClick={onClose} className="cursor-pointer hover:opacity-70 transition-opacity">
            <X size={20} className="text-foreground-secondary" />
          </button>
        </div>

        <nav className="flex flex-col p-4 gap-1 flex-1">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                onClose()
                if (item.label === 'Home' || item.label === 'Ver Produtos') onHome()
              }}
              className="w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg font-body text-sm text-foreground-secondary hover:bg-surface hover:text-foreground-primary transition-colors cursor-pointer"
            >
              <item.icon size={20} className="shrink-0" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="border-t border-border p-6">
          <span className="font-body text-xs font-semibold text-foreground-secondary/60 uppercase tracking-wider">
            Redes Sociais
          </span>
          <div className="flex items-center gap-2 mt-3">
            {socialLinks.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-surface hover:bg-primary hover:text-white transition-colors cursor-pointer"
                title={label}
              >
                <Icon size={18} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
