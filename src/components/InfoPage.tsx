import type { ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'
import Footer from './Footer'

interface InfoPageProps {
  title: string
  onBack: () => void
  onNavigate: (target: string) => void
  children: ReactNode
}

export default function InfoPage({ title, onBack, onNavigate, children }: InfoPageProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex items-center gap-3 px-4 md:px-8 h-16 md:h-20 border-b border-neutral-200 shrink-0">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity">
          <ChevronLeft size={22} className="text-neutral-600" />
        </button>
        <span className="font-heading text-lg font-semibold text-black">{title}</span>
      </div>
      <div className="flex-1 w-full max-w-3xl mx-auto px-4 md:px-8 py-8">
        {children}
      </div>
      <Footer onNavigate={onNavigate} />
    </div>
  )
}
