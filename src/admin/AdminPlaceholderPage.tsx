import { Link } from 'react-router-dom'

export default function AdminPlaceholderPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
        <span className="font-heading text-lg font-semibold text-gray-900">Painel Admin</span>
        <p className="font-body text-sm text-gray-500 mt-2">
          A interface administrativa será implementada na Parte 3 (Dashboard Admin).
        </p>
        <Link
          to="/"
          className="inline-block mt-6 px-6 h-11 bg-gray-900 text-white font-body text-sm font-semibold rounded-full cursor-pointer hover:bg-gray-800 transition-colors flex items-center justify-center"
        >
          Voltar à loja
        </Link>
      </div>
    </div>
  )
}