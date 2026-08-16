interface AdminPlaceholderProps {
  title: string
  description?: string
}

export default function AdminPlaceholder({ title, description }: AdminPlaceholderProps) {
  return (
    <div className="max-w-4xl">
      <h1 className="font-heading text-2xl font-semibold text-gray-900">{title}</h1>
      <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center">
        <p className="font-body text-sm text-gray-500">
          {description ?? 'Esta secção será implementada na Parte 3 (Dashboard Admin).'}
        </p>
      </div>
    </div>
  )
}